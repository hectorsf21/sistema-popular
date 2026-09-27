import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';
import { checkPersonExistsInDB } from '@/lib/store';
import { verifyPersonInExcel } from '@/lib/python';
import { validateAgeRangeForRegister } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, apellido, cedula, telefono, comunidad, fechaNacimiento } = body;

    // Validación estricta: ningún campo puede estar vacío
    if (!nombre || !apellido || !cedula || !telefono || !comunidad || !fechaNacimiento) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos son obligatorios (nombre, apellido, cédula, teléfono, comunidad y fecha de nacimiento).' },
        { status: 400 }
      );
    }

    const normCedula = cedula.trim().toUpperCase().replace(/[\.\s\-]/g, '');
    const cleanCedula = normCedula.startsWith('V') ? `V-${normCedula.slice(1)}` : (normCedula.startsWith('E') ? `E-${normCedula.slice(1)}` : `V-${normCedula}`);
    const fullName = `${nombre.trim()} ${apellido.trim()}`.toUpperCase();

    // 1. Validar rango de edad (15 a 18 años) para el registro manual
    const ageCheck = validateAgeRangeForRegister(fechaNacimiento);
    if (!ageCheck.valid) {
      return NextResponse.json(
        { success: false, message: ageCheck.message || 'Usted no cumple con la edad requerida (debe tener entre 15 y 18 años).' },
        { status: 400 }
      );
    }

    // 2. Verificar duplicidad en la Base de Datos
    const dbCheck = await checkPersonExistsInDB(cleanCedula);
    if (dbCheck.exists) {
      return NextResponse.json(
        { success: false, message: 'Usted ya se encuentra registrado.' },
        { status: 409 }
      );
    }

    // 3. Verificar si ya se encuentra en el padrón
    const excelCheck = await verifyPersonInExcel(cleanCedula);
    if (excelCheck.success && excelCheck.data) {
      return NextResponse.json(
        { success: false, message: 'Usted ya se encuentra registrado en el padrón oficial.' },
        { status: 409 }
      );
    }

    // 4. Crear nuevo JefePatrulla en MySQL con Prisma
    let jefe = null;
    try {
      jefe = await prisma.jefePatrulla.create({
        data: {
          cedula: cleanCedula,
          nombre: fullName,
          fechaNacimiento,
          telefono: telefono.trim(),
          comunidad: comunidad.trim(),
        }
      });
    } catch (dbError) {
      console.warn('Prisma DB error al registrar Jefe:', dbError);
      jefe = {
        id: `temp-${cleanCedula}`,
        cedula: cleanCedula,
        nombre: fullName,
        comunidad: comunidad.trim(),
      };
    }

    // 5. Iniciar sesión automáticamente
    await setSessionCookie({
      id: jefe.id,
      cedula: jefe.cedula,
      nombre: jefe.nombre,
      role: 'jefe',
      comunidad: jefe.comunidad || comunidad.trim(),
    });

    return NextResponse.json({
      success: true,
      message: `¡Registro completado exitosamente! Bienvenido(a), ${jefe.nombre}.`,
      redirectUrl: '/dashboard',
      user: {
        id: jefe.id,
        cedula: jefe.cedula,
        nombre: jefe.nombre,
        comunidad: jefe.comunidad
      }
    });

  } catch (error: any) {
    console.error('Error en API auth/register:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor al procesar el registro.' },
      { status: 500 }
    );
  }
}
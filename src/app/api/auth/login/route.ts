import { NextResponse } from 'next/server';
import { verifyPersonInExcel } from '@/lib/python';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cedula, fechaNacimiento, isMaster, masterKey } = body;

    // Login Master Admin
    if (isMaster) {
      const validMasterKey = process.env.MASTER_KEY || 'admin123';
      if (masterKey !== validMasterKey) {
        return NextResponse.json(
          { success: false, message: 'La clave de Administrador Master es incorrecta.' },
          { status: 401 }
        );
      }

      await setSessionCookie({
        id: 'master-admin',
        cedula: 'ADMIN-000',
        nombre: 'Administrador Master',
        role: 'master',
        comunidad: 'Central de Operaciones'
      });

      return NextResponse.json({
        success: true,
        message: 'Bienvenido Administrador Master',
        redirectUrl: '/master'
      });
    }

    // Login Jefe de Patrulla (Validación por Excel via Python)
    if (!cedula || !fechaNacimiento) {
      return NextResponse.json(
        { success: false, message: 'Por favor ingrese la Cédula y Fecha de Nacimiento.' },
        { status: 400 }
      );
    }

    const verification = await verifyPersonInExcel(cedula, fechaNacimiento);

    if (!verification.success || !verification.data) {
      return NextResponse.json(
        { success: false, message: verification.message || 'No autorizado. Cédula o Fecha no coincide en el padrón.' },
        { status: 401 }
      );
    }

    const person = verification.data;

    // Buscar o crear en la base de datos MySQL con Prisma
    let jefe = null;
    try {
      jefe = await prisma.jefePatrulla.upsert({
        where: { cedula: person.cedula },
        update: {
          nombre: person.nombre,
          fechaNacimiento: person.fechaNacimiento,
          comunidad: person.comunidad,
          municipio: person.municipio,
          parroquia: person.parroquia,
        },
        create: {
          cedula: person.cedula,
          nombre: person.nombre,
          fechaNacimiento: person.fechaNacimiento,
          comunidad: person.comunidad,
          municipio: person.municipio,
          parroquia: person.parroquia,
        },
      });
    } catch (dbError) {
      console.warn('DB Mysql warning (usando fallback de sesión):', dbError);
      // Fallback objeto temporal si DB aún no ha corrido migrations
      jefe = {
        id: `temp-${person.cedula}`,
        cedula: person.cedula,
        nombre: person.nombre,
        comunidad: person.comunidad,
      };
    }

    await setSessionCookie({
      id: jefe.id,
      cedula: jefe.cedula,
      nombre: jefe.nombre,
      role: 'jefe',
      comunidad: jefe.comunidad || person.comunidad,
    });

    return NextResponse.json({
      success: true,
      message: `¡Bienvenido(a), ${jefe.nombre}!`,
      redirectUrl: '/dashboard',
      user: {
        id: jefe.id,
        cedula: jefe.cedula,
        nombre: jefe.nombre,
        comunidad: jefe.comunidad
      }
    });

  } catch (error: any) {
    console.error('Error en API auth/login:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

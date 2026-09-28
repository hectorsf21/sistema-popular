import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  addIntegrante,
  checkPersonExistsInDB,
  deleteIntegrante,
  getJefeWithIntegrantes,
  updateIntegrante
} from '@/lib/store';
import { verifyPersonInExcel } from '@/lib/python';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'jefe') {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { cedula, telefono, responsabilidad, isManual, nombre, fechaNacimiento, municipio, parroquia, comunidad } = body;

    if (!cedula) {
      return NextResponse.json({ success: false, message: 'La cédula es requerida.' }, { status: 400 });
    }

    if (!telefono || !telefono.trim()) {
      return NextResponse.json({ success: false, message: 'El número de teléfono es obligatorio.' }, { status: 400 });
    }

    const norm = cedula.trim().toUpperCase().replace(/[\.\s\-]/g, '');
    const cleanCedula = norm.startsWith('V') ? `V-${norm.slice(1)}` : (norm.startsWith('E') ? `E-${norm.slice(1)}` : `V-${norm}`);

    // 1. Validar límite de 10 integrantes
    const jefe = await getJefeWithIntegrantes(session.cedula);
    if (jefe && jefe.integrantes.length >= 10) {
      return NextResponse.json({
        success: false,
        message: 'No puede agregar más de 10 integrantes a su patrulla 1x10.'
      }, { status: 400 });
    }

    // 2. Validar regla de no duplicidad
    const dbCheck = await checkPersonExistsInDB(cleanCedula);
    if (dbCheck.exists) {
      return NextResponse.json({
        success: false,
        message: dbCheck.detail || `La persona con cédula ${cleanCedula} ya se encuentra registrada en otra patrulla.`
      }, { status: 409 });
    }

    let memberData = {
      cedula: cleanCedula,
      nombre: '',
      fechaNacimiento: '',
      municipio: (municipio && municipio.trim()) || jefe?.municipio || 'MP. INFANTE',
      parroquia: (parroquia && parroquia.trim()) || jefe?.parroquia || 'PQ. VALLE DE LA PASCUA',
      comunidad: (comunidad && comunidad.trim()) || session.comunidad || 'Comunidad General',
      telefono: telefono.trim(),
      responsabilidad: responsabilidad || 'Patrullado'
    };

    // 3. Caso Registro Manual
    if (isManual) {
      if (!nombre || !fechaNacimiento || !comunidad) {
        return NextResponse.json({
          success: false,
          message: 'Todos los campos son obligatorios.'
        }, { status: 400 });
      }

      memberData.nombre = nombre.trim().toUpperCase();
      memberData.fechaNacimiento = fechaNacimiento;
    } else {
      // 4. Caso Búsqueda en Padrón
      const excelCheck = await verifyPersonInExcel(cleanCedula);
      if (!excelCheck.success || !excelCheck.data) {
        return NextResponse.json({
          success: false,
          message: excelCheck.message || 'La cédula no aparece en el padrón electoral.'
        }, { status: 400 });
      }

      const person = excelCheck.data;
      memberData.nombre = person.nombre;
      memberData.fechaNacimiento = person.fechaNacimiento;
      memberData.municipio = person.municipio || memberData.municipio;
      memberData.parroquia = person.parroquia || memberData.parroquia;
      memberData.comunidad = person.comunidad || memberData.comunidad;
    }

    // 5. Guardar en BD
    const newMember = await addIntegrante({
      jefeId: session.id,
      cedula: memberData.cedula,
      nombre: memberData.nombre,
      fechaNacimiento: memberData.fechaNacimiento,
      telefono: memberData.telefono,
      municipio: memberData.municipio,
      parroquia: memberData.parroquia,
      comunidad: memberData.comunidad,
      responsabilidad: memberData.responsabilidad
    });

    return NextResponse.json({
      success: true,
      message: `${memberData.nombre} ha sido agregado(a) a su patrulla 1x10 exitosamente.`,
      integrante: newMember
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'jefe') {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    const { id, telefono, responsabilidad, comunidad } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'El ID del integrante es requerido.' }, { status: 400 });
    }

    if (!telefono || !telefono.trim()) {
      return NextResponse.json({ success: false, message: 'El número de teléfono es obligatorio.' }, { status: 400 });
    }

    const updated = await updateIntegrante(id, {
      telefono: telefono.trim(),
      responsabilidad,
      comunidad
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Integrante no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Datos del integrante actualizados correctamente.',
      integrante: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'jefe') {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID de integrante no proporcionado.' }, { status: 400 });
    }

    await deleteIntegrante(id);

    return NextResponse.json({
      success: true,
      message: 'Integrante eliminado exitosamente. El cupo ha sido liberado.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
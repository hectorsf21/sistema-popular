import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  addIntegrante,
  checkIntegranteExists,
  deleteIntegrante,
  getJefeWithIntegrantes,
  updateIntegrante
} from '@/lib/store';
import { verifyPersonInExcel } from '@/lib/python';

// POST: Agregar nuevo integrante al 1x10
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'jefe') {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    const { cedula, telefono, responsabilidad } = await request.json();

    if (!cedula) {
      return NextResponse.json({ success: false, message: 'La cédula es requerida.' }, { status: 400 });
    }

    // 1. Validar límite de 10 integrantes
    const jefe = await getJefeWithIntegrantes(session.cedula);
    if (jefe && jefe.integrantes.length >= 10) {
      return NextResponse.json({
        success: false,
        message: 'No puede agregar más de 10 integrantes a su patrulla 1x10.'
      }, { status: 400 });
    }

    // 2. Validar regla de exclusividad / no duplicidad
    const existsCheck = await checkIntegranteExists(cedula);
    if (existsCheck.exists) {
      return NextResponse.json({
        success: false,
        message: `La persona con cédula ${cedula} ya fue agregada como integrante en otra patrulla (${existsCheck.jefeNombre}).`
      }, { status: 409 });
    }

    // 3. Validar con Python contra Excel
    const excelCheck = await verifyPersonInExcel(cedula);
    if (!excelCheck.success || !excelCheck.data) {
      return NextResponse.json({
        success: false,
        message: excelCheck.message || 'La cédula no aparece en el padrón electoral.'
      }, { status: 400 });
    }

    const person = excelCheck.data;

    // 4. Guardar en BD / Store
    const newMember = await addIntegrante({
      jefeId: session.id,
      cedula: person.cedula,
      nombre: person.nombre,
      fechaNacimiento: person.fechaNacimiento,
      telefono: telefono || null,
      comunidad: person.comunidad,
      responsabilidad: responsabilidad || 'Patrullado'
    });

    return NextResponse.json({
      success: true,
      message: `${person.nombre} ha sido agregado(a) a su patrulla 1x10.`,
      integrante: newMember
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Editar integrante existente
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

    const updated = await updateIntegrante(id, {
      telefono,
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

// DELETE: Eliminar integrante del 1x10
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

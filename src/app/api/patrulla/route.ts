import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getJefeWithIntegrantes } from '@/lib/store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'jefe') {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    const jefe = await getJefeWithIntegrantes(session.cedula);

    return NextResponse.json({
      success: true,
      jefe: jefe || {
        id: session.id,
        cedula: session.cedula,
        nombre: session.nombre,
        comunidad: session.comunidad || 'Sin comunidad',
        integrantes: []
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

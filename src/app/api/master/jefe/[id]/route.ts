import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getJefeById } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'master') {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    const { id } = params;
    const jefe = await getJefeById(id);

    if (!jefe) {
      return NextResponse.json({ success: false, message: 'Jefe de Patrulla no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      jefe
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

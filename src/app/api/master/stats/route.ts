import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllJefesWithStats } from '@/lib/store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'master') {
      return NextResponse.json({ success: false, message: 'No autorizado. Acceso restringido a Master Admin.' }, { status: 401 });
    }

    const jefes = await getAllJefesWithStats();

    const totalJefes = jefes.length;
    const totalIntegrantes = jefes.reduce((acc, j) => acc + j.totalIntegrantes, 0);
    const jefesCompletos = jefes.filter(j => j.isCompleted).length;
    const metaMetaPorcentaje = totalJefes > 0 ? Math.round((totalIntegrantes / (totalJefes * 10)) * 100) : 0;

    // Conteo por comunidades
    const comunidadesMap: Record<string, number> = {};
    jefes.forEach(j => {
      comunidadesMap[j.comunidad] = (comunidadesMap[j.comunidad] || 0) + 1 + j.totalIntegrantes;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalJefes,
        totalIntegrantes,
        totalGeneral: totalJefes + totalIntegrantes,
        jefesCompletos,
        metaPorcentaje: metaMetaPorcentaje,
        comunidadesCount: Object.keys(comunidadesMap).length
      },
      jefes
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

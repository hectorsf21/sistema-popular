import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllJefesWithStats } from '@/lib/store';

// Meta fija global establecida: 572.000 personas organizadas
const META_GLOBAL_OBJETIVO = 572000;

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'master') {
      return NextResponse.json({ success: false, message: 'No autorizado. Acceso restringido a Master Admin.' }, { status: 401 });
    }

    const jefes = await getAllJefesWithStats();

    const totalJefes = jefes.length;
    const totalIntegrantes = jefes.reduce((acc, j) => acc + j.totalIntegrantes, 0);
    const totalGeneral = totalJefes + totalIntegrantes; // Jefes + Integrantes
    const jefesCompletos = jefes.filter(j => j.isCompleted).length;

    // Cálculo con 2 decimales reales
    const metaMetaPorcentaje = totalGeneral > 0
      ? Number(((totalGeneral / META_GLOBAL_OBJETIVO) * 100).toFixed(2))
      : 0.00;

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
        totalGeneral,
        jefesCompletos,
        metaPorcentaje: metaMetaPorcentaje,
        metaObjetivo: META_GLOBAL_OBJETIVO,
        comunidadesCount: Object.keys(comunidadesMap).length
      },
      jefes
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
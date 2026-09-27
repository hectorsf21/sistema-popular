import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { verifyPersonInExcel } from '@/lib/python';
import { checkPersonExistsInDB, getJefeWithIntegrantes } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'jefe') {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    const { cedula } = await request.json();
    if (!cedula) {
      return NextResponse.json({ success: false, message: 'Ingrese el número de cédula.' }, { status: 400 });
    }

    // 1. Verificar si el Jefe ya alcanzó su límite de 10 integrantes
    const jefe = await getJefeWithIntegrantes(session.cedula);
    if (jefe && jefe.integrantes.length >= 10) {
      return NextResponse.json({
        success: false,
        message: 'Ha alcanzado el límite máximo de 10 integrantes para su patrulla 1x10.'
      }, { status: 400 });
    }

    // 2. Verificar si la Cédula ya pertenece a OTRA patrulla o es un Jefe de Patrulla en la BD
    const dbCheck = await checkPersonExistsInDB(cedula);
    if (dbCheck.exists) {
      return NextResponse.json({
        success: false,
        message: dbCheck.detail || `Esta persona con cédula ${cedula} ya se encuentra registrada en el sistema y no se puede duplicar.`
      }, { status: 409 });
    }

    // 3. Verificar la Cédula en el padrón electoral Excel mediante Python
    const excelCheck = await verifyPersonInExcel(cedula);

    if (!excelCheck.success || !excelCheck.data) {
      return NextResponse.json({
        success: false,
        message: excelCheck.message || `La cédula ${cedula} no aparece registrada en el padrón electoral en Excel.`
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cédula verificada exitosamente en el padrón electoral.',
      person: excelCheck.data
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

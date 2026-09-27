import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export interface ExcelVerificationResult {
  success: boolean;
  message: string;
  data?: {
    cedula: string;
    nombre: string;
    nombres: string;
    apellidos: string;
    fechaNacimiento: string;
    comunidad: string;
    municipio: string;
    parroquia: string;
  };
}

export async function verifyPersonInExcel(
  cedula: string,
  fechaNacimiento?: string
): Promise<ExcelVerificationResult> {
  try {
    // Usar python3 si está en servidor Linux/CloudPanel
    const pythonBin = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'verify_excel.py');
    const excelPath = path.resolve(process.cwd(), process.env.EXCEL_PADRON_PATH || './data/padron.xlsx');

    const dobArg = fechaNacimiento ? `"${fechaNacimiento}"` : 'null';
    const command = `${pythonBin} "${scriptPath}" "${cedula}" ${dobArg} "${excelPath}"`;

    const { stdout } = await execPromise(command, {
      encoding: 'utf-8',
      timeout: 30000, // 30 segundos por si el Excel es grande
      env: { ...process.env },
    });

    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result: ExcelVerificationResult = JSON.parse(jsonMatch[0]);
      // Retorna exactamente lo que respondió Python (success: true o false con su mensaje)
      return result;
    }

    return {
      success: false,
      message: 'No se obtuvo una respuesta válida del verificador del padrón.'
    };
  } catch (error: any) {
    console.error('Error ejecutando script de verificación Python:', error);
    return {
      success: false,
      message: 'Error al procesar la verificación con el padrón electoral.'
    };
  }
}
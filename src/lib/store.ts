import { prisma } from './prisma';

export interface IntegranteData {
  id: string;
  jefeId: string;
  cedula: string;
  nombre: string;
  fechaNacimiento: string;
  telefono?: string | null;
  comunidad?: string | null;
  responsabilidad?: string | null;
  createdAt: string;
}

export interface JefeData {
  id: string;
  cedula: string;
  nombre: string;
  fechaNacimiento: string;
  telefono?: string | null;
  comunidad?: string | null;
  municipio?: string | null;
  parroquia?: string | null;
  createdAt: string;
  integrantes: IntegranteData[];
}

// Memory fallback para desarrollo si MySQL no está disponible
const memoryJefes = new Map<string, JefeData>();
const memoryIntegrantes = new Map<string, IntegranteData>();

export async function getJefeWithIntegrantes(cedula: string): Promise<JefeData | null> {
  try {
    const jefe = await prisma.jefePatrulla.findUnique({
      where: { cedula },
      include: {
        integrantes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (jefe) {
      return {
        ...jefe,
        createdAt: jefe.createdAt.toISOString(),
        integrantes: jefe.integrantes.map(i => ({
          ...i,
          createdAt: i.createdAt.toISOString()
        }))
      };
    }
  } catch (error) {
    console.warn('Prisma DB query fallback to memory:', error);
  }

  // Fallback a memoria
  const memJefe = memoryJefes.get(cedula);
  if (memJefe) return memJefe;
  return null;
}

export async function getJefeById(jefeId: string): Promise<JefeData | null> {
  try {
    const jefe = await prisma.jefePatrulla.findUnique({
      where: { id: jefeId },
      include: {
        integrantes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (jefe) {
      return {
        ...jefe,
        createdAt: jefe.createdAt.toISOString(),
        integrantes: jefe.integrantes.map(i => ({
          ...i,
          createdAt: i.createdAt.toISOString()
        }))
      };
    }
  } catch (error) {
    console.warn('Prisma DB query fallback to memory:', error);
  }

  for (const jefe of memoryJefes.values()) {
    if (jefe.id === jefeId) return jefe;
  }
  return null;
}

export async function checkIntegranteExists(cedula: string): Promise<{ exists: boolean; jefeNombre?: string }> {
  try {
    const integrante = await prisma.integrante.findUnique({
      where: { cedula },
      include: {
        jefe: {
          select: { nombre: true, cedula: true }
        }
      }
    });

    if (integrante) {
      return {
        exists: true,
        jefeNombre: integrante.jefe?.nombre || 'Otro Jefe de Patrulla'
      };
    }
  } catch (error) {
    console.warn('Prisma DB query fallback to memory:', error);
  }

  // Check memory
  for (const i of memoryIntegrantes.values()) {
    if (i.cedula === cedula) {
      const jefe = Array.from(memoryJefes.values()).find(j => j.id === i.jefeId);
      return {
        exists: true,
        jefeNombre: jefe?.nombre || 'Otro Jefe de Patrulla'
      };
    }
  }

  return { exists: false };
}

export async function checkPersonExistsInDB(cedulaInput: string): Promise<{
  exists: boolean;
  role?: 'jefe' | 'integrante';
  jefeNombre?: string;
  detail?: string;
}> {
  const norm = cedulaInput.trim().toUpperCase().replace(/[\.\s\-]/g, '');
  const cleanKeyFormatted = norm.startsWith('V') ? `V-${norm.slice(1)}` : `V-${norm}`;

  try {
    const jefe = await prisma.jefePatrulla.findFirst({
      where: {
        OR: [
          { cedula: cedulaInput },
          { cedula: norm },
          { cedula: cleanKeyFormatted }
        ]
      }
    });

    if (jefe) {
      return {
        exists: true,
        role: 'jefe',
        detail: `La persona con cédula ${cedulaInput} ya está registrada como Jefe de Patrulla (${jefe.nombre}).`
      };
    }

    const integrante = await prisma.integrante.findFirst({
      where: {
        OR: [
          { cedula: cedulaInput },
          { cedula: norm },
          { cedula: cleanKeyFormatted }
        ]
      },
      include: {
        jefe: { select: { nombre: true } }
      }
    });

    if (integrante) {
      return {
        exists: true,
        role: 'integrante',
        jefeNombre: integrante.jefe?.nombre || 'Otro Jefe de Patrulla',
        detail: `La persona con cédula ${cedulaInput} ya pertenece a la patrulla 1x10 de "${integrante.jefe?.nombre || 'Otro Jefe de Patrulla'}".`
      };
    }
  } catch (error) {
    console.warn('Prisma DB query checkPersonExistsInDB fallback to memory:', error);
  }

  // Memory checks
  for (const j of memoryJefes.values()) {
    const jNorm = j.cedula.toUpperCase().replace(/[\.\s\-]/g, '');
    if (jNorm === norm || j.cedula === cleanKeyFormatted || j.cedula === cedulaInput) {
      return {
        exists: true,
        role: 'jefe',
        detail: `La persona con cédula ${cedulaInput} ya está registrada como Jefe de Patrulla (${j.nombre}).`
      };
    }
  }

  for (const i of memoryIntegrantes.values()) {
    const iNorm = i.cedula.toUpperCase().replace(/[\.\s\-]/g, '');
    if (iNorm === norm || i.cedula === cleanKeyFormatted || i.cedula === cedulaInput) {
      const jefe = Array.from(memoryJefes.values()).find(j => j.id === i.jefeId);
      return {
        exists: true,
        role: 'integrante',
        jefeNombre: jefe?.nombre || 'Otro Jefe de Patrulla',
        detail: `La persona con cédula ${cedulaInput} ya pertenece a la patrulla 1x10 de "${jefe?.nombre || 'Otro Jefe de Patrulla'}".`
      };
    }
  }

  return { exists: false };
}


export async function addIntegrante(data: {
  jefeId: string;
  cedula: string;
  nombre: string;
  fechaNacimiento: string;
  telefono?: string;
  comunidad?: string;
  responsabilidad?: string;
}): Promise<IntegranteData> {
  try {
    const created = await prisma.integrante.create({
      data: {
        jefeId: data.jefeId,
        cedula: data.cedula,
        nombre: data.nombre,
        fechaNacimiento: data.fechaNacimiento,
        telefono: data.telefono,
        comunidad: data.comunidad,
        responsabilidad: data.responsabilidad || 'Patrullado'
      }
    });

    return {
      ...created,
      createdAt: created.createdAt.toISOString()
    };
  } catch (error) {
    console.warn('Prisma DB create fallback to memory:', error);
  }

  // Fallback a memoria
  const newInt: IntegranteData = {
    id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    jefeId: data.jefeId,
    cedula: data.cedula,
    nombre: data.nombre,
    fechaNacimiento: data.fechaNacimiento,
    telefono: data.telefono || null,
    comunidad: data.comunidad || null,
    responsabilidad: data.responsabilidad || 'Patrullado',
    createdAt: new Date().toISOString()
  };

  memoryIntegrantes.set(data.cedula, newInt);
  
  for (const jefe of memoryJefes.values()) {
    if (jefe.id === data.jefeId) {
      jefe.integrantes.unshift(newInt);
      break;
    }
  }

  return newInt;
}

export async function updateIntegrante(
  id: string,
  data: { telefono?: string; comunidad?: string; responsabilidad?: string }
): Promise<IntegranteData | null> {
  try {
    const updated = await prisma.integrante.update({
      where: { id },
      data
    });
    return {
      ...updated,
      createdAt: updated.createdAt.toISOString()
    };
  } catch (error) {
    console.warn('Prisma DB update fallback to memory:', error);
  }

  for (const [cedula, i] of memoryIntegrantes.entries()) {
    if (i.id === id) {
      if (data.telefono !== undefined) i.telefono = data.telefono;
      if (data.comunidad !== undefined) i.comunidad = data.comunidad;
      if (data.responsabilidad !== undefined) i.responsabilidad = data.responsabilidad;
      return i;
    }
  }

  return null;
}

export async function deleteIntegrante(id: string): Promise<boolean> {
  try {
    await prisma.integrante.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.warn('Prisma DB delete fallback to memory:', error);
  }

  for (const [cedula, i] of memoryIntegrantes.entries()) {
    if (i.id === id) {
      memoryIntegrantes.delete(cedula);
      for (const jefe of memoryJefes.values()) {
        jefe.integrantes = jefe.integrantes.filter(item => item.id !== id);
      }
      return true;
    }
  }

  return true;
}

export async function getAllJefesWithStats() {
  try {
    const jefes = await prisma.jefePatrulla.findMany({
      include: {
        integrantes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (jefes.length > 0) {
      return jefes.map(j => ({
        id: j.id,
        cedula: j.cedula,
        nombre: j.nombre,
        municipio: j.municipio || '',
        parroquia: j.parroquia || '',
        comunidad: j.comunidad || 'Sin comunidad',
        totalIntegrantes: j.integrantes.length,
        isCompleted: j.integrantes.length >= 10,
        createdAt: j.createdAt.toISOString()
      }));
    }
  } catch (error) {
    console.warn('Prisma DB getAllJefes fallback to memory:', error);
  }

  return Array.from(memoryJefes.values()).map(j => ({
    id: j.id,
    cedula: j.cedula,
    nombre: j.nombre,
    comunidad: j.comunidad || 'Sin comunidad',
    totalIntegrantes: j.integrantes.length,
    isCompleted: j.integrantes.length >= 10,
    createdAt: j.createdAt
  }));
}

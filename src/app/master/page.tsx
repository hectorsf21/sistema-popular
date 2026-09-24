'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Users, Search, LogOut, CheckCircle2, Eye,
  BarChart3, MapPin, Server, X, UserCheck, Layers, Printer, FileDown
} from 'lucide-react';
import CloudpanelGuideModal from '@/components/CloudpanelGuideModal';
import CascadingLocationSelect from '@/components/CascadingLocationSelect';

interface JefeItem {
  id: string;
  cedula: string;
  nombre: string;
  municipio: string;
  parroquia: string;
  comunidad: string;
  totalIntegrantes: number;
  isCompleted: boolean;
  createdAt: string;
}

interface StatsData {
  totalJefes: number;
  totalIntegrantes: number;
  totalGeneral: number;
  jefesCompletos: number;
  metaPorcentaje: number;
  comunidadesCount: number;
}

const MOCK_JEFES_STATIC: JefeItem[] = [
  {
    id: 'demo-1',
    cedula: 'V-14893609',
    nombre: 'DAYANA MARIA HERRERA',
    municipio: 'MP. INFANTE',
    parroquia: 'PQ. VALLE DE LA PASCUA',
    comunidad: 'CIRCUITO ANEXADO INFANTE II',
    totalIntegrantes: 10,
    isCompleted: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    cedula: 'V-14893613',
    nombre: 'ALFONZO JOSE HERNANDEZ BOLIVAR',
    municipio: 'MP. INFANTE',
    parroquia: 'PQ. VALLE DE LA PASCUA',
    comunidad: 'SECTOR GUAMACHAL',
    totalIntegrantes: 8,
    isCompleted: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-3',
    cedula: 'V-14893614',
    nombre: 'WOLFAN RAMON APONTE RODRIGUEZ',
    municipio: 'MP. INFANTE',
    parroquia: 'PQ. VALLE DE LA PASCUA',
    comunidad: 'CIRCUITO JUANA RAMIREZ LA AVANZADORA',
    totalIntegrantes: 10,
    isCompleted: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-4',
    cedula: 'V-55667788',
    nombre: 'Ana Karina Martínez Díaz',
    municipio: 'MP. ROSTRO DE CRISTO',
    parroquia: 'PQ. SAN JOSE DE TIZNADOS',
    comunidad: 'COMUNA GUERICO UNIDO Y ORGANIZADO',
    totalIntegrantes: 6,
    isCompleted: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-5',
    cedula: 'V-99887766',
    nombre: 'Pedro Antonio Sánchez Morales',
    municipio: 'MP. ROSTRO DE CRISTO',
    parroquia: 'PQ. SAN JOSE DE TIZNADOS',
    comunidad: 'CIRCUITO CAMAGUAN POTENCIA',
    totalIntegrantes: 10,
    isCompleted: true,
    createdAt: new Date().toISOString()
  }
];

export default function MasterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [jefes, setJefes] = useState<JefeItem[]>(MOCK_JEFES_STATIC);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'complete' | 'incomplete'>('all');
  
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [selectedParroquia, setSelectedParroquia] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');

  // Modales
  const [selectedJefeModal, setSelectedJefeModal] = useState<any | null>(null);
  const [loadingJefeDetails, setLoadingJefeDetails] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const fetchMasterStats = async () => {
    try {
      const res = await fetch('/api/master/stats');
      if (res.status === 401) {
        console.warn('Ejecutando en modo plano / Vercel.');
      } else {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          if (data.jefes && data.jefes.length > 0) {
            setJefes(data.jefes);
          }
        }
      }
    } catch (err) {
      console.warn('Usando mock estático de respaldo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterStats();
  }, []);

  const currentStats = stats || {
    totalJefes: jefes.length,
    totalIntegrantes: jefes.reduce((acc, j) => acc + j.totalIntegrantes, 0),
    totalGeneral: jefes.length + jefes.reduce((acc, j) => acc + j.totalIntegrantes, 0),
    jefesCompletos: jefes.filter(j => j.isCompleted).length,
    metaPorcentaje: jefes.length > 0 ? Math.round((jefes.reduce((acc, j) => acc + j.totalIntegrantes, 0) / (jefes.length * 10)) * 100) : 0,
    comunidadesCount: new Set(jefes.map(j => j.comunidad)).size
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleOpenJefeModal = async (jefe: JefeItem) => {
    setLoadingJefeDetails(true);
    setSelectedJefeModal(null);

    try {
      const res = await fetch(`/api/master/jefe/${jefe.id}`);
      const data = await res.json();
      if (data.success && data.jefe) {
        setSelectedJefeModal({
          ...data.jefe,
          municipio: jefe.municipio,
          parroquia: jefe.parroquia
        });
        setLoadingJefeDetails(false);
        return;
      }
    } catch (err) {
      // Fallback
    }

    setTimeout(() => {
      setSelectedJefeModal({
        id: jefe.id,
        cedula: jefe.cedula,
        nombre: jefe.nombre,
        municipio: jefe.municipio,
        parroquia: jefe.parroquia,
        comunidad: jefe.comunidad,
        integrantes: Array.from({ length: jefe.totalIntegrantes }).map((_, idx) => ({
          id: `int-${idx}`,
          cedula: `V-${20000000 + idx * 4321}`,
          nombre: `INTEGRANTE DEMO ${idx + 1}`,
          telefono: `0414-${1000000 + idx * 1111}`,
          responsabilidad: idx === 0 ? 'Logística' : idx === 1 ? 'Movilización' : 'Patrullado'
        }))
      });
      setLoadingJefeDetails(false);
    }, 200);
  };

  // Imprimir o Exportar PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Descargar Reporte Estático
  const handleDownloadStaticPDF = () => {
    if (!selectedJefeModal) return;
    const content = `=====================================================
SISTEMA POPULAR 1x10 - REPORTE OFICIAL DE PATRULLA
=====================================================
JEFE DE PATRULLA: ${selectedJefeModal.nombre}
CEDULA: ${selectedJefeModal.cedula}
MUNICIPIO: ${selectedJefeModal.municipio || 'MP. INFANTE'}
PARROQUIA: ${selectedJefeModal.parroquia || 'PQ. VALLE DE LA PASCUA'}
COMUNA / CIRCUITO: ${selectedJefeModal.comunidad}
TOTAL INTEGRANTES: ${selectedJefeModal.integrantes.length} / 10
=====================================================
LISTADO DE INTEGRANTES PATRULLADOS:
-----------------------------------------------------
${selectedJefeModal.integrantes.map((m: any, i: number) => 
  `#${i + 1} | ${m.cedula} | ${m.nombre} | ${m.responsabilidad || 'Patrullado'} | Tel: ${m.telefono || 'N/A'}`
).join('\n')}
=====================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_1x10_${selectedJefeModal.cedula}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredJefes = jefes.filter(j => {
    if (selectedMunicipio && j.municipio && j.municipio.toLowerCase() !== selectedMunicipio.toLowerCase()) return false;
    if (selectedParroquia && j.parroquia && j.parroquia.toLowerCase() !== selectedParroquia.toLowerCase()) return false;
    if (selectedComuna && j.comunidad && j.comunidad.toLowerCase() !== selectedComuna.toLowerCase()) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchText =
        j.nombre.toLowerCase().includes(term) ||
        j.cedula.toLowerCase().includes(term) ||
        j.comunidad.toLowerCase().includes(term);
      if (!matchText) return false;
    }

    if (filterType === 'complete') return j.isCompleted;
    if (filterType === 'incomplete') return !j.isCompleted;

    return true;
  });

  const resetLocationFilters = () => {
    setSelectedMunicipio('');
    setSelectedParroquia('');
    setSelectedComuna('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      
      {/* Navbar Superior */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black text-white shadow-lg shadow-red-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base leading-tight">Panel Master Admin</h1>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                  VERCEL READY
                </span>
              </div>
              <p className="text-xs text-slate-400">Supervisión 1x10 con Exportación a PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold border border-indigo-800 transition-colors"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Guía CloudPanel</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-900/80 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 no-print">

        {/* Tarjetas de Estadísticas Globales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Jefes Patrulla</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{currentStats.totalJefes}</h3>
              <p className="text-[11px] text-emerald-400 mt-1">Jefes activos en sistema</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Integrantes 1x10</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{currentStats.totalIntegrantes}</h3>
              <p className="text-[11px] text-indigo-400 mt-1">Integrantes registrados</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Población Organizada</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{currentStats.totalGeneral}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Jefes + Patrullados</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Meta 1x10 Alcanzada</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{currentStats.metaPorcentaje}%</h3>
              <p className="text-[11px] text-slate-400 mt-1">{currentStats.jefesCompletos} patrullas completas</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* SELECTOR EN CASCADA */}
        <CascadingLocationSelect
          selectedMunicipio={selectedMunicipio}
          selectedParroquia={selectedParroquia}
          selectedComuna={selectedComuna}
          onChangeMunicipio={setSelectedMunicipio}
          onChangeParroquia={setSelectedParroquia}
          onChangeComuna={setSelectedComuna}
          onReset={resetLocationFilters}
        />

        {/* Listado de Jefes */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Estructura General de Patrullas 1x10</h2>
              <p className="text-xs text-slate-400">
                Mostrando <strong className="text-indigo-400">{filteredJefes.length}</strong> Jefes de Patrulla
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar por Nombre o Cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('complete')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterType === 'complete' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  10/10 Completo
                </button>
                <button
                  onClick={() => setFilterType('incomplete')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterType === 'incomplete' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Incompletos
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Jefe de Patrulla</th>
                  <th className="py-3 px-4">Cédula</th>
                  <th className="py-3 px-4">Municipio / Parroquia</th>
                  <th className="py-3 px-4">Comuna / Circuito</th>
                  <th className="py-3 px-4 text-center">Avance 1x10</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredJefes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron Jefes de Patrulla con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredJefes.map((jefe) => (
                    <tr key={jefe.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {jefe.nombre}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs font-mono">
                        {jefe.cedula}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs">
                        <div className="font-semibold text-slate-200">{jefe.municipio || 'MP. INFANTE'}</div>
                        <div className="text-[11px] text-slate-400">{jefe.parroquia || 'PQ. VALLE DE LA PASCUA'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[200px]" title={jefe.comunidad}>{jefe.comunidad}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          jefe.isCompleted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {jefe.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>{jefe.totalIntegrantes} / 10 Integrantes</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenJefeModal(jefe)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold border border-indigo-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Integrantes</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL CON OPCIONES DE IMPRESIÓN Y EXPORTACIÓN A PDF */}
      {(selectedJefeModal || loadingJefeDetails) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-slate-800 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            <button
              onClick={() => setSelectedJefeModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {loadingJefeDetails ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Cargando integrantes de la patrulla...</p>
              </div>
            ) : selectedJefeModal && (
              <>
                {/* Cabecera Modal con Botones PDF / Imprimir */}
                <div className="mb-5 pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        PATRULLA 1x10
                      </span>
                      <span className="text-xs text-slate-400">{selectedJefeModal.comunidad}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{selectedJefeModal.nombre}</h3>
                    <p className="text-xs text-slate-400">Cédula: <strong className="text-slate-200">{selectedJefeModal.cedula}</strong></p>
                  </div>

                  {/* Botones de Exportar a PDF / Imprimir */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                      title="Imprimir o Guardar en PDF con diseño oficial"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir / PDF</span>
                    </button>

                    <button
                      onClick={handleDownloadStaticPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      title="Descargar reporte plano descargable"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Descargar Reporte</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Integrantes */}
                <div className="overflow-y-auto space-y-3 pr-2 flex-1">
                  {selectedJefeModal.integrantes.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-xl border border-slate-800">
                      Este Jefe de Patrulla aún no ha registrado integrantes en su 1x10.
                    </div>
                  ) : (
                    selectedJefeModal.integrantes.map((member: any, idx: number) => (
                      <div
                        key={member.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold text-xs flex items-center justify-center">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{member.nombre}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-slate-300">{member.cedula}</span>
                              {member.telefono && <span>• Tel: {member.telefono}</span>}
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-900">
                          {member.responsabilidad || 'Patrullado'}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Total: {selectedJefeModal.integrantes.length} / 10 integrantes</span>
                  <button
                    onClick={() => setSelectedJefeModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ÁREA DE IMPRESIÓN EXCLUSIVA (PRINTABLE REPORT PARA PDF) */}
      {selectedJefeModal && (
        <div className="printable-report hidden print:block">
          <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '20px', margin: 0, fontWeight: 'bold' }}>REPUBLICA BOLIVARIANA DE VENEZUELA</h2>
              <h1 style={{ fontSize: '24px', margin: '5px 0', color: '#000' }}>SISTEMA POPULAR 1x10 - REPORTE DE PATRULLA</h1>
              <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>Documento Oficial de Registro de Integrantes</p>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>JEFE DE PATRULLA:</strong> {selectedJefeModal.nombre}</p>
              <p><strong>CÉDULA DE IDENTIDAD:</strong> {selectedJefeModal.cedula}</p>
              <p><strong>MUNICIPIO:</strong> {selectedJefeModal.municipio || 'MP. INFANTE'}</p>
              <p><strong>PARROQUIA:</strong> {selectedJefeModal.parroquia || 'PQ. VALLE DE LA PASCUA'}</p>
              <p><strong>COMUNA / CIRCUITO:</strong> {selectedJefeModal.comunidad}</p>
              <p><strong>TOTAL INTEGRANTES:</strong> {selectedJefeModal.integrantes.length} / 10</p>
            </div>

            <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>INTEGRANTES REGISTRADOS (1x10)</h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f2f2f2', textAlign: 'left' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>#</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Cédula</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nombre Completo</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Responsabilidad</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Teléfono</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Firma / Verificación</th>
                </tr>
              </thead>
              <tbody>
                {selectedJefeModal.integrantes.map((m: any, idx: number) => (
                  <tr key={m.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.cedula}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.nombre}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.responsabilidad || 'Patrullado'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.telefono || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', height: '30px' }}></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '12px' }}>
              <div style={{ width: '40%', borderTop: '1px solid #000', paddingTop: '5px' }}>
                Firma del Jefe de Patrulla<br/>{selectedJefeModal.cedula}
              </div>
              <div style={{ width: '40%', borderTop: '1px solid #000', paddingTop: '5px' }}>
                Verificación Master Admin<br/>SISTEMA POPULAR 1x10
              </div>
            </div>
          </div>
        </div>
      )}

      <CloudpanelGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

    </div>
  );
}

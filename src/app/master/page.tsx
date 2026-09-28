'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Search, LogOut, CheckCircle2, Eye,
  BarChart3, MapPin, X, UserCheck, Layers, Printer, FileDown
} from 'lucide-react';
import CascadingLocationSelect from '@/components/CascadingLocationSelect';
import BalanceElectoralModal from '@/components/BalanceElectoralModal';

interface IntegranteItem {
  id: string;
  cedula: string;
  nombre: string;
  telefono?: string;
  municipio?: string;
  parroquia?: string;
  comunidad?: string;
}

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
  integrantes?: IntegranteItem[];
}

interface StatsData {
  totalJefes: number;
  totalIntegrantes: number;
  totalGeneral: number;
  jefesCompletos: number;
  metaPorcentaje: number;
  metaObjetivo?: number;
  comunidadesCount: number;
}

export default function MasterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [jefes, setJefes] = useState<JefeItem[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'complete' | 'incomplete'>('all');
  
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [selectedParroquia, setSelectedParroquia] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');

  // Modales
  const [selectedJefeModal, setSelectedJefeModal] = useState<any | null>(null);
  const [loadingJefeDetails, setLoadingJefeDetails] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);

  const fetchMasterStats = async () => {
    try {
      const res = await fetch('/api/master/stats');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        if (data.jefes) {
          setJefes(data.jefes);
        }
      }
    } catch (err) {
      console.error('Error cargando estadísticas master:', err);
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
    metaPorcentaje: 0.00,
    metaObjetivo: 572067,
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

    setSelectedJefeModal({
      ...jefe,
      integrantes: jefe.integrantes || []
    });
    setLoadingJefeDetails(false);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadStaticPDF = () => {
    if (!selectedJefeModal) return;
    const content = `=====================================================
1X10 COMUNAL GUARICO - REPORTE OFICIAL DE PATRULLA
=====================================================
JEFE DE PATRULLA: ${selectedJefeModal.nombre}
CEDULA: ${selectedJefeModal.cedula}
MUNICIPIO: ${selectedJefeModal.municipio || 'MP. INFANTE'}
PARROQUIA: ${selectedJefeModal.parroquia || 'PQ. VALLE DE LA PASCUA'}
COMUNA / CIRCUITO: ${selectedJefeModal.comunidad}
TOTAL INTEGRANTES: ${selectedJefeModal.integrantes?.length || 0} / 10
=====================================================
LISTADO DE INTEGRANTES PATRULLADOS:
-----------------------------------------------------
${(selectedJefeModal.integrantes || []).map((m: any, i: number) => 
  `#${i + 1} | Cédula: ${m.cedula} | ${m.nombre} | Tel: ${m.telefono || 'N/A'}`
).join('\n')}
=====================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_1X10_COMUNAL_GUARICO_${selectedJefeModal.cedula}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredJefes = jefes.filter(j => {
    if (selectedMunicipio && j.municipio && j.municipio.toLowerCase() !== selectedMunicipio.toLowerCase()) return false;
    if (selectedParroquia && j.parroquia && j.parroquia.toLowerCase() !== selectedParroquia.toLowerCase()) return false;
    if (selectedComuna && j.comunidad && j.comunidad.toLowerCase() !== selectedComuna.toLowerCase()) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchJefe =
        j.nombre.toLowerCase().includes(term) ||
        j.cedula.toLowerCase().includes(term) ||
        j.comunidad.toLowerCase().includes(term);

      const matchIntegrante = j.integrantes?.some(
        (i) => i.nombre.toLowerCase().includes(term) || i.cedula.toLowerCase().includes(term)
      );

      if (!matchJefe && !matchIntegrante) return false;
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
    <div className="min-h-screen bg-[#080d1a] text-slate-100 pb-16">
      
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-30 bg-[#0b1326]/90 backdrop-blur-md border-b border-slate-800/80 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/izquierda.png"
              alt="Logo Izquierdo"
              width={245}
              height={111}
              className="object-contain max-h-16 w-auto block"
            />
          </div>

          <div className="hidden lg:block text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-extrabold text-white text-lg tracking-tight">1X10 COMUNAL GUARICO</h1>
              <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px] font-bold border border-sky-800">
                MASTER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400">Supervisión Territorial 1x10</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* BOTÓN BALANCE TERRITORIAL */}
            <button
              onClick={() => setIsBalanceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-800 text-xs font-semibold transition-all shadow-sm"
              title="Ver tabla comparativa oficial por municipio"
            >
              <BarChart3 className="w-4 h-4 text-red-400" />
              <span>Balance Territorial</span>
            </button>

            {/* BOTÓN SALIR */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Salir</span>
            </button>

            <img
              src="/derecha.png"
              alt="Logo Derecho"
              width={181}
              height={151}
              className="object-contain max-h-16 w-auto block"
            />
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
              <p className="text-[11px] text-sky-400 mt-1">Jefes de patrulla activos</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center border border-sky-800">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Integrantes 1x10</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{currentStats.totalIntegrantes}</h3>
              <p className="text-[11px] text-sky-400 mt-1">Patrullados integrados</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Población Organizada</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{currentStats.totalGeneral}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Jefes + Patrullados</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-slate-300 flex items-center justify-center border border-slate-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Meta Global (572k)</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                {Number(currentStats.metaPorcentaje || 0).toFixed(2)}%
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">{currentStats.jefesCompletos} patrullas 10/10</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
              <BarChart3 className="w-5 h-5" />
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

        {/* Listado de Jefes con Búsqueda Cruzada */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Estructura 1X10 COMUNAL GUARICO</h2>
              <p className="text-xs text-slate-400">
                Mostrando <strong className="text-sky-400">{filteredJefes.length}</strong> Patrullas (Busca por Jefe o Integrante)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Buscar Cédula o Nombre (Jefe o Integrante)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    filterType === 'incomplete' ? 'bg-slate-800 text-slate-300' : 'text-slate-400 hover:text-slate-200'
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
                      No se encontraron registros con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredJefes.map((jefe) => {
                    const matchedMember = searchTerm
                      ? jefe.integrantes?.find(
                          (i) =>
                            i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            i.cedula.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                      : null;

                    return (
                      <tr key={jefe.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{jefe.nombre}</div>
                          {matchedMember && (
                            <div className="text-[11px] text-amber-400 font-normal mt-0.5 flex items-center gap-1">
                              <span>↳ Coincide integrante:</span>
                              <strong className="underline">{matchedMember.nombre} ({matchedMember.cedula})</strong>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 text-xs font-mono">
                          {jefe.cedula}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 text-xs">
                          <div className="font-semibold text-slate-200">{jefe.municipio || 'MP. INFANTE'}</div>
                          <div className="text-[11px] text-slate-400">{jefe.parroquia || 'PQ. VALLE DE LA PASCUA'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={jefe.comunidad}>{jefe.comunidad}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            jefe.isCompleted
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-sky-950 text-sky-300 border border-sky-800'
                          }`}>
                            {jefe.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>{jefe.totalIntegrantes} / 10 Integrantes</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenJefeModal(jefe)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs font-semibold border border-sky-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Integrantes</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL DETALLES DEL JEFE / INTEGRANTES */}
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
                <div className="w-8 h-8 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Cargando integrantes de la patrulla...</p>
              </div>
            ) : selectedJefeModal && (
              <>
                <div className="mb-5 pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                        1X10 COMUNAL GUARICO
                      </span>
                      <span className="text-xs text-slate-400">{selectedJefeModal.comunidad}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{selectedJefeModal.nombre}</h3>
                    <p className="text-xs text-slate-400">Cédula: <strong className="text-slate-200">{selectedJefeModal.cedula}</strong></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir / PDF</span>
                    </button>

                    <button
                      onClick={handleDownloadStaticPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5 text-sky-400" />
                      <span>Descargar Reporte</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto space-y-2.5 pr-2 flex-1">
                  {selectedJefeModal.integrantes?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-xl border border-slate-800">
                      Este Jefe de Patrulla aún no ha registrado integrantes en su 1x10.
                    </div>
                  ) : (
                    selectedJefeModal.integrantes?.map((member: any, idx: number) => (
                      <div
                        key={member.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 font-bold text-xs flex items-center justify-center">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{member.nombre}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {member.cedula}
                            </div>
                          </div>
                        </div>

                        {member.telefono && (
                          <span className="text-xs text-slate-400">
                            Tel: {member.telefono}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Total: {selectedJefeModal.integrantes?.length || 0} / 10 integrantes</span>
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

      {/* MODAL DE BALANCE ELECTORAL POR MUNICIPIO */}
      <BalanceElectoralModal
        isOpen={isBalanceOpen}
        onClose={() => setIsBalanceOpen(false)}
        jefes={jefes}
      />

      {/* REPORTE IMPRESO OFICIAL */}
      {selectedJefeModal && (
        <div className="printable-report hidden print:block">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: letter portrait;
                margin: 15mm;
              }
              body {
                background: white !important;
                color: black !important;
              }
              .printable-report {
                display: block !important;
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: #111 !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
            }
          `}} />

          <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* ENCABEZADO CON AMBOS LOGOS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <img
                src="/izquierda.png"
                alt="Logo PSUV"
                style={{ width: '140px', height: 'auto', objectFit: 'contain' }}
              />
              <img
                src="/derecha.png"
                alt="Logo Comisión Electoral"
                style={{ width: '110px', height: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* TÍTULO Y JEFE DE PATRULLA */}
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                Lista de Patrulleros 1X10
              </h1>
              <h2 style={{ fontSize: '17px', fontWeight: 'normal', margin: 0, color: '#222' }}>
                Jefe de patrulla: <strong>{selectedJefeModal.nombre}</strong>
              </h2>
            </div>

            {/* TABLA CON FORMATO EXACTO */}
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #f1f5f9' }}>
                    Nombre y Apellido
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #f1f5f9', width: '85px' }}>
                    Cédula
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #f1f5f9', width: '100px' }}>
                    Telefono
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #f1f5f9' }}>
                    Municipio
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #f1f5f9' }}>
                    Parroquia
                  </th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1' }}>
                    Centro de Votación
                  </th>
                </tr>
              </thead>
              <tbody>
                {(!selectedJefeModal.integrantes || selectedJefeModal.integrantes.length === 0) ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      No hay integrantes registrados en esta patrulla.
                    </td>
                  </tr>
                ) : (
                  selectedJefeModal.integrantes.map((m: any, idx: number) => {
                    const cleanCI = m.cedula ? m.cedula.replace(/^[VE]-?/i, '') : '';
                    const isLast = idx === selectedJefeModal.integrantes.length - 1;

                    return (
                      <tr key={m.id || idx} style={{ borderBottom: isLast ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: '500', color: '#0f172a', borderBottom: isLast ? 'none' : '1px solid #e2e8f0', borderRight: '1px solid #f8fafc' }}>
                          {m.nombre}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155', borderBottom: isLast ? 'none' : '1px solid #e2e8f0', borderRight: '1px solid #f8fafc' }}>
                          {cleanCI}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', color: '#334155', borderBottom: isLast ? 'none' : '1px solid #e2e8f0', borderRight: '1px solid #f8fafc' }}>
                          {m.telefono || 'S/N'}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', textTransform: 'uppercase', color: '#334155', borderBottom: isLast ? 'none' : '1px solid #e2e8f0', borderRight: '1px solid #f8fafc' }}>
                          {m.municipio || selectedJefeModal.municipio || 'JUAN GERMAN ROSCIO N.'}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', textTransform: 'uppercase', color: '#334155', borderBottom: isLast ? 'none' : '1px solid #e2e8f0', borderRight: '1px solid #f8fafc' }}>
                          {m.parroquia || selectedJefeModal.parroquia || 'SAN JUAN DE LOS MORROS'}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', textTransform: 'uppercase', color: '#334155', borderBottom: isLast ? 'none' : '1px solid #e2e8f0' }}>
                          {m.centroVotacion || m.comunidad || selectedJefeModal.comunidad || 'CIRCUITO COMUNAL'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

          </div>
        </div>
      )}

    </div>
  );
}
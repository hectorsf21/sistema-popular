'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, UserPlus, LogOut, CheckCircle2, AlertCircle, Trash2, Edit3,
  Search, MapPin, Phone, X, Server
} from 'lucide-react';
import CloudpanelGuideModal from '@/components/CloudpanelGuideModal';

interface Integrante {
  id: string;
  jefeId: string;
  cedula: string;
  nombre: string;
  fechaNacimiento: string;
  telefono?: string;
  comunidad?: string;
  createdAt: string;
}

interface JefeProfile {
  id: string;
  cedula: string;
  nombre: string;
  comunidad: string;
  integrantes: Integrante[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jefe, setJefe] = useState<JefeProfile | null>(null);

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Estados de Agregar Integrante
  const [searchCedula, setSearchCedula] = useState('');
  const [verifyingCedula, setVerifyingCedula] = useState(false);
  const [foundPerson, setFoundPerson] = useState<any | null>(null);
  const [inputTelefono, setInputTelefono] = useState('');
  const [addError, setAddError] = useState('');

  // Estados de Editar / Eliminar
  const [selectedMember, setSelectedMember] = useState<Integrante | null>(null);
  const [editTelefono, setEditTelefono] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPatrulla = async () => {
    try {
      const res = await fetch('/api/patrulla');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setJefe(data.jefe);
      }
    } catch (err) {
      console.error('Error cargando patrulla:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatrulla();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleVerifyCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCedula) return;

    setVerifyingCedula(true);
    setAddError('');
    setFoundPerson(null);

    try {
      const res = await fetch('/api/patrulla/verify-cedula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: searchCedula.trim() })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAddError(data.message || 'La cédula no es válida o no está disponible.');
      } else {
        setFoundPerson(data.person);
      }
    } catch (err) {
      setAddError('Error de comunicación con el servidor.');
    } finally {
      setVerifyingCedula(false);
    }
  };

  const handleConfirmAddMember = async () => {
    if (!foundPerson) return;
    setVerifyingCedula(true);
    setAddError('');

    try {
      const res = await fetch('/api/patrulla/integrantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: foundPerson.cedula,
          telefono: inputTelefono
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAddError(data.message || 'Error al agregar integrante.');
      } else {
        showToast(data.message || 'Integrante registrado exitosamente.');
        closeAddModal();
        fetchPatrulla();
      }
    } catch (err) {
      setAddError('Error al guardar el integrante.');
    } finally {
      setVerifyingCedula(false);
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSearchCedula('');
    setFoundPerson(null);
    setInputTelefono('');
    setAddError('');
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;

    try {
      const res = await fetch('/api/patrulla/integrantes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember.id,
          telefono: editTelefono
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast('Teléfono del integrante actualizado.');
        setIsEditModalOpen(false);
        fetchPatrulla();
      } else {
        showToast(data.message || 'Error al actualizar', 'error');
      }
    } catch (err) {
      showToast('Error al actualizar integrante', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;

    try {
      const res = await fetch(`/api/patrulla/integrantes?id=${selectedMember.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        showToast('Integrante eliminado de la patrulla.');
        setIsDeleteModalOpen(false);
        fetchPatrulla();
      } else {
        showToast(data.message || 'Error al eliminar', 'error');
      }
    } catch (err) {
      showToast('Error al eliminar integrante', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-400">Cargando 1X10 COMUNAL GUARICO...</p>
        </div>
      </div>
    );
  }

  const integrantesCount = jefe?.integrantes.length || 0;
  const isComplete = integrantesCount >= 10;
  const percentage = Math.round((integrantesCount / 10) * 100);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 pb-16">
      
      {/* Toast Notificación */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border transition-all ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200' : 'bg-red-950/90 border-red-800 text-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* HEADER SUPERIOR CON DOS LOGOS (Izquierda 245x111, Derecha 181x151) */}
      <header className="sticky top-0 z-30 bg-[#0b1326]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          
          {/* LOGO IZQUIERDO SUPERIOR (245px ancho x 111px alto) */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/izquierda.jpg"
              onError={(e) => { (e.target as HTMLImageElement).src = '/izquierda.svg'; }}
              alt="Logo Izquierdo"
              style={{ width: '245px', height: '111px' }}
              className="object-contain max-h-16 w-auto"
            />
          </div>

          {/* Título Central */}
          <div className="hidden lg:block text-center">
            <h1 className="font-extrabold text-white text-lg tracking-tight">1X10 COMUNAL GUARICO</h1>
            <p className="text-xs text-slate-400">Panel del Jefe de Patrulla</p>
          </div>

          {/* LOGO DERECHO SUPERIOR (181px ancho x 151px alto) & Botones */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>CloudPanel</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Salir</span>
            </button>

            <img
              src="/derecha.png"
              onError={(e) => { (e.target as HTMLImageElement).src = '/derecha.svg'; }}
              alt="Logo Derecho"
              style={{ width: '181px', height: '151px' }}
              className="object-contain max-h-16 w-auto"
            />
          </div>

        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* Tarjeta de Información del Jefe y Progreso */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-800/80">
                  JEFE DE PATRULLA
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {jefe?.comunidad}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{jefe?.nombre}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Cédula: <strong className="text-slate-200">{jefe?.cedula}</strong>
              </p>
            </div>

            {/* Contador de Meta 1x10 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#070e1e] p-4 rounded-xl border border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-6 text-xs text-slate-400 font-semibold">
                  <span>META 1X10 COMUNAL</span>
                  <span className="text-sky-400 font-bold">{integrantesCount} / 10</span>
                </div>
                <div className="w-48 sm:w-56 h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-500 to-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                disabled={isComplete}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all ${
                  isComplete
                    ? 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/20'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{isComplete ? 'Patrulla Completa' : 'Ingresar Integrante'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Listado de Integrantes (10 Cupos) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Integrantes Patrullados (1x10)</span>
            </h3>
            <span className="text-xs text-slate-400">
              {10 - integrantesCount} cupos disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jefe?.integrantes.map((member, idx) => (
              <div
                key={member.id}
                className="glass-card rounded-xl p-4 relative group border border-slate-800 hover:border-sky-500/40 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-300 font-bold flex items-center justify-center text-xs shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-snug">{member.nombre}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-300 font-mono">
                          {member.cedula}
                        </span>
                        {member.telefono && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            • <Phone className="w-3 h-3 text-slate-500" /> {member.telefono}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setEditTelefono(member.telefono || '');
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
                      title="Editar teléfono"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/80 text-slate-400 hover:text-red-300 transition-colors border border-slate-800"
                      title="Eliminar integrante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {Array.from({ length: 10 - integrantesCount }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-xl p-4 border border-dashed border-slate-800 hover:border-sky-500/40 bg-slate-900/20 hover:bg-slate-900/40 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-600 font-bold flex items-center justify-center text-xs border border-slate-800">
                    #{integrantesCount + idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 group-hover:text-sky-300 transition-colors">
                      Cupo Vacante #{integrantesCount + idx + 1}
                    </div>
                    <div className="text-[11px] text-slate-600">Clic para agregar integrante</div>
                  </div>
                </div>
                <UserPlus className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* MODAL 1: INGRESAR INTEGRANTE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
            <button
              onClick={closeAddModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ingresar Integrante 1x10</h3>
                <p className="text-xs text-slate-400">Verificación directa en el padrón electoral</p>
              </div>
            </div>

            {addError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{addError}</span>
              </div>
            )}

            {!foundPerson ? (
              <form onSubmit={handleVerifyCedula} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Cédula de Identidad del Integrante
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ej: V-14893609"
                      value={searchCedula}
                      onChange={(e) => setSearchCedula(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-sky-500"
                    />
                    <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingCedula}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20"
                  >
                    {verifyingCedula ? 'Verificando en Padrón...' : 'Buscar en Padrón'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/60 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registro verificado en Padrón Electoral</span>
                  </div>
                  <div className="text-slate-200 font-bold text-sm">{foundPerson.nombre}</div>
                  <div className="text-slate-400 grid grid-cols-2 gap-1 pt-1 border-t border-slate-800">
                    <div>Cédula: <span className="text-slate-200">{foundPerson.cedula}</span></div>
                    <div>Fecha Nac: <span className="text-slate-200">{foundPerson.fechaNacimiento}</span></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono de Contacto (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: 0414-1234567"
                    value={inputTelefono}
                    onChange={(e) => setInputTelefono(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setFoundPerson(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddMember}
                    disabled={verifyingCedula}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20"
                  >
                    {verifyingCedula ? 'Guardando...' : 'Confirmar e Integrar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR INTEGRANTE */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Editar Integrante</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedMember.nombre} ({selectedMember.cedula})</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={editTelefono}
                  onChange={(e) => setEditTelefono(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ELIMINAR INTEGRANTE */}
      {isDeleteModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-slate-800 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-300 flex items-center justify-center mx-auto mb-3 border border-slate-800">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white">¿Eliminar Integrante?</h3>
            <p className="text-xs text-slate-400 mt-1">
              ¿Desea eliminar a <strong className="text-slate-200">{selectedMember.nombre}</strong> de su patrulla 1x10?
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <CloudpanelGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Calendar, Key, CheckCircle2, AlertCircle, Sparkles, FileSpreadsheet } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'jefe' | 'master'>('jefe');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [masterKey, setMasterKey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const isMaster = activeTab === 'master';
      const payload = isMaster
        ? { isMaster: true, masterKey }
        : { isMaster: false, cedula: cedula.trim(), fechaNacimiento };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Error al iniciar sesión.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Ingreso exitoso.');
      setTimeout(() => {
        router.push(data.redirectUrl || '/dashboard');
      }, 600);

    } catch (err) {
      setErrorMsg('Ocurrió un error de conexión con el servidor.');
      setLoading(false);
    }
  };

  const fillDemoUser = (demoCed: string, demoDob: string) => {
    setCedula(demoCed);
    setFechaNacimiento(demoDob);
    setErrorMsg('');
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden">
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Encabezado Principal */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-indigo-400 text-xs font-semibold mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Organizativo de Patrullas</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Sistema Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-indigo-400">1x10</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Validación en tiempo real contra el padrón electoral en Excel
          </p>
        </div>

        {/* Tarjeta del Formulario de Login */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800/80">
          
          {/* Pestanas Tipo Toggle */}
          <div className="flex p-1 bg-slate-900/90 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab('jefe'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'jefe'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Jefe de Patrulla</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('master'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'master'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Acceso Master</span>
            </button>
          </div>

          {/* Mensajes de Alerta */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulario Login Jefe de Patrulla */}
          {activeTab === 'jefe' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cédula de Identidad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ej: V-12345678"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verificando Padrón...</span>
                  </>
                ) : (
                  <span>Ingresar al Sistema 1x10</span>
                )}
              </button>

              {/* Botones de Usuario de Prueba para la Simulación */}
              <div className="pt-4 border-t border-slate-800/80 mt-6">
                <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cédulas del Padrón Real (Clic para probar):</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoUser('V-14893609', '1980-07-26')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-200">Dayana Herrera</div>
                    <div className="text-[10px] text-slate-400">V-14893609 • 26/07/1980</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoUser('V-14893613', '1980-11-14')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-200">Alfonzo Hernández</div>
                    <div className="text-[10px] text-slate-400">V-14893613 • 14/11/1980</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Formulario Login Master Admin */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Clave de Administrador Master
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Clave Master (Ej: admin123)"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Clave por defecto de demostración: <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">admin123</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Ingresar a Panel Master</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Plataforma de Organización Popular • Next.js & MySQL & Python
        </p>
      </div>
    </main>
  );
}

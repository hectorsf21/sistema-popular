'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Calendar, Key, CheckCircle2, AlertCircle, Sparkles, FileSpreadsheet, UserPlus, X, Phone, MapPin } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'jefe' | 'master'>('jefe');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [masterKey, setMasterKey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal de Registro Estático
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regCedula, setRegCedula] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regComunidad, setRegComunidad] = useState('');
  const [regFechaNac, setRegFechaNac] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

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
      }, 500);

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

  const handleStaticRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccessMsg('¡Registro completado exitosamente para la simulación 1X10 COMUNAL GUARICO!');
    setTimeout(() => {
      setIsRegisterOpen(false);
      setRegSuccessMsg('');
      setRegNombre('');
      setRegApellido('');
      setRegCedula('');
      setRegTelefono('');
      setRegComunidad('');
      setRegFechaNac('');
    }, 2000);
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#080d1a] to-[#040711] overflow-hidden">
      
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        
        {/* LOGO EN EL CENTRO SUPERIOR (Dimensiones: 212px ancho x 204px alto) */}
        <div className="mb-6 flex justify-center items-center">
          <img
            src="/centro.png"
            onError={(e) => {
              // Fallback a SVG si centro.png aún no existe
              (e.target as HTMLImageElement).src = '/centro.svg';
            }}
            alt="Logo 1X10 COMUNAL GUARICO"
            style={{ width: '212px', height: '204px' }}
            className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Encabezado Principal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-sky-400 text-xs font-semibold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Organizativo Territorial</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">
              1X10 COMUNAL GUARICO
            </span>
          </h1>
          
          <p className="mt-1.5 text-xs text-slate-400">
            Validación de integrantes por Cédula y Fecha de Nacimiento
          </p>
        </div>

        {/* Tarjeta del Formulario de Login */}
        <div className="glass-panel w-full rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
          
          {/* Pestanas Toggle */}
          <div className="flex p-1 bg-slate-900/90 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab('jefe'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'jefe'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Jefe de Patrulla</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('master'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'master'
                  ? 'bg-slate-800 text-sky-300 border border-slate-700 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Acceso Master</span>
            </button>
          </div>

          {/* Alert Error */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alert Success */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-start gap-2.5">
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
                    placeholder="Ej: V-14893609"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verificando Padrón...</span>
                  </>
                ) : (
                  <span>Ingresar a 1X10 COMUNAL GUARICO</span>
                )}
              </button>

              {/* BOTÓN REGISTRARTE AQUÍ */}
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>¿No tienes cuenta? Registrarte aquí</span>
                </button>
              </div>

              {/* Botones de Usuario de Prueba */}
              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cédulas de prueba (Clic para ingresar):</span>
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Clave de demostración: <code className="text-sky-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">admin123</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-sky-300 border border-slate-600 font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Ingresar al Panel Master</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          1X10 COMUNAL GUARICO • Organización Popular
        </p>
      </div>

      {/* MODAL FORMULARIO ESTÁTICO DE REGISTRO */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Registro de Jefe de Patrulla</h3>
                <p className="text-xs text-slate-400">Formulario estático de simulación 1x10</p>
              </div>
            </div>

            {regSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{regSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleStaticRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Juan"
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Apellido</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Pérez"
                      value={regApellido}
                      onChange={(e) => setRegApellido(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Cédula de Identidad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: V-12345678"
                      value={regCedula}
                      onChange={(e) => setRegCedula(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Número Telefónico</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 0414-1234567"
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Centro Comunal / Comunidad</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Comuna El Sueño de Chávez"
                    value={regComunidad}
                    onChange={(e) => setRegComunidad(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={regFechaNac}
                    onChange={(e) => setRegFechaNac(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20"
                  >
                    Enviar Registro
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </main>
  );
}

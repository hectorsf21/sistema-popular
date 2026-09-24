'use client';

import { X, Server, Terminal, GitBranch, Database, ShieldCheck, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CloudpanelGuideModal({ isOpen, onClose }: Props) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const steps = [
    {
      num: '1',
      title: 'Subir el proyecto a tu repositorio de GitHub',
      icon: GitBranch,
      desc: 'Sube todo el código del sistema a tu repositorio privado o público en GitHub:',
      code: `git init
git add .
git commit -m "Initial commit - Sistema 1x10"
git branch -M main
git remote add origin https://github.com/tu-usuario/sistema-popular.git
git push -u origin main`
    },
    {
      num: '2',
      title: 'Conectarse por SSH a CloudPanel y clonar el repositorio',
      icon: Terminal,
      desc: 'Ingresa a tu servidor mediante SSH e ingresa a la carpeta de tu sitio en CloudPanel (ej. /htdocs/tudominio.com):',
      code: `ssh clp-user@ip-de-tu-servidor
cd /home/clp/htdocs/tudominio.com/
git clone https://github.com/tu-usuario/sistema-popular.git .
npm install`
    },
    {
      num: '3',
      title: 'Configurar Base de Datos MySQL y archivo .env',
      icon: Database,
      desc: 'En el panel de CloudPanel crea una base de datos MySQL y un usuario. Luego crea el archivo .env en la raíz:',
      code: `nano .env

# Contenido del .env en el servidor CloudPanel:
DATABASE_URL="mysql://usuario_db:password_db@127.0.0.1:3306/nombre_db"
JWT_SECRET="clave_secreta_super_segura_2026"
PYTHON_PATH="python3"
EXCEL_PADRON_PATH="./data/padron.xlsx"
MASTER_KEY="tu_clave_master_personalizada"`
    },
    {
      num: '4',
      title: 'Ejecutar migraciones de Prisma y generar Excel de demostración',
      icon: ShieldCheck,
      desc: 'Aplica el esquema de tablas en tu MySQL de CloudPanel y genera o sube el Excel del padrón:',
      code: `npx prisma db push
python3 scripts/generate_sample_excel.py
npm run build`
    },
    {
      num: '5',
      title: 'Iniciar el sistema con PM2 (Mantenimiento Continuo)',
      icon: Server,
      desc: 'Utiliza PM2 para mantener la aplicación ejecutándose en segundo plano y reiniciar automáticamente ante reinicios del servidor:',
      code: `npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup`
    },
    {
      num: '6',
      title: 'Configurar Reverse Proxy en CloudPanel',
      icon: Server,
      desc: 'En CloudPanel, ve a tu sitio web -> **Reverse Proxy** -> Redirigir el tráfico del puerto **80/443** a **http://127.0.0.1:3000**.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center font-bold text-xl shadow-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Guía de Despliegue en CloudPanel</h2>
            <p className="text-xs text-slate-400">Paso a paso usando GitHub, SSH, PM2 y MySQL</p>
          </div>
        </div>

        <div className="overflow-y-auto space-y-6 pr-2 flex-1">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div key={step.num} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                    {step.num}
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-indigo-400" />
                    <span>{step.title}</span>
                  </h3>
                </div>

                <p className="text-xs text-slate-300 pl-10">{step.desc}</p>

                {step.code && (
                  <div className="relative ml-10">
                    <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800/80 leading-relaxed">
                      {step.code}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(step.code!, `step-${step.num}`)}
                      className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedCode === `step-${step.num}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
          >
            Entendido, cerrar guía
          </button>
        </div>

      </div>
    </div>
  );
}

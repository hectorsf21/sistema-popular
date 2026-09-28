'use client';

import React from 'react';
import { METAS_MUNICIPIOS, TOTAL_REGISTRO_ELECTORAL, TOTAL_POR_ALCANZAR } from '@/data/metas_electorales';
import { X, Printer, BarChart3 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jefes: any[];
}

export default function BalanceElectoralModal({ isOpen, onClose, jefes }: Props) {
  if (!isOpen) return null;

  // Conteo en tiempo real por Municipio desde los datos cargados en la BD
  const conteoPorMunicipio: Record<string, number> = {};
  let totalRegistradosGlobal = 0;

  jefes.forEach((j) => {
    // Normalizar nombre de municipio
    let munKey = (j.municipio || '').toUpperCase().trim();
    if (munKey.includes('INFANTE')) munKey = 'MP. LEONARDO INFANTE';
    else if (munKey.includes('CAMAGUAN')) munKey = 'MP. ESTEROS DE CAMAGUAN';
    else if (munKey.includes('RONDON')) munKey = 'MP.JUAN JOSE RONDON';
    else if (munKey.includes('GUARIBE')) munKey = 'MP. SAN JOSE DE GUARIBE';
    else if (munKey.includes('RIBAS')) munKey = 'MP. JOSÉ FÉLIX RIBAS';
    else if (munKey.includes('IPIRE')) munKey = 'MP. SANTA MARIA DE IPIRE';
    else if (munKey.includes('GUAYABAL')) munKey = 'MP. SAN GERONIMO DE GUAYABAL';
    else if (munKey.includes('MIRANDA')) munKey = 'MP. FRANCISCO DE MIRANDA';
    else if (munKey.includes('MELLADO')) munKey = 'MP. JULIÁN MELLADO';
    else if (munKey.includes('MONAGAS')) munKey = 'MP. JOSÉ TADEO MONAGAS';
    else if (munKey.includes('CHAGUARAMAS')) munKey = 'MP. CHAGUARAMAS';
    else if (munKey.includes('SOCORRO')) munKey = 'MP. EL SOCORRO';
    else if (munKey.includes('ZARAZA')) munKey = 'MP. PEDRO ZARAZA';
    else if (munKey.includes('ROSCIO')) munKey = 'MP. JUAN GERMAN ROSCIO N.';
    else if (munKey.includes('ORTIZ')) munKey = 'MP. ORTIZ';

    const personas = 1 + (j.totalIntegrantes || 0);
    totalRegistradosGlobal += personas;

    conteoPorMunicipio[munKey] = (conteoPorMunicipio[munKey] || 0) + personas;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in no-print">
      <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 border border-slate-800 shadow-2xl relative max-h-[92vh] flex flex-col bg-[#0b1326]">
        
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Balance Territorial 1X10</h2>
              <p className="text-xs text-slate-400">Comparativa oficial por Municipio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Balance</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabla idéntica a la imagen */}
        <div className="overflow-y-auto mt-4 pr-1 flex-1">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-red-700 text-white text-center font-bold">
                <th className="py-2.5 px-3 border border-red-800 text-left">MUNICIPIO</th>
                <th className="py-2.5 px-3 border border-red-800">REGISTRO ELECTORAL</th>
                <th className="py-2.5 px-3 border border-red-800">REGISTRO ELECTORAL/ Por Alcanzar</th>
                <th className="py-2.5 px-3 border border-red-800 bg-red-800">REGISTRADOS 1X10</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {METAS_MUNICIPIOS.map((item) => {
                const registrados = conteoPorMunicipio[item.municipio.toUpperCase()] || 0;

                return (
                  <tr key={item.municipio} className="hover:bg-slate-900/50 transition-colors text-slate-200">
                    <td className="py-2 px-3 font-semibold border border-slate-800/80">
                      {item.municipio}
                    </td>
                    <td className="py-2 px-3 text-center border border-slate-800/80">
                      {item.registroElectoral.toLocaleString('es-VE')}
                    </td>
                    <td className="py-2 px-3 text-center font-medium border border-slate-800/80 text-amber-300">
                      {item.porAlcanzar.toLocaleString('es-VE')}
                    </td>
                    <td className="py-2 px-3 text-center border border-slate-800/80 font-bold text-sky-400 bg-slate-900/40">
                      {registrados.toLocaleString('es-VE')}
                    </td>
                  </tr>
                );
              })}

              {/* Fila Totalizadora Roja al final idéntica a la imagen */}
              <tr className="bg-red-700 text-white font-extrabold text-center text-sm sticky bottom-0">
                <td className="py-2.5 px-3 text-left border border-red-800">TOTAL:</td>
                <td className="py-2.5 px-3 border border-red-800">{TOTAL_REGISTRO_ELECTORAL.toLocaleString('es-VE')}</td>
                <td className="py-2.5 px-3 border border-red-800">{TOTAL_POR_ALCANZAR.toLocaleString('es-VE')}</td>
                <td className="py-2.5 px-3 border border-red-800 bg-red-800">
                  {totalRegistradosGlobal.toLocaleString('es-VE')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
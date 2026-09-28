'use client';

import React, { useState } from 'react';
import {
  METAS_MUNICIPIOS,
  METAS_PARROQUIAS,
  TOTAL_REGISTRO_ELECTORAL,
  TOTAL_POR_ALCANZAR
} from '@/data/metas_electorales';
import { X, Printer, BarChart3, MapPin, Navigation } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jefes: any[];
}

export default function BalanceElectoralModal({ isOpen, onClose, jefes }: Props) {
  const [activeTab, setActiveTab] = useState<'municipios' | 'parroquias'>('municipios');

  if (!isOpen) return null;

  // Conteos en tiempo real
  const conteoPorMunicipio: Record<string, number> = {};
  const conteoPorParroquia: Record<string, number> = {};
  let totalRegistradosGlobal = 0;

  jefes.forEach((j) => {
    // Normalizar Municipio
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

    // Normalizar Parroquia
    let parKey = (j.parroquia || '').toUpperCase().replace(/^PQ\.\s*/i, '').trim();

    // 1 Jefe
    totalRegistradosGlobal += 1;
    conteoPorMunicipio[munKey] = (conteoPorMunicipio[munKey] || 0) + 1;
    conteoPorParroquia[parKey] = (conteoPorParroquia[parKey] || 0) + 1;

    // Sus integrantes
    (j.integrantes || []).forEach((m: any) => {
      totalRegistradosGlobal += 1;
      let iMun = (m.municipio || munKey).toUpperCase().trim();
      let iPar = (m.parroquia || parKey).toUpperCase().replace(/^PQ\.\s*/i, '').trim();

      conteoPorMunicipio[iMun] = (conteoPorMunicipio[iMun] || 0) + 1;
      conteoPorParroquia[iPar] = (conteoPorParroquia[iPar] || 0) + 1;
    });
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in no-print">
      <div className="glass-panel w-full max-w-5xl rounded-2xl p-6 border border-slate-800 shadow-2xl relative max-h-[92vh] flex flex-col bg-[#0b1326]">
        
        {/* Encabezado del modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Balance Territorial 1X10</h2>
              <p className="text-xs text-slate-400">Comparativa oficial por Municipio y Parroquia</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pestañas Municipio / Parroquia */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('municipios')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'municipios'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Por Municipios (15)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('parroquias')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'parroquias'
                    ? 'bg-red-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Por Parroquias (39)</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DE LAS TABLAS */}
        <div className="overflow-y-auto mt-4 pr-1 flex-1">
          {activeTab === 'municipios' ? (
            /* TABLA 1: POR MUNICIPIOS (IMAGEN 1) */
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
          ) : (
            /* TABLA 2: POR PARROQUIAS (IMAGEN 2 - 39 PARROQUIAS) */
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-red-700 text-white text-center font-bold">
                  <th className="py-2.5 px-3 border border-red-800 text-left">MUNICIPIO</th>
                  <th className="py-2.5 px-3 border border-red-800 text-left">PARROQUIA</th>
                  <th className="py-2.5 px-3 border border-red-800">REGISTRO ELECTORAL</th>
                  <th className="py-2.5 px-3 border border-red-800">REGISTRO ELECTORAL/ Por Alcanzar</th>
                  <th className="py-2.5 px-3 border border-red-800 bg-red-800">REGISTRADOS 1X10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {METAS_PARROQUIAS.map((item, idx) => {
                  const parNorm = item.parroquia.toUpperCase().trim();
                  const registrados = conteoPorParroquia[parNorm] || 0;

                  return (
                    <tr key={`${item.municipio}-${item.parroquia}-${idx}`} className="hover:bg-slate-900/50 transition-colors text-slate-200">
                      <td className="py-1.5 px-3 border border-slate-800/80 font-medium text-slate-300">
                        {item.municipio}
                      </td>
                      <td className="py-1.5 px-3 border border-slate-800/80 font-semibold text-white">
                        {item.parroquia}
                      </td>
                      <td className="py-1.5 px-3 text-center border border-slate-800/80">
                        {item.registroElectoral.toLocaleString('es-VE')}
                      </td>
                      <td className="py-1.5 px-3 text-center font-medium border border-slate-800/80 text-amber-300">
                        {item.porAlcanzar.toLocaleString('es-VE')}
                      </td>
                      <td className="py-1.5 px-3 text-center border border-slate-800/80 font-bold text-sky-400 bg-slate-900/40">
                        {registrados.toLocaleString('es-VE')}
                      </td>
                    </tr>
                  );
                })}

                <tr className="bg-red-700 text-white font-extrabold text-center text-sm sticky bottom-0">
                  <td colSpan={2} className="py-2.5 px-3 text-left border border-red-800">TOTAL:</td>
                  <td className="py-2.5 px-3 border border-red-800">{TOTAL_REGISTRO_ELECTORAL.toLocaleString('es-VE')}</td>
                  <td className="py-2.5 px-3 border border-red-800">{TOTAL_POR_ALCANZAR.toLocaleString('es-VE')}</td>
                  <td className="py-2.5 px-3 border border-red-800 bg-red-800">
                    {totalRegistradosGlobal.toLocaleString('es-VE')}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { UBICACIONES_DATA, MUNICIPIOS_LIST } from '@/data/ubicaciones';
import { MapPin, Filter, Layers, Navigation } from 'lucide-react';

interface CascadingLocationSelectProps {
  selectedMunicipio: string;
  selectedParroquia: string;
  selectedComuna: string;
  onChangeMunicipio: (val: string) => void;
  onChangeParroquia: (val: string) => void;
  onChangeComuna: (val: string) => void;
  onReset: () => void;
}

export default function CascadingLocationSelect({
  selectedMunicipio,
  selectedParroquia,
  selectedComuna,
  onChangeMunicipio,
  onChangeParroquia,
  onChangeComuna,
  onReset
}: CascadingLocationSelectProps) {
  
  const parroquiasList = selectedMunicipio && UBICACIONES_DATA[selectedMunicipio]
    ? Object.keys(UBICACIONES_DATA[selectedMunicipio])
    : [];

  const comunasList = selectedMunicipio && selectedParroquia && UBICACIONES_DATA[selectedMunicipio]?.[selectedParroquia]
    ? UBICACIONES_DATA[selectedMunicipio][selectedParroquia]
    : [];

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtro Jerárquico Territorial</span>
        </div>

        {(selectedMunicipio || selectedParroquia || selectedComuna) && (
          <button
            onClick={onReset}
            className="text-[11px] font-semibold text-slate-400 hover:text-sky-400 transition-colors"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* 1. Selector de Municipio */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-400" />
            <span>1. Municipio</span>
          </label>
          <select
            value={selectedMunicipio}
            onChange={(e) => {
              onChangeMunicipio(e.target.value);
              onChangeParroquia('');
              onChangeComuna('');
            }}
            className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          >
            <option value="">Todos los Municipios ({MUNICIPIOS_LIST.length})</option>
            {MUNICIPIOS_LIST.map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Selector de Parroquia */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-sky-400" />
            <span>2. Parroquia</span>
          </label>
          <select
            value={selectedParroquia}
            disabled={!selectedMunicipio}
            onChange={(e) => {
              onChangeParroquia(e.target.value);
              onChangeComuna('');
            }}
            className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedMunicipio
                ? 'Seleccione primero Municipio'
                : `Todas las Parroquias (${parroquiasList.length})`}
            </option>
            {parroquiasList.map((par) => (
              <option key={par} value={par}>
                {par}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Selector de Comuna / Circuito Comunal */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-400" />
            <span>3. Comuna / Circuito Comunal</span>
          </label>
          <select
            value={selectedComuna}
            disabled={!selectedParroquia}
            onChange={(e) => onChangeComuna(e.target.value)}
            className="w-full px-3 py-2 bg-[#060a14] border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedParroquia
                ? 'Seleccione primero Parroquia'
                : `Todas las Comunas (${comunasList.length})`}
            </option>
            {comunasList.map((com) => (
              <option key={com} value={com}>
                {com}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}

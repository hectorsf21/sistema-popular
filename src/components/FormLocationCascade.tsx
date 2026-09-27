'use client';

import React from 'react';
import { UBICACIONES_DATA, MUNICIPIOS_LIST } from '@/data/ubicaciones';

interface Props {
  municipio: string;
  parroquia: string;
  comunidad: string;
  onChangeMunicipio: (m: string) => void;
  onChangeParroquia: (p: string) => void;
  onChangeComunidad: (c: string) => void;
  required?: boolean;
}

export default function FormLocationCascade({
  municipio,
  parroquia,
  comunidad,
  onChangeMunicipio,
  onChangeParroquia,
  onChangeComunidad,
  required = true
}: Props) {
  const parroquiasList = municipio && UBICACIONES_DATA[municipio]
    ? Object.keys(UBICACIONES_DATA[municipio])
    : [];

  const comunasList = municipio && parroquia && UBICACIONES_DATA[municipio]?.[parroquia]
    ? UBICACIONES_DATA[municipio][parroquia]
    : [];

  return (
    <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Municipio */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Municipio {required && <span className="text-red-400">*</span>}
          </label>
          <select
            required={required}
            value={municipio}
            onChange={(e) => {
              onChangeMunicipio(e.target.value);
              onChangeParroquia('');
              onChangeComunidad('');
            }}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-sky-500 transition-all"
          >
            <option value="">Seleccione Municipio</option>
            {MUNICIPIOS_LIST.map((mun) => (
              <option key={mun} value={mun}>{mun}</option>
            ))}
          </select>
        </div>

        {/* 2. Parroquia */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Parroquia {required && <span className="text-red-400">*</span>}
          </label>
          <select
            required={required}
            disabled={!municipio}
            value={parroquia}
            onChange={(e) => {
              onChangeParroquia(e.target.value);
              onChangeComunidad('');
            }}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-sky-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">
              {!municipio ? 'Primero elija Municipio' : 'Seleccione Parroquia'}
            </option>
            {parroquiasList.map((par) => (
              <option key={par} value={par}>{par}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Circuito Comunal */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Circuito Comunal / Comuna {required && <span className="text-red-400">*</span>}
        </label>
        <select
          required={required}
          disabled={!parroquia}
          value={comunidad}
          onChange={(e) => onChangeComunidad(e.target.value)}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-sky-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="">
            {!parroquia ? 'Primero elija Parroquia' : `Seleccione Circuito Comunal (${comunasList.length})`}
          </option>
          {comunasList.map((com) => (
            <option key={com} value={com}>{com}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
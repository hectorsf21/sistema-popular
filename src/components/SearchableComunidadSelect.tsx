'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UBICACIONES_DATA } from '@/data/ubicaciones';
import { Search, ChevronDown, Check, Edit3 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function SearchableComunidadSelect({ value, onChange, required = true }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extraer todas las comunas únicas del padrón existente
  const comunasList: string[] = useMemo(() => {
    const list: string[] = [];
    Object.values(UBICACIONES_DATA).forEach((parroquias) => {
      Object.values(parroquias).forEach((comunas) => {
        comunas.forEach((comuna: string) => {
          if (comuna && !list.includes(comuna)) {
            list.push(comuna);
          }
        });
      });
    });
    return list.sort();
  }, []);

  // Filtrar según lo que el usuario va escribiendo
  const filteredComunas = comunasList.filter((c: string) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isCustomMode) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
          <span>Centro Comunal / Circuito Comunal (Manual) <span className="text-red-400">*</span></span>
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(false);
              onChange('');
            }}
            className="text-[11px] text-sky-400 hover:underline"
          >
            ← Volver a la lista
          </button>
        </div>
        <input
          type="text"
          required={required}
          placeholder="Escriba el nombre exacto del circuito comunal..."
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-full px-3 py-2 bg-slate-900 border border-amber-600/60 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-300">
        Centro Comunal / Circuito Comunal <span className="text-red-400">*</span>
      </label>

      {/* Botón selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-left text-xs flex items-center justify-between focus:ring-2 focus:ring-sky-500 transition-all text-white"
      >
        <span className={value ? 'text-white font-medium truncate' : 'text-slate-500'}>
          {value || 'Seleccione o busque su circuito comunal...'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {/* Menú flotante con buscador */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#0a1224] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-slate-800 bg-slate-900 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Escribe para filtrar (ej: Zaraza, Pascua, Casco)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#060a14] border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/40">
            {filteredComunas.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No se encontraron circuitos coincidentes.
              </div>
            ) : (
              filteredComunas.slice(0, 100).map((comuna: string) => (
                <button
                  type="button"
                  key={comuna}
                  onClick={() => {
                    onChange(comuna);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-sky-950/60 hover:text-sky-300 transition-colors ${
                    value === comuna ? 'bg-sky-900/40 text-sky-300 font-bold' : 'text-slate-200'
                  }`}
                >
                  <span className="truncate">{comuna}</span>
                  {value === comuna && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                </button>
              ))
            )}

            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                setIsOpen(false);
                onChange('');
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-amber-400 hover:bg-amber-950/40 flex items-center gap-2 border-t border-slate-700 bg-slate-900 sticky bottom-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>¿No consigues tu circuito? Haz clic aquí para escribirlo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import React, { useState, useEffect } from 'react';
import { Search, Users, Plus, Check } from 'lucide-react';
import api from '@/lib/api';

interface SelectorGrupoProps {
  onSeleccionar: (grupo: any) => void;
  onNuevoNombre: (nombre: string) => void;
}

export default function SelectorGrupo({ onSeleccionar, onNuevoNombre }: SelectorGrupoProps) {
  const [busqueda, setBusqueda] = useState('');
  const [grupos, setGrupos] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);

  // 1. Cargar grupos existentes al iniciar
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await api.get('/clientes/directorio-hibrido/');
        // Filtramos solo los que son grupos
        setGrupos(res.data.filter((e: any) => e.es_grupo));
      } catch (e) { console.error("Error al cargar grupos"); }
    };
    fetchGrupos();
  }, []);

  // 2. Filtrar mientras Alexander escribe
  const handleInput = (val: string) => {
    setBusqueda(val);
    onNuevoNombre(val); // Enviamos el nombre al form principal por si es nuevo
    if (val.length > 0) {
      const filtrados = grupos.filter(g => 
        g.nombre.toLowerCase().includes(val.toLowerCase())
      );
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
  };

  const seleccionar = (grupo: any) => {
    setSeleccionado(grupo);
    setBusqueda(grupo.nombre);
    onSeleccionar(grupo); // Avisamos al padre el ID del grupo
    setMostrarSugerencias(false);
  };

  return (
    <div className="relative space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
        Nombre del Grupo Solidario
      </label>
      
      <div className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${seleccionado ? 'text-emerald-500' : 'text-slate-300'}`}>
          {seleccionado ? <Check size={18} /> : <Search size={18} />}
        </div>
        
        <input
          type="text"
          value={busqueda}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setMostrarSugerencias(true)}
          placeholder="Ej: Grupo Los Pinos"
          className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-600 font-bold text-slate-700 shadow-inner"
        />
      </div>

      {/* LISTA DE SUGERENCIAS */}
      {mostrarSugerencias && busqueda.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-2xl rounded-2xl mt-2 overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
          
          {/* Si no existe, damos la opción de crear */}
          {sugerencias.length === 0 && (
            <button 
              onClick={() => setMostrarSugerencias(false)}
              className="w-full p-4 text-left flex items-center gap-3 hover:bg-purple-50 text-purple-600 transition-colors"
            >
              <Plus size={16} />
              <span className="text-xs font-black uppercase">Crear nuevo grupo: "{busqueda}"</span>
            </button>
          )}

          {/* Sugerencias encontradas */}
          {sugerencias.map((g) => (
            <button
              key={g.id}
              onClick={() => seleccionar(g)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 border-b last:border-none transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Users size={14} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{g.nombre}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">ID: {g.id} • {g.num_integrantes} Clientes</p>
                </div>
              </div>
              <div className="text-[8px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded font-black uppercase">Existente</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
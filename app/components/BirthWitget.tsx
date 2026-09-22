"use client";
import React, { useEffect, useState } from 'react';
import { Cake, Gift, Phone, Smile } from 'lucide-react';
import api from '@/lib/api';

export default function BirthdayWidget() {
  const [cumpleaneros, setCumpleaneros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clientes/cumpleanos/')
      .then(res => {
        setCumpleaneros(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando cumpleañeros:", err);
        setLoading(false);
      });
  }, []);

  // Estado de carga elegante (Skeleton) para que no dé el salto brusco de tamaño
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-2xl"></div>
          <div className="space-y-2 w-1/2">
            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            <div className="h-3 bg-slate-50 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden transition-all duration-300">
      {/* Icono de fondo decorativo */}
      <div className="absolute top-0 right-0 p-4 opacity-5 text-[#0047AB]">
        <Cake size={100} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-50 text-[#0047AB] rounded-2xl">
          <Cake size={18} />
        </div>
        <div>
          <h4 className="font-black text-slate-800 text-sm uppercase italic tracking-tight">Cumpleañeros del Mes</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fidelización Express</p>
        </div>
      </div>

      {/* RENDER CONDICIONAL DEPENDIENDO DE LA LISTA */}
      {cumpleaneros.length > 0 ? (
        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
          {cumpleaneros.map((c) => (
            <div 
              key={c.id} 
              className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 ${
                c.es_hoy 
                  ? 'bg-amber-50/60 border-amber-200 shadow-sm shadow-amber-100 animate-in zoom-in-95' 
                  : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800 italic">{c.nombre}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Día: {c.dia}</span>
                  {c.telefono && c.telefono !== 'N/A' && (
                    <span className="flex items-center gap-0.5 text-slate-500">
                      • <Phone size={10} /> {c.telefono}
                    </span>
                  )}
                </div>
              </div>

              {c.es_hoy ? (
                <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl shadow-sm animate-pulse">
                  <Gift size={11} /> ¡Hoy! 🎉
                </span>
              ) : (
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">
                  Próximo
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ✨ ESTADO VACÍO CUANDO NO HAY CUMPLEAÑOS */
        <div className="flex flex-col items-center justify-center py-8 opacity-20">
          <Smile size={40} className="text-slate-400 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
            Sin cumpleaños este mes
          </p>
        </div>
      )}
    </div>
  );
}
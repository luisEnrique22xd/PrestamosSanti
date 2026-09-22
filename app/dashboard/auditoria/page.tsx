"use client";
import React, { useEffect, useState } from 'react';
import { 
  History, Search, Filter, ShieldAlert, 
  Calendar, User as UserIcon, Activity, Loader2 
} from "lucide-react";
import api from '@/lib/api';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/usuarios/logs/');
      setLogs(res.data);
    } catch (error) {
      console.error("Error cargando logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const logsFiltrados = logs.filter((log: any) => 
    log.detalle.toLowerCase().includes(filtro.toLowerCase()) ||
    log.usuario_nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    log.accion.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-[#0047AB]" size={40} />
      <p className="font-black uppercase tracking-widest text-[10px] mt-4 text-slate-400 italic">Escaneando registros de seguridad...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
      
      {/* HEADER DE AUDITORÍA */}
      <div className="bg-[#050533] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <History size={120} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-1.5 rounded-full border border-blue-400/30 mb-4">
            <ShieldAlert size={14} className="text-blue-300" />
            <span className="text-blue-200 text-[9px] font-black uppercase tracking-[0.2em]">Centro de Control de Acuitlapilco</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Auditoría de Sistema</h1>
          <p className="text-slate-400 text-xs mt-2 font-medium max-w-md">
            Monitoreo en tiempo real de todas las acciones críticas realizadas por el personal.
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-[1.8rem] shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="bg-slate-50 p-3 rounded-2xl text-slate-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por usuario, acción o detalle del movimiento..." 
          className="flex-1 bg-transparent outline-none font-bold text-sm text-slate-600"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <div className="hidden md:flex gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros Activos</span>
        </div>
      </div>

      {/* TABLA DE LOGS ESTILO TIMELINE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalle de la Operación</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logsFiltrados.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-[#0047AB]">
                      <Activity size={12} />
                      <span className="text-[10px] font-black uppercase tracking-tight">{log.accion}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0047AB] group-hover:text-white transition-colors">
                        <UserIcon size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{log.usuario_nombre}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs md:max-w-md">
                      {log.detalle}
                    </p>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter flex items-center gap-1">
                        <Calendar size={10} className="text-[#0047AB]" />
                        {new Date(log.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {new Date(log.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
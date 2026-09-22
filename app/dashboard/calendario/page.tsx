"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, User, X, Phone,
  DollarSign, Calendar as CalendarIcon, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CalendarioCobranza() {
  const router = useRouter();
  const hoy = new Date();

  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [proyecciones, setProyecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formateador de fecha manual para evitar desfases de zona horaria (UTC)
  const getFechaISO = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const nombreMes = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(new Date(anioActual, mesActual));
  const primerDiaMes = new Date(anioActual, mesActual, 1).getDay();
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();

  useEffect(() => {
    const fetchProyecciones = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/calendario-pagos/?mes=${mesActual + 1}&anio=${anioActual}`);
        setProyecciones(res.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProyecciones();
  }, [mesActual, anioActual]);

  const contactarCliente = (tel: string, nombre: string) => {
    const msg = encodeURIComponent(`Hola "${nombre}", te recordamos que hoy te corresponde realizar el pago de tu préstamo, agradecemos tu cumplimiento puntual para evitar el pago de días de penalizacion. `);
    window.open(`https://wa.me/52${tel.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const celdas = [];
  for (let i = 0; i < primerDiaMes; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const cobrosDelDiaSeleccionado = useMemo(() =>
    proyecciones.filter(p => p.fecha === selectedDate),
    [selectedDate, proyecciones]);

  const totalMontoDia = cobrosDelDiaSeleccionado.reduce((acc, c) => acc + Number(c.monto), 0);

  if (loading && proyecciones.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
      <Loader2 className="animate-spin" size={40} color="#0047AB" />
      <p className="font-black italic uppercase tracking-widest text-xs">Sincronizando agenda Acuitlapilco...</p>
    </div>
  );

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-700">      {/* CALENDARIO */}
      <div className={`transition-all duration-700 bg-white p-4 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 w-full ${selectedDate ? 'lg:w-2/3' : 'lg:w-full'}`}>        <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter italic uppercase">Cobranza {nombreMes}</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Gestión de Abonos Programados</p>
        </div>

        <div className="flex bg-slate-100 p-1 md:p-2 rounded-xl md:rounded-2xl border border-slate-200">            <button onClick={() => setMesActual(m => m - 1)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-[#0047AB] transition-all"><ChevronLeft size={22} /></button>
          <span className="font-black text-slate-700 self-center px-8 text-[10px] uppercase tracking-[0.3em]">{nombreMes} {anioActual}</span>
          <button onClick={() => setMesActual(m => m + 1)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-[#0047AB] transition-all"><ChevronRight size={22} /></button>
        </div>
      </div>

        <div className="grid grid-cols-7 gap-2 md:gap-6 mb-4 md:mb-8">
          {diasSemana.map(dia => (
            <div key={dia} className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">{dia}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-6">          {celdas.map((dia, index) => {
          if (dia === null) return <div key={`empty-${index}`} className="relative h-16 md:h-32 p-1 md:p-6 rounded-xl md:rounded-[2.5rem]" />;

          const fechaISO = getFechaISO(anioActual, mesActual, dia);
          const cobros = proyecciones.filter(p => p.fecha === fechaISO);
          const esHoy = dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();
          const isSelected = selectedDate === fechaISO;
          const tienePendientes = cobros.some(c => c.estatus !== 'pagado');

          return (
            <button
              key={dia}
              onClick={() => setSelectedDate(fechaISO)}
              className={`relative min-h-[80px] md:h-32 p-2 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-between group
  ${isSelected ? 'bg-blue-50 border-[#0047AB] shadow-lg scale-105 z-10' : 'bg-white border-transparent hover:bg-slate-50'}`}
            >
              {esHoy && (
                <div className="absolute top-4 right-4 flex flex-col items-center gap-1">
                  <span className="text-[7px] font-black text-red-500 uppercase tracking-tighter">Hoy</span>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                </div>
              )}

              <span className={`text-lg font-black ${isSelected ? 'text-[#0047AB]' : 'text-slate-700'}`}>{dia}</span>

              {cobros.length > 0 && (
                <div className={`flex gap-1.5 p-2 rounded-xl ${tienePendientes ? 'bg-slate-100/50' : 'bg-emerald-100/50'}`}>
                  {cobros.slice(0, 3).map((c, i) => {
                    // Determinamos el color del punto basado en la lógica solicitada
                    let colorPunto = "bg-red-500"; // Por defecto: Rojo (Pendiente)

                    if (c.estatus === 'pagado') {
                      // Si está pagado, verificamos si tuvo penalización
                      // (Ajusta 'c.con_penalizacion' según el nombre exacto que devuelva tu API)
                      colorPunto = c.con_penalizacion ? "bg-yellow-500" : "bg-emerald-500";
                    }

                    return (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${colorPunto} shadow-sm`}
                        title={c.estatus}
                      />
                    );
                  })}
                  {cobros.length > 3 && <span className="text-[8px] font-black text-slate-400">+{cobros.length - 3}</span>}
                </div>
              )}
            </button>
          );
        })}
        </div>
      </div>

      {/* PANEL DETALLE (SIDEBAR) */}
      {selectedDate && (
        <div className="w-full lg:max-w-md bg-[#050533] p-6 md:p-10 rounded-3xl md:rounded-[3rem] text-white shadow-2xl flex flex-col border border-white/5 relative overflow-hidden min-h-[500px]">          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

          <div className="flex justify-between items-center mb-12 relative z-10">
            <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
              <CalendarIcon className="text-sky-400" /> Cobros del Día
            </h3>
            <button onClick={() => setSelectedDate(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white">
              <X size={28} />
            </button>
          </div>

          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 mb-8 text-center backdrop-blur-md">
            <p className="text-[9px] text-sky-400 uppercase font-black tracking-[0.3em] mb-2 italic">Fecha Seleccionada</p>
            <p className="text-xl font-bold text-white tracking-tight capitalize">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString('es-MX', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
            <div className="bg-white/5 p-5 rounded-[2rem] border border-white/10">
              <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Citas</p>
              <p className="text-xl md:text-2xl font-black">{cobrosDelDiaSeleccionado.length}</p>
            </div>
            <div className="bg-emerald-500/10 p-5 rounded-[2rem] border border-emerald-500/20">
              <p className="text-[8px] text-emerald-400 uppercase font-black tracking-widest mb-1">Monto Total</p>
              <p className="text-xl md:text-2xl font-black text-emerald-400">${totalMontoDia.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {cobrosDelDiaSeleccionado.map((cobro: any) => (
              <div key={cobro.id} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0047AB] rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-blue-900/50">
                      <User size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="font-black text-base tracking-tight leading-none">{cobro.cliente}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-2 tracking-widest italic">ID: {cobro.idCliente}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[8px] font-black uppercase px-2 py-1 rounded-md mb-2 w-fit ml-auto ${cobro.estatus === 'pagado'
                        ? (cobro.con_penalizacion ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-400')
                        : 'bg-red-500/20 text-red-500'
                      }`}>
                      {cobro.estatus === 'pagado' && cobro.con_penalizacion ? 'Pagado c/ Mora' : cobro.estatus}
                    </p>
                    <p className="text-lg font-black">${cobro.monto}</p>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-3 mt-4">
                  {/* WhatsApp Button */}
                  <button
                    onClick={() => contactarCliente(cobro.tel, cobro.cliente)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600/20 transition-all border border-white/5 min-w-[120px]"
                  >
                    <Phone size={14} className="text-green-400" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Cobrar Button */}
                  <button
                    onClick={() => router.push(`/dashboard/pagos`)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase transition-all shadow-xl min-w-[120px] ${cobro.estatus === 'pagado'
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-[#10B981] text-white hover:bg-emerald-600 shadow-emerald-900/40'
                      }`}
                  >
                    {cobro.estatus === 'pagado' ? <CheckCircle2 size={14} /> : <DollarSign size={14} />}
                    <span>{cobro.estatus === 'pagado' ? 'Pagado' : 'Cobrar'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] italic">
            Management V1.0 • Acuitlapilco
          </div>
        </div>
      )}
    </div>
  );
}
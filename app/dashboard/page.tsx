'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  DollarSign, ArrowRight, Search, TrendingUp,
  Users, Wallet, Calendar, ArrowUpRight, Loader2,
  Activity, AlertCircle, CheckCircle2, ShieldAlert, FileText
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import StatCard from '../components/statscard';
import BirthdayWidget from '../components/BirthWitget';

const COLORES_MODALIDAD: { [key: string]: string } = {
  'Efectivo': '#10B981',      // Verde Esmeralda
  'Transferencia': '#3B82F6', // Azul
  'Depósito': '#8B5CF6',      // Violeta
  'Otro': '#94A3B8'           // Gris Slate
};

export default function GlobalDashboard() {
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // Para evitar errores de hidratación
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const router = useRouter();

  // 1. Carga de datos globales
  useEffect(() => {
    setMounted(true);
    const fetchGlobalData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/estadisticas-globales/');
        setResumen(res.data);
      } catch (e) {
        console.error("Error al cargar estadísticas:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalData();
  }, []);

  // 2. Buscador en tiempo real
  const handleSearch = async (val: string) => {
    setBusqueda(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/?search=${val}`);
        setSugerencias(res.data.slice(0, 5));
      } catch (e) { console.error(e); }
    } else {
      setSugerencias([]);
    }
  };

  // 3. Cálculo dinámico de Inversión
  const capitalEnCalle = useMemo(() => {
    if (!resumen?.rangos) return 0;
    return resumen.rangos.reduce((acc: number, r: any) => {
      const valor = typeof r.total === 'string'
        ? parseFloat(r.total.replace(/[^0-9.-]+/g, ""))
        : (r.total || 0);
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);
  }, [resumen]);

  if (loading || !mounted) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} color="#0047AB" />
      <p className="font-black uppercase tracking-[0.3em] text-[10px] italic">
        Sincronizando con Servidor Railway...
      </p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="flex flex-col items-center justify-center text-center">
          {/* SAPPE en Azul Rey */}
          <h1 className="text-4xl font-black text-[#0047AB] italic uppercase tracking-tighter leading-none">
            SAPPE
          </h1>

          {/* Subtítulo en Rojo */}
          {/* He usado text-red-600, pero puedes usar [#FF0000] si quieres el rojo puro */}
          <p className="text-red-600 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            "SISTEMAS DE ADMINISTRACIÓN PARA PRÉSTAMOS SANTI"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">S
            {/* Tu gráfica de flujo o historial */}
          </div>
          <div>
            {/* Removido de aquí para evitar desbalancear el header */}
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0047AB] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar cliente (Nombre o ID)..."
            value={busqueda}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-[#0047AB] outline-none font-bold text-sm transition-all"
          />
          {sugerencias.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-50 overflow-hidden animate-in zoom-in-95 duration-200">
              {sugerencias.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/dashboard/${c.id}`)}
                  className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-none"
                >
                  <div className="text-left">
                    <span className="font-black text-slate-700 text-xs uppercase block">{c.nombre}</span>
                    <span className="text-[9px] text-slate-400 font-bold">ID: {c.id}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-[#0047AB]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* MÉTRICAS (TARJETAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#050533] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp size={80} />
          </div>
          <p className="text-sky-400 text-[10px] font-black uppercase tracking-widest relative z-10 italic">Total Recuperado</p>
          <h2 className="text-4xl font-black mt-2 relative z-10 tracking-tighter italic">
            {resumen?.total_recuperado || "$0.00"}
          </h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-[#0047AB]">
            <Users size={80} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Préstamos Activos</p>
          <h2 className="text-4xl font-black text-slate-800 mt-2 tracking-tighter">
            {resumen?.prestamos_activos || 0}
          </h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600">
            <Activity size={80} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Inversión</p>
          <h2 className="text-4xl font-black text-red-600 mt-2 tracking-tighter italic">
            ${capitalEnCalle.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 relative group transition-all hover:bg-emerald-100 flex flex-col justify-between">
          <div>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Cobranza del Día</p>
            <h2 className="text-4xl font-black text-emerald-700 mt-2 tracking-tighter italic">
              {resumen?.cobrado_hoy || "$0.00"}
            </h2>
          </div>
          {resumen?.metodos_pago?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-emerald-200/50 space-y-2">
              {resumen.metodos_pago.map((metodo: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-[9px] font-black uppercase">
                  <span className="text-emerald-600/70">{metodo.label}:</span>
                  <span className="text-emerald-800">${metodo.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <ShieldAlert size={16} className="text-[#0047AB]" />
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">
            Balance de Penalizaciones y Recargos
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* 1. Total Histórico */}
          <StatCard
            title="Total Penalizaciones"
            value={`$${(resumen?.total_penalizaciones || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon={FileText}
            color="#0047AB"
          />

          {/* 2. Cobradas */}
          <StatCard
            title="Penalizaciones Cobradas"
            value={`$${(resumen?.penalizaciones_cobradas || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon={CheckCircle2}
            color="#10B981"
          />

          {/* 3. Condonadas */}
          <StatCard
            title="Penalizaciones Condonadas"
            value={`$${(resumen?.penalizaciones_condonadas || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            color="#F59E0B"
          />

          {/* 4. Moras Pendientes */}
          <StatCard
            title="Moras por Recuperar"
            value={`$${(resumen?.total_moras_pendientes || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon={AlertCircle}
            color="#DC2626"
          />
        </div>
      </div>

      {/* GRÁFICA Y CONCENTRACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 uppercase italic flex items-center gap-2 text-sm tracking-tight">
              <Calendar size={18} className="text-[#0047AB]" />
              Pagos Semanales
            </h3>
            <span className="text-[9px] font-black bg-blue-50 text-[#0047AB] px-4 py-1.5 rounded-full uppercase tracking-widest">Historial de Flujo</span>
          </div>
          <div className="h-[350px] w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resumen?.grafica_semanal || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0047AB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0047AB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                  itemStyle={{ color: '#0047AB', fontWeight: '900', fontSize: '12px' }}
                  formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Recuperado']}
                />
                <Area type="monotone" dataKey="monto" stroke="#0047AB" strokeWidth={4} fillOpacity={1} fill="url(#colorRecup)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">

          {/* 🎂 INTEGRADO EN LA COLUMNA LATERAL (SE MOSTRARÁ SIEMPRE FIJO AQUÍ) */}
          <BirthdayWidget />

          {/* GRÁFICA DE PASTEL */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between min-h-[300px]">
            <h3 className="font-black text-slate-800 uppercase italic mb-6 flex items-center gap-2 text-sm self-start">
              <Activity size={18} className="text-[#0047AB]" />
              Métodos de Hoy
            </h3>

            <div className="h-[180px] w-full flex items-center justify-center">
              {resumen?.metodos_pago && resumen.metodos_pago.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resumen.metodos_pago}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={75}
                      paddingAngle={8} dataKey="monto" nameKey="label" stroke="none"
                    >
                      {resumen.metodos_pago.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORES_MODALIDAD[entry.label] || COLORES_MODALIDAD['Otro']} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Recuperado']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center opacity-20">
                  <DollarSign size={60} className="text-slate-400 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin cobranza aún</p>
                </div>
              )}
            </div>

            {/* Leyendas (Solo si hay datos) */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 w-full min-h-[20px]">
              {resumen?.metodos_pago?.map((metodo: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORES_MODALIDAD[metodo.label as keyof typeof COLORES_MODALIDAD] || COLORES_MODALIDAD['Otro'] }}></div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{metodo.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LISTA DE CONCENTRACIÓN */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-black text-slate-800 uppercase italic mb-8 flex items-center gap-2 text-sm text-left">
              <Wallet size={18} className="text-[#0047AB]" />
              Concentración
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              {resumen?.rangos?.filter((r: any) => r.cant > 0).map((r: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                  <div>
                    <p className="text-[10px] font-black text-slate-700 group-hover:text-[#0047AB] transition-colors uppercase tracking-tight">{r.label}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{r.cant} Créditos</p>
                  </div>
                  <p className="text-[10px] font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-100">{r.total}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BANNER ACCIÓN */}
      <div className="bg-gradient-to-br from-[#0047AB] to-[#050533] p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
        <div className="text-center md:text-left relative z-10">
          <h4 className="text-2xl font-black italic uppercase tracking-tighter">Expansión de Negocio</h4>
          <p className="text-blue-200 text-xs mt-2 font-medium tracking-wide uppercase">Genera nuevos contratos y emite pagarés legales al instante.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/prestamos')}
          className="w-full lg:w-auto bg-white text-[#050533] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 relative z-10 justify-center"
        >
          Nuevo Préstamo
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
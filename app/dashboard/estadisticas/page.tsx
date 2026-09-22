'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { BarChart3, Loader2, Landmark, Percent, Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import api from '@/lib/api';
import { exportToExcel } from '@/lib/generateStatsReport';
import { exportCashFlowToExcel, exportCashFlowToPDF } from '@/lib/generateCashFlow';

const COLORS = {
  azulRey: '#0047AB',
  verdeExito: '#10B981',
  purpura: '#8B5CF6',
  rojoPeligro: '#EF4444'
};

export default function EstadisticasPage() {
  const [reporteData, setReporteData] = useState<any>(null);
  const [rangoFechas, setRangoFechas] = useState({
    inicio: new Date().toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });
  const [tipoReporte, setTipoReporte] = useState('dia');
  const [isCargandoReporte, setIsCargandoReporte] = useState(false);
  const [dataGrafica, setDataGrafica] = useState([]);
  const [statsGenerales, setStatsGenerales] = useState<any>(null);
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'anio'>('semana');
  const [loading, setLoading] = useState(true);

  // Estados para el Reporte de Ingresos vs Egresos
  const [flujoEfectivo, setFlujoEfectivo] = useState<any>(null);
  const [filtroFlujo, setFiltroFlujo] = useState('diario');
  const fetchReporteDetallado = async (tipo: string, customInicio?: string, customFin?: string) => {
    try {
      setIsCargandoReporte(true);
      setTipoReporte(tipo);
      const hoy = new Date();
      let inicio: string, fin: string = hoy.toISOString().split('T')[0];

      if (tipo === 'dia') {
        inicio = fin;
      } else if (tipo === 'semana') {
        const d = new Date();
        d.setDate(hoy.getDate() - 7);
        inicio = d.toISOString().split('T')[0];
      } else if (tipo === 'mes') {
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      } else if (tipo === 'anio') {
        inicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
      } else {
        // Personalizado
        inicio = customInicio || rangoFechas.inicio;
        fin = customFin || rangoFechas.fin;
      }

      const res = await api.get(`/reporte-detallado/?inicio=${inicio}&fin=${fin}`);
      setReporteData(res.data);
      setRangoFechas({ inicio, fin });
    } catch (error) {
      console.error("Error al generar reporte:", error);
    } finally {
      setIsCargandoReporte(false);
    }
  };

  // Cargar reporte del día por defecto al montar
  useEffect(() => {
    fetchReporteDetallado('dia');
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/estadisticas-globales/');
        setStatsGenerales(res.data);
      } catch (error) { console.error(error); }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchGrafica = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/estadisticas-dinamicas/?periodo=${periodo}`);
        setDataGrafica(res.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchGrafica();
  }, [periodo]);

  // Nuevo efecto para traer el flujo de efectivo (Ingresos/Egresos)
  useEffect(() => {
    const fetchFlujo = async () => {
      try {
        // Asumiendo que el endpoint es /reporte-flujo-efectivo/
        const res = await api.get(`/reporte-flujo-efectivo/?periodo=${filtroFlujo}`);
        setFlujoEfectivo(res.data);
      } catch (error) { console.error(error); }
    };
    fetchFlujo();
  }, [filtroFlujo]);

  if (!statsGenerales && loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin" size={40} color="#0047AB" />
        <p className="font-black italic uppercase tracking-widest text-xs text-center">Consultando saldos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-10 animate-in fade-in duration-700">

      {/* 🚀 NUEVA SECCIÓN: REPORTE DE INGRESOS Y EGRESOS (DINERO PRESTADO VS COBRADO) */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl"><Activity size={24} /></div>
            <div>
              <h3 className="font-black text-slate-800 text-xl uppercase italic tracking-tight">Monitor de Flujo de Efectivo</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest italic">Capital Colocado vs Recuperado</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['diario', 'semanal', 'mensual', 'anual'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltroFlujo(f)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filtroFlujo === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportCashFlowToPDF(flujoEfectivo)}
              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
              title="Descargar PDF de Flujo"
            >
              <Landmark size={18} />
            </button>
            <button
              onClick={() => exportCashFlowToExcel(flujoEfectivo)}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              title="Descargar Excel de Flujo"
            >
              <Wallet size={18} />
            </button>
          </div>
        </div>
        {/* 📊 SELECTOR DE REPORTES PROFESIONALES */}
<div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8">
  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
    <div>
      <h3 className="font-black text-slate-800 text-xl uppercase italic tracking-tight">Generador de Reportes</h3>
      <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest italic">Selecciona el periodo para exportar</p>
    </div>

    <div className="flex flex-wrap justify-center gap-2 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
      {['dia', 'semana', 'mes', 'anio'].map((t) => (
        <button
          key={t}
          onClick={() => fetchReporteDetallado(t)}
          className={`px-6 py-2 rounded-full text-[9px] font-black uppercase transition-all ${
            tipoReporte === t ? 'bg-[#0047AB] text-white shadow-lg' : 'text-slate-400 hover:bg-white'
          }`}
        >
          {t}
        </button>
      ))}
      {/* Selector Personalizado */}
      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
        <input 
          type="date" 
          value={rangoFechas.inicio} 
          onChange={(e) => setRangoFechas({...rangoFechas, inicio: e.target.value})}
          className="bg-transparent text-[10px] font-black uppercase outline-none"
        />
        <span className="text-slate-300">-</span>
        <input 
          type="date" 
          value={rangoFechas.fin} 
          onChange={(e) => setRangoFechas({...rangoFechas, fin: e.target.value})}
          className="bg-transparent text-[10px] font-black uppercase outline-none"
        />
        <button 
          onClick={() => fetchReporteDetallado('custom')}
          className="p-2 bg-slate-900 text-white rounded-full hover:scale-110 transition-transform"
        >
          <Activity size={14} />
        </button>
      </div>
    </div>
    
    <div className="flex gap-3">
      <button 
        onClick={() => exportToExcel(reporteData, reporteData.historial || [])}
        disabled={isCargandoReporte}
        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
      >
        <Wallet size={14} /> Excel Profesional
      </button>
    </div>
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TARJETA EGRESOS: DINERO PRESTADO */}
          <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 relative overflow-hidden group">
            <ArrowUpRight className="absolute -right-2 -top-2 text-blue-200 size-24 rotate-12 group-hover:scale-110 transition-transform" />
            <p className="text-blue-600 text-[10px] font-black uppercase mb-2">Egresos (Préstamos)</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tighter italic">
              ${flujoEfectivo?.colocacion_capital?.toLocaleString('es-MX') || '0.00'}
            </h4>
            <p className="text-[9px] text-blue-400 font-bold mt-4 uppercase italic">Dinero total colocado en el periodo</p>
          </div>

          {/* TARJETA INGRESOS: DINERO COBRADO */}
          <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 relative overflow-hidden group">
            <ArrowDownRight className="absolute -right-2 -top-2 text-emerald-200 size-24 -rotate-12 group-hover:scale-110 transition-transform" />
            <p className="text-emerald-600 text-[10px] font-black uppercase mb-2">Ingresos (Cobranza)</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tighter italic">
              ${flujoEfectivo?.recuperacion_total?.toLocaleString('es-MX') || '0.00'}
            </h4>
            <p className="text-[9px] text-emerald-400 font-bold mt-4 uppercase italic">Capital + Intereses + Multas recibidas</p>
          </div>

          {/* TARJETA BALANCE NETO */}
          <div className={`p-6 rounded-[2rem] border relative overflow-hidden group ${(flujoEfectivo?.balance_neto || 0) >= 0 ? 'bg-slate-900 border-slate-800' : 'bg-rose-50 border-rose-100'
            }`}>
            <p className={`text-[10px] font-black uppercase mb-2 ${(flujoEfectivo?.balance_neto || 0) >= 0 ? 'text-slate-400' : 'text-rose-600'
              }`}>Balance Neto de Caja</p>
            <h4 className={`text-2xl font-black tracking-tighter italic ${(flujoEfectivo?.balance_neto || 0) >= 0 ? 'text-white' : 'text-rose-900'
              }`}>
              {(flujoEfectivo?.balance_neto || 0) >= 0 ? '+' : ''}
              ${flujoEfectivo?.balance_neto?.toLocaleString('es-MX') || '0.00'}
            </h4>
            <p className={`text-[9px] font-bold mt-4 uppercase italic ${(flujoEfectivo?.balance_neto || 0) >= 0 ? 'text-slate-500' : 'text-rose-400'
              }`}>
              {flujoEfectivo?.balance_neto >= 0 ? 'Flujo de caja positivo' : 'Déficit (Inyección de capital)'}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR SUPERIOR: SIDEBAR + GRÁFICA (MANTENIDO) */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">

        {/* SIDEBAR IZQUIERDO */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 space-y-6">

          {/* 1. BANNER PRINCIPAL DE CAPITAL */}
          <div className="relative overflow-hidden bg-[#050533] p-8 rounded-[2.5rem] shadow-2xl text-white border border-white/5">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Landmark size={100} />
            </div>
            <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic">Capital Colocado</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 italic">
              {statsGenerales?.capital_en_calle || "$0.00"}
            </h2>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                <p className="text-[8px] font-bold text-slate-400 uppercase">Activos</p>
                <p className="text-xs font-black text-emerald-400">{statsGenerales?.prestamos_activos || 0}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                <p className="text-[8px] font-bold text-slate-400 uppercase">Recuperado</p>
                <p className="text-xs font-black text-sky-400">{statsGenerales?.total_recuperado || "$0.00"}</p>
              </div>
            </div>
          </div>

          {/* 2. SALUD FINANCIERA */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
              <Percent size={28} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Estado de Cartera</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic mt-1">Óptima</h3>
            <p className="text-slate-400 text-[10px] mt-2 font-medium leading-relaxed italic">
              Cartera con flujo de abonos constante y morosidad controlada.
            </p>
          </div>

          {/* 3. BOTONES DE ACCIÓN */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => exportToExcel(statsGenerales, dataGrafica)}
              className="flex items-center justify-center gap-3 bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-emerald-100 hover:bg-emerald-100 hover:-translate-y-1 transition-all shadow-sm w-full"
            >
              <Wallet size={16} /> Exportar Excel
            </button>
            {/* <button
              onClick={() => exportToPDF(statsGenerales, dataGrafica)}
              className="flex items-center justify-center gap-3 bg-white text-slate-700 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-200 hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm w-full"
            >
              <Landmark size={16} /> Reporte PDF
            </button> */}
          </div>
        </div>

        {/* CONTENEDOR DERECHO: GRÁFICA (CORREGIDA ALTURA) */}
        <div className="flex-1 w-full bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col min-h-[450px] lg:min-h-[620px]">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><BarChart3 size={24} /></div>
              <div>
                <h3 className="font-black text-slate-800 text-xl uppercase italic leading-none tracking-tight">Rendimiento Operativo</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase mt-2 tracking-widest italic">Flujo de efectivo acumulado • {periodo}</p>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto">
              {(['semana', 'mes', 'anio'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-6 md:px-8 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${periodo === p ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[350px] lg:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafica} barGap={12}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  cursor={{ fill: '#f8f9fe' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const capital = payload[0].value as number;
                      const interes = payload[1].value as number;
                      return (
                        <div className="bg-white p-5 rounded-[1.5rem] shadow-2xl border border-slate-50">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-3 border-b pb-2">{label}</p>
                          <p className="text-xs font-bold text-blue-600">Cap: ${capital.toLocaleString()}</p>
                          <p className="text-xs font-bold text-emerald-600">Int: ${interes.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', paddingBottom: '30px' }} />
                <Bar dataKey="capital" fill={COLORS.azulRey} radius={[8, 8, 0, 0]} name="Capital" barSize={35} />
                <Bar dataKey="interes" fill={COLORS.verdeExito} radius={[8, 8, 0, 0]} name="Ganancia" barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RANGOS DE CARTERA (Inferior) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {(statsGenerales?.rangos || []).map((item: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:border-blue-200 transition-all group">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-tighter mb-3">{item.label}</p>
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-base md:text-lg font-black text-slate-800 leading-none italic">{item.total}</h4>
                <p className="text-[8px] text-slate-300 font-bold uppercase mt-2">Colocado</p>
              </div>
              <div className="bg-blue-50 text-[#0047AB] px-3 py-1.5 rounded-xl text-[10px] font-black">
                {item.cant}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
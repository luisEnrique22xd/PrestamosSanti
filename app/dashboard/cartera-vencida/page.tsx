'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  Users, ChevronRight, ChevronLeft, ExternalLink,
  User, MapPin, Search, ShieldCheck, Loader2, AlertCircle, X,
  CheckCircle2
} from 'lucide-react';
import React from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CarteraVencidaPage() {
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Función auxiliar para auto-limpiar la alerta
  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 5000);
  };
  const router = useRouter();
  const [entidades, setEntidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPorPagina = 6;

  // 1. CARGA DE DATOS (Solo los que el backend dice que ya vencieron)
  const fetchCartera = async () => {
    try {
      setLoading(true);
      // 🔥 DEBE SER /prestamos/... NO /clientes/...
      const response = await api.get('/prestamos/cartera-vencida/');
      setEntidades(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al obtener cartera:', error);
      setEntidades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCartera(); }, []);

  // 2. FILTRADO Y ORDENAMIENTO (Usando useMemo para estabilidad)
  const deudoresFiltrados = useMemo(() => {
    return entidades
      .filter(e => {
        const nombre = (e.nombre_deudor || '').toLowerCase();
        const busqueda = searchTerm.toLowerCase();
        return nombre.includes(busqueda) || e.id_prestamo.toString().includes(busqueda);
      })
      .sort((a, b) => b.monto_vencido - a.monto_vencido);
  }, [entidades, searchTerm]);

  const totalPaginas = Math.ceil(deudoresFiltrados.length / itemsPorPagina);
  const deudoresActuales = deudoresFiltrados.slice((currentPage - 1) * itemsPorPagina, currentPage * itemsPorPagina);

  const condonarMora = async (idPrestamo: number, nombre: string) => {
  const motivo = window.prompt(`¿Por qué condonas la mora de ${nombre}? (Mín. 10 carac.)`);
  if (!motivo || motivo.trim().length < 10) {
    return lanzarAlerta('error', "❌ Motivo inválido (mínimo 10 caracteres).");
  }

  try {
    // Apunta al endpoint correcto registrado en urls.py
    await api.post(`/penalizaciones/${idPrestamo}/condonar/`, { motivo });
    
    lanzarAlerta('success', "✅ Condonación realizada con éxito.");
    setExpandedId(null); // Plegar el detalle tras la acción
    await fetchCartera(); // Recargar cartera
  } catch (e: any) { 
    console.error('Error al condonar:', e);
    const msg = e.response?.data?.error || e.response?.data?.message || "❌ Error al procesar condonación.";
    lanzarAlerta('error', msg); 
  }
};

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} color="#DC2626" />
      <p className="font-black uppercase tracking-widest text-[10px] italic text-red-500 animate-pulse">
        Escaneando Cartera Vencida Tlaxcala...
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500 relative">
      {/* HEADER ALERTA */}
      <div className="p-6 md:p-8 border-b border-red-50 bg-red-50/20 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 italic uppercase tracking-tighter text-center md:text-left">Cartera en Mora</h2>            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">
              Recuperación Urgente: {deudoresFiltrados.length} Cuentas Vencidas
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o folio..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] md:w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-4 md:px-8 py-4 md:py-6">Cliente / Préstamo</th>
              <th className="px-4 md:px-8 py-4 md:py-6">Tipo</th>
              <th className="px-4 md:px-8 py-4 md:py-6 text-center">Monto Vencido</th>
              <th className="px-4 md:px-8 py-4 md:py-6 text-center">Días de Atraso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {deudoresActuales.length > 0 ? deudoresActuales.map((e) => {
              const uniqueKey = `${e.es_grupo ? 'G' : 'I'}-${e.id_prestamo}`;
              const isExpanded = expandedId === uniqueKey;

              return (
                <React.Fragment key={uniqueKey}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : uniqueKey)}
                    className={`transition-all cursor-pointer ${isExpanded ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${e.es_grupo ? 'bg-purple-600' : 'bg-[#0047AB]'}`}>
                          {e.es_grupo ? <Users size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight capitalize">{e.nombre_deudor}</p>
                          <p className="text-[9px] text-slate-400 font-bold italic">FOLIO: #{e.id_prestamo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${e.es_grupo ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {e.es_grupo ? 'Grupal' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-black text-sm text-red-600">
                        ${parseFloat(e.monto_vencido).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${e.dias_atraso > 7 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-600'}`}>
                          {e.dias_atraso} Días tarde
                        </span>
                        <span className="text-[8px] text-slate-400 mt-1 font-bold italic">Venció: {e.fecha_vencimiento}</span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-red-50/20">
                      <td colSpan={4} className="px-12 py-6 animate-in slide-in-from-top-2">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-red-100 shadow-xl gap-6">                          <div className="flex gap-10">
                          <div>
                            <p className="text-[8px] font-black text-slate-300 uppercase">Contacto</p>
                            <p className="text-xs font-bold text-slate-700">{e.telefono || 'Sin Teléfono'}</p>
                          </div>
                          {e.total_penalizaciones > 0 && (
                            <div>
                              <p className="text-[8px] font-black text-red-400 uppercase">Multas Acumuladas</p>
                              <p className="text-xs font-black text-red-600">${e.total_penalizaciones}</p>
                            </div>
                          )}
                        </div>
                          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                              onClick={(event) => { event.stopPropagation(); condonarMora(e.id_prestamo, e.nombre_deudor); }}
                              className="px-4 py-2 bg-amber-500 text-white text-[9px] font-black uppercase rounded-xl hover:bg-amber-600 transition-all w-full sm:w-auto justify-center"
                            >
                              Condonar
                            </button>
                            <button
                              onClick={(event) => { event.stopPropagation(); router.push('/dashboard/pagos'); }}
                              className="px-4 py-2 bg-red-700 text-white text-[9px] font-black uppercase rounded-xl hover:bg-red-800 shadow-lg w-full sm:w-auto justify-center"
                            >
                              Gestionar Cobro
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }) : (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-300">
                  <div className="flex flex-col items-center opacity-30">
                    <ShieldCheck size={60} />
                    <p className="font-black italic uppercase text-xs mt-4 tracking-widest">Cartera al Corriente</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[9px] text-slate-400 font-black uppercase">Página {currentPage} de {totalPaginas || 1}</p>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <button disabled={currentPage === totalPaginas} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      </div>
      {alerta && (
        <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right duration-500 ${alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'
          }`}>
          <div className={`p-3 rounded-2xl ${alerta.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
            }`}>
            {alerta.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
              {alerta.type === 'success' ? 'Sistema Express' : 'Atención'}
            </p>
            <p className="font-bold text-sm italic text-slate-700">{alerta.msg}</p>
          </div>
          <button onClick={() => setAlerta(null)} className="ml-4 text-slate-300 hover:text-slate-500">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
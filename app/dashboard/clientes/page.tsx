'use client';
import { useEffect, useState } from 'react';
import {
  Users, ChevronLeft, ChevronRight, ExternalLink,
  User, CheckCircle2, AlertCircle, X, Search, UserPlus, Edit3, Loader2
} from 'lucide-react';
import React from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clientesPorPagina = 6;


  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    curp: '',
    direccion: '',
    fecha_nacimiento: ''
  });

  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Función auxiliar para auto-limpiar la alerta
  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 5000);
  };

  const fetchClientes = async () => {
    try {
      setLoading(true);
      // Este endpoint ahora debe devolver una lista híbrida (Clientes + Grupos)
      const response = await api.get('/clientes/directorio-hibrido/');
      setClientes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  // Función para abrir el modal en modo edición
  const abrirEdicion = (cliente: any) => {
    if (cliente.es_grupo) return lanzarAlerta('error', "Para editar grupos, vaya al detalle del préstamo.");
    setIsEditing(true);
    setSelectedId(cliente.id);
    setFormData({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      curp: cliente.curp,
      direccion: cliente.direccion,
      fecha_nacimiento: cliente.fecha_nacimiento
    });
    setIsModalOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de edad mínima (18 años)
    const nacimiento = new Date(formData.fecha_nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy < new Date(new Date(nacimiento).setFullYear(nacimiento.getFullYear() + edad))) edad--;

    if (edad < 18) return lanzarAlerta('error', "❌ El cliente debe ser mayor de edad.");

    try {
      if (isEditing && selectedId) {
        await api.put(`/clientes/${selectedId}/`, formData);
        lanzarAlerta('success', "✅ Datos actualizados correctamente");
      } else {
        await api.post('/clientes/', formData);
        lanzarAlerta('success', "✅ Cliente registrado con éxito");
      }

      fetchClientes();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      const errorMsg = error.response?.data
        ? Object.values(error.response.data).flat().join(", ")
        : "Error en el servidor";
      lanzarAlerta('error', `❌ Error: ${errorMsg}`);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', telefono: '', curp: '', direccion: '', fecha_nacimiento: '' });
    setIsEditing(false);
    setSelectedId(null);
  };

  const clientesFiltrados = (clientes || []).filter(c => {
    const search = searchTerm.toLowerCase().trim();
    return !search || c.nombre?.toLowerCase().includes(search) || c.id?.toString().includes(search);
  });

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceUltimo = currentPage * clientesPorPagina; // <--- AGREGAR ESTA
  const indicePrimero = indiceUltimo - clientesPorPagina; // <--- AGREGAR ESTA
  const clientesActuales = clientesFiltrados.slice((currentPage - 1) * clientesPorPagina, currentPage * clientesPorPagina);


  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black uppercase tracking-widest text-xs italic">Sincronizando Directorio Tlaxcala...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6">        <div>
        <h2 className="text-2xl font-black text-slate-800 italic">Directorio General</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Total registrados: {clientes.length}</p>
      </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">          <div className="relative flex-1 md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0047AB]" size={18} />
          <input
            type="text"
            placeholder="Buscar cliente por nombre o ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0047AB] outline-none transition-all"
          />
        </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-[#0047AB] text-white font-black px-8 py-3 rounded-2xl hover:bg-blue-700 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 w-full sm:w-auto justify-center"
          >
            <UserPlus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* MODAL UNIFICADO (REGISTRO / EDICIÓN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050533]/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-800 mb-6 italic">
              {isEditing ? 'Actualizar Expediente' : 'Nuevo Registro de Cliente'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">              <div className="col-span-2 space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nombre Completo</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold" />
            </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Teléfono</label>
                <input type="tel" required value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">CURP</label>
                {/* <input type="text" disabled={isEditing} required maxLength={18} value={formData.curp} onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-mono font-bold" /> */}
                <input type="text" required maxLength={18} value={formData.curp} onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-mono font-bold" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Dirección Particular</label>
                <input type="text" required value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Fecha de Nacimiento</label>
                <input type="date" required value={formData.fecha_nacimiento} onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold" />
              </div>
              <button type="submit" className="col-span-2 mt-4 bg-[#050533] text-white font-black py-5 rounded-2xl hover:bg-[#0047AB] transition-all uppercase text-[10px] tracking-[0.2em]">
                {isEditing ? 'Guardar Cambios' : 'Registrar en Sistema'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="min-w-[800px] lg:w-full text-left border-collapse">          <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
          <tr>
            <th className="px-4 md:px-8 py-4 md:py-6">Identidad / ID</th>
            <th className="px-4 md:px-8 py-4 md:py-6">Tipo</th>
            <th className="px-4 md:px-8 py-4 md:py-6 text-center">Saldo Actual</th>
            <th className="px-4 md:px-8 py-4 md:py-6 text-center">Estatus</th>
          </tr>
        </thead>
          <tbody className="divide-y divide-slate-50">
            {clientesActuales.map((c) => (
              <React.Fragment key={`${c.es_grupo ? 'G' : 'I'}-${c.id}`}>
                <tr
                  onClick={() => {
                    const uniqueKey = `${c.es_grupo ? 'G' : 'I'}-${c.id}`;
                    setExpandedId(expandedId === uniqueKey ? null : uniqueKey);
                  }}
                  className={`transition-all cursor-pointer group ${expandedId === `${c.es_grupo ? 'G' : 'I'}-${c.id}` ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-all ${c.es_grupo ? 'bg-purple-600' : 'bg-[#0047AB]'}`}>
                        {c.es_grupo ? <Users size={18} /> : <User size={18} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm tracking-tight capitalize">{c.nombre || c.nombre_grupo}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase italic">{c.es_grupo ? 'Ref Grupal:' : 'ID Cliente:'} {c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${c.es_grupo ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {c.es_grupo ? 'Grupal Solidario' : 'Individual'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-black text-sm ${parseFloat(c.saldo_actual) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        ${parseFloat(c.saldo_actual || '0').toLocaleString('es-MX')}
                      </span>

                      {/* 🔥 ETIQUETA DE CUENTAS MÚLTIPLES */}
                      {c.prestamos_activos && c.prestamos_activos.length > 1 && (
                        <span className="mt-1 text-[7px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-amber-200">
                          {c.prestamos_activos.length} Cuentas Activas
                        </span>
                      )}

                      {parseFloat(c.total_penalizaciones) > 0 && (
                        <p className="text-[8px] text-red-400 font-bold uppercase italic">+ Mora Detectada</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`mx-auto w-fit px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border-2 ${c.tiene_prestamo_activo ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                      {c.tiene_prestamo_activo ? '● Deudor' : '● Libre'}
                    </div>
                  </td>
                </tr>

                {expandedId === `${c.es_grupo ? 'G' : 'I'}-${c.id}` && (
                  <tr className="bg-slate-50/30">
                    <td colSpan={4} className="px-16 py-8 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex flex-col gap-6">
                        {/* LISTA RAPIDA DE PRESTAMOS SI HAY MÁS DE UNO */}
        {c.prestamos_activos && c.prestamos_activos.length > 1 && (
          <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Desglose de Cuentas</p>
            <div className="flex flex-wrap gap-4">
              {c.prestamos_activos.map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-50">
                  <span className="text-[9px] font-black text-[#0047AB]">#PR-{p.folio.toString().padStart(3, '0')}</span>
                  <span className="text-[10px] font-bold text-red-500">${p.monto_total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">                        <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Información Base</p>
                        <p className="text-xs text-slate-600 font-bold leading-tight">{c.es_grupo ? `Integrantes: ${c.num_integrantes}` : c.direccion}</p>
                      </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Responsable / Aval</p>
                          <p className="text-xs text-slate-800 font-black">
                            {c.es_grupo ? (c.datos_ultimo_aval?.nombre_aval || 'Sin Representante') : (c.datos_ultimo_aval?.nombre_aval || 'Ninguno')}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 col-span-1 sm:col-span-2 lg:justify-end">                          {!c.es_grupo && (
                          <button onClick={(e) => { e.stopPropagation(); abrirEdicion(c); }} className="flex-1 max-w-[150px] flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase py-3 rounded-xl hover:bg-slate-50 transition-all">
                            <Edit3 size={14} /> Editar
                          </button>
                        )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Esto mandará a /dashboard/grupo-35 o /dashboard/102
                              router.push(`/dashboard/${c.es_grupo ? 'grupo-' : ''}${c.id}`);
                            }}
                            className={`flex-1 max-w-[180px] flex items-center justify-center gap-2 text-white text-[9px] font-black uppercase py-3 rounded-xl shadow-lg transition-all ${c.es_grupo ? 'bg-purple-700 hover:bg-purple-800' : 'bg-[#050533] hover:bg-[#0047AB]'}`}
                          >
                            Expediente <ExternalLink size={14} />
                          </button>
                        </div>
                      </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="p-6 md:p-8 bg-slate-50/20 border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-6 text-center">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
          Cliente <span className="text-[#0047AB]">{indicePrimero + 1}</span> a <span className="text-[#0047AB]">{Math.min(indiceUltimo, clientesFiltrados.length)}</span> de {clientesFiltrados.length}
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0047AB] disabled:opacity-20"><ChevronLeft size={18} /></button>
          <div className="flex gap-2">
            {[...Array(totalPaginas)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 text-[10px] font-black rounded-2xl transition-all ${currentPage === i + 1 ? 'bg-[#0047AB] text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>{i + 1}</button>
            ))}
          </div>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPaginas))} disabled={currentPage === totalPaginas} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0047AB] disabled:opacity-20"><ChevronRight size={18} /></button>
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
              {alerta.type === 'success' ? 'Prestamos Express' : 'Atención'}
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
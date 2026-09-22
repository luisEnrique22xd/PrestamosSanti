"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  UserPlus, RefreshCcw, ShieldCheck,
  X, Check, Plus, AlertCircle, Users, User, Search, Info
} from 'lucide-react';
import api from '@/lib/api';

// 1. CONFIGURACIÓN DE TASAS (NORMAL VS URGENTE)
const TASAS_CONFIG = {
  NORMAL: { 'S': 2.5, 'Q': 6.25, 'M': 15.0 },
  URGENTE: { 'S': 3.75, 'Q': 7.5, 'M': 15.0 }
};

export default function PrestamosPage() {
  const [tipoPrestamo, setTipoPrestamo] = useState<'I' | 'G'>('I');
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  // Estados para buscadores con sugerencias
  const [busquedaSocio, setBusquedaSocio] = useState('');
  const [sugerenciasSocios, setSugerenciasSocios] = useState<any[]>([]);
  const [sugerenciasIndividual, setSugerenciasIndividual] = useState<any[]>([]);

  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [gruposExistentes, setGruposExistentes] = useState<any[]>([]);
  const [mostrarSugerenciasGrupo, setMostrarSugerenciasGrupo] = useState(false);

  const [formData, setFormData] = useState({
    cliente: '', // ID del cliente
    nombre_grupo: '',
    grupo_id: '',
    monto_capital: '',
    tasa_interes: '2.5',
    cuotas: '8',
    modalidad: 'S',
    nombre_aval: '',
    direccion_aval: '',
    telefono_aval: '',
    curp_aval: '',
    parentesco_aval: '',
    garantia_descripcion: '',
    nombre_aval_2: '',
    direccion_aval_2: '',
    telefono_aval_2: '',
    curp_aval_2: '',
    parentesco_aval_2: '',
  });

  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [esUrgente, setEsUrgente] = useState(false);
  const [user, setUser] = useState({ role: '' });

  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 6000);
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    setUser({ role: savedRole || '' });
  }, []);

  const isAdmin = user.role === 'admin';

  // REGLA DE BLOQUEO DINÁMICO
  const tieneBloqueo = useMemo(() => {
    if (!clienteEncontrado) return false;
    return clienteEncontrado.tiene_prestamo_activo || clienteEncontrado.saldo_actual > 0;
  }, [clienteEncontrado]);

  // 🔥 ACTUALIZACIÓN AUTOMÁTICA DE TASAS SEGÚN MODO URGENTE
  useEffect(() => {
    const mod = formData.modalidad as 'S' | 'Q' | 'M';
    const nuevaTasa = esUrgente
      ? TASAS_CONFIG.URGENTE[mod]
      : TASAS_CONFIG.NORMAL[mod];

    setFormData(prev => ({ ...prev, tasa_interes: nuevaTasa.toString() }));
  }, [esUrgente, formData.modalidad]);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await api.get('/clientes/directorio-hibrido/');
        setGruposExistentes(res.data.filter((e: any) => e.es_grupo));
      } catch (e) { console.error("Error al cargar grupos"); }
    };
    fetchGrupos();
  }, []);

  // --- BUSCADOR POR NOMBRE (INDIVIDUAL) ---
  const buscarClientePorNombre = async (val: string) => {
    setFormData({ ...formData, cliente: val });
    if (val.length > 2) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        setSugerenciasIndividual(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
      } catch (e) { console.error(e); }
    } else {
      setSugerenciasIndividual([]);
    }
  };

  const seleccionarCliente = (cliente: any) => {
    const deudaActiva = cliente.tiene_prestamo_activo || cliente.saldo_actual > 0;

    if (deudaActiva) {
      lanzarAlerta('error', `RESTRICCIÓN: ${cliente.nombre} presenta deudas vigentes.`);
    }

    setClienteEncontrado(cliente);
    setFormData({
      ...formData,
      cliente: cliente.id.toString(),
      nombre_aval: cliente.datos_ultimo_aval?.nombre_aval || '',
      telefono_aval: cliente.datos_ultimo_aval?.telefono_aval || '',
      direccion_aval: cliente.datos_ultimo_aval?.direccion_aval || '',
      curp_aval: cliente.datos_ultimo_aval?.curp_aval || '',
      parentesco_aval: cliente.datos_ultimo_aval?.parentesco_aval || '',
      garantia_descripcion: cliente.datos_ultimo_aval?.garantia_descripcion || '',
    });
    setSugerenciasIndividual([]);
  };

  // --- LÓGICA GRUPAL ---
  const buscarSocios = async (val: string) => {
    setBusquedaSocio(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        setSugerenciasSocios(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
      } catch (e) { console.error(e); }
    } else { setSugerenciasSocios([]); }
  };

  const agregarIntegrante = (socio: any) => {
    if (socio.tiene_prestamo_activo || socio.saldo_actual > 0) {
      lanzarAlerta('error', `${socio.nombre} ya tiene compromisos financieros activos.`);
      return;
    }
    if (!integrantes.find(i => i.id === socio.id)) {
      setIntegrantes([...integrantes, socio]);
    }
    setBusquedaSocio('');
    setSugerenciasSocios([]);
  };

  const calculos = useMemo(() => {
    const capital = Number(formData.monto_capital) || 0;
    const tasa = Number(formData.tasa_interes) / 100;
    const nCuotas = Number(formData.cuotas) || 1;
    const interesTotal = capital * tasa * nCuotas;
    const totalPagar = capital + interesTotal;
    const pagoPorPeriodo = totalPagar / nCuotas;
    return { interesTotal, totalPagar, pagoPorPeriodo };
  }, [formData.monto_capital, formData.tasa_interes, formData.cuotas]);

  const ejecutarGuardado = async () => {
    setLoading(true);
    setConfirmando(false);
    try {
      const capitalNum = Number(formData.monto_capital);
      const payload = {
        ...formData,
        tipo: tipoPrestamo,
        es_urgente: esUrgente,
        integrantes: tipoPrestamo === 'G' ? integrantes.map(i => i.id) : [],
        monto_capital: capitalNum,
        monto_total_pagar: calculos.totalPagar,
        fecha_inicio: new Date().toISOString().split('T')[0],
      };
      if (capitalNum < 7499) {
        payload.nombre_aval_2 = '';
        payload.telefono_aval_2 = '';
        payload.direccion_aval_2 = '';
        payload.curp_aval_2 = '';
        payload.parentesco_aval_2 = '';
      }
      await api.post('/prestamos/', payload);
      lanzarAlerta('success', "Crédito autorizado correctamente.");
      setEsUrgente(false);
      handleReset();
    } catch (error: any) {
      lanzarAlerta('error', error.response?.data?.error || "Error al procesar crédito.");
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setFormData({
      cliente: '', nombre_grupo: '', grupo_id: '', monto_capital: '', tasa_interes: '2.5', cuotas: '8',
      modalidad: 'S', nombre_aval: '', direccion_aval: '', telefono_aval: '',
      curp_aval: '', parentesco_aval: '', garantia_descripcion: '', nombre_aval_2: '', direccion_aval_2: '', telefono_aval_2: '',
      curp_aval_2: '', parentesco_aval_2: '',
    });
    setIntegrantes([]);
    setClienteEncontrado(null);
    setConfirmando(false);
    setEsUrgente(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

      {/* SELECTOR */}
      <div className="flex flex-col sm:flex-row bg-slate-100 p-2 rounded-3xl sm:rounded-[2.5rem] w-full sm:w-fit mx-auto shadow-inner gap-2">
        <button onClick={() => { setTipoPrestamo('I'); handleReset(); }} className={`flex items-center gap-3 px-6 md:px-10 w-full sm:w-auto justify-center py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${tipoPrestamo === 'I' ? 'bg-[#0047AB] text-white shadow-lg' : 'text-slate-400'}`}>
          <User size={16} /> Individual
        </button>
        <button onClick={() => { setTipoPrestamo('G'); handleReset(); }} className={`flex items-center gap-3 px-6 md:px-10 w-full sm:w-auto justify-center py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${tipoPrestamo === 'G' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>
          <Users size={16} /> Grupal Solidario
        </button>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 relative">
        <h2 className="text-3xl font-black text-slate-800 italic tracking-tighter mb-10 uppercase">
          {tipoPrestamo === 'I' ? 'Nuevo Préstamo Cliente' : 'Apertura de Crédito Grupal'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); setConfirmando(true); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* BUSCADOR (INDIVIDUAL) */}
          {tipoPrestamo === 'I' ? (
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Buscar Cliente (Nombre)</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  value={clienteEncontrado ? clienteEncontrado.nombre : formData.cliente}
                  onChange={(e) => {
                    if (clienteEncontrado) setClienteEncontrado(null);
                    buscarClientePorNombre(e.target.value);
                  }}
                  className={`w-full p-4 pl-12 rounded-2xl outline-none font-bold transition-all ${tieneBloqueo && !esUrgente ? 'bg-red-50 border-red-200 border' : 'bg-slate-50'}`}
                  placeholder="Escriba nombre del cliente..."
                  required
                />
              </div>

              {sugerenciasIndividual.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                  {sugerenciasIndividual.map(c => (
                    <button key={c.id} type="button" onClick={() => seleccionarCliente(c)} className="w-full p-4 text-left hover:bg-blue-50 flex items-center justify-between border-b last:border-none">
                      <span className="text-xs font-black uppercase">{c.nombre}</span>
                      {(c.tiene_prestamo_activo || c.saldo_actual > 0) && (
                        <span className="text-[8px] bg-red-100 text-red-600 px-2 py-1 rounded font-black uppercase">Bloqueado</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {clienteEncontrado && tieneBloqueo && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                    <X size={16} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase italic">Restricción: El cliente posee una deuda activa</p>
                  </div>

                  {isAdmin && (
                    <div className={`p-4 border-2 border-dashed rounded-3xl transition-all ${esUrgente ? 'bg-amber-500 border-amber-600' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className={`flex items-center gap-2 ${esUrgente ? 'text-white' : 'text-amber-700'}`}>
                          <AlertCircle size={20} />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase leading-tight">Autorización Especial</span>
                            <span className="text-[8px] font-bold opacity-70">¿Permitir segundo préstamo?</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEsUrgente(!esUrgente)}
                          className={`px-5 py-2.5 rounded-2xl text-[9px] font-black transition-all shadow-sm ${esUrgente
                            ? 'bg-red-600 text-white ring-4 ring-red-100'
                            : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-100'
                            }`}
                        >
                          {esUrgente ? 'BLOQUEO ANULADO' : 'ACTIVAR EXCEPCIÓN'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="col-span-1 md:col-span-2 space-y-6">
              <label className="text-[10px] font-black text-purple-600 uppercase ml-2 tracking-widest">Nombre del Grupo</label>
              <input
                type="text"
                value={formData.nombre_grupo}
                onChange={(e) => setFormData({ ...formData, nombre_grupo: e.target.value })}
                className="w-full p-4 bg-purple-50/30 rounded-2xl outline-none border-2 border-transparent focus:border-purple-600 font-bold"
                placeholder="Nombre del grupo..." required
              />
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Añadir Integrantes</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" value={busquedaSocio} onChange={(e) => buscarSocios(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none" placeholder="Buscar por nombre..." />
                </div>
                {sugerenciasSocios.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
                    {sugerenciasSocios.map(s => (
                      <button key={s.id} type="button" onClick={() => agregarIntegrante(s)} className="w-full p-4 text-left hover:bg-blue-50 border-b flex justify-between items-center">
                        <span className="text-xs font-black uppercase">{s.nombre}</span>
                        {(s.tiene_prestamo_activo || s.saldo_actual > 0) ? <AlertCircle className="text-red-500" size={14} /> : <Plus size={14} className="text-blue-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {integrantes.map(i => (
                  <div key={i.id} className="bg-[#0047AB] text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 uppercase">
                    {i.nombre} <button type="button" onClick={() => setIntegrantes(integrantes.filter(it => it.id !== i.id))}><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Monto ($)</label>
            <input type="number" min={0} value={formData.monto_capital} onChange={(e) => setFormData({ ...formData, monto_capital: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl text-[#0047AB]" required />
          </div>

          {/* RESUMEN AZUL OSCURO */}
          {Number(formData.monto_capital) > 0 && (
            <div className="col-span-1 md:col-span-2 bg-[#050533] p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] text-white flex flex-col lg:flex-row justify-around items-center gap-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="text-center">
                <p className="text-[9px] font-black text-sky-400 uppercase mb-1">Cuota Estimada</p>
                <p className="text-2xl md:text-3xl font-black italic">${calculos.pagoPorPeriodo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Tasa Aplicada</p>
                <p className={`text-2xl md:text-3xl font-black italic ${esUrgente ? 'text-amber-400' : 'text-emerald-400'}`}>{formData.tasa_interes}%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total a Pagar</p>
                <p className="text-2xl md:text-3xl font-black italic text-white">${calculos.totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}

          {/* SECCIÓN DE AVALES */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100 space-y-6">
              <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2 italic">
                <ShieldCheck size={18} /> Información del Aval Principal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <input type="text" placeholder="Nombre completo" value={formData.nombre_aval} onChange={(e) => setFormData({ ...formData, nombre_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required />
                <input type="tel" placeholder="Teléfono" value={formData.telefono_aval} onChange={(e) => setFormData({ ...formData, telefono_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required />
                <input type="text" placeholder="Dirección" value={formData.direccion_aval} onChange={(e) => setFormData({ ...formData, direccion_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm md:col-span-2" required />
                <input type="text" placeholder="CURP" value={formData.curp_aval} onChange={(e) => setFormData({ ...formData, curp_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" />
                <input type="text" placeholder="Parentesco" value={formData.parentesco_aval} onChange={(e) => setFormData({ ...formData, parentesco_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" />
              </div>
            </div>

            {Number(formData.monto_capital) > 7500 && (
              <div className="p-8 bg-purple-50/30 rounded-[2.5rem] border border-purple-100 space-y-6 animate-in slide-in-from-top duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-2 italic">
                    <UserPlus size={18} /> Segundo Aval
                  </h3>
                  <span className="text-[8px] bg-purple-200 text-purple-700 px-2 py-1 rounded-full font-black">OBLIGATORIO</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <input type="text" placeholder="Nombre completo" value={formData.nombre_aval_2} onChange={(e) => setFormData({ ...formData, nombre_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
                  <input type="tel" placeholder="Teléfono" value={formData.telefono_aval_2} onChange={(e) => setFormData({ ...formData, telefono_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
                  <input type="text" placeholder="Dirección" value={formData.direccion_aval_2} onChange={(e) => setFormData({ ...formData, direccion_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm md:col-span-2" required />
                  <input type="text" placeholder="CURP" value={formData.curp_aval_2} onChange={(e) => setFormData({ ...formData, curp_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
                  <input type="text" placeholder="Parentesco" value={formData.parentesco_aval_2} onChange={(e) => setFormData({ ...formData, parentesco_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" />
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input type="text" placeholder="Descripción de la Garantía (Ej. Laptop, Factura de Moto...)" value={formData.garantia_descripcion} onChange={(e) => setFormData({ ...formData, garantia_descripcion: e.target.value })} className="w-full p-2 bg-transparent outline-none font-bold text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Frecuencia</label>
            <select value={formData.modalidad} onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold">
              <option value="S">
                Semanal {esUrgente ? '(3.75%)' : '(2.5%)'}
              </option>
              <option value="Q">
                Quincenal {esUrgente ? '(7.5%)' : '(6.25%)'}
              </option>
              <option value="M">
                Mensual {esUrgente ? '(15.0%)' : '(15.0%)'}
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Plazo (Periodos)</label>
            <input type="number" value={formData.cuotas} onChange={(e) => setFormData({ ...formData, cuotas: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
          </div>

          <button
            type="submit"
            disabled={(!esUrgente && tieneBloqueo) || loading || !formData.monto_capital}
            className={`col-span-1 md:col-span-2 mt-4 py-5 md:py-6 rounded-2xl md:rounded-[2.2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-4 ${(!esUrgente && tieneBloqueo)
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : esUrgente
                ? 'bg-red-700 text-white animate-pulse shadow-red-200'
                : 'bg-[#050533] text-white hover:bg-[#0047AB]'
              }`}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Procesando...' : esUrgente ? 'AUTORIZAR COMO ADMIN (URGENTE)' : 'Autorizar Crédito'}</span>
          </button>
        </form>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmando && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050533]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 shadow-2xl border-t-8 border-[#0047AB] mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black italic text-slate-800 uppercase leading-none text-center">Confirmar Datos</h3>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 font-bold text-sm">
              <div className="flex justify-between uppercase text-slate-500 text-[10px]"><span>Cliente:</span> <span className="text-slate-800 text-xs">{clienteEncontrado?.nombre || formData.nombre_grupo}</span></div>
              <div className="flex justify-between"><span>Capital:</span> <span>${Number(formData.monto_capital).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Tasa Aplicada:</span> <span className={esUrgente ? 'text-red-600' : 'text-blue-600'}>{formData.tasa_interes}%</span></div>
              <div className="flex justify-between text-xl font-black text-emerald-600 border-t pt-4"><span>Total a Pagar:</span> <span>${calculos.totalPagar.toLocaleString()}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setConfirmando(false)} className="py-5 rounded-3xl font-black text-[10px] uppercase text-slate-400 bg-slate-100">Cancelar</button>
              <button onClick={ejecutarGuardado} className="py-5 rounded-3xl font-black text-[10px] uppercase text-white bg-emerald-500 shadow-xl shadow-emerald-100">Autorizar</button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA FLOTANTE */}
      {alerta && (
        <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right ${alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
          <div className={`p-3 rounded-2xl ${alerta.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
            {alerta.type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
          </div>
          <p className="font-bold text-sm text-slate-800 italic">{alerta.msg}</p>
        </div>
      )}
    </div>
  );
}
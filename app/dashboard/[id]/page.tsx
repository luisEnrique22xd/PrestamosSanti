"use client";
import React, { useEffect, useState, use, useRef } from 'react';
import {
  Search, X, TrendingUp, CheckCircle2, Printer,
  DollarSign, UserCheck, Users, Phone,
  User, ArrowRight, Loader2, AlertTriangle,
  AlertCircle,
  Edit
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell, PieChart as RePie, Pie
} from 'recharts';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { generarPDFRecibo } from '@/lib/generateTicket';
import ClientHealthBadge from '@/app/components/ClientHealthBadge';

const COLORS = {
  azulRey: '#0047AB',
  verdeExito: '#10B981',
  rojoAlerta: '#DC2626',
  amarilloCuidado: '#FBBF24',
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 opacity-10`}>
      <Icon size={80} color={color} />
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
  </div>
);


export default function ClienteDashboard({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const [showEditAvalModal, setShowEditAvalModal] = useState(false);
  const [editAvalData, setEditAvalData] = useState({
    nombre_aval: '',
    telefono_aval: '',
    direccion_aval: ''
  });
  const [procesandoAval, setProcesandoAval] = useState(false);
  const abrirEditarAval = () => {
    if (data.datos_ultimo_aval) {
      setEditAvalData({
        nombre_aval: data.datos_ultimo_aval.nombre_aval || '',
        telefono_aval: data.datos_ultimo_aval.telefono_aval || '',
        direccion_aval: data.datos_ultimo_aval.direccion_aval || ''
      });
      setShowEditAvalModal(true);
    } else {
      lanzarAlerta('error', "⚠️ No hay datos de aval para editar.");
    }
  };
  const [selectedPrestamoId, setSelectedPrestamoId] = useState<number | null>(null);
  const params = use(paramsPromise);
  const router = useRouter();
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Función auxiliar para auto-limpiar la alerta
  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 5000);
  };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // MODAL ABONO
  const [showModal, setShowModal] = useState(false);
  const [montoAbono, setMontoAbono] = useState('');
  const [semanaAbono, setSemanaAbono] = useState('1');
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [datosRecibo, setDatosRecibo] = useState<any>(null);

  // BUSCADOR
  const [busqueda, setBusqueda] = useState('');
  const [listaEntidades, setListaEntidades] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // CONDONACIÓN
  const [showCondonarModal, setShowCondonarModal] = useState(false);
  const [selectedPenalizacion, setSelectedPenalizacion] = useState<any>(null);
  const [motivoCondonacion, setMotivoCondonacion] = useState('');
  const [procesandoCondonacion, setProcesandoCondonacion] = useState(false);

  const [user, setUser] = useState<{ role: string | null }>({ role: null });

  useEffect(() => {
    // 2. Leemos el rol cuando el componente se monta
    const savedRole = localStorage.getItem('user_role');
    setUser({ role: savedRole });
  }, []);

  // --- 1. CARGA DE DATOS DEL EXPEDIENTE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let endpoint = params.id.startsWith('grupo-')
          ? `/grupos/${params.id.replace('grupo-', '')}/detalle/`
          : `/clientes/${params.id}/`;

        const res = await api.get(endpoint);
        setData(res.data);
      } catch (error) {
        console.error("Error al localizar entidad:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  // --- 2. CARGA DE DIRECTORIO PARA BUSCADOR ---
  useEffect(() => {
    const cargarDirectorio = async () => {
      try {
        const res = await api.get('/clientes/directorio-hibrido/');
        setListaEntidades(res.data);
      } catch (e) { console.error(e); }
    };
    cargarDirectorio();
  }, []);

  // --- 3. LÓGICA DEL BUSCADOR ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.length > 1) {
      const filtrados = listaEntidades.filter(entidad => {
        const nombre = (entidad.nombre || entidad.nombre_grupo || '').toLowerCase();
        return nombre.includes(valor.toLowerCase()) || entidad.id.toString().includes(valor);
      }).slice(0, 5);
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
  };

  const seleccionarEntidad = (entidad: any) => {
    setMostrarSugerencias(false);
    setBusqueda('');
    const path = entidad.es_grupo ? `grupo-${entidad.id}` : entidad.id;
    router.push(`/dashboard/${path}`);
  };

  // --- 4. LÓGICA DE ABONO ---
  const handleRegistrarPago = async () => {
    if (!montoAbono) return lanzarAlerta('error', "❌ Ingresa un monto válido");
    // 🔥 CAMBIO: Validamos que exista una cuenta seleccionada
    if (!selectedPrestamoId) return lanzarAlerta('error', "❌ Error: Seleccione una cuenta.");

    try {
      setLoading(true);
      const response = await api.post('/abonos/', {
        // 🔥 CAMBIO: Usamos selectedPrestamoId en lugar del último
        prestamo: selectedPrestamoId,
        monto: montoAbono,
        semana_numero: semanaAbono
      });

      // 🔥 CAMBIO: Los cálculos ahora se basan en el préstamo seleccionado de la lista
      const pActivo = data.prestamos_activos?.find((p: any) => p.id === selectedPrestamoId);
      const capitalOriginal = parseFloat(pActivo?.capital || 0);
      const abonoActual = parseFloat(montoAbono);
      const saldoAnteriorManual = parseFloat(pActivo?.monto_total || 0);
      const nuevoSaldoCapital = saldoAnteriorManual - abonoActual;

      setDatosRecibo({
        cliente: data.nombre,
        monto: abonoActual.toFixed(2),
        fecha: new Date().toLocaleDateString('es-MX'),
        folio: response.data.id_abono || "001",
        saldoRestante: nuevoSaldoCapital.toFixed(2),
        capitalOriginal: capitalOriginal.toFixed(2),
        saldoAnterior: saldoAnteriorManual.toFixed(2),
        semana: semanaAbono
      });

      setPagoExitoso(true);
      setMontoAbono('');

      const endpoint = params.id.startsWith('grupo-')
        ? `/grupos/${params.id.replace('grupo-', '')}/detalle/`
        : `/clientes/${params.id}/`;
      const resRefresh = await api.get(endpoint);
      setData(resRefresh.data);
    } catch (error: any) {
      lanzarAlerta('error', "❌ Error al registrar el pago.");
    } finally { setLoading(false); }
  };

  const handleCondonar = async () => {
    if (motivoCondonacion.length < 10) return lanzarAlerta('error', "⚠️ Justificación muy corta.");
    if(!selectedPenalizacion?.id) return lanzarAlerta('error', "❌ Error: No se ha seleccionado una penalización válida.");
    try {
      setProcesandoCondonacion(true);
      // Usamos el ID de la mora que seleccionamos al abrir el modal
      await api.post(`/penalizaciones/${selectedPenalizacion.id}/condonar/`, {
        motivo: motivoCondonacion
      });

      setShowCondonarModal(false);

      // 🔥 IMPORTANTE: Recarga los datos para que el saldo baje de $1,115 a $1,100
      const res = await api.get(`/clientes/${params.id}/`);
      setData(res.data);

      lanzarAlerta('success', "✅ Recargos condonados. El saldo ha sido actualizado.");
    } catch (error) {
      lanzarAlerta('error', "❌ Error al condonar la mora.");
    } finally {
      setProcesandoCondonacion(false);
    }
  };

  const handleUpdateAval = async () => {
    try {
      setProcesandoAval(true);
      // Asumimos que el endpoint es /clientes/{id}/actualizar-aval/ o similar
      await api.patch(`/clientes/${params.id}/actualizar-aval/`, editAvalData);

      lanzarAlerta('success', "✅ Datos del aval actualizados correctamente.");
      setShowEditAvalModal(false);

      // Recargar datos del expediente
      const res = await api.get(`/clientes/${params.id}/`);
      setData(res.data);
    } catch (error) {
      lanzarAlerta('error', "❌ Error al actualizar el aval.");
    } finally {
      setProcesandoAval(false);
    }
  };
  if (loading && !data) return <div className="p-10 flex items-center gap-3 font-black italic text-slate-400"><Loader2 className="animate-spin" /> Sincronizando Acuitlapilco...</div>;
  if (!data) return <div className="p-10 font-black italic text-red-400 text-center">⚠️ Error: Entidad no localizada en el sistema.</div>;

  const cumplimientoData = [
    { name: 'Pagado', value: data.progreso_pagos?.pagado || 0, color: COLORS.verdeExito },
    { name: 'Pendiente', value: 100 - (data.progreso_pagos?.pagado || 0), color: '#F1F5F9' },
  ];

  const StatusBadge = ({ data }: { data: any }) => {
    // 1. Si no tiene préstamo activo y el saldo es 0, está LIBRE/LIQUIDADO
    const isLiquidado = !data.tiene_prestamo_activo && Number(data.saldo_actual) <= 0;

    if (isLiquidado) {
      return (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm animate-in zoom-in duration-500">
          <CheckCircle2 size={14} className="animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">Préstamo Liquidado</span>
        </div>
      );
    }

    // 2. Si tiene préstamo activo o saldo pendiente, está EN COBRO
    return (
      <div className="flex items-center gap-2 bg-blue-50 text-[#0047AB] px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
        <div className="w-1.5 h-1.5 bg-[#0047AB] rounded-full animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Cuenta en Cobro</span>
      </div>
    );
  };


  <ClientHealthBadge
    count={data.conteo_historico_penalizaciones || 0}
    tieneMora={data.tiene_moras_activas}
  />
  const mapearPlazo = (cuotas: number, modalidad: string) => {
    const mod = modalidad?.trim().toUpperCase() || '';

    if (mod.startsWith('S') || mod.includes('SEMANAL')) {
      return `${cuotas} ${cuotas === 1 ? 'Semana' : 'Semanas'}`;
    }
    if (mod.startsWith('Q') || mod.includes('QUINCENAL')) {
      return `${cuotas} ${cuotas === 1 ? 'Quincena' : 'Quincenas'}`;
    }
    if (mod.startsWith('M') || mod.includes('MENSUAL')) {
      return `${cuotas} ${cuotas === 1 ? 'Mes' : 'Meses'}`;
    }
    return `${cuotas} Cuotas`;
  };
  return (
    <div className="flex min-h-screen bg-[#F8FAFE]">
      <main className="flex-1 p-10 overflow-auto">

        {/* BUSCADOR */}
        <div className="mb-8 flex justify-end" ref={searchRef}>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text" placeholder="Buscar cliente o grupo..."
              value={busqueda} onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 bg-white shadow-sm rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold"
            />
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] w-full">
                {sugerencias.map((c) => (
                  <button key={`${c.es_grupo ? 'G' : 'I'}-${c.id}`} onClick={() => seleccionarEntidad(c)} className="w-full px-5 py-4 hover:bg-blue-50 text-left border-b last:border-none flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${c.es_grupo ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {c.es_grupo ? <Users size={14} /> : <User size={14} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{c.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{c.es_grupo ? 'Grupo Solidario' : `ID: ${c.id}`}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-[#0047AB] transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HEADER */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-blue-200 uppercase ${data.tipo === 'G' ? 'bg-purple-600' : 'bg-[#0047AB]'}`}>
              {data.tipo === 'G' ? <Users size={32} /> : data.nombre[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Resumen General de Deuda</span>
                </div>
                <StatusBadge data={data} />
                <ClientHealthBadge count={data.conteo_historico_penalizaciones || 0} tieneMora={data.tiene_moras_activas} />
              </div>
              <h1 className="text-4xl font-black text-slate-800 italic tracking-tighter">
                {data.tipo === 'G' ? `Grupo: ${data.nombre}` : data.nombre}
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1">{data.direccion}</p>
            </div>
          </div>
        </header>

        {/* STATS GENERALES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Saldo Consolidado" value={`$${(data.saldo_actual || 0).toLocaleString()}`} icon={DollarSign} color={COLORS.rojoAlerta} />
          <StatCard title="Total Pagado" value={`$${(data.progreso_pagos?.monto_pagado || 0).toLocaleString()}`} icon={UserCheck} color={COLORS.verdeExito} />
          <StatCard title="Total Contratado" value={`$${(data.progreso_pagos?.monto_capital || 0).toLocaleString()}`} icon={TrendingUp} color={COLORS.azulRey} />
          <StatCard
            title={data.tipo === 'G' ? "Integrantes" : "Teléfono"}
            value={data.tipo === 'G' ? `${data.integrantes_detalle?.length || 0} Clientes` : (data.telefono !== 'N/A' ? data.telefono : data.datos_ultimo_aval?.telefono_aval || 'S/N')}
            icon={data.tipo === 'G' ? Users : Phone}
            color={data.tipo === 'G' ? '#7C3AED' : COLORS.amarilloCuidado}
          />
        </div>

        {/* 🔥 AGREGADO: SECCIÓN DE CUENTAS INDEPENDIENTES 🔥 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {data.prestamos_activos?.map((p: any) => (
            <div key={p.id} className="bg-white p-8 rounded-[3rem] border-l-[12px] border-[#0047AB] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 bg-[#050533] text-white px-5 py-2 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest">
                Folio: PR-{p.folio.toString().padStart(5, '0')}
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase italic mb-1">Saldo de esta cuenta ({p.modalidad})</p>
                  <h2 className="text-4xl font-black text-slate-800 italic tracking-tighter">
                    ${p.monto_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                  {/* Columna 1: Capital Inicial */}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Capital Inicial</p>
                    <p className="font-bold text-slate-600 text-xs md:text-sm">${p.capital.toLocaleString()}</p>
                  </div>

                  {/* Columna 2: Fecha de Emisión y Plazo Pactado */}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Emisión / Plazo</p>
                   <p className="font-bold text-slate-700 text-[11px]">
  {p.fecha_inicio
    ? p.fecha_inicio.split('T')[0].split('-').reverse().join('/')
    : new Date().toLocaleDateString('es-MX')}
</p>
                    <p className="text-[10px] font-black text-[#0047AB] uppercase tracking-tighter mt-0.5">
                      {mapearPlazo(p.cuotas, p.modalidad)}
                    </p>
                  </div>

                  {/* Columna 3: Aval Responsable */}
                  {/* Columna 3: Aval Responsable */}
<div>
  <p className="text-[9px] font-black text-slate-400 uppercase">Aval Responsable</p>
  
  <div className="flex items-center justify-between gap-1 mt-0.5">
    <div className="min-w-0 flex-1">
      {/* Nombre del Aval */}
      <p 
        className="font-bold text-slate-700 text-[11px] uppercase truncate block" 
        title={p.aval || data.datos_ultimo_aval?.nombre_aval}
      >
        {p.aval || data.datos_ultimo_aval?.nombre_aval || 'Sin Asignar'}
      </p>

      {/* Teléfono del Aval */}
      {(p.telefono_aval || data.datos_ultimo_aval?.telefono_aval) ? (
        <a
          href={`tel:${p.telefono_aval || data.datos_ultimo_aval?.telefono_aval}`}
          className="text-[10px] font-semibold text-slate-500 hover:text-[#0047AB] transition-colors flex items-center gap-1 truncate"
          title="Llamar al aval"
        >
          <Phone size={10} className="shrink-0 text-slate-400" />
          <span className="truncate">{p.telefono_aval || data.datos_ultimo_aval?.telefono_aval}</span>
        </a>
      ) : (
        <p className="text-[10px] font-semibold text-slate-400 italic">S/N</p>
      )}
    </div>

    {/* Botón Editar Aval */}
    <button
      onClick={abrirEditarAval}
      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors shrink-0"
      title="Editar datos del aval"
    >
      <Edit size={13} />
    </button>
  </div>
</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPrestamoId(p.id);
                    setPagoExitoso(false);
                    setShowModal(true);
                  }}
                  className="w-full py-4 bg-slate-50 hover:bg-[#0047AB] hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign size={14} /> Registrar Abono a esta Cuenta
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* GRAFICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
            <h4 className="font-black text-slate-800 text-lg uppercase italic mb-8">Flujo de Abonos</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.historial_grafico || []}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#F8FAFE' }} contentStyle={{ borderRadius: '20px', border: 'none' }} />
                  <Bar dataKey="pago" fill={data.tipo === 'G' ? '#7C3AED' : COLORS.azulRey} radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center">
            <h4 className="font-black text-slate-800 mb-2 uppercase italic">Liquidación Global</h4>
            <div className="flex-1 relative w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePie data={cumplimientoData} innerRadius={70} outerRadius={90} dataKey="value" startAngle={90} endAngle={450}>
                  {cumplimientoData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                </RePie>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800">{Math.round(data.progreso_pagos?.pagado || 0)}%</span>
                <span className="text-[8px] text-slate-400 font-black uppercase">Completado</span>
              </div>
            </div>
          </div>
        </div>

        {/* RECARGOS */}
        <div className="mt-8">
          <div className="bg-[#050533] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
            <h4 className="font-black mb-6 uppercase italic text-sky-400">Recargos del Crédito (1%)</h4>
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {data.total_penalizaciones > 0 ? (
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-right-4">
                  <div>
                    {/* 🔥 CAMBIO AQUÍ: Texto dinámico según el estado real de la mora */}
                    <p className={`text-[9px] font-black uppercase ${data.tiene_moras_activas ? 'text-red-400' : 'text-amber-400'}`}>
                      {data.tiene_moras_activas ? '⚠️ Mora Activa Detectada' : '⏳ Saldo de Recargos Pendiente'}
                    </p>
                    <p className="text-sm font-bold text-white">${parseFloat(data.total_penalizaciones).toFixed(2)}</p>
                    <p className="text-[8px] text-slate-400 italic">
                      {data.tiene_moras_activas
                        ? 'El cliente presenta un atraso en la cuota actual.'
                        : 'El cliente va al corriente en cuotas, pero arrastra recargos anteriores.'}
                    </p>
                  </div>
<button
  onClick={() => {
    setSelectedPenalizacion({ 
      id: data.id_mora_activa || data.ultimo_prestamo_id || data.prestamos_activos?.[0]?.id, 
      monto_penalizado: data.total_penalizaciones 
    });
    setShowCondonarModal(true);
  }}
  className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
>
  Condonar
</button>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-emerald-400 py-4 italic font-bold animate-in zoom-in">
                  <CheckCircle2 size={18} />
                  <span>✓ El cliente está al corriente y sin recargos</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL COBRO */}
      {showModal && (
        <div className="fixed inset-0 bg-[#050533]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            {!pagoExitoso ? (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-8">
                  {/* 🔥 AGREGADO: Titulo con Folio Seleccionado 🔥 */}
                  <h2 className="text-2xl font-black text-slate-800 italic uppercase">
                    Registrar Abono
                    {selectedPrestamoId && (
                      <span className="text-[#0047AB] ml-2 font-black italic">
                        #{data.prestamos_activos?.find((p: any) => p.id === selectedPrestamoId)?.folio}
                      </span>
                    )}
                  </h2>
                  <button onClick={() => { setShowModal(false); setSelectedPrestamoId(null); }} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Monto del Pago ($)</label>
                    <input type="number" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-2xl text-slate-800" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Número de Cuota</label>
                    <select value={semanaAbono} onChange={(e) => setSemanaAbono(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                      {Array.from({ length: data.progreso_pagos?.total_cuotas || 12 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>Cuota {num}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleRegistrarPago} disabled={loading} className="w-full py-5 bg-[#0047AB] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all">
                    {loading ? 'Procesando...' : 'Confirmar Abono'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4 animate-in slide-in-from-bottom">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={44} /></div>
                <h2 className="text-2xl font-black text-slate-800 uppercase italic">¡Abono Aplicado!</h2>
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-1">Nuevo Saldo Pendiente</p>
                  <p className="text-4xl font-black text-[#0047AB] tracking-tighter italic">${datosRecibo?.saldoRestante}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button onClick={() => { setShowModal(false); setPagoExitoso(false); setSelectedPrestamoId(null); }} className="py-4 text-slate-400 font-black uppercase text-[10px]">Cerrar</button>
                  <button onClick={() => generarPDFRecibo(datosRecibo)} className="py-4 bg-[#050533] text-white rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center justify-center gap-2"><Printer size={16} /> Recibo</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONDONAR */}
      {showCondonarModal && (
        <div className="fixed inset-0 bg-[#050533]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in">
            <h2 className="text-2xl font-black text-slate-800 italic mb-2">Condonar Recargo</h2>
            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Monto a perdonar: <span className="text-red-500">${selectedPenalizacion?.monto_penalizado}</span></p>
            <div className="space-y-4">
              <textarea value={motivoCondonacion} onChange={(e) => setMotivoCondonacion(e.target.value)} placeholder="Motivo de la condonación..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-sm min-h-[120px]" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowCondonarModal(false)} className="py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                {user.role === 'admin' && (<button onClick={handleCondonar} disabled={procesandoCondonacion || motivoCondonacion.length < 10} className="py-4 bg-red-600 text-white font-black text-[10px] uppercase rounded-2xl shadow-lg disabled:opacity-30">Confirmar</button>)}
              </div>
            </div>
          </div>
        </div>
      )}
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
      {/* MODAL EDITAR AVAL */}
      {showEditAvalModal && (
        <div className="fixed inset-0 bg-[#050533]/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 italic uppercase">Editar Aval</h2>
              <button onClick={() => setShowEditAvalModal(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Nombre del Aval</label>
                <input
                  type="text"
                  value={editAvalData.nombre_aval}
                  onChange={(e) => setEditAvalData({ ...editAvalData, nombre_aval: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Teléfono</label>
                <input
                  type="text"
                  value={editAvalData.telefono_aval}
                  onChange={(e) => setEditAvalData({ ...editAvalData, telefono_aval: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Dirección</label>
                <textarea
                  value={editAvalData.direccion_aval}
                  onChange={(e) => setEditAvalData({ ...editAvalData, direccion_aval: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button onClick={() => setShowEditAvalModal(false)} className="py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                <button
                  onClick={handleUpdateAval}
                  disabled={procesandoAval}
                  className="py-4 bg-[#0047AB] text-white font-black text-[10px] uppercase rounded-2xl shadow-lg disabled:opacity-50"
                >
                  {procesandoAval ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
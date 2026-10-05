// // "use client";
// // import { useState, useEffect, useMemo } from 'react';
// // import {
// //   UserPlus, RefreshCcw, ShieldCheck,
// //   X, Check, Plus, AlertCircle, Users, User, Search, Info
// // } from 'lucide-react';
// // import api from '@/lib/api';

// // // 1. CONFIGURACIÓN DE TASAS (NORMAL VS URGENTE)
// // const TASAS_CONFIG = {
// //   NORMAL: { 'S': 20,},
  
// // };

// // export default function PrestamosPage() {
// //   const [tipoPrestamo, setTipoPrestamo] = useState<'I' | 'G'>('I');
// //   const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
// //   const [loading, setLoading] = useState(false);
// //   const [confirmando, setConfirmando] = useState(false);

// //   // Estados para buscadores con sugerencias
// //   const [busquedaSocio, setBusquedaSocio] = useState('');
// //   const [sugerenciasSocios, setSugerenciasSocios] = useState<any[]>([]);
// //   const [sugerenciasIndividual, setSugerenciasIndividual] = useState<any[]>([]);

// //   const [integrantes, setIntegrantes] = useState<any[]>([]);
// //   const [gruposExistentes, setGruposExistentes] = useState<any[]>([]);
// //   const [mostrarSugerenciasGrupo, setMostrarSugerenciasGrupo] = useState(false);

// //   const [formData, setFormData] = useState({
// //     cliente: '', // ID del cliente
// //     nombre_grupo: '',
// //     grupo_id: '',
// //     monto_capital: '',
// //     tasa_interes: '2.5',
// //     cuotas: '8',
// //     modalidad: 'S',
// //     nombre_aval: '',
// //     direccion_aval: '',
// //     telefono_aval: '',
// //     curp_aval: '',
// //     parentesco_aval: '',
// //     garantia_descripcion: '',
// //     nombre_aval_2: '',
// //     direccion_aval_2: '',
// //     telefono_aval_2: '',
// //     curp_aval_2: '',
// //     parentesco_aval_2: '',
// //   });

// //   const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
// //   const [esUrgente, setEsUrgente] = useState(false);
// //   const [user, setUser] = useState({ role: '' });

// //   const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
// //     setAlerta({ type, msg });
// //     setTimeout(() => setAlerta(null), 6000);
// //   };

// //   useEffect(() => {
// //     const savedRole = localStorage.getItem('user_role');
// //     setUser({ role: savedRole || '' });
// //   }, []);

// //   const isAdmin = user.role === 'admin';

// //   // REGLA DE BLOQUEO DINÁMICO
// //   const tieneBloqueo = useMemo(() => {
// //     if (!clienteEncontrado) return false;
// //     return clienteEncontrado.tiene_prestamo_activo || clienteEncontrado.saldo_actual > 0;
// //   }, [clienteEncontrado]);

// //   // 🔥 ACTUALIZACIÓN AUTOMÁTICA DE TASAS SEGÚN MODO URGENTE
// //   useEffect(() => {
// //     const mod = formData.modalidad as 'S' | 'Q' | 'M';
// //     const nuevaTasa = esUrgente
// //       ? TASAS_CONFIG.URGENTE[mod]
// //       : TASAS_CONFIG.NORMAL[mod];

// //     setFormData(prev => ({ ...prev, tasa_interes: nuevaTasa.toString() }));
// //   }, [esUrgente, formData.modalidad]);

// //   useEffect(() => {
// //     const fetchGrupos = async () => {
// //       try {
// //         const res = await api.get('/clientes/directorio-hibrido/');
// //         setGruposExistentes(res.data.filter((e: any) => e.es_grupo));
// //       } catch (e) { console.error("Error al cargar grupos"); }
// //     };
// //     fetchGrupos();
// //   }, []);

// //   // --- BUSCADOR POR NOMBRE (INDIVIDUAL) ---
// //   const buscarClientePorNombre = async (val: string) => {
// //     setFormData({ ...formData, cliente: val });
// //     if (val.length > 2) {
// //       try {
// //         const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
// //         setSugerenciasIndividual(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
// //       } catch (e) { console.error(e); }
// //     } else {
// //       setSugerenciasIndividual([]);
// //     }
// //   };

// //   const seleccionarCliente = (cliente: any) => {
// //     const deudaActiva = cliente.tiene_prestamo_activo || cliente.saldo_actual > 0;

// //     if (deudaActiva) {
// //       lanzarAlerta('error', `RESTRICCIÓN: ${cliente.nombre} presenta deudas vigentes.`);
// //     }

// //     setClienteEncontrado(cliente);
// //     setFormData({
// //       ...formData,
// //       cliente: cliente.id.toString(),
// //       nombre_aval: cliente.datos_ultimo_aval?.nombre_aval || '',
// //       telefono_aval: cliente.datos_ultimo_aval?.telefono_aval || '',
// //       direccion_aval: cliente.datos_ultimo_aval?.direccion_aval || '',
// //       curp_aval: cliente.datos_ultimo_aval?.curp_aval || '',
// //       parentesco_aval: cliente.datos_ultimo_aval?.parentesco_aval || '',
// //       garantia_descripcion: cliente.datos_ultimo_aval?.garantia_descripcion || '',
// //     });
// //     setSugerenciasIndividual([]);
// //   };

// //   // --- LÓGICA GRUPAL ---
// //   const buscarSocios = async (val: string) => {
// //     setBusquedaSocio(val);
// //     if (val.length > 1) {
// //       try {
// //         const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
// //         setSugerenciasSocios(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
// //       } catch (e) { console.error(e); }
// //     } else { setSugerenciasSocios([]); }
// //   };

// //   const agregarIntegrante = (socio: any) => {
// //     if (socio.tiene_prestamo_activo || socio.saldo_actual > 0) {
// //       lanzarAlerta('error', `${socio.nombre} ya tiene compromisos financieros activos.`);
// //       return;
// //     }
// //     if (!integrantes.find(i => i.id === socio.id)) {
// //       setIntegrantes([...integrantes, socio]);
// //     }
// //     setBusquedaSocio('');
// //     setSugerenciasSocios([]);
// //   };

// //   const calculos = useMemo(() => {
// //     const capital = Number(formData.monto_capital) || 0;
// //     const tasa = Number(formData.tasa_interes) / 100;
// //     const nCuotas = Number(formData.cuotas) || 1;
// //     const interesTotal = capital * tasa * nCuotas;
// //     const totalPagar = capital + interesTotal;
// //     const pagoPorPeriodo = totalPagar / nCuotas;
// //     return { interesTotal, totalPagar, pagoPorPeriodo };
// //   }, [formData.monto_capital, formData.tasa_interes, formData.cuotas]);

// //   const ejecutarGuardado = async () => {
// //     setLoading(true);
// //     setConfirmando(false);
// //     try {
// //       const capitalNum = Number(formData.monto_capital);
// //       const payload = {
// //         ...formData,
// //         tipo: tipoPrestamo,
// //         es_urgente: esUrgente,
// //         integrantes: tipoPrestamo === 'G' ? integrantes.map(i => i.id) : [],
// //         monto_capital: capitalNum,
// //         monto_total_pagar: calculos.totalPagar,
// //         fecha_inicio: new Date().toISOString().split('T')[0],
// //       };
// //       if (capitalNum < 7499) {
// //         payload.nombre_aval_2 = '';
// //         payload.telefono_aval_2 = '';
// //         payload.direccion_aval_2 = '';
// //         payload.curp_aval_2 = '';
// //         payload.parentesco_aval_2 = '';
// //       }
// //       await api.post('/prestamos/', payload);
// //       lanzarAlerta('success', "Crédito autorizado correctamente.");
// //       setEsUrgente(false);
// //       handleReset();
// //     } catch (error: any) {
// //       lanzarAlerta('error', error.response?.data?.error || "Error al procesar crédito.");
// //     } finally { setLoading(false); }
// //   };

// //   const handleReset = () => {
// //     setFormData({
// //       cliente: '', nombre_grupo: '', grupo_id: '', monto_capital: '', tasa_interes: '2.5', cuotas: '8',
// //       modalidad: 'S', nombre_aval: '', direccion_aval: '', telefono_aval: '',
// //       curp_aval: '', parentesco_aval: '', garantia_descripcion: '', nombre_aval_2: '', direccion_aval_2: '', telefono_aval_2: '',
// //       curp_aval_2: '', parentesco_aval_2: '',
// //     });
// //     setIntegrantes([]);
// //     setClienteEncontrado(null);
// //     setConfirmando(false);
// //     setEsUrgente(false);
// //   };

// //   return (
// //     <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

// //       {/* SELECTOR */}
// //       <div className="flex flex-col sm:flex-row bg-slate-100 p-2 rounded-3xl sm:rounded-[2.5rem] w-full sm:w-fit mx-auto shadow-inner gap-2">
// //         <button onClick={() => { setTipoPrestamo('I'); handleReset(); }} className={`flex items-center gap-3 px-6 md:px-10 w-full sm:w-auto justify-center py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${tipoPrestamo === 'I' ? 'bg-[#0047AB] text-white shadow-lg' : 'text-slate-400'}`}>
// //           <User size={16} /> Individual
// //         </button>
// //         <button onClick={() => { setTipoPrestamo('G'); handleReset(); }} className={`flex items-center gap-3 px-6 md:px-10 w-full sm:w-auto justify-center py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${tipoPrestamo === 'G' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>
// //           <Users size={16} /> Grupal Solidario
// //         </button>
// //       </div>

// //       <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 relative">
// //         <h2 className="text-3xl font-black text-slate-800 italic tracking-tighter mb-10 uppercase">
// //           {tipoPrestamo === 'I' ? 'Nuevo Préstamo Cliente' : 'Apertura de Crédito Grupal'}
// //         </h2>

// //         <form onSubmit={(e) => { e.preventDefault(); setConfirmando(true); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">

// //           {/* BUSCADOR (INDIVIDUAL) */}
// //           {tipoPrestamo === 'I' ? (
// //             <div className="space-y-2 relative">
// //               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Buscar Cliente (Nombre)</label>
// //               <div className="relative">
// //                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
// //                 <input
// //                   type="text"
// //                   value={clienteEncontrado ? clienteEncontrado.nombre : formData.cliente}
// //                   onChange={(e) => {
// //                     if (clienteEncontrado) setClienteEncontrado(null);
// //                     buscarClientePorNombre(e.target.value);
// //                   }}
// //                   className={`w-full p-4 pl-12 rounded-2xl outline-none font-bold transition-all ${tieneBloqueo && !esUrgente ? 'bg-red-50 border-red-200 border' : 'bg-slate-50'}`}
// //                   placeholder="Escriba nombre del cliente..."
// //                   required
// //                 />
// //               </div>

// //               {sugerenciasIndividual.length > 0 && (
// //                 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
// //                   {sugerenciasIndividual.map(c => (
// //                     <button key={c.id} type="button" onClick={() => seleccionarCliente(c)} className="w-full p-4 text-left hover:bg-blue-50 flex items-center justify-between border-b last:border-none">
// //                       <span className="text-xs font-black uppercase">{c.nombre}</span>
// //                       {(c.tiene_prestamo_activo || c.saldo_actual > 0) && (
// //                         <span className="text-[8px] bg-red-100 text-red-600 px-2 py-1 rounded font-black uppercase">Bloqueado</span>
// //                       )}
// //                     </button>
// //                   ))}
// //                 </div>
// //               )}

// //               {clienteEncontrado && tieneBloqueo && (
// //                 <div className="mt-4 space-y-3">
// //                   <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600">
// //                     <X size={16} className="shrink-0" />
// //                     <p className="text-[10px] font-black uppercase italic">Restricción: El cliente posee una deuda activa</p>
// //                   </div>

// //                   {isAdmin && (
// //                     <div className={`p-4 border-2 border-dashed rounded-3xl transition-all ${esUrgente ? 'bg-amber-500 border-amber-600' : 'bg-amber-50 border-amber-200'}`}>
// //                       <div className="flex items-center justify-between gap-4">
// //                         <div className={`flex items-center gap-2 ${esUrgente ? 'text-white' : 'text-amber-700'}`}>
// //                           <AlertCircle size={20} />
// //                           <div className="flex flex-col">
// //                             <span className="text-[9px] font-black uppercase leading-tight">Autorización Especial</span>
// //                             <span className="text-[8px] font-bold opacity-70">¿Permitir segundo préstamo?</span>
// //                           </div>
// //                         </div>
// //                         <button
// //                           type="button"
// //                           onClick={() => setEsUrgente(!esUrgente)}
// //                           className={`px-5 py-2.5 rounded-2xl text-[9px] font-black transition-all shadow-sm ${esUrgente
// //                             ? 'bg-red-600 text-white ring-4 ring-red-100'
// //                             : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-100'
// //                             }`}
// //                         >
// //                           {esUrgente ? 'BLOQUEO ANULADO' : 'ACTIVAR EXCEPCIÓN'}
// //                         </button>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}
// //             </div>
// //           ) : (
// //             <div className="col-span-1 md:col-span-2 space-y-6">
// //               <label className="text-[10px] font-black text-purple-600 uppercase ml-2 tracking-widest">Nombre del Grupo</label>
// //               <input
// //                 type="text"
// //                 value={formData.nombre_grupo}
// //                 onChange={(e) => setFormData({ ...formData, nombre_grupo: e.target.value })}
// //                 className="w-full p-4 bg-purple-50/30 rounded-2xl outline-none border-2 border-transparent focus:border-purple-600 font-bold"
// //                 placeholder="Nombre del grupo..." required
// //               />
// //               <div className="relative">
// //                 <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Añadir Integrantes</label>
// //                 <div className="relative">
// //                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
// //                   <input type="text" value={busquedaSocio} onChange={(e) => buscarSocios(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none" placeholder="Buscar por nombre..." />
// //                 </div>
// //                 {sugerenciasSocios.length > 0 && (
// //                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
// //                     {sugerenciasSocios.map(s => (
// //                       <button key={s.id} type="button" onClick={() => agregarIntegrante(s)} className="w-full p-4 text-left hover:bg-blue-50 border-b flex justify-between items-center">
// //                         <span className="text-xs font-black uppercase">{s.nombre}</span>
// //                         {(s.tiene_prestamo_activo || s.saldo_actual > 0) ? <AlertCircle className="text-red-500" size={14} /> : <Plus size={14} className="text-blue-500" />}
// //                       </button>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>
// //               <div className="flex flex-wrap gap-2">
// //                 {integrantes.map(i => (
// //                   <div key={i.id} className="bg-[#0047AB] text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 uppercase">
// //                     {i.nombre} <button type="button" onClick={() => setIntegrantes(integrantes.filter(it => it.id !== i.id))}><X size={14} /></button>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           <div className="space-y-2">
// //             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Monto ($)</label>
// //             <input type="number" min={0} value={formData.monto_capital} onChange={(e) => setFormData({ ...formData, monto_capital: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl text-[#0047AB]" required />
// //           </div>

// //           {/* RESUMEN AZUL OSCURO */}
// //           {Number(formData.monto_capital) > 0 && (
// //             <div className="col-span-1 md:col-span-2 bg-[#050533] p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] text-white flex flex-col lg:flex-row justify-around items-center gap-8 shadow-2xl animate-in zoom-in-95 duration-300">
// //               <div className="text-center">
// //                 <p className="text-[9px] font-black text-sky-400 uppercase mb-1">Cuota Estimada</p>
// //                 <p className="text-2xl md:text-3xl font-black italic">${calculos.pagoPorPeriodo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
// //               </div>
// //               <div className="text-center">
// //                 <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Tasa Aplicada</p>
// //                 <p className={`text-2xl md:text-3xl font-black italic ${esUrgente ? 'text-amber-400' : 'text-emerald-400'}`}>{formData.tasa_interes}%</p>
// //               </div>
// //               <div className="text-center">
// //                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total a Pagar</p>
// //                 <p className="text-2xl md:text-3xl font-black italic text-white">${calculos.totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
// //               </div>
// //             </div>
// //           )}

// //           {/* SECCIÓN DE AVALES */}
// //           <div className="col-span-1 md:col-span-2 space-y-6">
// //             <div className="p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100 space-y-6">
// //               <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2 italic">
// //                 <ShieldCheck size={18} /> Información del Aval Principal
// //               </h3>
// //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
// //                 <input type="text" placeholder="Nombre completo" value={formData.nombre_aval} onChange={(e) => setFormData({ ...formData, nombre_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required />
// //                 <input type="tel" placeholder="Teléfono" value={formData.telefono_aval} onChange={(e) => setFormData({ ...formData, telefono_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required />
// //                 <input type="text" placeholder="Dirección" value={formData.direccion_aval} onChange={(e) => setFormData({ ...formData, direccion_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm md:col-span-2" required />
// //                 <input type="text" placeholder="CURP" value={formData.curp_aval} onChange={(e) => setFormData({ ...formData, curp_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" />
// //                 <input type="text" placeholder="Parentesco" value={formData.parentesco_aval} onChange={(e) => setFormData({ ...formData, parentesco_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" />
// //               </div>
// //             </div>

// //             {Number(formData.monto_capital) > 7500 && (
// //               <div className="p-8 bg-purple-50/30 rounded-[2.5rem] border border-purple-100 space-y-6 animate-in slide-in-from-top duration-500">
// //                 <div className="flex items-center justify-between">
// //                   <h3 className="text-[11px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-2 italic">
// //                     <UserPlus size={18} /> Segundo Aval
// //                   </h3>
// //                   <span className="text-[8px] bg-purple-200 text-purple-700 px-2 py-1 rounded-full font-black">OBLIGATORIO</span>
// //                 </div>
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
// //                   <input type="text" placeholder="Nombre completo" value={formData.nombre_aval_2} onChange={(e) => setFormData({ ...formData, nombre_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
// //                   <input type="tel" placeholder="Teléfono" value={formData.telefono_aval_2} onChange={(e) => setFormData({ ...formData, telefono_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
// //                   <input type="text" placeholder="Dirección" value={formData.direccion_aval_2} onChange={(e) => setFormData({ ...formData, direccion_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm md:col-span-2" required />
// //                   <input type="text" placeholder="CURP" value={formData.curp_aval_2} onChange={(e) => setFormData({ ...formData, curp_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
// //                   <input type="text" placeholder="Parentesco" value={formData.parentesco_aval_2} onChange={(e) => setFormData({ ...formData, parentesco_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" />
// //                 </div>
// //               </div>
// //             )}

// //             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
// //               <input type="text" placeholder="Descripción de la Garantía (Ej. Laptop, Factura de Moto...)" value={formData.garantia_descripcion} onChange={(e) => setFormData({ ...formData, garantia_descripcion: e.target.value })} className="w-full p-2 bg-transparent outline-none font-bold text-sm" />
// //             </div>
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Frecuencia</label>
// //             <select value={formData.modalidad} onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold">
// //               <option value="S">
// //                 Semanal {esUrgente ? '(3.75%)' : '(2.5%)'}
// //               </option>
// //               <option value="Q">
// //                 Quincenal {esUrgente ? '(7.5%)' : '(6.25%)'}
// //               </option>
// //               <option value="M">
// //                 Mensual {esUrgente ? '(15.0%)' : '(15.0%)'}
// //               </option>
// //             </select>
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Plazo (Periodos)</label>
// //             <input type="number" value={formData.cuotas} onChange={(e) => setFormData({ ...formData, cuotas: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
// //           </div>

// //           <button
// //             type="submit"
// //             disabled={(!esUrgente && tieneBloqueo) || loading || !formData.monto_capital}
// //             className={`col-span-1 md:col-span-2 mt-4 py-5 md:py-6 rounded-2xl md:rounded-[2.2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-4 ${(!esUrgente && tieneBloqueo)
// //               ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
// //               : esUrgente
// //                 ? 'bg-red-700 text-white animate-pulse shadow-red-200'
// //                 : 'bg-[#050533] text-white hover:bg-[#0047AB]'
// //               }`}
// //           >
// //             <ShieldCheck size={18} />
// //             <span>{loading ? 'Procesando...' : esUrgente ? 'AUTORIZAR COMO ADMIN (URGENTE)' : 'Autorizar Crédito'}</span>
// //           </button>
// //         </form>
// //       </div>

// //       {/* MODAL DE CONFIRMACIÓN */}
// //       {confirmando && (
// //         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050533]/80 backdrop-blur-sm animate-in fade-in">
// //           <div className="bg-white w-full max-w-lg rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 shadow-2xl border-t-8 border-[#0047AB] mx-4 max-h-[90vh] overflow-y-auto">
// //             <h3 className="text-2xl font-black italic text-slate-800 uppercase leading-none text-center">Confirmar Datos</h3>
// //             <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 font-bold text-sm">
// //               <div className="flex justify-between uppercase text-slate-500 text-[10px]"><span>Cliente:</span> <span className="text-slate-800 text-xs">{clienteEncontrado?.nombre || formData.nombre_grupo}</span></div>
// //               <div className="flex justify-between"><span>Capital:</span> <span>${Number(formData.monto_capital).toLocaleString()}</span></div>
// //               <div className="flex justify-between"><span>Tasa Aplicada:</span> <span className={esUrgente ? 'text-red-600' : 'text-blue-600'}>{formData.tasa_interes}%</span></div>
// //               <div className="flex justify-between text-xl font-black text-emerald-600 border-t pt-4"><span>Total a Pagar:</span> <span>${calculos.totalPagar.toLocaleString()}</span></div>
// //             </div>
// //             <div className="grid grid-cols-2 gap-4">
// //               <button onClick={() => setConfirmando(false)} className="py-5 rounded-3xl font-black text-[10px] uppercase text-slate-400 bg-slate-100">Cancelar</button>
// //               <button onClick={ejecutarGuardado} className="py-5 rounded-3xl font-black text-[10px] uppercase text-white bg-emerald-500 shadow-xl shadow-emerald-100">Autorizar</button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* ALERTA FLOTANTE */}
// //       {alerta && (
// //         <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right ${alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
// //           <div className={`p-3 rounded-2xl ${alerta.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
// //             {alerta.type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
// //           </div>
// //           <p className="font-bold text-sm text-slate-800 italic">{alerta.msg}</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// "use client";
// import { useState, useEffect, useMemo } from 'react';
// import {
//   UserPlus, ShieldCheck, X, Check, Plus, AlertCircle, Users, User, Search
// } from 'lucide-react';
// import api from '@/lib/api';

// export default function PrestamosPage() {
//   const [tipoPrestamo, setTipoPrestamo] = useState<'I' | 'G'>('I');
//   const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [confirmando, setConfirmando] = useState(false);

//   // Estados para buscadores con sugerencias
//   const [busquedaSocio, setBusquedaSocio] = useState('');
//   const [sugerenciasSocios, setSugerenciasSocios] = useState<any[]>([]);
//   const [sugerenciasIndividual, setSugerenciasIndividual] = useState<any[]>([]);

//   const [integrantes, setIntegrantes] = useState<any[]>([]);
//   const [formData, setFormData] = useState({
//     cliente: '', // ID del cliente
//     nombre_grupo: '',
//     monto_capital: '',
//     tasa_interes: '20',
//     cuotas: '6',
//     modalidad: 'S',
//     nombre_aval: '',
//     direccion_aval: '',
//     telefono_aval: '',
//     curp_aval: '',
//     parentesco_aval: '',
//     garantia_descripcion: '',
//     nombre_aval_2: '',
//     direccion_aval_2: '',
//     telefono_aval_2: '',
//     curp_aval_2: '',
//     parentesco_aval_2: '',
//   });

//   const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
//   const [esUrgente, setEsUrgente] = useState(false);
//   const [user, setUser] = useState({ role: '' });

//   const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
//     setAlerta({ type, msg });
//     setTimeout(() => setAlerta(null), 6000);
//   };

//   useEffect(() => {
//     const savedRole = localStorage.getItem('user_role');
//     setUser({ role: savedRole || '' });
//   }, []);

//   const isAdmin = user.role === 'admin';

//   // REGLA DE BLOQUEO DINÁMICO INDIVIDUAL
//   const tieneBloqueo = useMemo(() => {
//     if (!clienteEncontrado) return false;
//     return clienteEncontrado.tiene_prestamo_activo || clienteEncontrado.saldo_actual > 0;
//   }, [clienteEncontrado]);

//   // --- BUSCADOR POR NOMBRE (INDIVIDUAL) ---
//   const buscarClientePorNombre = async (val: string) => {
//     setFormData(prev => ({ ...prev, cliente: val }));
//     if (val.length > 2) {
//       try {
//         const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
//         setSugerenciasIndividual(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
//       } catch (e) {
//         console.error(e);
//       }
//     } else {
//       setSugerenciasIndividual([]);
//     }
//   };

//   const seleccionarCliente = (cliente: any) => {
//     const deudaActiva = cliente.tiene_prestamo_activo || cliente.saldo_actual > 0;

//     if (deudaActiva) {
//       lanzarAlerta('error', `RESTRICCIÓN: ${cliente.nombre} presenta deudas vigentes.`);
//     }

//     setClienteEncontrado(cliente);
//     setFormData(prev => ({
//       ...prev,
//       cliente: cliente.id.toString(),
//       nombre_aval: cliente.datos_ultimo_aval?.nombre_aval || '',
//       telefono_aval: cliente.datos_ultimo_aval?.telefono_aval || '',
//       direccion_aval: cliente.datos_ultimo_aval?.direccion_aval || '',
//       curp_aval: cliente.datos_ultimo_aval?.curp_aval || '',
//       parentesco_aval: cliente.datos_ultimo_aval?.parentesco_aval || '',
//       garantia_descripcion: cliente.datos_ultimo_aval?.garantia_descripcion || '',
//     }));
//     setSugerenciasIndividual([]);
//   };

//   // --- LÓGICA GRUPAL ---
//   const buscarSocios = async (val: string) => {
//     setBusquedaSocio(val);
//     if (val.length > 1) {
//       try {
//         const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
//         setSugerenciasSocios(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
//       } catch (e) {
//         console.error(e);
//       }
//     } else {
//       setSugerenciasSocios([]);
//     }
//   };

//   const agregarIntegrante = (socio: any) => {
//     if (socio.tiene_prestamo_activo || socio.saldo_actual > 0) {
//       lanzarAlerta('error', `${socio.nombre} ya tiene compromisos financieros activos.`);
//       return;
//     }
//     if (integrantes.length >= 10) {
//       lanzarAlerta('error', "El grupo ya cuenta con los 10 integrantes requeridos.");
//       return;
//     }
//     if (!integrantes.find(i => i.id === socio.id)) {
//       setIntegrantes([...integrantes, socio]);
//     }
//     setBusquedaSocio('');
//     setSugerenciasSocios([]);
//   };

//   // 🔥 CÁLCULO ESTRICTO FINANCIERA SANTI: 20% DE INTERÉS TOTAL A 6 CUOTAS SEMANALES
//   const calculos = useMemo(() => {
//     const capital = Number(formData.monto_capital) || 0;
//     const interesTotal = capital * 0.20; // 20% Fijo
//     const totalPagar = capital + interesTotal;
//     const pagoPorPeriodo = totalPagar / 6; // 6 Semanas Fijas
//     return { interesTotal, totalPagar, pagoPorPeriodo };
//   }, [formData.monto_capital]);

//   const ejecutarGuardado = async () => {
//     setLoading(true);
//     setConfirmando(false);
//     try {
//       const capitalNum = Number(formData.monto_capital);

//       // Validación previa de 10 integrantes para grupal
//       if (tipoPrestamo === 'G' && integrantes.length !== 10) {
//         lanzarAlerta('error', 'Financiera Santi requiere exactamente 10 integrantes para un crédito grupal.');
//         setLoading(false);
//         return;
//       }

//       const payload: any = {
//         ...formData,
//         tipo: tipoPrestamo,
//         es_urgente: esUrgente,
//         integrantes: tipoPrestamo === 'G' ? integrantes.map(i => i.id) : [],
//         monto_capital: capitalNum,
//         monto_total_pagar: calculos.totalPagar,
//         cuotas: 6,
//         modalidad: 'S',
//         tasa_interes: 20,
//         fecha_inicio: new Date().toISOString().split('T')[0],
//       };

//       if (capitalNum <= 7500) {
//         payload.nombre_aval_2 = '';
//         payload.telefono_aval_2 = '';
//         payload.direccion_aval_2 = '';
//         payload.curp_aval_2 = '';
//         payload.parentesco_aval_2 = '';
//       }

//       await api.post('/prestamos/', payload);
//       lanzarAlerta('success', "Crédito autorizado correctamente.");
//       setEsUrgente(false);
//       handleReset();
//     } catch (error: any) {
//       lanzarAlerta('error', error.response?.data?.error || error.response?.data?.grupo || "Error al procesar el crédito.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       cliente: '', nombre_grupo: '', monto_capital: '', tasa_interes: '20', cuotas: '6',
//       modalidad: 'S', nombre_aval: '', direccion_aval: '', telefono_aval: '',
//       curp_aval: '', parentesco_aval: '', garantia_descripcion: '', nombre_aval_2: '', direccion_aval_2: '', telefono_aval_2: '',
//       curp_aval_2: '', parentesco_aval_2: '',
//     });
//     setIntegrantes([]);
//     setClienteEncontrado(null);
//     setConfirmando(false);
//     setEsUrgente(false);
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

//       {/* SELECTOR */}
//       <div className="flex flex-col sm:flex-row bg-slate-100 p-2 rounded-3xl sm:rounded-[2.5rem] w-full sm:w-fit mx-auto shadow-inner gap-2">
//         <button
//           type="button"
//           onClick={() => { setTipoPrestamo('I'); handleReset(); }}
//           className={`flex items-center gap-3 px-6 md:px-10 w-full sm:w-auto justify-center py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${tipoPrestamo === 'I' ? 'bg-[#0047AB] text-white shadow-lg' : 'text-slate-400'}`}
//         >
//           <User size={16} /> Individual
//         </button>
//         <button
//           type="button"
//           onClick={() => { setTipoPrestamo('G'); handleReset(); }}
//           className={`flex items-center gap-3 px-6 md:px-10 w-full sm:w-auto justify-center py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${tipoPrestamo === 'G' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}
//         >
//           <Users size={16} /> Grupal (10 Integrantes)
//         </button>
//       </div>

//       <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 relative">
//         <h2 className="text-3xl font-black text-slate-800 italic tracking-tighter mb-10 uppercase">
//           {tipoPrestamo === 'I' ? 'Nuevo Préstamo Individual' : 'Apertura de Crédito Grupal'}
//         </h2>

//         <form onSubmit={(e) => { e.preventDefault(); setConfirmando(true); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">

//           {/* BUSCADOR (INDIVIDUAL) */}
//           {tipoPrestamo === 'I' ? (
//             <div className="space-y-2 relative md:col-span-2">
//               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Buscar Cliente (Nombre o Folio)</label>
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
//                 <input
//                   type="text"
//                   value={clienteEncontrado ? `[${clienteEncontrado.folio || String(clienteEncontrado.id).padStart(4, '0')}] ${clienteEncontrado.nombre}` : formData.cliente}
//                   onChange={(e) => {
//                     if (clienteEncontrado) setClienteEncontrado(null);
//                     buscarClientePorNombre(e.target.value);
//                   }}
//                   className={`w-full p-4 pl-12 rounded-2xl outline-none font-bold transition-all ${tieneBloqueo && !esUrgente ? 'bg-red-50 border-red-200 border' : 'bg-slate-50'}`}
//                   placeholder="Escriba nombre o folio del cliente..."
//                   required
//                 />
//               </div>

//               {sugerenciasIndividual.length > 0 && (
//                 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
//                   {sugerenciasIndividual.map(c => (
//                     <button key={c.id} type="button" onClick={() => seleccionarCliente(c)} className="w-full p-4 text-left hover:bg-blue-50 flex items-center justify-between border-b last:border-none">
//                       <span className="text-xs font-black uppercase">[{c.folio || String(c.id).padStart(4, '0')}] {c.nombre}</span>
//                       {(c.tiene_prestamo_activo || c.saldo_actual > 0) && (
//                         <span className="text-[8px] bg-red-100 text-red-600 px-2 py-1 rounded font-black uppercase">Bloqueado</span>
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {clienteEncontrado && tieneBloqueo && (
//                 <div className="mt-4 space-y-3">
//                   <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600">
//                     <X size={16} className="shrink-0" />
//                     <p className="text-[10px] font-black uppercase italic">Restricción: El cliente posee una deuda activa</p>
//                   </div>

//                   {isAdmin && (
//                     <div className={`p-4 border-2 border-dashed rounded-3xl transition-all ${esUrgente ? 'bg-amber-500 border-amber-600' : 'bg-amber-50 border-amber-200'}`}>
//                       <div className="flex items-center justify-between gap-4">
//                         <div className={`flex items-center gap-2 ${esUrgente ? 'text-white' : 'text-amber-700'}`}>
//                           <AlertCircle size={20} />
//                           <div className="flex flex-col">
//                             <span className="text-[9px] font-black uppercase leading-tight">Autorización Especial Admin</span>
//                             <span className="text-[8px] font-bold opacity-70">¿Permitir segundo préstamo?</span>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => setEsUrgente(!esUrgente)}
//                           className={`px-5 py-2.5 rounded-2xl text-[9px] font-black transition-all shadow-sm ${esUrgente
//                             ? 'bg-red-600 text-white ring-4 ring-red-100'
//                             : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-100'
//                           }`}
//                         >
//                           {esUrgente ? 'EXCEPCIÓN ACTIVADA' : 'ACTIVAR EXCEPCIÓN'}
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ) : (
//             /* SECCIÓN GRUPAL */
//             <div className="col-span-1 md:col-span-2 space-y-6">
//               <div>
//                 <label className="text-[10px] font-black text-purple-600 uppercase ml-2 tracking-widest">Nombre del Grupo</label>
//                 <input
//                   type="text"
//                   value={formData.nombre_grupo}
//                   onChange={(e) => setFormData({ ...formData, nombre_grupo: e.target.value })}
//                   className="w-full p-4 bg-purple-50/30 rounded-2xl outline-none border-2 border-transparent focus:border-purple-600 font-bold"
//                   placeholder="Ej. Grupo Las Flores..." required
//                 />
//               </div>

//               <div className="relative">
//                 <div className="flex justify-between items-center mb-2">
//                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Añadir Integrantes</label>
//                   <span className={`text-[10px] font-black px-3 py-1 rounded-full ${integrantes.length === 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
//                     {integrantes.length} / 10 Integrantes
//                   </span>
//                 </div>
//                 <div className="relative">
//                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
//                   <input
//                     type="text"
//                     value={busquedaSocio}
//                     onChange={(e) => buscarSocios(e.target.value)}
//                     className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none"
//                     placeholder="Buscar cliente por nombre..."
//                     disabled={integrantes.length >= 10}
//                   />
//                 </div>
//                 {sugerenciasSocios.length > 0 && (
//                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
//                     {sugerenciasSocios.map(s => (
//                       <button key={s.id} type="button" onClick={() => agregarIntegrante(s)} className="w-full p-4 text-left hover:bg-blue-50 border-b flex justify-between items-center">
//                         <span className="text-xs font-black uppercase">[{s.folio || String(s.id).padStart(4, '0')}] {s.nombre}</span>
//                         {(s.tiene_prestamo_activo || s.saldo_actual > 0) ? <AlertCircle className="text-red-500" size={14} /> : <Plus size={14} className="text-blue-500" />}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* LISTA DE INTEGRANTES */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {integrantes.map((i, index) => (
//                   <div key={i.id} className="bg-purple-50 text-purple-900 border border-purple-200 px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-between uppercase">
//                     <span>{index + 1}. [{i.folio || String(i.id).padStart(4, '0')}] {i.nombre}</span>
//                     <button type="button" onClick={() => setIntegrantes(integrantes.filter(it => it.id !== i.id))} className="text-purple-400 hover:text-red-500">
//                       <X size={16} />
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               {integrantes.length !== 10 && (
//                 <p className="text-[10px] font-black text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 italic">
//                   * Importante: Financiera Santi exige exactamente 10 integrantes para autorizar un crédito grupal (Faltan: {10 - integrantes.length}).
//                 </p>
//               )}
//             </div>
//           )}

//           {/* MONTO CAPITAL */}
//           <div className="space-y-2 col-span-1 md:col-span-2">
//             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Monto del Préstamo ($ MXN)</label>
//             <input
//               type="number"
//               min={100}
//               value={formData.monto_capital}
//               onChange={(e) => setFormData({ ...formData, monto_capital: e.target.value })}
//               className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-2xl text-[#0047AB]"
//               placeholder="Ej. 1000"
//               required
//             />
//           </div>

//           {/* RESUMEN AZUL - CONDICIONES SANTI (20% A 6 SEMANAS) */}
//           {Number(formData.monto_capital) > 0 && (
//             <div className="col-span-1 md:col-span-2 bg-[#050533] p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] text-white flex flex-col lg:flex-row justify-around items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-300">
//               <div className="text-center">
//                 <p className="text-[9px] font-black text-sky-400 uppercase mb-1">Cuota Semanal (6 Pagos)</p>
//                 <p className="text-2xl md:text-3xl font-black italic">${calculos.pagoPorPeriodo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Interés Aplicado</p>
//                 <p className="text-2xl md:text-3xl font-black italic text-emerald-400">20% Fijo</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total a Pagar</p>
//                 <p className="text-2xl md:text-3xl font-black italic text-white">${calculos.totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
//               </div>
//             </div>
//           )}

//           {/* SECCIÓN DE AVALES */}
//           <div className="col-span-1 md:col-span-2 space-y-6">
//             <div className="p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100 space-y-6">
//               <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2 italic">
//                 <ShieldCheck size={18} /> Información del Aval Principal
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
//                 <input type="text" placeholder="Nombre completo" value={formData.nombre_aval} onChange={(e) => setFormData({ ...formData, nombre_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required />
//                 <input type="tel" placeholder="Teléfono" value={formData.telefono_aval} onChange={(e) => setFormData({ ...formData, telefono_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required />
//                 <input type="text" placeholder="Dirección" value={formData.direccion_aval} onChange={(e) => setFormData({ ...formData, direccion_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm md:col-span-2" required />
//                 <input type="text" placeholder="CURP" value={formData.curp_aval} onChange={(e) => setFormData({ ...formData, curp_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" />
//                 <input type="text" placeholder="Parentesco" value={formData.parentesco_aval} onChange={(e) => setFormData({ ...formData, parentesco_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" />
//               </div>
//             </div>

//             {/* SEGUNDO AVAL SI MONTO ES MAYOR A 7,500 */}
//             {Number(formData.monto_capital) > 7500 && (
//               <div className="p-8 bg-purple-50/30 rounded-[2.5rem] border border-purple-100 space-y-6 animate-in slide-in-from-top duration-500">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-[11px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-2 italic">
//                     <UserPlus size={18} /> Segundo Aval
//                   </h3>
//                   <span className="text-[8px] bg-purple-200 text-purple-700 px-2 py-1 rounded-full font-black">OBLIGATORIO (&gt;$7,500 MXN)</span>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
//                   <input type="text" placeholder="Nombre completo" value={formData.nombre_aval_2} onChange={(e) => setFormData({ ...formData, nombre_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
//                   <input type="tel" placeholder="Teléfono" value={formData.telefono_aval_2} onChange={(e) => setFormData({ ...formData, telefono_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
//                   <input type="text" placeholder="Dirección" value={formData.direccion_aval_2} onChange={(e) => setFormData({ ...formData, direccion_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm md:col-span-2" required />
//                   <input type="text" placeholder="CURP" value={formData.curp_aval_2} onChange={(e) => setFormData({ ...formData, curp_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" required />
//                   <input type="text" placeholder="Parentesco" value={formData.parentesco_aval_2} onChange={(e) => setFormData({ ...formData, parentesco_aval_2: e.target.value })} className="p-4 rounded-xl border border-purple-100 outline-none font-bold text-sm" />
//                 </div>
//               </div>
//             )}

//             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
//               <input type="text" placeholder="Descripción de la Garantía (Ej. Factura de Moto, Electrodomésticos...)" value={formData.garantia_descripcion} onChange={(e) => setFormData({ ...formData, garantia_descripcion: e.target.value })} className="w-full p-2 bg-transparent outline-none font-bold text-sm" />
//             </div>
//           </div>

//           {/* BOTÓN SUBMIT */}
//           <button
//             type="submit"
//             disabled={
//               (!esUrgente && tipoPrestamo === 'I' && tieneBloqueo) ||
//               (tipoPrestamo === 'G' && integrantes.length !== 10) ||
//               loading ||
//               !formData.monto_capital
//             }
//             className={`col-span-1 md:col-span-2 mt-4 py-5 md:py-6 rounded-2xl md:rounded-[2.2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-4 ${
//               ((!esUrgente && tipoPrestamo === 'I' && tieneBloqueo) || (tipoPrestamo === 'G' && integrantes.length !== 10) || !formData.monto_capital)
//                 ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
//                 : esUrgente
//                   ? 'bg-red-700 text-white animate-pulse shadow-red-200'
//                   : 'bg-[#050533] text-white hover:bg-[#0047AB]'
//             }`}
//           >
//             <ShieldCheck size={18} />
//             <span>
//               {loading
//                 ? 'Procesando...'
//                 : tipoPrestamo === 'G' && integrantes.length !== 10
//                   ? `Requiere 10 Integrantes (${integrantes.length}/10)`
//                   : esUrgente
//                     ? 'AUTORIZAR COMO ADMIN (URGENTE)'
//                     : 'Autorizar Crédito'}
//             </span>
//           </button>
//         </form>
//       </div>

//       {/* MODAL DE CONFIRMACIÓN */}
//       {confirmando && (
//         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050533]/80 backdrop-blur-sm animate-in fade-in">
//           <div className="bg-white w-full max-w-lg rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 shadow-2xl border-t-8 border-[#0047AB] mx-4 max-h-[90vh] overflow-y-auto">
//             <h3 className="text-2xl font-black italic text-slate-800 uppercase leading-none text-center">Confirmar Crédito</h3>
//             <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 font-bold text-sm">
//               <div className="flex justify-between uppercase text-slate-500 text-[10px]">
//                 <span>Acreditado:</span>
//                 <span className="text-slate-800 text-xs">{clienteEncontrado ? `[${clienteEncontrado.folio || String(clienteEncontrado.id).padStart(4, '0')}] ${clienteEncontrado.nombre}` : formData.nombre_grupo}</span>
//               </div>
//               <div className="flex justify-between"><span>Monto Capital:</span> <span>${Number(formData.monto_capital).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
//               <div className="flex justify-between"><span>Plazo y Frecuencia:</span> <span className="text-blue-600">6 Semanas</span></div>
//               <div className="flex justify-between"><span>Interés Fijo:</span> <span className="text-emerald-600">20%</span></div>
//               <div className="flex justify-between text-xl font-black text-emerald-600 border-t pt-4"><span>Total a Pagar:</span> <span>${calculos.totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <button type="button" onClick={() => setConfirmando(false)} className="py-5 rounded-3xl font-black text-[10px] uppercase text-slate-400 bg-slate-100">Cancelar</button>
//               <button type="button" onClick={ejecutarGuardado} className="py-5 rounded-3xl font-black text-[10px] uppercase text-white bg-emerald-500 shadow-xl shadow-emerald-100">Autorizar</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ALERTA FLOTANTE */}
//       {alerta && (
//         <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right ${alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
//           <div className={`p-3 rounded-2xl ${alerta.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
//             {alerta.type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
//           </div>
//           <p className="font-bold text-sm text-slate-800 italic">{alerta.msg}</p>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  UserPlus, ShieldCheck, X, Check, Plus, AlertCircle, Users, User, Search, Loader2, CheckCircle2
} from 'lucide-react';
import React from 'react';
import api from '@/lib/api';

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
  const [formData, setFormData] = useState({
    cliente: '', // ID del cliente
    nombre_grupo: '',
    monto_capital: '',
    tasa_interes: '20',
    cuotas: '6',
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

  // REGLA DE BLOQUEO DINÁMICO INDIVIDUAL
  const tieneBloqueo = useMemo(() => {
    if (!clienteEncontrado) return false;
    return clienteEncontrado.tiene_prestamo_activo || parseFloat(clienteEncontrado.saldo_actual || '0') > 0;
  }, [clienteEncontrado]);

  // --- BUSCADOR POR NOMBRE (INDIVIDUAL) ---
  const buscarClientePorNombre = async (val: string) => {
    setFormData(prev => ({ ...prev, cliente: val }));
    if (val.length > 2) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        setSugerenciasIndividual(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
      } catch (e) {
        console.error("Error al buscar cliente:", e);
      }
    } else {
      setSugerenciasIndividual([]);
    }
  };

  const seleccionarCliente = (cliente: any) => {
    const deudaActiva = cliente.tiene_prestamo_activo || parseFloat(cliente.saldo_actual || '0') > 0;

    if (deudaActiva) {
      lanzarAlerta('error', `RESTRICCIÓN: ${cliente.nombre} presenta deudas vigentes.`);
    }

    setClienteEncontrado(cliente);
    setFormData(prev => ({
      ...prev,
      cliente: cliente.id.toString(),
      nombre_aval: cliente.datos_ultimo_aval?.nombre_aval || '',
      telefono_aval: cliente.datos_ultimo_aval?.telefono_aval || '',
      direccion_aval: cliente.datos_ultimo_aval?.direccion_aval || '',
      curp_aval: cliente.datos_ultimo_aval?.curp_aval || '',
      parentesco_aval: cliente.datos_ultimo_aval?.parentesco_aval || '',
      garantia_descripcion: cliente.datos_ultimo_aval?.garantia_descripcion || '',
    }));
    setSugerenciasIndividual([]);
  };

  // --- LÓGICA GRUPAL ---
  const buscarSocios = async (val: string) => {
    setBusquedaSocio(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        setSugerenciasSocios(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
      } catch (e) {
        console.error("Error al buscar socios:", e);
      }
    } else {
      setSugerenciasSocios([]);
    }
  };

  const agregarIntegrante = (socio: any) => {
    if (socio.tiene_prestamo_activo || parseFloat(socio.saldo_actual || '0') > 0) {
      lanzarAlerta('error', `${socio.nombre} ya tiene compromisos financieros activos.`);
      return;
    }
    if (integrantes.length >= 10) {
      lanzarAlerta('error', "El grupo ya cuenta con los 10 integrantes requeridos.");
      return;
    }
    if (!integrantes.find(i => i.id === socio.id)) {
      setIntegrantes(prev => [...prev, socio]);
    }
    setBusquedaSocio('');
    setSugerenciasSocios([]);
  };

  // CÁLCULO ESTRICTO SIFIN: 20% DE INTERÉS TOTAL A 6 CUOTAS SEMANALES
  const calculos = useMemo(() => {
    const capital = Number(formData.monto_capital) || 0;
    const interesTotal = capital * 0.20; // 20% Fijo
    const totalPagar = capital + interesTotal;
    const pagoPorPeriodo = totalPagar / 6; // 6 Semanas Fijas
    return { interesTotal, totalPagar, pagoPorPeriodo };
  }, [formData.monto_capital]);

  const handleReset = () => {
    setFormData({
      cliente: '',
      nombre_grupo: '',
      monto_capital: '',
      tasa_interes: '20',
      cuotas: '6',
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
    setIntegrantes([]);
    setClienteEncontrado(null);
    setConfirmando(false);
    setEsUrgente(false);
    setBusquedaSocio('');
    setSugerenciasIndividual([]);
    setSugerenciasSocios([]);
  };

  const prevalidarFormulario = (e: React.FormEvent) => {
    e.preventDefault();

    if (tipoPrestamo === 'I' && !clienteEncontrado) {
      lanzarAlerta('error', 'Debe seleccionar un cliente válido del directorio.');
      return;
    }

    if (tipoPrestamo === 'G') {
      if (!formData.nombre_grupo.trim()) {
        lanzarAlerta('error', 'Por favor, asigne un nombre al grupo.');
        return;
      }
      if (integrantes.length !== 10) {
        lanzarAlerta('error', `El grupo debe tener exactamente 10 integrantes (Actuales: ${integrantes.length}).`);
        return;
      }
    }

    const capitalNum = Number(formData.monto_capital);
    if (!capitalNum || capitalNum <= 0) {
      lanzarAlerta('error', 'Ingrese un monto de capital válido.');
      return;
    }

    if (capitalNum > 7500) {
      if (!formData.nombre_aval_2 || !formData.telefono_aval_2 || !formData.direccion_aval_2 || !formData.curp_aval_2) {
        lanzarAlerta('error', 'Para montos mayores a $7,500 MXN es obligatorio completar los datos del Segundo Aval.');
        return;
      }
    }

    setConfirmando(true);
  };

  const ejecutarGuardado = async () => {
    setLoading(true);
    setConfirmando(false);

    try {
      const capitalNum = Number(formData.monto_capital);

      if (tipoPrestamo === 'G' && integrantes.length !== 10) {
        lanzarAlerta('error', 'SIFIN requiere exactamente 10 integrantes para un crédito grupal.');
        setLoading(false);
        return;
      }

      const payload: any = {
        ...formData,
        tipo: tipoPrestamo,
        es_urgente: esUrgente,
        cliente: tipoPrestamo === 'I' ? formData.cliente : null,
        nombre_grupo: tipoPrestamo === 'G' ? formData.nombre_grupo : '',
        integrantes: tipoPrestamo === 'G' ? integrantes.map(i => i.id) : [],
        monto_capital: capitalNum,
        monto_total_pagar: calculos.totalPagar,
        tasa_interes: 20,
        cuotas: 6,
        modalidad: 'S',
        fecha_inicio: new Date().toISOString().split('T')[0],
      };

      if (capitalNum <= 7500) {
        payload.nombre_aval_2 = '';
        payload.telefono_aval_2 = '';
        payload.direccion_aval_2 = '';
        payload.curp_aval_2 = '';
        payload.parentesco_aval_2 = '';
      }

      await api.post('/prestamos/', payload);
      lanzarAlerta('success', "Crédito autorizado correctamente.");
      handleReset();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || "Error al procesar el crédito.";
      lanzarAlerta('error', `❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

      {/* SELECTOR INDIVIDUAL / GRUPAL */}
      <div className="flex flex-col sm:flex-row bg-slate-100 p-2 rounded-3xl sm:rounded-[2.5rem] w-full sm:w-fit mx-auto shadow-inner gap-2 border border-slate-200/80">
        <button
          type="button"
          onClick={() => { setTipoPrestamo('I'); handleReset(); }}
          className={`flex items-center gap-3 px-6 md:px-10 w-full sm:w-auto justify-center py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${
            tipoPrestamo === 'I' ? 'bg-emerald-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User size={16} /> Individual
        </button>
        <button
          type="button"
          onClick={() => { setTipoPrestamo('G'); handleReset(); }}
          className={`flex items-center gap-3 px-6 md:px-10 w-full sm:w-auto justify-center py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${
            tipoPrestamo === 'G' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users size={16} /> Grupal Solidario
        </button>
      </div>

      {/* TARJETA FORMULARIO */}
      <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-200/80 relative">
        <div className="mb-8">
          <p className="text-[9px] font-black uppercase text-emerald-700 tracking-widest mb-1">
            Sistema SIFIN · Módulo de Captura
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 italic tracking-tighter uppercase">
            {tipoPrestamo === 'I' ? 'Nuevo Préstamo Cliente' : 'Apertura de Crédito Grupal'}
          </h2>
        </div>

        <form onSubmit={prevalidarFormulario} className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* BUSCADOR (INDIVIDUAL) */}
          {tipoPrestamo === 'I' ? (
            <div className="space-y-2 relative col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                Buscar Cliente (Nombre)
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={clienteEncontrado ? clienteEncontrado.nombre : formData.cliente}
                  onChange={(e) => {
                    if (clienteEncontrado) setClienteEncontrado(null);
                    buscarClientePorNombre(e.target.value);
                  }}
                  className={`w-full p-4 pl-12 rounded-2xl outline-none font-bold text-slate-800 transition-all border ${
                    tieneBloqueo && !esUrgente
                      ? 'bg-rose-50 border-rose-200 text-rose-900 focus:ring-2 focus:ring-rose-500'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-600'
                  }`}
                  placeholder="Escriba el nombre del cliente..."
                  required
                />
              </div>

              {/* LISTA SUGERENCIAS */}
              {sugerenciasIndividual.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
                  {sugerenciasIndividual.map((c) => {
                    const deudor = c.tiene_prestamo_activo || parseFloat(c.saldo_actual || '0') > 0;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => seleccionarCliente(c)}
                        className="w-full p-4 text-left hover:bg-emerald-50/60 flex items-center justify-between border-b last:border-none transition-colors"
                      >
                        <div>
                          <p className="text-xs font-black uppercase text-slate-800">{c.nombre}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">ID: {String(c.id).padStart(4, '0')}</p>
                        </div>
                        {deudor && (
                          <span className="text-[8px] bg-rose-100 text-rose-600 px-2.5 py-1 rounded-lg font-black uppercase border border-rose-200">
                            Bloqueado (Deuda)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* AVISO / EXCEPCIÓN BLOQUEO DEUDAS */}
              {clienteEncontrado && tieneBloqueo && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
                    <X size={18} className="shrink-0 text-rose-600" />
                    <p className="text-[10px] font-black uppercase italic tracking-wide">
                      Restricción Financiera: El cliente posee una deuda activa en sistema.
                    </p>
                  </div>

                  {isAdmin && (
                    <div className={`p-4 border-2 border-dashed rounded-3xl transition-all ${
                      esUrgente ? 'bg-amber-500 border-amber-600 text-white' : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle size={22} className={esUrgente ? 'text-white' : 'text-amber-600'} />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider">Autorización Especial Administrador</p>
                            <p className="text-[9px] font-bold opacity-80">¿Habilitar apertura de segundo préstamo con tasa especial?</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEsUrgente(!esUrgente)}
                          className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-[9px] font-black transition-all shadow-sm ${
                            esUrgente
                              ? 'bg-rose-700 text-white ring-4 ring-rose-200'
                              : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {esUrgente ? 'EXCEPCIÓN ACTIVADA' : 'ACTIVAR EXCEPCIÓN'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* SECCIÓN GRUPAL */
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-800 uppercase ml-2 tracking-widest">
                  Nombre del Grupo Solidario
                </label>
                <input
                  type="text"
                  value={formData.nombre_grupo}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_grupo: e.target.value }))}
                  className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-800"
                  placeholder="Ej. Grupo Las Flores..."
                  required
                />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                    Añadir Integrantes
                  </label>
                  <span className="text-[10px] font-black text-slate-800 uppercase bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {integrantes.length} / 10 Requeridos
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={busquedaSocio}
                    onChange={(e) => buscarSocios(e.target.value)}
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 font-bold text-slate-800"
                    placeholder="Buscar por nombre de cliente..."
                  />
                </div>

                {sugerenciasSocios.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
                    {sugerenciasSocios.map((s) => {
                      const deudor = s.tiene_prestamo_activo || parseFloat(s.saldo_actual || '0') > 0;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => agregarIntegrante(s)}
                          className="w-full p-4 text-left hover:bg-slate-50 border-b last:border-none flex justify-between items-center transition-colors"
                        >
                          <div>
                            <p className="text-xs font-black uppercase text-slate-800">{s.nombre}</p>
                            <p className="text-[9px] text-slate-400 font-bold">ID: {String(s.id).padStart(4, '0')}</p>
                          </div>
                          {deudor ? (
                            <AlertCircle className="text-rose-500 shrink-0" size={18} />
                          ) : (
                            <Plus className="text-emerald-600 shrink-0" size={18} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CHIPS DE INTEGRANTES */}
              <div className="flex flex-wrap gap-2 pt-2">
                {integrantes.map((i, idx) => (
                  <div
                    key={i.id}
                    className="bg-slate-800 text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 uppercase shadow-sm"
                  >
                    <span>{idx + 1}. {i.nombre}</span>
                    <button
                      type="button"
                      onClick={() => setIntegrantes(integrantes.filter(it => it.id !== i.id))}
                      className="hover:text-rose-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MONTO CAPITAL */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Monto Solicitado ($ MXN)
            </label>
            <input
              type="number"
              min={1}
              step="any"
              value={formData.monto_capital}
              onChange={(e) => setFormData(prev => ({ ...prev, monto_capital: e.target.value }))}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-2xl text-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all"
              placeholder="0.00"
              required
            />
          </div>

          {/* TARJETA RESUMEN FINANCIERO SIFIN */}
          {Number(formData.monto_capital) > 0 && (
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] text-white flex flex-col sm:flex-row justify-around items-center gap-6 shadow-xl border border-emerald-500/20 animate-in zoom-in-95 duration-300">
              <div className="text-center">
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">
                  Cuota Semanal (6 Semanas)
                </p>
                <p className="text-2xl md:text-3xl font-black italic">
                  ${calculos.pagoPorPeriodo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                  Interés Fijo
                </p>
                <p className={`text-2xl md:text-3xl font-black italic ${esUrgente ? 'text-amber-400' : 'text-emerald-400'}`}>
                  20.00%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                  Total Final a Pagar
                </p>
                <p className="text-2xl md:text-3xl font-black italic text-white">
                  ${calculos.totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN AVALES */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            
            {/* AVAL 1 */}
            <div className="p-6 md:p-8 bg-emerald-50/40 rounded-[2.5rem] border border-emerald-200/60 space-y-6">
              <h3 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2 italic">
                <ShieldCheck size={18} /> Información del Aval Principal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={formData.nombre_aval}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_aval: e.target.value }))}
                  className="p-4 bg-white rounded-xl border border-emerald-100 outline-none font-bold text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  required
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.telefono_aval}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono_aval: e.target.value }))}
                  className="p-4 bg-white rounded-xl border border-emerald-100 outline-none font-bold text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  required
                />
                <input
                  type="text"
                  placeholder="Dirección particular"
                  value={formData.direccion_aval}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion_aval: e.target.value }))}
                  className="p-4 bg-white rounded-xl border border-emerald-100 outline-none font-bold text-sm text-slate-800 sm:col-span-2 focus:ring-2 focus:ring-emerald-600"
                  required
                />
                <input
                  type="text"
                  placeholder="CURP"
                  maxLength={18}
                  value={formData.curp_aval}
                  onChange={(e) => setFormData(prev => ({ ...prev, curp_aval: e.target.value.toUpperCase() }))}
                  className="p-4 bg-white rounded-xl border border-emerald-100 outline-none font-mono font-bold text-sm text-slate-800 uppercase focus:ring-2 focus:ring-emerald-600"
                />
                <input
                  type="text"
                  placeholder="Parentesco / Relación"
                  value={formData.parentesco_aval}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentesco_aval: e.target.value }))}
                  className="p-4 bg-white rounded-xl border border-emerald-100 outline-none font-bold text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* AVAL 2 (SI CAPITAL > 7500) */}
            {Number(formData.monto_capital) > 7500 && (
              <div className="p-6 md:p-8 bg-amber-50/40 rounded-[2.5rem] border border-amber-200/80 space-y-6 animate-in slide-in-from-top duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2 italic">
                    <UserPlus size={18} /> Segundo Aval Requerido
                  </h3>
                  <span className="text-[8px] bg-amber-500/20 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    Obligatorio {'>'} $7,500 MXN
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.nombre_aval_2}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre_aval_2: e.target.value }))}
                    className="p-4 bg-white rounded-xl border border-amber-200 outline-none font-bold text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.telefono_aval_2}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono_aval_2: e.target.value }))}
                    className="p-4 bg-white rounded-xl border border-amber-200 outline-none font-bold text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dirección particular"
                    value={formData.direccion_aval_2}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccion_aval_2: e.target.value }))}
                    className="p-4 bg-white rounded-xl border border-amber-200 outline-none font-bold text-sm text-slate-800 sm:col-span-2 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="CURP"
                    maxLength={18}
                    value={formData.curp_aval_2}
                    onChange={(e) => setFormData(prev => ({ ...prev, curp_aval_2: e.target.value.toUpperCase() }))}
                    className="p-4 bg-white rounded-xl border border-amber-200 outline-none font-mono font-bold text-sm text-slate-800 uppercase focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Parentesco / Relación"
                    value={formData.parentesco_aval_2}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentesco_aval_2: e.target.value }))}
                    className="p-4 bg-white rounded-xl border border-amber-200 outline-none font-bold text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {/* GARANTÍA */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <input
                type="text"
                placeholder="Descripción de la Garantía (Ej. Factura de motocicleta, Electrónicos...)"
                value={formData.garantia_descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, garantia_descripcion: e.target.value }))}
                className="w-full p-2 bg-transparent outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <button
            type="submit"
            disabled={(!esUrgente && tieneBloqueo) || loading || !formData.monto_capital}
            className={`col-span-1 md:col-span-2 mt-4 py-5 md:py-6 rounded-2xl md:rounded-[2.2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-98 ${
              (!esUrgente && tieneBloqueo)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : esUrgente
                  ? 'bg-rose-700 hover:bg-rose-800 text-white animate-pulse shadow-rose-200'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/20'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <ShieldCheck size={20} />
            )}
            <span>
              {loading
                ? 'Procesando Expediente...'
                : esUrgente
                  ? 'AUTORIZAR COMO ADMIN (EXCEPCIÓN)'
                  : 'Autorizar Crédito SIFIN'}
            </span>
          </button>
        </form>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmando && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-6 shadow-2xl border-t-8 border-emerald-600 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black italic text-slate-800 uppercase leading-none text-center">
              Confirmar Parámetros
            </h3>

            <div className="bg-slate-50 p-6 rounded-[2rem] space-y-3 font-bold text-sm border border-slate-200/80">
              <div className="flex justify-between uppercase text-slate-500 text-[10px]">
                <span>Modalidad:</span>
                <span className="text-slate-800 font-black">{tipoPrestamo === 'I' ? 'Individual' : 'Grupal Solidario'}</span>
              </div>
              <div className="flex justify-between uppercase text-slate-500 text-[10px]">
                <span>Titular / Grupo:</span>
                <span className="text-slate-800 font-black">{clienteEncontrado?.nombre || formData.nombre_grupo}</span>
              </div>
              <div className="flex justify-between uppercase text-slate-500 text-[10px]">
                <span>Capital Solicitado:</span>
                <span className="text-slate-800 font-black">${Number(formData.monto_capital).toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between uppercase text-slate-500 text-[10px]">
                <span>Tasa Interés:</span>
                <span className={`font-black ${esUrgente ? 'text-amber-600' : 'text-emerald-700'}`}>20.00% (Fijo)</span>
              </div>
              <div className="flex justify-between uppercase text-slate-500 text-[10px]">
                <span>Plazo:</span>
                <span className="text-slate-800 font-black">6 Semanas</span>
              </div>
              <div className="flex justify-between text-lg font-black text-emerald-700 border-t border-slate-200 pt-3 mt-2">
                <span>Total a Pagar:</span>
                <span>${calculos.totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarGuardado}
                className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Confirmar y Emitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST DE ALERTA */}
      {alerta && (
        <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right duration-500 ${
          alerta.type === 'success' ? 'border-emerald-500' : 'border-rose-500'
        }`}>
          <div className={`p-3 rounded-2xl ${
            alerta.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {alerta.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
              {alerta.type === 'success' ? 'Sistema SIFIN' : 'Atención'}
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
"use client";
import React, { useEffect, useState } from 'react';
import {
  UserCircle, Landmark, ShieldCheck, LogOut,
  Key, Settings, Search, Loader2, X, CheckCircle2, AlertCircle, Edit2, Save, History, Printer,
  Users, ChevronLeft
} from "lucide-react";
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { generarPDFRecibo } from '@/lib/generateTicket';

export default function UsuarioPage() {
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 5000);
  };

  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // ESTADOS PARA BÓVEDA DE TICKETS Y PAGINACIÓN
  const [tickets, setTickets] = useState<any[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busquedaTicket, setBusquedaTicket] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(false);

  // ESTADOS PARA MODALES
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showParamsModal, setShowParamsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // FORMULARIOS
  const [formPerfil, setFormPerfil] = useState({ first_name: '', last_name: '', email: '' });
  const [formPass, setFormPass] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [formParams, setFormParams] = useState({ interes_global: '10', mora_diaria: '1.5' });
  const [userData, setUserData] = useState({ username: '', password: '', email: '' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', msg: '' });
  const [fechaLocal, setFechaLocal] = useState('');

  const fetchTickets = async (pagina = 1, query = '') => {
    try {
      setLoadingTickets(true);
      let url = `/usuarios/tickets/?page=${pagina}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;

      const res = await api.get(url);
      setTickets(res.data.results || []);
      setTotalTickets(res.data.count || 0);
      setPaginaActual(pagina);
    } catch (error) {
      console.error("Error al cargar tickets paginados:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const res = await api.get('/usuarios/perfil/');
      setPerfil(res.data);

      setFormPerfil({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || ''
      });

      if (res.data.last_login && res.data.last_login !== "N/A") {
        const fecha = new Date(res.data.last_login);
        if (!isNaN(fecha.getTime())) {
          setFechaLocal(fecha.toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }));
        } else {
          setFechaLocal('Sesión Inicial');
        }
      } else {
        setFechaLocal('Primera Conexión');
      }

      setFormParams({
        interes_global: res.data.interes_config || '10',
        mora_diaria: res.data.mora_config || '1.5'
      });
    } catch (error) {
      console.error("Error al obtener perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    setRole(savedRole);
    setUserRole(savedRole);
    fetchPerfil();

    if (savedRole === 'admin') {
      fetchTickets(1);
    }
  }, []);

  const mostrarAlerta = (type: 'success' | 'error', msg: string) => {
    setStatusMsg({ type, msg });
    setTimeout(() => setStatusMsg({ type: '', msg: '' }), 4000);
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/auth/registrar-trabajador/', userData);
      lanzarAlerta('success', "✅ Usuario creado con éxito");
      setShowAdminModal(false);
      setUserData({ username: '', password: '', email: '' });
    } catch (e) {
      lanzarAlerta('error', "❌ Error al crear usuario");
    }
  };

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/usuarios/perfil/actualizar/', formPerfil);
      setPerfil({ ...perfil, ...formPerfil });
      setShowEditModal(false);
      mostrarAlerta('success', 'Perfil actualizado correctamente');
    } catch (error) {
      mostrarAlerta('error', 'Error al sincronizar datos');
    }
  };

  const handleUpdateParams = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/usuarios/configuracion/', formParams);
      setShowParamsModal(false);
      mostrarAlerta('success', 'Reglas de negocio actualizadas');
    } catch (error) {
      mostrarAlerta('error', 'No tienes permisos de administrador');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formPass.new_password !== formPass.confirm_password) {
      return mostrarAlerta('error', 'Las contraseñas no coinciden');
    }
    try {
      await api.post('/usuarios/perfil/cambiar-password/', formPass);
      setShowPassModal(false);
      setFormPass({ old_password: '', new_password: '', confirm_password: '' });
      mostrarAlerta('success', 'Seguridad actualizada');
    } catch (error: any) {
      mostrarAlerta('error', error.response?.data?.error || 'Error de validación');
    }
  };

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('user_role');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const handleReimprimir = (pago: any) => {
    generarPDFRecibo({
      folio: pago.id.toString().padStart(8, '0'),
      cliente: pago.cliente,
      monto: Number(pago.monto),
      semana: pago.semana_numero.toString(),
      saldoAnterior: pago.saldo_anterior,
      nuevoSaldo: pago.nuevo_saldo,
      fecha: pago.fecha,
      hora: pago.hora,
      reimpresion: true
    });
  };

  const descargarBackup = async () => {
    try {
      const res = await api.get('/usuarios/backup/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_acuitlapilco_${new Date().toLocaleDateString()}.json`);
      document.body.appendChild(link);
      link.click();
      mostrarAlerta('success', 'Copia de seguridad descargada');
    } catch (error) {
      mostrarAlerta('error', 'No tienes permisos de superusuario');
    }
  };

  const totalPaginas = Math.ceil(totalTickets / 25) || 1;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} color="#0047AB" />
      <p className="font-black uppercase tracking-[0.3em] text-[10px] italic">Accediendo a Bóveda de Usuario...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 relative animate-in fade-in duration-700">

      {/* TOAST NOTIFICATION */}
      {statusMsg.msg && (
        <div className={`fixed top-10 right-10 z-[100] p-5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${statusMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-black text-xs uppercase tracking-widest">{statusMsg.msg}</span>
        </div>
      )}

      {/* HEADER PROFILE CARD */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/40 rounded-full -mr-20 -mt-20 z-0"></div>

        <div className="relative z-10 group">
          <div className="w-44 h-44 rounded-[2.8rem] bg-[#050533] p-1.5 shadow-2xl shadow-blue-900/30">
            <div className="w-full h-full rounded-[2.5rem] bg-white flex items-center justify-center border-4 border-white">
              <span className="text-7xl font-black text-[#0047AB] uppercase select-none">
                {perfil?.first_name?.[0] || perfil?.username?.[0]}
              </span>
            </div>
          </div>
          <button onClick={() => setShowEditModal(true)} className="absolute -bottom-2 -right-2 bg-white p-4 rounded-2xl shadow-xl text-[#0047AB] border border-slate-50 hover:scale-110 transition-all active:scale-95">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex-1 relative z-10 text-center md:text-left">
          <div className={`inline-flex items-center gap-2 ${role === 'admin' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'} px-4 py-1.5 rounded-full border mb-4 transition-colors duration-500`}>
            <div className={`w-2 h-2 ${role === 'admin' ? 'bg-emerald-500' : 'bg-blue-500'} rounded-full animate-pulse`} />
            <span className={`${role === 'admin' ? 'text-emerald-700' : 'text-blue-700'} text-[10px] font-black uppercase tracking-[0.2em]`}>
              {role === 'admin' ? 'Administrador General' : 'Cobrador Autorizado'}
            </span>
          </div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tighter capitalize mb-2 italic">
            {perfil?.first_name ? `${perfil.first_name} ${perfil.last_name}` : perfil?.username}
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.25em] flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck size={16} className="text-[#0047AB]" /> {perfil?.email}
          </p>

          <div className="flex justify-center md:justify-start gap-4 mt-8 flex-wrap">
            <div className="bg-slate-50/80 px-6 py-4 rounded-[1.5rem] border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">ID Personal</p>
              <p className="text-sm font-black text-[#0047AB] font-mono">#{perfil?.id?.toString().padStart(3, '0')}</p>
            </div>
            <div className="bg-slate-50/80 px-6 py-4 rounded-[1.5rem] border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Última Conexión</p>
              <p className={`text-sm font-black tracking-tighter ${fechaLocal === 'Primera Conexión' ? 'text-emerald-500' : 'text-slate-700'}`}>
                {fechaLocal}
              </p>
            </div>
            {userRole === 'admin' && (
              <button 
                onClick={() => setShowAdminModal(true)}
                className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0047AB] transition-all flex items-center gap-2 shadow-lg"
              >
                <Users size={16} /> Registrar Trabajador
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PARÁMETROS DEL SISTEMA */}
        {role === 'admin' && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group">
            <button
              onClick={() => setShowParamsModal(true)}
              className="absolute top-8 right-8 p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#0047AB] transition-colors"
            >
              <Edit2 size={18} />
            </button>
            <h3 className="font-black text-slate-800 mb-10 flex items-center gap-3 italic uppercase tracking-tighter text-xl text-[#050533]">
              <div className="p-3 bg-blue-50 rounded-2xl text-[#0047AB]"><Landmark size={24} /></div>
              Reglas del Negocio
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-6 bg-slate-50/50 rounded-[2rem] border-2 border-transparent">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Interés Semanal</span>
                <span className="font-black text-[#0047AB] text-3xl italic">{formParams.interes_global}%</span>
              </div>
              <div className="flex justify-between items-center p-6 bg-slate-50/50 rounded-[2rem] border-2 border-transparent">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mora Diaria</span>
                <span className="font-black text-red-600 text-3xl italic">{formParams.mora_diaria}%</span>
              </div>
            </div>
          </div>
        )}

        {/* ACCIONES DE CUENTA */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-10 flex items-center gap-3 italic uppercase tracking-tighter text-xl">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#0047AB]"><ShieldCheck size={24} /></div>
            Seguridad y Sesión
          </h3>
          <div className="space-y-4">
            <button onClick={() => setShowPassModal(true)} className="group w-full p-6 bg-slate-50 hover:bg-[#050533] rounded-[2rem] transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-slate-400 group-hover:text-[#0047AB] shadow-sm"><Key size={20} /></div>
                <span className="text-[11px] font-black text-slate-600 group-hover:text-white uppercase tracking-widest">Cambiar Contraseña</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-white transition-all" />
            </button>

            <button onClick={handleLogout} className="group w-full p-6 bg-red-50 hover:bg-red-600 rounded-[2rem] transition-all flex items-center justify-between border border-red-100/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-red-400 shadow-sm"><LogOut size={20} /></div>
                <span className="text-[11px] font-black text-red-600 group-hover:text-white uppercase tracking-widest">Cerrar Sistema</span>
              </div>
              <ChevronRight size={18} className="text-red-200 group-hover:text-white transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: PARÁMETROS */}
      {showParamsModal && (
        <div className="fixed inset-0 bg-[#050533]/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleUpdateParams} className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Parámetros</h3>
              <button type="button" onClick={() => setShowParamsModal(false)} className="p-2 text-slate-300 hover:text-red-500"><X size={28} /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tasa de Interés (%)</label>
                <input type="number" step="0.1" className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-[#0047AB] outline-none font-black text-2xl text-[#0047AB]" value={formParams.interes_global} onChange={(e) => setFormParams({ ...formParams, interes_global: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mora Diaria (%)</label>
                <input type="number" step="0.1" className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-red-500 outline-none font-black text-2xl text-red-600" value={formParams.mora_diaria} onChange={(e) => setFormParams({ ...formParams, mora_diaria: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="w-full mt-10 py-6 bg-[#050533] text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#0047AB] transition-all">
              <Save size={20} /> Guardar Cambios
            </button>
          </form>
        </div>
      )}

      {/* MODAL: EDITAR DATOS PERSONALES */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#050533]/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleUpdatePerfil} className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Editar Perfil</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-2 text-slate-300 hover:text-red-500"><X size={28} /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Nombre" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold" value={formPerfil.first_name} onChange={e => setFormPerfil({ ...formPerfil, first_name: e.target.value })} />
              <input placeholder="Apellidos" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold" value={formPerfil.last_name} onChange={e => setFormPerfil({ ...formPerfil, last_name: e.target.value })} />
              <input placeholder="Correo" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold" value={formPerfil.email} onChange={e => setFormPerfil({ ...formPerfil, email: e.target.value })} />
            </div>
            <button type="submit" className="w-full mt-8 py-5 bg-[#0047AB] text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all">Sincronizar Datos</button>
          </form>
        </div>
      )}

      {/* MODAL: PASSWORD */}
      {showPassModal && (
        <div className="fixed inset-0 bg-[#050533]/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleChangePassword} className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter mb-8">Seguridad</h3>
            <div className="space-y-4">
              <input type="password" placeholder="Contraseña Actual" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold" value={formPass.old_password} onChange={e => setFormPass({ ...formPass, old_password: e.target.value })} />
              <div className="h-px bg-slate-100 my-4"></div>
              <input type="password" placeholder="Nueva Contraseña" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold" value={formPass.new_password} onChange={e => setFormPass({ ...formPass, new_password: e.target.value })} />
              <input type="password" placeholder="Confirmar Nueva" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold" value={formPass.confirm_password} onChange={e => setFormPass({ ...formPass, confirm_password: e.target.value })} />
            </div>
            <button type="submit" className="w-full mt-8 py-5 bg-[#050533] text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Actualizar Acceso</button>
            <button type="button" onClick={() => setShowPassModal(false)} className="w-full mt-2 py-2 text-slate-400 font-black uppercase text-[9px] tracking-widest">Cerrar</button>
          </form>
        </div>
      )}

      {/* MANTENIMIENTO Y RESPALDO */}
      {role === 'admin' && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 italic uppercase tracking-tighter text-xl">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><ShieldCheck size={24} /></div>
            Mantenimiento y Respaldo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={descargarBackup}
              className="flex items-center justify-between p-6 bg-slate-50 hover:bg-[#0047AB] rounded-[2rem] group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl text-slate-400 group-hover:text-[#0047AB]"><Save size={20} /></div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-slate-600 group-hover:text-white uppercase tracking-widest">Respaldar Base de Datos</p>
                  <p className="text-[9px] text-slate-400 group-hover:text-white/60 uppercase">Descargar JSON de seguridad</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/auditoria')}
              className="flex items-center justify-between p-6 bg-slate-50 hover:bg-[#050533] rounded-[2rem] group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl text-slate-400 group-hover:text-[#050533]"><Search size={20} /></div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-slate-600 group-hover:text-white uppercase tracking-widest">Historial de Logs</p>
                  <p className="text-[9px] text-slate-400 group-hover:text-white/60 uppercase">Auditar acciones del personal</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* BÓVEDA DE TICKETS - SOLO ADMIN */}
      {role === 'admin' && (
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 mt-8 animate-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter flex items-center gap-2">
                <History className="text-purple-600" /> Bóveda de Tickets
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-8 italic">Historial global de cobranza</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar socio..."
                  value={busquedaTicket}
                  onChange={(e) => setBusquedaTicket(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTickets(1, busquedaTicket)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500 w-44 md:w-56"
                />
              </div>

              <span className="text-[10px] font-black bg-purple-50 text-purple-600 px-4 py-2 rounded-full uppercase whitespace-nowrap">
                {totalTickets} recibos emitidos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingTickets ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">
                Cargando recibos...
              </div>
            ) : tickets.map((pago: any) => (
              <div
                key={pago.id}
                className="
                  flex flex-col sm:flex-row
                  sm:items-center sm:justify-between
                  gap-4
      p-4 sm:p-6
      bg-slate-50
      rounded-[2.2rem]
      border border-transparent
      hover:border-purple-200
      transition-all
      group
      relative
      overflow-hidden
    "
  >
    {/* DECORACIÓN */}
    <div className="absolute -right-2 -bottom-2 opacity-[0.03] text-slate-900 rotate-12 pointer-events-none">
      <Printer size={80} />
    </div>

    {/* INFORMACIÓN DEL CLIENTE */}
    <div className="flex items-center gap-4 relative z-10 min-w-0 w-full sm:w-auto">

      <div
        className="
          w-14 h-14
          bg-purple-100
          text-purple-600
          rounded-2xl
          flex flex-col
          items-center
          justify-center
          shadow-sm
          font-black
          transition-colors
          group-hover:bg-purple-600
          group-hover:text-white
          shrink-0
        "
      >
        <span className="text-[8px] uppercase opacity-50">
          Sem
        </span>

        <span className="text-xl leading-none">
          {pago.semana_numero}
        </span>
      </div>

      <div className="min-w-0">
        <p className="font-black text-slate-800 text-xs uppercase tracking-tighter truncate max-w-[180px] sm:max-w-[140px]">
          {pago.cliente}
        </p>

        <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
          {pago.fecha}
          {pago.hora && ` • ${pago.hora}`}
        </p>
      </div>

    </div>

    {/* MONTO + BOTÓN */}
    <div
      className="
        flex
        items-center
        justify-between
        sm:justify-end
        gap-3
        relative
        z-10
        w-full
        sm:w-auto
      "
    >

      <div className="text-left sm:text-right min-w-0">
        <span className="text-lg font-black text-emerald-600 block leading-none whitespace-nowrap">
          ${pago.monto?.toLocaleString('es-MX', {
            minimumFractionDigits: 2
          })}
        </span>

        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter italic">
          ID #{pago.id}
        </span>
      </div>

      {/* BOTÓN REIMPRIMIR */}
      <button
        type="button"
        onClick={() => handleReimprimir(pago)}
        className="
          p-4
          bg-white
          text-slate-300
          hover:text-emerald-500
          rounded-2xl
          shadow-sm
          hover:shadow-md
          transition-all
          active:scale-90
          shrink-0
          border
          border-slate-100
        "
        title="Reimprimir Comprobante"
        aria-label={`Reimprimir comprobante ${pago.id}`}
      >
        <Printer size={18} />
      </button>

    </div>

  </div>
))}
            

            {!loadingTickets && tickets.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 opacity-30 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                <History size={48} className="mb-4" />
                <p className="font-black italic text-sm uppercase tracking-widest">Bóveda vacía</p>
              </div>
            )}
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400">
                Página {paginaActual} de {totalPaginas}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={paginaActual <= 1 || loadingTickets}
                  onClick={() => fetchTickets(paginaActual - 1, busquedaTicket)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600 font-bold text-xs flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button
                  disabled={paginaActual >= totalPaginas || loadingTickets}
                  onClick={() => fetchTickets(paginaActual + 1, busquedaTicket)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600 font-bold text-xs flex items-center gap-1"
                >
                  Siguiente <ChevronRight size={16} className="" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL REGISTRAR TRABAJADOR */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-[#050533]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 italic uppercase leading-none">Nuevo Usuario</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Acceso para Personal de Cobranza</p>
              </div>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-300 hover:text-red-500 transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Nombre de Usuario</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700"
                  onChange={(e) => setUserData({...userData, username: e.target.value})}
                  value={userData.username}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700"
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  value={userData.email}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Contraseña Temporal</label>
                <input 
                  type="password" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700"
                  onChange={(e) => setUserData({...userData, password: e.target.value})}
                  value={userData.password}
                />
              </div>

              <button 
                onClick={handleCreateUser}
                className="w-full py-5 bg-[#0047AB] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
              >
                Dar de Alta en SAPPE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA FLOTANTE */}
      {alerta && (
        <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right duration-500 ${alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
          <div className={`p-3 rounded-2xl ${alerta.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
            {alerta.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{alerta.type === 'success' ? 'Sistema Express' : 'Atención'}</p>
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

function ChevronRight({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  Search, DollarSign, X, CheckCircle2,
  Loader2, ArrowUpRight, Users, User, AlertCircle
} from "lucide-react";
import api from '@/lib/api';
import { generarPDFRecibo } from '@/lib/generateTicket';

export default function PagosPage() {
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 5000);
  };

  const [montoPenalizacion, setMontoPenalizacion] = useState(0);
  const [tienePenalizaciones, setTienePenalizaciones] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState<any>(null);
  const [montoAbono, setMontoAbono] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string>('');
  const [modalidadPago, setModalidadPago] = useState('E');

  // 1. LÓGICA DE PENALIZACIONES
  useEffect(() => {
    if (clienteSel) {
      const penalizacionesActivas = clienteSel.penalizaciones?.filter((p: any) => p.activa) || [];
      if (penalizacionesActivas.length > 0 || Number(clienteSel.total_penalizaciones) > 0) {
        setTienePenalizaciones(true);
        setMontoPenalizacion(Number(clienteSel.total_penalizaciones) || 0);
      } else {
        setTienePenalizaciones(false);
        setMontoPenalizacion(0);
      }
    } else {
      setTienePenalizaciones(false);
      setMontoPenalizacion(0);
    }
  }, [clienteSel]);

  // 2. CUOTA SUGERIDA (CORREGIDA: Acceso a prestamos_activos[0])
  useEffect(() => {
    if (clienteSel && semanaSeleccionada) {
      const prestamo = clienteSel.prestamos_activos?.[0];
      if (prestamo) {
        const montoTotal = Number(prestamo.monto_total) || 0;
        const numCuotas = Number(prestamo.cuotas) || 12;
        const sugerencia = montoTotal / numCuotas;
        setMontoAbono(sugerencia.toFixed(2));
      }
    }
  }, [semanaSeleccionada, clienteSel]);

  // 3. BUSCADOR
  const buscarEntidades = async (val: string) => {
    setBusqueda(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        const conDeuda = res.data.filter((e: any) => e.tiene_prestamo_activo);
        setSugerencias(conDeuda.slice(0, 5));
      } catch (e) { console.error("Error buscando entidades:", e); }
    } else { setSugerencias([]); }
  };

  const seleccionarEntidadConFolio = (cliente: any, prestamo: any) => {
    const entidadConfigurada = {
      ...cliente,
      // Forzamos el saldo del préstamo seleccionado
      saldo_actual: prestamo.saldo_restante !== undefined ? prestamo.saldo_restante : (prestamo.saldo_real || prestamo.monto_total),
      prestamos_activos: [prestamo],
      ultimo_prestamo_id: prestamo.id
    };
    setClienteSel(entidadConfigurada);
    setSugerencias([]);
    setBusqueda(cliente.nombre);
    setSemanaSeleccionada('');
    setMontoAbono('');
  };

  // 4. CÁLCULOS DE PANTALLA
  const saldoTotalAnterior = useMemo(() => {
    const principal = Number(clienteSel?.saldo_actual) || 0;
    const moras = Number(clienteSel?.total_penalizaciones) || 0;
    return principal + moras;
  }, [clienteSel]);

  const nuevoSaldoCalculado = useMemo(() => {
    const capitalActual = Number(clienteSel?.saldo_actual) || 0;
    const abonoCuotaRecibido = montoAbono === '' ? 0 : Number(montoAbono);
    const resultado = capitalActual - abonoCuotaRecibido;
    return Math.max(0, resultado);
  }, [clienteSel, montoAbono]);

  const handleAplicarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSel || !montoAbono) return;

    setLoading(true);
    try {
      const res = await api.post('/abonos/', {
        prestamo: clienteSel.ultimo_prestamo_id,
        monto: Number(montoAbono),
        semana_numero: Number(semanaSeleccionada),
        monto_penalizacion: Number(montoPenalizacion),
        modalidad: modalidadPago,
      });

      generarPDFRecibo({
        folio: res.data.id.toString().padStart(8, '0'),
        cliente: res.data.cliente,
        monto: res.data.monto,
        semana: semanaSeleccionada,
        saldoAnterior: res.data.saldo_anterior,
        nuevoSaldo: res.data.nuevo_saldo,
        penalizacion: res.data.penalizaciones_pagadas,
        fecha: res.data.fecha,
        hora: res.data.hora
      });

      lanzarAlerta('success', "✅ Pago aplicado con éxito");
      setClienteSel(null);
      setBusqueda('');
      setMontoAbono('');
      setMontoPenalizacion(0);
    } catch (error) {
      lanzarAlerta('error', "❌ Error al procesar el pago");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-10 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className={`absolute -top-10 -right-10 opacity-5 transition-colors ${clienteSel?.es_grupo ? 'text-purple-600' : 'text-[#0047AB]'}`}>
          {clienteSel?.es_grupo ? <Users size={240} /> : <DollarSign size={240} />}
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 italic tracking-tighter">Caja de Cobranza</h2>
          <p className="text-slate-400 text-sm mb-10 font-medium italic">Gestión de Abonos y Recuperación de Capital</p>

          <form onSubmit={handleAplicarPago} className="space-y-8">
            {/* BUSCADOR */}
            <div className="space-y-3 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Localizar Deudor</label>
              <div className="relative group">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${clienteSel ? 'text-emerald-500' : 'text-slate-300'}`} size={20} />
                <input
                  value={busqueda}
                  onChange={(e) => buscarEntidades(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[2rem] outline-none border-2 border-transparent focus:border-[#0047AB] focus:bg-white font-bold text-slate-700"
                  placeholder="Escribe nombre o ID..."
                />
              </div>

              {sugerencias.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden">
                  {sugerencias.flatMap((c) =>
                    c.prestamos_activos?.map((p: any) => (
                      <button
                        key={`${c.id}-${p.id}`}
                        type="button"
                        onClick={() => seleccionarEntidadConFolio(c, p)}
                        className="w-full p-4 flex justify-between items-center hover:bg-blue-50 border-b last:border-none group transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${c.es_grupo ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {c.es_grupo ? <Users size={20} /> : <User size={20} />}
                          </div>
                          <div className="text-left">
                            <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{c.nombre}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Folio: #{p.folio}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                Saldo: ${Number(p.saldo_restante || p.saldo_real || p.monto_total).toLocaleString('es-MX')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* SELECTOR DE SEMANA */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Número de Cuota a Liquidar</label>
              <select required value={semanaSeleccionada} onChange={(e) => setSemanaSeleccionada(e.target.value)} className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#0047AB] font-bold text-slate-700 cursor-pointer">
                <option value="">Selecciona el periodo de pago...</option>
                {[...Array(clienteSel?.prestamos_activos?.[0]?.cuotas || 12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Abono #{i + 1}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Monto Recibido ($)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-500 text-xl">$</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={montoAbono}
                    onChange={(e) => setMontoAbono(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-black text-2xl md:text-3xl text-[#050533]"
                    placeholder="0.00"
                  />
                </div>

                {clienteSel && (
                  <div className="flex justify-between px-2 text-[10px] text-[#0047AB] font-black uppercase italic animate-in fade-in duration-300">
                    <span>Abono a capital:</span>
                    <span>
                      {clienteSel.prestamos_activos?.[0]
                        ? `$${(Number(clienteSel.prestamos_activos[0].monto_total) / Number(clienteSel.prestamos_activos[0].cuotas)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                        : '---'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className={`text-[10px] font-black uppercase ml-2 tracking-widest ${tienePenalizaciones ? 'text-red-500' : 'text-slate-400'}`}>
                  {tienePenalizaciones ? '⚠️ Cobro Penalización' : 'Penalizaciones'}
                </label>
                <div className="relative">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-black text-xl ${tienePenalizaciones ? 'text-red-500' : 'text-slate-300'}`}>$</span>
                  <input
                    type="number"
                    min={0}
                    value={montoPenalizacion}
                    onChange={(e) => setMontoPenalizacion(Number(e.target.value))}
                    disabled={!tienePenalizaciones}
                    className={`w-full pl-12 pr-6 py-5 rounded-[1.5rem] outline-none border-2 font-black text-xl md:text-2xl transition-all ${tienePenalizaciones
                      ? 'bg-red-50 border-red-200 text-red-600 focus:border-red-500'
                      : 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Modalidad de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'E', label: 'Efectivo' }, { id: 'D', label: 'Depósito' }, { id: 'T', label: 'Transferencia' }].map((m) => (
                  <button key={m.id} type="button" onClick={() => setModalidadPago(m.id)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${modalidadPago === m.id ? `border-slate-800 bg-slate-800 text-white shadow-md` : `border-slate-100 bg-slate-50 text-slate-400`}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RESUMEN ACTUALIZADO */}
            {clienteSel && (
              <div className={`p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border animate-in slide-in-from-bottom-2 duration-500 ${clienteSel.es_grupo ? 'bg-purple-50 border-purple-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-500 font-bold text-xs">
                    <span>SALDO TOTAL (CON MORA):</span>
                    <span className="text-slate-700 font-black">${saldoTotalAnterior.toLocaleString('es-MX')}</span>
                  </div>

                  <div className="space-y-1 px-1">
                    <div className="flex justify-between text-[10px] text-blue-600 font-black uppercase italic mb-1">
                      <span>Abono a capital:</span>
                      <span>
                        {clienteSel.prestamos_activos?.[0]
                          ? `$${(Number(clienteSel.prestamos_activos[0].monto_total) / Number(clienteSel.prestamos_activos[0].cuotas)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                          : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px] italic font-medium">
                      <span>Capital actual: ${Number(clienteSel.saldo_actual).toLocaleString()}</span>
                      <span>+ Mora detectada: ${Number(montoPenalizacion).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-500 text-[10px] font-black uppercase tracking-tighter pt-1">
                      <span>Abono a aplicar:</span>
                      <span>- ${(Number(montoAbono) + Number(montoPenalizacion)).toLocaleString('es-MX')}</span>
                    </div>
                  </div>

                  <div className={`flex justify-between pt-4 border-t ${clienteSel.es_grupo ? 'border-purple-200' : 'border-emerald-200'}`}>
                    <span className="text-xs font-black uppercase">NUEVO SALDO CAPITAL:</span>
                    <span className={`text-xl md:text-2xl font-black tracking-tighter ${clienteSel.es_grupo ? 'text-purple-900' : 'text-emerald-900'}`}>
                      ${nuevoSaldoCalculado.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || !clienteSel || !montoAbono} className={`w-full py-5 md:py-6 text-white font-black rounded-2xl md:rounded-[2rem] shadow-xl transition-all uppercase text-[10px] md:text-xs tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 ${clienteSel?.es_grupo ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#050533] hover:bg-[#0047AB]'}`}>
              {loading ? <Loader2 className="animate-spin" /> : <>Confirmar y Emitir Recibo <CheckCircle2 size={18} /></>}
            </button>
          </form>
        </div>
      </div>

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
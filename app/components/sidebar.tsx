'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import { 
  LayoutDashboard, 
  BarChart, 
  AlertCircle, 
  Users, 
  HandCoins, 
  Receipt,
  Calendar, 
  Calculator, 
  LogOut,
  User,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    setRole(savedRole || 'cobrador');
  }, [pathname]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'Estadísticas', path: '/dashboard/estadisticas', icon: BarChart, roles: ['admin'] },
    { name: 'Cartera Vencida', path: '/dashboard/cartera-vencida', icon: AlertCircle, roles: ['admin'] },
    { name: 'Clientes', path: '/dashboard/clientes', icon: Users, roles: ['admin', 'cobrador'] },
    { name: 'Préstamos', path: '/dashboard/prestamos', icon: HandCoins, roles: ['admin', 'cobrador'] },
    { name: 'Pagos', path: '/dashboard/pagos', icon: Receipt, roles: ['admin', 'cobrador'] },
    { name: 'Calendario', path: '/dashboard/calendario', icon: Calendar, roles: ['admin', 'cobrador'] },
    { name: 'Simulador', path: '/dashboard/simulador', icon: Calculator, roles: ['admin', 'cobrador'] },
    { name: 'Mi Perfil', path: '/dashboard/usuario', icon: User, roles: ['admin', 'cobrador'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role || 'cobrador'));

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('user_role');
    localStorage.clear();
    router.push('/login');
  };

  return (
    <>
      {/* BOTÓN MENÚ MÓVIL */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-[100] p-3 bg-[#0F172A] text-white rounded-2xl shadow-xl border border-slate-800"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY FONDO MÓVIL */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[80] md:hidden"
        />
      )}

      {/* SIDEBAR PRINCIPAL SIFIN */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-[90]
        w-72 h-screen bg-[#0F172A] p-6 flex flex-col 
        transition-transform duration-300 ease-in-out border-r border-slate-800/80
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* NUEVA SECCIÓN DE LOGO E IDENTIDAD SIFIN */}
        <div className="flex flex-col items-center gap-3 mb-8 border-b border-slate-800/80 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/20">
            <TrendingUp className="w-8 h-8 text-amber-400" />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-2xl font-black italic tracking-wider text-white">SIFIN</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                PRO
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 block mt-1">
              Financiera Santi
            </span>
            <span className="inline-block mt-3 text-[8px] bg-slate-800 text-slate-300 font-black px-3 py-1 rounded-full border border-slate-700/50 uppercase tracking-widest">
              {role === 'admin' ? 'PANEL ADMINISTRATIVO' : 'MODO COBRADOR'}
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
          {filteredMenu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center group p-3.5 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                  <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* CERRAR SESIÓN */}
        <div className="mt-auto pt-6 border-t border-slate-800/80">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group uppercase font-black text-[10px] tracking-widest"
          >
            <LogOut size={18} className="text-slate-500 group-hover:text-red-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    localStorage.clear(); // Limpieza total para no dejar rastros
    router.push('/login');
  };

  return (
    <>
    <button 
      onClick={() => setIsOpen(!isOpen)}
      className="md:hidden fixed top-4 right-4 z-[100] p-3 bg-[#050533] text-white rounded-2xl shadow-xl border border-white/10"
    >
      <Menu size={24} />
    </button>
    {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] md:hidden"
        />
      )}
<aside className={`
      fixed md:sticky top-0 left-0 z-[90]
      w-72 h-screen bg-[#050533] p-8 flex flex-col 
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* LOGO SECTION */}
      <div className="flex flex-col items-center gap-4 mb-12 border-b border-white/5 pb-8">
        <Image src="/images/logo.png" alt="Logo" width={80} height={80} className="object-contain" priority />
        <div className="text-center">
          <span className="text-white font-black text-lg tracking-tighter block uppercase">Préstamos Express</span>
          <span className="text-[10px] text-sky-500 font-black uppercase tracking-[0.3em] mt-2 block">
            {role === 'admin' ? 'ADMIN PANEL' : 'COBRADOR V1.0'}
          </span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center group p-4 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-900/60' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-sky-400'} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="mt-auto pt-8 border-t border-white/5">
        <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-2 w-full text-slate-500 hover:text-red-400 transition-colors group uppercase font-black text-[10px] tracking-widest">
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
    </>
  );
  
}
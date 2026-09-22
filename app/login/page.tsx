"use client";
import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login/', { username, password });
      const userRole = response.data.role || (username === 'admin' ? 'admin' : 'cobrador');
      Cookies.set('access_token', response.data.access, { expires: 1 }); 
      Cookies.set('user_role', userRole, { expires: 1 });
      localStorage.setItem('user_role', userRole);
      // Guardamos los tokens en el storage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Redirigimos al Dashboard
      
if (userRole === 'admin') {
  router.push('/dashboard'); // Dashboard General
} else {
  router.push('/dashboard/clientes'); 
}
    } catch (err) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  return(
    <div className="min-h-screen bg-[#050533] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-3xl font-black text-slate-800 mb-2 italic tracking-tighter">Bienvenido</h2>
        <p className="text-slate-400 text-sm mb-8">Inicia sesión en Préstamos Express</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text" 
            placeholder="Usuario" 
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          
          <button className="w-full py-4 bg-[#0047AB] text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
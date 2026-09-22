import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

interface HealthBadgeProps {
  count: number;
  tieneMora?: boolean; // Agregamos esta propiedad para amarrar el estado con la base de datos
}

const ClientHealthBadge = ({ count, tieneMora = false }: HealthBadgeProps) => {
  // Lógica de Semáforo SAPPE de Alto Riesgo:
  // - CRÍTICO (Rojo): Si tiene mora activa O más de 5 penalizaciones.
  // - REGULAR (Amarillo): Si no tiene mora pero acumuló entre 2 y 4 penalizaciones.
  // - EXCELENTE (Verde): Solo 0 o 1 penalización es permitida para un historial limpio.
  
  const isCritico = tieneMora || count >= 5;
  const isRegular = !tieneMora && count >= 2 && count < 5;

  const config = {
    color: isCritico 
      ? 'bg-red-50 text-red-600 border-red-100 shadow-red-50' 
      : isRegular 
        ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50' 
        : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50',
    
    label: isCritico 
      ? (tieneMora ? 'Malo (Mora Activa)' : 'Malo (Crítico)') 
      : isRegular 
        ? 'Regular' 
        : 'Excelente',
    
    icon: isCritico 
      ? (tieneMora ? <ShieldAlert size={12} className="animate-pulse" /> : <AlertCircle size={12} />)
      : isRegular 
        ? <AlertTriangle size={12} /> 
        : <CheckCircle2 size={12} />
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm animate-in fade-in duration-500 ${config.color}`}>
      {config.icon}
      <span className="text-[10px] font-black uppercase tracking-widest italic">
        Perfil: {config.label} ({count} Pen.)
      </span>
    </div>
  );
};

export default ClientHealthBadge;
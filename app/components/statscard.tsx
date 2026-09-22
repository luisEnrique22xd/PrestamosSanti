import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
    <div className={`absolute top-0 right-0 p-4 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`} style={{ color }}>
      <Icon size={80} />
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest relative z-10">
      {title}
    </p>
    <h3 className="text-4xl font-black mt-2 relative z-10 tracking-tighter" style={{ color }}>
      {value}
    </h3>
  </div>
);

export default StatCard;
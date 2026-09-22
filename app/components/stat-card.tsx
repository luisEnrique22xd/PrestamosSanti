// components/StatCard.tsx
interface StatProps {
  title: string;
  value: string;
  trend: string;
  subtext: string;
  isNegative?: boolean;
}

export default function StatCard({ title, value, trend, subtext, isNegative }: StatProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <p className="text-slate-400 text-sm font-medium mb-4">{title}</p>
      <div className="flex items-end gap-3 mb-2">
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        <span className={`text-xs font-bold mb-1.5 ${isNegative ? 'text-red-500' : 'text-emerald-500'}`}>
          {trend} {isNegative ? '↓' : '↑'}
        </span>
      </div>
      <p className="text-slate-400 text-[11px] font-medium">Compared to ({subtext} last year)</p>
    </div>
  );
}
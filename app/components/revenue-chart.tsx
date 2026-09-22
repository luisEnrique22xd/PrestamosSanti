// components/RevenueChart.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { month: 'Sep', arrival: 480, spending: 180,},
  { month: 'Sep', arrival: 380, spending: 120 },
  { month: 'Nov', arrival: 300, spending: 440 },
  { month: 'Dec', arrival: 140, spending: 280 },
  { month: 'Jan', arrival: 110, spending: 180 },
  { month: 'Feb', arrival: 460, spending: 260 },
];

export default function RevenueChart() {
  return (
    <div className="h-75 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={12}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="arrival" fill="#050533" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="spending" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export { RevenueChart };
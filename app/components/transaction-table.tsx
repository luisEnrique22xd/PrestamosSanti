// components/TransactionTable.tsx
const transactions = [
  { company: 'Google', client: 'Jeremy Rice', amount: '$744', rank: '4.2', status: 'Good', icon: 'G' },
  { company: 'Facebook', client: 'Antonio Greene', amount: '$900', rank: '4.6', status: 'Good', icon: 'f' },
  { company: 'YouTube', client: 'Clarence Diaz', amount: '$560', rank: '2.8', status: 'Bad', icon: 'Y' },
];

export default function TransactionTable() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-bold text-slate-800">Transactions</h4>
        <span className="text-slate-400 cursor-pointer text-xl">•••</span>
      </div>8
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-300 text-[11px] uppercase tracking-wider">
            <th className="pb-4 font-medium">Company</th>
            <th className="pb-4 font-medium">Client</th>
            <th className="pb-4 font-medium">Amont</th>
            <th className="pb-4 font-medium">Rank</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {transactions.map((t, i) => (
            <tr key={i} className="border-t border-slate-50">
              <td className="py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">
                  {t.icon}
                </div>
                <span className="font-semibold text-slate-700">{t.company}</span>
              </td>
              <td className="py-4 text-slate-500">{t.client}</td>
              <td className="py-4 font-bold text-indigo-900">{t.amount}</td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Good' ? 'bg-sky-400' : 'bg-red-400'}`} />
                  <span className="font-medium text-slate-700">{t.rank}</span>
                  <span className="text-slate-400 text-xs">{t.status}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
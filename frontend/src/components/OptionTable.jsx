import { TrendingUp, TrendingDown, Target } from 'lucide-react';

const OptionTable = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Assuming ATM is somewhere in the middle. In real app, you'd calculate this 
  // based on current spot price. For now, let's find the middle or mark the middle-most as ATM.
  const middleIndex = Math.floor(data.length / 2);

  return (
    <div className="flex-1 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/5">
      <div className="overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-10 bg-slate-900 border-b border-white/5 shadow-md">
            <tr>
              <th colSpan="3" className="py-4 px-6 text-center text-rose-400 bg-rose-500/10 border-r border-slate-700/50 uppercase tracking-widest text-xs font-bold">Calls</th>
              <th className="py-4 px-6 text-center text-indigo-400 border-x border-slate-700/50 uppercase tracking-widest text-xs font-bold bg-indigo-500/5">Strike</th>
              <th colSpan="3" className="py-4 px-6 text-center text-emerald-400 bg-emerald-500/10 border-l border-slate-700/50 uppercase tracking-widest text-xs font-bold">Puts</th>
            </tr>
            <tr className="bg-slate-800/80 border-b border-white/5">
              <th className="py-3 px-6 text-xs text-slate-500 uppercase font-bold tracking-wider">OI</th>
              <th className="py-3 px-6 text-xs text-slate-500 uppercase font-bold tracking-wider">Volume</th>
              <th className="py-3 px-6 text-xs text-slate-500 uppercase font-bold border-r border-slate-700/50 tracking-wider">LTP</th>
              <th className="py-3 px-6 text-xs text-slate-500 uppercase font-bold border-x border-slate-700/50 text-center tracking-wider">Price Point</th>
              <th className="py-3 px-6 text-xs text-slate-500 uppercase font-bold border-l border-slate-700/50 tracking-wider">LTP</th>
              <th className="py-3 px-6 text-xs text-slate-500 uppercase font-bold tracking-wider">Volume</th>
              <th className="py-3 px-6 text-xs text-slate-500 uppercase font-bold tracking-wider text-right">OI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, index) => {
              const isATM = index === middleIndex;
              return (
                <tr 
                  key={index} 
                  className={`transition-all duration-300 group
                    ${isATM 
                        ? 'bg-indigo-500/20 text-indigo-100 border-y border-indigo-500/40 relative z-2 scale-[1.01] shadow-2xl ring-1 ring-indigo-500/50' 
                        : 'hover:bg-slate-700/40'}
                    ${index < middleIndex ? 'bg-rose-500/5' : 'bg-emerald-500/5'} 
                  `}
                >
                  {/* CE Columns */}
                  <td className="py-4 px-6 text-slate-300 tabular-nums">
                    <span className="flex items-center gap-2 group-hover:text-rose-400 transition-colors">
                      {row.ceOI.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs tabular-nums text-center">
                    {row.ceVolume?.toLocaleString() || '-'}
                  </td>
                  <td className="py-4 px-6 border-r border-white/5 font-mono text-rose-300 group-hover:text-rose-200 transition-colors">
                    $ {row.ceLTP.toFixed(2)}
                  </td>

                  {/* Strike Price */}
                  <td className="py-4 px-6 border-x border-white/5 bg-slate-900/50 font-bold text-center group-hover:bg-slate-950 transition-colors">
                    <div className="flex items-center justify-center gap-2">
                        {isATM && <Target size={14} className="text-indigo-400 animate-pulse" />}
                        <span className="text-indigo-200">{row.strikePrice.toLocaleString()}</span>
                    </div>
                  </td>

                  {/* PE Columns */}
                  <td className="py-4 px-6 border-l border-white/5 font-mono text-emerald-300 group-hover:text-emerald-200 transition-colors">
                    $ {row.peLTP.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs tabular-nums text-center">
                    {row.peVolume?.toLocaleString() || '-'}
                  </td>
                  <td className="py-4 px-6 text-slate-300 text-right tabular-nums">
                    <span className="flex items-center justify-end gap-2 group-hover:text-emerald-400 transition-colors">
                      {row.peOI.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionTable;

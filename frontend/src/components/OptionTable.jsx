import React from 'react';
import { TrendingUp, TrendingDown, Info, Activity } from 'lucide-react';
import PCRCard from './PCRCard';

const OptionTable = ({ data }) => {
  if (!data) return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-xl">
      <Activity className="text-indigo-500 animate-spin mb-4" size={40} />
      <p className="text-slate-400 font-medium">Loading Real-Time NSE Data...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* PCR & Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="bg-indigo-500 w-2 h-8 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></span>
            NIFTY Option Chain
          </h2>
          <div className="flex items-center gap-3 mt-1 text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 rounded-lg border border-white/5 text-xs">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              LIVE
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-500">
              {data.marketDate} • {data.timestamp} • {data.expiryDate}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Spot Price</span>
            <div className="text-2xl font-black text-white flex items-end gap-1 tabular-nums">
              <span className="text-xs text-indigo-400 font-bold mb-1 opacity-80">₹</span>
              {data.underlyingValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <PCRCard data={data.data} />
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 custom-scrollbar pb-4">
        <table className="w-full text-[11px] text-left text-slate-300 border-collapse table-fixed min-w-[1500px]">
          <thead className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {/* Header Categories */}
            <tr className="border-b border-white/5 bg-slate-800/30">
              <th colSpan="11" className="px-4 py-2 text-center text-indigo-300 font-black border-r border-white/5 uppercase tracking-[0.2em]">Calls</th>
              <th className="px-2 py-2 text-center text-white bg-slate-800 font-black uppercase tracking-[0.2em]">Strike</th>
              <th colSpan="11" className="px-4 py-2 text-center text-rose-300 font-black border-l border-white/5 uppercase tracking-[0.2em]">Puts</th>
            </tr>
            {/* Main Headers - Exactly matching the image */}
            <tr className="bg-slate-800/50 text-center border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
              <th className="w-10 py-2.5 border-r border-white/5"></th>
              <th className="w-20 py-2.5">OI</th>
              <th className="w-16 py-2.5">CHNG OI</th>
              <th className="w-20 py-2.5">VOLUME</th>
              <th className="w-12 py-2.5">IV</th>
              <th className="w-20 py-2.5">LTP</th>
              <th className="w-16 py-2.5">CHNG</th>
              <th className="w-16 py-2.5">BID QTY</th>
              <th className="w-16 py-2.5">BID</th>
              <th className="w-16 py-2.5">ASK</th>
              <th className="w-16 py-2.5 border-r border-white/5">ASK QTY</th>
              
              <th className="w-24 py-2.5 bg-slate-700/80 text-white font-black">STRIKE</th>
              
              <th className="w-16 py-2.5 border-l border-white/5">BID QTY</th>
              <th className="w-16 py-2.5">BID</th>
              <th className="w-16 py-2.5">ASK</th>
              <th className="w-16 py-2.5">ASK QTY</th>
              <th className="w-16 py-2.5">CHNG</th>
              <th className="w-20 py-2.5">LTP</th>
              <th className="w-12 py-2.5">IV</th>
              <th className="w-20 py-2.5">VOLUME</th>
              <th className="w-16 py-2.5">CHNG OI</th>
              <th className="w-20 py-2.5">OI</th>
              <th className="w-10 py-2.5 border-l border-white/5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-semibold">
            {data.data.map((row, idx) => {
              const underlying = data.underlyingValue || 0;
              const isATM = Math.abs(underlying - row.strikePrice) < 50;
              const isCallITM = row.strikePrice < underlying;
              const isPutITM = row.strikePrice > underlying;
              
              return (
                <tr key={idx} className={`text-center transition-all duration-150 group tabular-nums hover:bg-white/5 ${isATM ? 'bg-indigo-500/10' : ''}`}>
                  {/* CALLS - ITM Highlighting */}
                  <td className={`py-2 border-r border-white/5 ${isCallITM ? 'bg-yellow-500/5' : ''}`}><TrendingUp size={10} className="mx-auto text-indigo-500/40 group-hover:text-indigo-400" /></td>
                  <td className={`px-1 py-2 text-slate-300 ${isCallITM ? 'bg-yellow-500/5' : ''}`}>{(row.ceOI || 0).toLocaleString()}</td>
                  <td className={`px-1 py-2 ${row.ceChngOI >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isCallITM ? 'bg-yellow-500/5' : ''}`}>
                    {row.ceChngOI > 0 ? '+' : ''}{(row.ceChngOI || 0).toLocaleString()}
                  </td>
                  <td className={`px-1 py-2 text-slate-400/80 ${isCallITM ? 'bg-yellow-500/5' : ''}`}>{(row.ceVolume || 0).toLocaleString()}</td>
                  <td className={`px-1 py-2 text-yellow-500/70 ${isCallITM ? 'bg-yellow-500/5' : ''}`}>{row.ceIV || '-'}</td>
                  <td className={`px-1 py-2 text-white font-bold ${isCallITM ? 'bg-yellow-500/5' : ''}`}>{row.ceLTP?.toFixed(2) || '-'}</td>
                  <td className={`px-1 py-2 ${row.ceChng >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isCallITM ? 'bg-yellow-500/5' : ''}`}>
                    {row.ceChng >= 0 ? '+' : ''}{row.ceChng ? row.ceChng.toFixed(2) : '-'}
                  </td>
                  <td className={`px-1 py-2 text-slate-500 text-[9px] ${isCallITM ? 'bg-yellow-500/5' : ''}`}>{row.ceBidQty?.toLocaleString() || '-'}</td>
                  <td className={`px-1 py-2 text-indigo-300/80 font-medium ${isCallITM ? 'bg-yellow-500/5' : ''}`}>{row.ceBid?.toFixed(2) || '-'}</td>
                  <td className={`px-1 py-2 text-indigo-300/80 font-medium ${isCallITM ? 'bg-yellow-500/5' : ''}`}>{row.ceAsk?.toFixed(2) || '-'}</td>
                  <td className={`px-1 py-2 border-r border-white/5 text-slate-500 text-[9px] ${isCallITM ? 'bg-yellow-500/5' : ''}`}>{row.ceAskQty?.toLocaleString() || '-'}</td>
                  
                  {/* STRIKE */}
                  <td className={`px-2 py-2 font-black border-x border-white/10 ${isATM ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 z-20 sticky' : 'bg-slate-800/80 text-indigo-100 group-hover:bg-slate-700'}`}>
                    {row.strikePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* PUTS - ITM Highlighting */}
                  <td className={`px-1 py-2 border-l border-white/5 text-slate-500 text-[9px] ${isPutITM ? 'bg-yellow-500/5' : ''}`}>{row.peBidQty?.toLocaleString() || '-'}</td>
                  <td className={`px-1 py-2 text-rose-300/80 font-medium ${isPutITM ? 'bg-yellow-500/5' : ''}`}>{row.peBid?.toFixed(2) || '-'}</td>
                  <td className={`px-1 py-2 text-rose-300/80 font-medium ${isPutITM ? 'bg-yellow-500/5' : ''}`}>{row.peAsk?.toFixed(2) || '-'}</td>
                  <td className={`px-1 py-2 text-slate-500 text-[9px] ${isPutITM ? 'bg-yellow-500/5' : ''}`}>{row.peAskQty?.toLocaleString() || '-'}</td>
                  <td className={`px-1 py-2 ${row.peChng >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isPutITM ? 'bg-yellow-500/5' : ''}`}>
                    {row.peChng >= 0 ? '+' : ''}{row.peChng ? row.peChng.toFixed(2) : '-'}
                  </td>
                  <td className={`px-1 py-2 text-white font-bold ${isPutITM ? 'bg-yellow-500/5' : ''}`}>{row.peLTP?.toFixed(2) || '-'}</td>
                  <td className={`px-1 py-2 text-yellow-500/70 ${isPutITM ? 'bg-yellow-500/5' : ''}`}>{row.peIV || '-'}</td>
                  <td className={`px-1 py-2 text-slate-400/80 ${isPutITM ? 'bg-yellow-500/5' : ''}`}>{(row.peVolume || 0).toLocaleString()}</td>
                  <td className={`px-1 py-2 ${row.peChngOI >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isPutITM ? 'bg-yellow-500/5' : ''}`}>
                    {row.peChngOI > 0 ? '+' : ''}{(row.peChngOI || 0).toLocaleString()}
                  </td>
                  <td className={`px-1 py-2 text-slate-300 ${isPutITM ? 'bg-yellow-500/5' : ''}`}>{(row.peOI || 0).toLocaleString()}</td>
                  <td className={`py-2 border-l border-white/5 ${isPutITM ? 'bg-yellow-500/5' : ''}`}><TrendingDown size={10} className="mx-auto text-rose-500/40 group-hover:text-rose-400" /></td>
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

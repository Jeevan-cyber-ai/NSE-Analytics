import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Info, Activity } from 'lucide-react';
import PCRCard from './PCRCard';

const HeaderWithTooltip = ({ title, description, className = "", align = "center" }) => {
  const alignClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-0 translate-x-0",
    right: "right-0 translate-x-0"
  };
  
  const arrowClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-4 translate-x-0",
    right: "right-4 translate-x-0"
  };

  return (
    <th className={`group/header relative py-2.5 transition-colors cursor-help hover:bg-white/5 ${className}`}>
      <div className="flex items-center justify-center gap-1">
        {title}
        <Info size={10} className="text-slate-500 opacity-0 group-hover/header:opacity-100 transition-opacity" />
      </div>
      <div className={`absolute top-full ${alignClasses[align]} mt-2 w-64 p-3 bg-slate-800 border border-white/10 rounded-xl text-[11px] normal-case font-medium text-slate-300 opacity-0 group-hover/header:opacity-100 pointer-events-none transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] backdrop-blur-xl`}>
        <div className="text-indigo-400 font-bold mb-1.5 border-b border-white/5 pb-1.5 flex items-center justify-between">
          {title}
          <Info size={10} className="text-indigo-500/50" />
        </div>
        <div className="leading-relaxed">
          {description}
        </div>
        <div className={`absolute bottom-full ${arrowClasses[align]} border-[6px] border-transparent border-b-slate-800`}></div>
      </div>
    </th>
  );
};

const OptionTable = ({ data }) => {
  const columnDescriptions = {
    OI: "Open Interest is the total number of outstanding option contracts that have not been settled. It shows market liquidity and position concentration.",
    CHNG_OI: "The net change in Open Interest for the day. Positive change indicates new traders entering; negative change shows positions being closed.",
    VOLUME: "The total number of contracts traded during the current session. High volume indicates intense trading activity and interest at this price.",
    IV: "Implied Volatility represents the market's expectation of future volatility, directly impacting the option premium price.",
    LTP: "Last Traded Price is the most recent market price for the option, reflecting its current market value.",
    CHNG: "Price Change represents the net difference in price from the previous day's closing price, showing daily price movement.",
    BID_QTY: "The total number of contracts that buyers are currently willing to buy at the Bid price.",
    BID: "The highest price a buyer is currently willing to pay for an option contract.",
    ASK: "The lowest price a seller is currently willing to accept for an option contract.",
    ASK_QTY: "The total number of contracts currently available for sale at the Ask price.",
    STRIKE: "The fixed price at which the buyer can exercise their option to buy (Call) or sell (Put) the underlying Nifty index."
  };

  const availableExpiries = data?.expiryDates?.length > 0 
    ? data.expiryDates 
    : [...new Set(data?.data?.map(r => r.expiryDate).filter(Boolean))];

  const [selectedExpiry, setSelectedExpiry] = useState(data?.expiryDate || 'N/A');

  useEffect(() => {
    // Keep selection in sync when snapshot data changes
    if (availableExpiries.length > 0 && !availableExpiries.includes(selectedExpiry)) {
      setSelectedExpiry(availableExpiries[0]);
    } else if (availableExpiries.length === 0 && data?.expiryDate) {
      setSelectedExpiry(data.expiryDate);
    }
  }, [data, availableExpiries, selectedExpiry]);

  if (!data) return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-xl">
      <Activity className="text-indigo-500 animate-spin mb-4" size={40} />
      <p className="text-slate-400 font-medium">Loading Real-Time NSE Data...</p>
    </div>
  );

  // Filter rows specific to the selected expiry (or fallback to all if legacy data)
  const filteredData = data.data.filter(r => r.expiryDate === selectedExpiry || !r.expiryDate);

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
            {availableExpiries.length > 1 ? (
              <select 
                title="Select Expiry" 
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(99,102,241,0.1)] outline-none cursor-pointer hover:bg-indigo-500/20 transition-all"
              >
                {availableExpiries.map(exp => (
                  <option key={exp} value={exp} className="bg-slate-900 text-indigo-300">
                    EXPIRY: {exp}
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                EXPIRY: {selectedExpiry || "N/A"}
              </span>
            )}
            <span className="text-xs uppercase tracking-widest text-slate-500 ml-1">
              {data.marketDate} • {data.timestamp}
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
          <PCRCard data={filteredData} />
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 custom-scrollbar pb-4">
        <table className="w-full text-[11px] text-left text-slate-300 border-collapse table-fixed min-w-[1500px]">
          <thead className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {/* Header Categories */}
            <tr className="border-b border-white/5 bg-slate-800/80 sticky top-0 z-50 backdrop-blur-md">
              <th colSpan="11" className="px-4 py-2 text-center text-indigo-300 font-black border-r border-white/5 uppercase tracking-[0.2em]">Calls</th>
              <th className="px-2 py-2 text-center text-white bg-slate-800 font-black uppercase tracking-[0.2em] sticky top-0">Strike</th>
              <th colSpan="11" className="px-4 py-2 text-center text-rose-300 font-black border-l border-white/5 uppercase tracking-[0.2em]">Puts</th>
            </tr>
            {/* Main Headers - Exactly matching the image */}
            <tr className="bg-slate-800/90 text-center border-b border-white/10 sticky top-[33px] z-40 backdrop-blur-md">
              <th className="w-10 py-2.5 border-r border-white/5"></th>
              <HeaderWithTooltip title="OI" description={columnDescriptions.OI} className="w-20" align="left" />
              <HeaderWithTooltip title="CHNG OI" description={columnDescriptions.CHNG_OI} className="w-16" align="left" />
              <HeaderWithTooltip title="VOLUME" description={columnDescriptions.VOLUME} className="w-20" />
              <HeaderWithTooltip title="IV" description={columnDescriptions.IV} className="w-12" />
              <HeaderWithTooltip title="LTP" description={columnDescriptions.LTP} className="w-20" />
              <HeaderWithTooltip title="CHNG" description={columnDescriptions.CHNG} className="w-16" />
              <HeaderWithTooltip title="BID QTY" description={columnDescriptions.BID_QTY} className="w-16" />
              <HeaderWithTooltip title="BID" description={columnDescriptions.BID} className="w-16" />
              <HeaderWithTooltip title="ASK" description={columnDescriptions.ASK} className="w-16" />
              <HeaderWithTooltip title="ASK QTY" description={columnDescriptions.ASK_QTY} className="w-16 border-r border-white/5" />
              
              <HeaderWithTooltip title="STRIKE" description={columnDescriptions.STRIKE} className="w-24 bg-slate-700/80 text-white font-black" />
              
              <HeaderWithTooltip title="BID QTY" description={columnDescriptions.BID_QTY} className="w-16 border-l border-white/5" />
              <HeaderWithTooltip title="BID" description={columnDescriptions.BID} className="w-16" />
              <HeaderWithTooltip title="ASK" description={columnDescriptions.ASK} className="w-16" />
              <HeaderWithTooltip title="ASK QTY" description={columnDescriptions.ASK_QTY} className="w-16" />
              <HeaderWithTooltip title="CHNG" description={columnDescriptions.CHNG} className="w-16" />
              <HeaderWithTooltip title="LTP" description={columnDescriptions.LTP} className="w-20" />
              <HeaderWithTooltip title="IV" description={columnDescriptions.IV} className="w-12" />
              <HeaderWithTooltip title="VOLUME" description={columnDescriptions.VOLUME} className="w-20" />
              <HeaderWithTooltip title="CHNG OI" description={columnDescriptions.CHNG_OI} className="w-16" align="right" />
              <HeaderWithTooltip title="OI" description={columnDescriptions.OI} className="w-20" align="right" />
              <th className="w-10 py-2.5 border-l border-white/5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-semibold">
            {filteredData.map((row, idx) => {
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

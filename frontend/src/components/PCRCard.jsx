import { TrendingDown, TrendingUp, Info } from 'lucide-react';

const PCRCard = ({ data }) => {
  if (!data || data.length === 0) return null;

  const totalCallOI = data.reduce((sum, row) => sum + row.ceOI, 0);
  const totalPutOI = data.reduce((sum, row) => sum + row.peOI, 0);
  const pcr = totalCallOI > 0 ? (totalPutOI / totalCallOI).toFixed(2) : 0;

  const totalCallVol = data.reduce((sum, row) => sum + row.ceVolume, 0);
  const totalPutVol = data.reduce((sum, row) => sum + row.peVolume, 0);
  const volPcr = totalCallVol > 0 ? (totalPutVol / totalCallVol).toFixed(2) : 0;

  // Max Pain Calculation
  const strikes = data.map(r => r.strikePrice);
  let maxPainStrike = strikes[0];
  let minPain = Infinity;

  strikes.forEach(s => {
    let currentPain = 0;
    data.forEach(r => {
        // Gain for sellers = Loss for buyers
        if (r.strikePrice < s) { // Call ITM
            currentPain += (r.ceOI || 0) * (s - r.strikePrice);
        } else if (r.strikePrice > s) { // Put ITM
            currentPain += (r.peOI || 0) * (r.strikePrice - s);
        }
    });
    if (currentPain < minPain) {
        minPain = currentPain;
        maxPainStrike = s;
    }
  });

  const getSentimentText = (val) => {
    if (val > 1.4) return { text: 'Extremely Bullish', color: 'text-emerald-400', icon: <TrendingUp className="text-emerald-500" /> };
    if (val > 1.0) return { text: 'Bullish', color: 'text-emerald-300', icon: <TrendingUp className="text-emerald-400 opacity-70" /> };
    if (val > 0.8) return { text: 'Neutral', color: 'text-slate-400', icon: <Info className="text-slate-500" /> };
    if (val > 0.6) return { text: 'Bearish', color: 'text-rose-300', icon: <TrendingDown className="text-rose-400 opacity-70" /> };
    return { text: 'Extremely Bearish', color: 'text-rose-400', icon: <TrendingDown className="text-rose-500" /> };
  };

  const sentiment = getSentimentText(parseFloat(pcr));

  return (
    <div className="flex gap-2 md:gap-4 group">
      {/* OI PCR */}
      <div className="flex flex-col items-end px-3 py-2 md:px-6 md:py-3 bg-slate-800/80 rounded-xl md:rounded-2xl border border-white/5 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 ring-1 ring-white/5 hover:ring-indigo-500/30">
        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
          <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-0.5 md:pt-1">OI PCR</span>
          <div className="relative group/tooltip">
              <Info size={8} className="text-slate-600 hover:text-slate-400 transition-colors cursor-help md:w-[10px] md:h-[10px]" />
              <div className="absolute top-full right-0 mt-3 w-40 md:w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg text-[9px] md:text-[10px] text-slate-400 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 shadow-2xl">
                PCR (Open Interest) = Total Put OI / Total Call OI.
              </div>
          </div>
        </div>
        <div className="flex items-end gap-1.5 md:gap-3">
          <div className="flex items-center gap-1.5 md:gap-2">
            {sentiment.icon && <span className="scale-75 md:scale-100">{sentiment.icon}</span>}
            <span className={`text-lg md:text-2xl font-black ${sentiment.color} drop-shadow-[0_0_12px_rgba(34,197,94,0.3)] tabular-nums`}>
              {pcr}
            </span>
          </div>
          <p className={`text-[8px] md:text-[10px] font-semibold ${sentiment.color} opacity-80 mb-0.5 md:mb-1 hidden sm:block`}>
            {sentiment.text}
          </p>
        </div>
      </div>

      {/* Volume PCR */}
      <div className="hidden md:flex flex-col items-end px-6 py-3 bg-slate-800/80 rounded-2xl border border-white/5 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 ring-1 ring-white/5 hover:ring-indigo-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-1">Volume PCR</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-2xl font-black text-indigo-300 tabular-nums">
            {volPcr}
          </span>
          <p className="text-[10px] font-semibold text-indigo-400/60 mb-1">
            Activity
          </p>
        </div>
      </div>

      {/* Max Pain */}
      <div className="hidden lg:flex flex-col items-end px-6 py-3 bg-slate-800/80 rounded-2xl border border-white/5 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 ring-1 ring-white/5 hover:ring-indigo-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-1">Max Pain</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-2xl font-black text-slate-100 tabular-nums">
            {maxPainStrike?.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
          <p className="text-[10px] font-semibold text-slate-500 mb-1">
             Settlement
          </p>
        </div>
      </div>
    </div>
  );

};

export default PCRCard;

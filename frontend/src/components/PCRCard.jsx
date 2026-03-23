import { TrendingDown, TrendingUp, Info } from 'lucide-react';

const PCRCard = ({ data }) => {
  if (!data || data.length === 0) return null;

  const totalCallOI = data.reduce((sum, row) => sum + row.ceOI, 0);
  const totalPutOI = data.reduce((sum, row) => sum + row.peOI, 0);
  const pcr = totalCallOI > 0 ? (totalPutOI / totalCallOI).toFixed(2) : 0;

  const getSentimentText = (val) => {
    if (val > 1.4) return { text: 'Extremely Bullish', color: 'text-emerald-400', icon: <TrendingUp className="text-emerald-500" /> };
    if (val > 1.0) return { text: 'Bullish', color: 'text-emerald-300', icon: <TrendingUp className="text-emerald-400 opacity-70" /> };
    if (val > 0.8) return { text: 'Neutral', color: 'text-slate-400', icon: <Info className="text-slate-500" /> };
    if (val > 0.6) return { text: 'Bearish', color: 'text-rose-300', icon: <TrendingDown className="text-rose-400 opacity-70" /> };
    return { text: 'Extremely Bearish', color: 'text-rose-400', icon: <TrendingDown className="text-rose-500" /> };
  };

  const sentiment = getSentimentText(parseFloat(pcr));

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-end px-6 py-3 bg-slate-800/80 rounded-2xl border border-white/5 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 ring-1 ring-white/5 hover:ring-indigo-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-1">Put-Call Ratio (PCR)</span>
          <div className="relative group/tooltip">
              <Info size={12} className="text-slate-600 hover:text-slate-400 transition-colors cursor-help" />
              <div className="absolute top-full right-0 mt-3 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-400 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 shadow-2xl">
                PCR = Total Put OI / Total Call OI. Used to gauge market sentiment.
              </div>
          </div>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            {sentiment.icon}
            <span className={`text-3xl font-black ${sentiment.color} drop-shadow-[0_0_12px_rgba(34,197,94,0.3)] tabular-nums`}>
              {pcr}
            </span>
          </div>
          <p className={`text-xs font-semibold ${sentiment.color} opacity-80 mb-1`}>
            {sentiment.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PCRCard;

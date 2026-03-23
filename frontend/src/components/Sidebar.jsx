import { useState } from 'react';
import { Calendar, Clock, ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = ({ dates, selectedDate, onSelectDate, timestamps, onSelectSnapshot, currentSnapshotId }) => {
  return (
    <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full shadow-2xl">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Calendar className="text-indigo-400" size={24} />
          <span>Historical Logs</span>
        </h2>
        
        <div className="relative">
          <select 
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-200"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
          >
            {dates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown size={18} className="text-slate-500" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest px-4 mb-4 mt-2">
          Daily Snapshots
        </h3>
        <div className="space-y-1">
          {timestamps.length > 0 ? (
            timestamps.map((t) => (
              <button
                key={t._id}
                onClick={() => onSelectSnapshot(t._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${currentSnapshotId === t._id 
                    ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}
                `}
              >
                <Clock size={16} className={`${currentSnapshotId === t._id ? 'text-indigo-400' : 'text-slate-600'}`} />
                <span className="flex-1 text-left font-medium text-sm">
                  {t.timestamp.split(' ').slice(-1)[0]} {/* Just show HH:mm:ss */}
                </span>
                {currentSnapshotId === t._id && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>}
                {currentSnapshotId !== t._id && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            ))
          ) : (
            <div className="text-slate-600 text-sm px-4 italic py-8 text-center ring-1 ring-slate-700/50 rounded-xl bg-slate-900/30">
              No snapshots available for the selected date.
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900/50">
        <div className="text-xs text-slate-500 flex justify-between items-center bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
          <span>Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE MONITOR
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

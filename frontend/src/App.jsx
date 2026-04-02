import { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import OptionTable from './components/OptionTable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [expiries, setExpiries] = useState([]);
  const [selectedExpiry, setSelectedExpiry] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(true); // Track if user is watching the latest

  const fetchTimestamps = () => {
    if (!selectedDate || !selectedExpiry) return;
    axios.get(`${API_BASE_URL}/timestamps?date=${selectedDate}&expiry=${selectedExpiry}`)
      .then(res => {
        setTimestamps(prev => {
          const newTimestamps = res.data;
          
          if (newTimestamps.length > 0) {
            const latestNewId = newTimestamps[0]._id;
            const latestOldId = prev.length > 0 ? prev[0]._id : null;
            
            if (latestNewId !== latestOldId) {
              if (!latestOldId || isLiveTracking) {
                fetchSnapshot(latestNewId);
                setIsLiveTracking(true);
              }
            }
          }
          return newTimestamps;
        });
      });
  };

  const triggerManualScrape = () => {
    if (isScraping) return;
    setIsScraping(true);
    axios.get(`${API_BASE_URL}/scrape`)
      .then(res => {
        setIsScraping(false);
        fetchTimestamps();
      })
      .catch(err => {
        setIsScraping(false);
        console.error("Manual Scrape Error:", err.message);
      });
  };

  useEffect(() => {
    // Fetch initial dates
    axios.get(`${API_BASE_URL}/dates`)
      .then(res => {
        setDates(res.data);
        if (res.data.length > 0) setSelectedDate(res.data[0]);
      });
  }, []);

  const fetchSnapshot = (id, isUserClick = false) => {
    if (isUserClick) {
      const isLatest = timestamps.length > 0 && timestamps[0]._id === id;
      setIsLiveTracking(isLatest);
      setIsSidebarOpen(false); 
    }
    
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/snapshot/${id}`)
      .then(res => {
        setSelectedSnapshot(res.data);
        setIsLoading(false);
      })
      .catch(err => setIsLoading(false));
  };

  useEffect(() => {
    if (!selectedDate) return;
    axios.get(`${API_BASE_URL}/expiries?date=${selectedDate}`)
      .then(res => {
        setExpiries(res.data);
        if (res.data.length > 0) {
          setSelectedExpiry(res.data[0]);
        } else {
          setSelectedExpiry('');
          setTimestamps([]);
        }
      });
  }, [selectedDate]);

  useEffect(() => {
    fetchTimestamps();
    const interval = setInterval(fetchTimestamps, 30000); 
    return () => clearInterval(interval);
  }, [selectedDate, selectedExpiry, isLiveTracking]);

  return (
    <div className="flex bg-slate-900 text-white h-screen overflow-hidden relative font-inter">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        dates={dates} 
        selectedDate={selectedDate} 
        onSelectDate={setSelectedDate}
        expiries={expiries}
        selectedExpiry={selectedExpiry}
        onSelectExpiry={setSelectedExpiry}
        timestamps={timestamps}
        onSelectSnapshot={fetchSnapshot}
        currentSnapshotId={selectedSnapshot?._id}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isScraping={isScraping}
        onManualRefresh={triggerManualScrape}
      />
      
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent)]">
        {/* Mobile Header with Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4 bg-slate-800/50 p-3 rounded-xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-sm font-black">N</span>
            </div>
            <span className="font-bold text-sm tracking-tight">NSE Analytics</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:text-white"
          >
            <Menu size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]"></div>
            <p className="text-slate-500 font-medium animate-pulse">Fetching snapshot details...</p>
          </div>
        ) : selectedSnapshot ? (
          <OptionTable data={selectedSnapshot} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 text-center">
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5 opacity-50">
               <span className="text-3xl">📊</span>
             </div>
             <div>
               <p className="font-bold text-slate-400">Welcome to NSE Option Chain Analytics</p>
               <p className="text-sm px-4">Select a date and timestamp from the sidebar to view historical data.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import OptionTable from './components/OptionTable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch initial dates
    axios.get(`${API_BASE_URL}/dates`)
      .then(res => {
        setDates(res.data);
        if (res.data.length > 0) setSelectedDate(res.data[res.data.length - 1]);
      });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      axios.get(`${API_BASE_URL}/timestamps?date=${selectedDate}`)
        .then(res => {
          setTimestamps(res.data);
          if (res.data.length > 0) fetchSnapshot(res.data[0]._id);
        });
    }
  }, [selectedDate]);

  const fetchSnapshot = (id) => {
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/snapshot/${id}`)
      .then(res => {
        setSelectedSnapshot(res.data);
        setIsLoading(false);
      })
      .catch(err => setIsLoading(false));
  };

  return (
    <div className="flex bg-slate-900 text-white min-h-screen overflow-hidden">
      <Sidebar 
        dates={dates} 
        selectedDate={selectedDate} 
        onSelectDate={setSelectedDate}
        timestamps={timestamps}
        onSelectSnapshot={fetchSnapshot}
        currentSnapshotId={selectedSnapshot?._id}
      />
      
      <main className="flex-1 flex flex-col p-6 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent)]">
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
               <p className="text-sm">Select a date and timestamp from the sidebar to view historical data.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

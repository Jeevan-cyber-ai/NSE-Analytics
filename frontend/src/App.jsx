import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import OptionTable from './components/OptionTable';
import PCRCard from './components/PCRCard';

const API_BASE_URL = 'http://localhost:5000/api'; // Update if needed

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
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <Sidebar 
        dates={dates} 
        selectedDate={selectedDate} 
        onSelectDate={setSelectedDate}
        timestamps={timestamps}
        onSelectSnapshot={fetchSnapshot}
        currentSnapshotId={selectedSnapshot?._id}
      />
      
      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              NSE Option Chain Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              {selectedSnapshot ? `Snapshot: ${selectedSnapshot.timestamp} (${selectedSnapshot.expiryDate} Expiry)` : 'Select a snapshot...'}
            </p>
          </div>
          <div className="flex gap-4">
            <PCRCard data={selectedSnapshot?.data} />
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : selectedSnapshot ? (
          <OptionTable data={selectedSnapshot.data} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 italic">
            Select a date and timestamp from the sidebar to view data.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

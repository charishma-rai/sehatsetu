import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/requests/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchRequests(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-teal-900 pt-10 pb-6 px-6 shadow-lg shadow-teal-900/20 sticky top-0 z-10 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate(-1)} className="text-white text-xl">←</button>
          <h1 className="text-xl font-black text-white tracking-tight">Community Requests</h1>
          <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center text-xl shadow-inner border border-teal-700">🚑</div>
        </div>
        <p className="text-teal-200/80 text-xs font-bold uppercase tracking-widest">Incoming Assistance Needs</p>
      </header>

      <div className="px-6 mt-6 space-y-4">
        {loading ? (
           <div className="text-center p-10 font-bold text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
           <div className="text-center p-10 font-bold text-slate-400 bg-white rounded-3xl border border-slate-100">No active requests.</div>
        ) : (
          requests.map(req => (
            <div key={req.id} className={`bg-white p-5 rounded-3xl border shadow-sm ${req.status === 'Pending' ? (req.urgency === 'Critical' ? 'border-red-200 shadow-red-900/5' : 'border-slate-100') : 'border-emerald-200 opacity-60'}`}>
               <div className="flex justify-between items-start mb-3">
                 <div>
                    <h3 className="text-base font-black text-slate-900">{req.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.village} · {req.type}</p>
                 </div>
                 <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                   req.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 
                   (req.urgency === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600')
                 }`}>
                   {req.urgency}
                 </div>
               </div>
               
               <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                 <p className="text-xs font-bold text-slate-700">"{req.reason}"</p>
               </div>

               {req.status === 'Pending' ? (
                 <div className="flex gap-2 mt-4">
                    <button onClick={() => handleAction(req.id, 'Accepted')} className="flex-1 bg-teal-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-teal-800 transition-colors">
                      Accept Request
                    </button>
                    <button onClick={() => handleAction(req.id, 'Declined')} className="bg-slate-100 text-slate-500 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                      Decline
                    </button>
                 </div>
               ) : (
                 <div className="mt-2 text-center bg-emerald-50 text-emerald-700 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Status: {req.status}
                 </div>
               )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

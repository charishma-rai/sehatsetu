import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Schedule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock data for the schedule
  const upcomingVisits = [
    { id: 101, name: "Sita Sharma", type: "ANC Follow-up", time: "10:00 AM", urgent: true, village: "Rampur" },
    { id: 102, name: "Ramesh Kumar", type: "TB Medication Check", time: "11:30 AM", urgent: false, village: "Baishpur" },
    { id: 103, name: "Geeta Devi (Child)", type: "Immunization - Polio", time: "02:00 PM", urgent: false, village: "Sundarpur" }
  ];

  const pendingFollowups = [
    { id: 2, name: "Sunita Yadav", reason: "Severe Anemia - Needs CBC", overdue: true, village: "Baishpur" },
    { id: 1, name: "Meena Devi", reason: "Missed 2 Visits - Diabetic", overdue: true, village: "Rampur" }
  ];

  const ashaTasks = [
    { id: 1, task: "Collect Iron Folic Acid (IFA) tablets from PHC", status: "Pending" },
    { id: 2, task: "Submit monthly maternal health report", status: "Completed" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-teal-900 pt-10 pb-6 px-6 shadow-lg shadow-teal-900/20 sticky top-0 z-10 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Calendar & Tasks</h1>
          <button className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center text-xl shadow-inner">📅</button>
        </div>
        <p className="text-teal-200/80 text-xs font-bold uppercase tracking-widest">Today's Itinerary</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 px-6 mt-6 mb-4 overflow-x-auto no-scrollbar">
        {["upcoming", "followups", "tasks"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab 
                ? "bg-teal-700 text-white shadow-md shadow-teal-900/20" 
                : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {tab.replace('upcoming', 'Visits').replace('followups', 'Overdue Follow-ups').replace('tasks', 'ASHA Tasks')}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-4">
        {activeTab === "upcoming" && upcomingVisits.map(visit => (
          <div key={visit.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="flex flex-col items-center justify-center bg-teal-50 w-14 h-14 rounded-2xl border border-teal-100">
              <span className="text-xs font-black text-teal-800">{visit.time.split(' ')[0]}</span>
              <span className="text-[9px] font-bold text-teal-600 uppercase">{visit.time.split(' ')[1]}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-black text-slate-900">{visit.name}</h3>
                {visit.urgent && <span className="bg-red-100 text-red-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Urgent</span>}
              </div>
              <p className="text-xs font-bold text-teal-700 mb-1">{visit.type}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">📍 {visit.village}</p>
            </div>
          </div>
        ))}

        {activeTab === "followups" && pendingFollowups.map(f => (
          <div key={f.id} onClick={() => navigate(`/patient/${f.id}`)} className="bg-red-50 p-5 rounded-3xl border border-red-100 shadow-sm cursor-pointer active:scale-95 transition-transform">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-black text-slate-900">{f.name}</h3>
              <span className="text-red-500 text-lg">⚠️</span>
            </div>
            <p className="text-xs font-bold text-red-700 mb-2">{f.reason}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">📍 {f.village}</p>
            <button className="mt-4 w-full bg-red-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
              Start Emergency Visit
            </button>
          </div>
        ))}

        {activeTab === "tasks" && ashaTasks.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
             <input type="checkbox" checked={t.status === "Completed"} readOnly className="w-5 h-5 accent-teal-600" />
             <p className={`text-sm font-bold ${t.status === "Completed" ? "text-slate-400 line-through" : "text-slate-800"}`}>
               {t.task}
             </p>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import usePatients from "./hooks/usePatients";

const badgeStyles = {
  CRITICAL: "bg-red-600 text-white shadow-lg shadow-red-900/20",
  HIGH: "bg-orange-500 text-white shadow-md shadow-orange-900/10",
  MODERATE: "bg-amber-500 text-white",
  LOW: "bg-emerald-500 text-white",
};

const textStyles = {
  CRITICAL: "text-red-700",
  HIGH: "text-orange-600",
  MODERATE: "text-amber-600",
  LOW: "text-emerald-600",
};

function Dashboard() {
  const navigate = useNavigate();
  const { patients, loading, error } = usePatients();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const criticalCount = patients.filter((p) => p.level === "CRITICAL").length;
  const highRiskCount = patients.filter((p) => p.level === "HIGH").length;

  const tasks = [
    { id: 1, title: "Register pregnant women", zone: "Zone A", status: "Pending" },
    { id: 2, title: "ANC tracking (Meena Devi)", zone: "Rampur", status: "Overdue", urgent: true },
    { id: 3, title: "Child immunization follow-up", zone: "Zone B", status: "Scheduled" },
    { id: 4, title: "TB medication check", zone: "Sundarpur", status: "Pending" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-teal-900 pt-10 pb-20 px-6 rounded-b-[40px] shadow-2xl shadow-teal-900/30 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center text-white font-bold text-lg border border-teal-700/50">S</div>
            <span className="text-white font-bold text-lg tracking-tight">SehatSetu</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-teal-800/50 rounded-full flex items-center justify-center text-sm border border-teal-700/30">🔔</div>
             <div className="w-10 h-10 bg-teal-700 rounded-full border-2 border-teal-500/30 flex items-center justify-center text-lg overflow-hidden shadow-inner">👤</div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Welcome, Lakshmi Singh</h1>
          <p className="text-teal-200/60 text-xs font-bold uppercase tracking-widest">{today}</p>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="px-6 -mt-10 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Visits</span>
            <span className="text-xl font-black text-slate-900">{patients.length}</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Critical</span>
            <span className="text-xl font-black text-red-600">{criticalCount}</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Anemia</span>
            <span className="text-xl font-black text-orange-500">2</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Today's Tasks</h2>
          <button className="text-teal-600 text-xs font-bold">View Calendar</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {tasks.map(task => (
            <div key={task.id} className={`flex-shrink-0 w-48 p-4 rounded-3xl border ${task.urgent ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'} shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-red-500' : 'bg-teal-500'}`} />
                <span className={`text-[10px] font-bold uppercase ${task.urgent ? 'text-red-600' : 'text-slate-400'}`}>{task.status}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-800 mb-1 leading-snug">{task.title}</h3>
              <p className="text-[9px] text-slate-500 font-medium">{task.zone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Patient List */}
      <div className="px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-900 leading-tight">Priority Follow-ups</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Prioritization Active</p>
          </div>
          <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full flex items-center gap-2 border border-teal-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white h-32 rounded-3xl animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-center mb-6 shadow-sm">
            <p className="text-amber-800 text-sm font-bold mb-2">Network Error</p>
            <p className="text-amber-700 text-xs">Could not sync with field server. Showing offline data.</p>
          </div>
        ) : null}

        {!loading && (
          <div className="space-y-4">
            {patients.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/patient/${p.id}`)}
                className="bg-white p-5 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-teal-500/30 transition-all group active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 shadow-inner">
                      {p.is_pregnant ? '🤰' : (p.age > 60 ? '👴' : '👤')}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base group-hover:text-teal-700 transition-colors">{p.name}</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{p.village} · Age {p.age}</p>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">ID: {p.id}</span>
                         <span className="text-[9px] font-bold text-slate-400">Last visit: {p.lastVisit}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black tracking-widest uppercase ${badgeStyles[p.level] || badgeStyles.LOW}`}>
                    {p.level}
                  </div>
                </div>
                
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100/50 mb-4 shadow-inner">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">🤖</span>
                    <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                      {p.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full ${textStyles[p.level]} bg-current`} style={{ width: `${p.score}%` }} />
                    </div>
                    <span className={`text-xs font-black ${textStyles[p.level]}`}>{p.score}</span>
                  </div>
                  <button className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 transition-colors">
                    Open Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
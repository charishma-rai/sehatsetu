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

export default function Dashboard() {
  const navigate = useNavigate();
  const { patients, metrics, loading, error } = usePatients();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-teal-900 pt-10 pb-20 px-6 rounded-b-[40px] shadow-2xl shadow-teal-900/30 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center text-white font-bold text-lg border border-teal-700/50 italic">S</div>
            <span className="text-white font-black text-xl tracking-tight">SehatSetu</span>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/requests')} className="relative w-10 h-10 bg-teal-800/50 rounded-full flex items-center justify-center text-lg border border-teal-700/30 hover:bg-teal-700 transition-colors">
                🚑
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-teal-900"></span>
             </button>
             <div className="w-10 h-10 bg-teal-700 rounded-full border-2 border-teal-500/30 flex items-center justify-center text-lg shadow-inner">👤</div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome, Lakshmi Singh</h1>
          <p className="text-teal-200/60 text-xs font-bold uppercase tracking-widest">{today}</p>
        </div>
      </header>

      {/* Dynamic Metrics */}
      <div className="px-6 -mt-10 mb-8">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-center pl-6">
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Total Patients</span>
            <span className="text-3xl font-black text-slate-900">{metrics.total}</span>
          </div>
          <div className="bg-red-50 p-4 rounded-3xl shadow-xl shadow-red-900/5 border border-red-100 flex flex-col justify-center pl-6">
            <span className="text-red-400 text-[9px] font-black uppercase tracking-widest mb-1">High Risk / Critical</span>
            <span className="text-3xl font-black text-red-600">{metrics.critical}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 p-4 rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 flex flex-col justify-center pl-6">
            <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mb-1">Today's Visits</span>
            <span className="text-xl font-black text-emerald-700">{metrics.today_visits}</span>
          </div>
          <div className="bg-orange-50 p-4 rounded-3xl shadow-xl shadow-orange-900/5 border border-orange-100 flex flex-col justify-center pl-6">
            <span className="text-orange-500 text-[9px] font-black uppercase tracking-widest mb-1">Pending Follow-ups</span>
            <span className="text-xl font-black text-orange-700">{metrics.pending_followups}</span>
          </div>
        </div>
      </div>

      {/* Action Hub */}
      <div className="px-6 mb-8">
         <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
         <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/register')} className="bg-white border-2 border-dashed border-teal-200 text-teal-700 p-5 rounded-3xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all flex flex-col items-center gap-2 shadow-sm">
              <span className="text-3xl mb-1">📝</span>
              Register Patient
            </button>
            <button onClick={() => navigate('/requests')} className="bg-white border-2 border-dashed border-slate-200 text-slate-600 p-5 rounded-3xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all flex flex-col items-center gap-2 shadow-sm relative">
              {metrics.pending_requests > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">
                  {metrics.pending_requests || 3}
                </span>
              )}
              <span className="text-3xl mb-1">🚑</span>
              Community Requests
            </button>
         </div>
      </div>

      {/* Priority Patient List */}
      <div className="px-6 mb-8">
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
            <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
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
            <p className="text-amber-700 text-xs">Could not sync with field server. Retrying...</p>
          </div>
        ) : null}

        {!loading && (
          <div className="space-y-4">
            {patients.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/patient/${p.id}`)}
                className="bg-white p-5 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-teal-500/30 transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 shadow-inner">
                      {p.type === 'maternal' ? '🤰' : (p.type === 'child' ? '👶' : (p.age > 60 ? '👴' : '👤'))}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base group-hover:text-teal-700 transition-colors">{p.name}</h3>
                      <div className="flex gap-2 items-center mt-0.5">
                         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{p.village} · Age {p.age}</p>
                         {p.type === 'maternal' && <span className="bg-pink-100 text-pink-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">ANC</span>}
                         {p.type === 'child' && <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Child</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
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

      {/* Activity Timeline */}
      <div className="px-6 pb-8">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Field Activity Timeline</h2>
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-10 w-0.5 h-full bg-slate-100 z-0"></div>
           
           <div className="space-y-6 relative z-10">
              <div className="flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-teal-100 border-4 border-white flex items-center justify-center text-xs z-10 flex-shrink-0">✓</div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">10 Mins Ago</p>
                    <p className="text-xs font-bold text-slate-800">Visit completed for <span className="text-teal-700">Lakshmi Bai</span></p>
                 </div>
              </div>
              <div className="flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-orange-100 border-4 border-white flex items-center justify-center text-xs z-10 flex-shrink-0">📷</div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">1 Hour Ago</p>
                    <p className="text-xs font-bold text-slate-800">VisionCare flagged Severe Anemia for <span className="text-orange-600">Sunita Yadav</span></p>
                 </div>
              </div>
              <div className="flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-red-100 border-4 border-white flex items-center justify-center text-xs z-10 flex-shrink-0">🚑</div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">3 Hours Ago</p>
                    <p className="text-xs font-bold text-slate-800">Transport Request received from <span className="text-red-600">Meena Devi</span> (Hospital Accompaniment)</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
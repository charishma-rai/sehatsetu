import React from "react";
import { useNavigate } from "react-router-dom";
import usePatients from "./hooks/usePatients";

const badgeStyles = {
  HIGH: "bg-red-500 text-white shadow-sm shadow-red-900/10",
  MEDIUM: "bg-amber-500 text-white shadow-sm shadow-amber-900/10",
  LOW: "bg-emerald-500 text-white shadow-sm shadow-emerald-900/10",
};

const textStyles = {
  HIGH: "text-red-600",
  MEDIUM: "text-amber-600",
  LOW: "text-emerald-600",
};

function Dashboard() {
  const navigate = useNavigate();
  const { patients, loading, error } = usePatients();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const highRiskCount = patients.filter((p) => p.level === "HIGH" || p.level === "CRITICAL").length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-primary pt-12 pb-20 px-6 rounded-b-[40px] shadow-lg shadow-teal-900/20 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">से</div>
            <span className="text-white font-bold text-lg tracking-tight">SehatSetu</span>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">👤</div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Namaskar, Suman 🙏</h1>
          <p className="text-teal-100/80 text-sm font-medium tracking-wide">📅 {today}</p>
        </div>
      </header>

      {/* Stats Section */}
      <div className="px-6 -mt-12 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100 flex flex-col items-center text-center">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Patients Today</span>
            <span className="text-3xl font-bold text-slate-900">{patients.length}</span>
            <span className="text-primary text-[10px] font-bold mt-1 uppercase">आज के मरीज़</span>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100 flex flex-col items-center text-center">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">High Risk</span>
            <span className="text-3xl font-bold text-amber-DEFAULT">{highRiskCount}</span>
            <span className="text-amber-DEFAULT text-[10px] font-bold mt-1 uppercase">उच्च जोखिम</span>
          </div>
        </div>
      </div>

      {/* Patient List Section */}
      <div className="px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Priority List / प्राथमिकता सूची</h2>
          <span className="text-primary text-xs font-bold bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider">AI Sorted</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white h-32 rounded-3xl animate-pulse shadow-soft border border-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-center mb-6">
            <p className="text-amber-dark text-sm font-semibold mb-2">⚠️ Backend connection lost</p>
            <p className="text-amber-700 text-xs">Showing fallback patient records.</p>
          </div>
        ) : null}

        {!loading && (
          <div className="space-y-4">
            {patients.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/patient/${p.id}`)}
                className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100 hover:border-primary/30 transition-all group active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl font-bold text-slate-400">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-slate-400 text-xs font-medium">📍 {p.village} · Age {p.age}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${badgeStyles[p.level] || badgeStyles.LOW}`}>
                    {p.level || "LOW"}
                  </div>
                </div>
                
                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 mb-4">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    ⚠️ <span className="text-slate-700">{p.reason}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Risk Score</span>
                    <span className={`text-sm font-black ${textStyles[p.level] || textStyles.LOW}`}>{p.score}</span>
                  </div>
                  <button className="text-primary text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Nav Placeholder */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-white/90 backdrop-blur-md h-16 rounded-full shadow-2xl border border-slate-100 flex items-center justify-around px-6 z-20">
        <button className="text-primary text-2xl">🏠</button>
        <button className="text-slate-300 text-2xl">👥</button>
        <button className="text-slate-300 text-2xl">📊</button>
        <button className="text-slate-300 text-2xl">⚙️</button>
      </div>
    </div>
  );
}

export default Dashboard;
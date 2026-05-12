import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usePatients from "./hooks/usePatients";

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients: patientsData, loading } = usePatients();

  const patient = patientsData.find((p) => p.id === Number(id));

  const [visited, setVisited] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Patient Record...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-8 text-center">
        <span className="text-6xl mb-6">😕</span>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Not Found</h2>
        <p className="text-slate-500 mb-8">This record might have been removed or moved.</p>
        <button 
          onClick={() => navigate("/dashboard")}
          className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const riskLevelColor = {
    CRITICAL: "text-red-600",
    HIGH: "text-red-500",
    MEDIUM: "text-amber-500",
    LOW: "text-emerald-500",
  }[patient.level] || "text-slate-500";

  const riskBgColor = {
    CRITICAL: "bg-red-50",
    HIGH: "bg-red-50",
    MEDIUM: "bg-amber-50",
    LOW: "bg-emerald-50",
  }[patient.level] || "bg-slate-50";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-all"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-slate-900 truncate">{patient.name}</h1>
      </header>

      <div className="px-6 py-8">
        {/* Risk Gauge Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-soft border border-slate-100 flex flex-col items-center mb-6">
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            {/* Simple Circular Progress (SVG) */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 - (552.92 * patient.score) / 100}
                className={riskLevelColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black ${riskLevelColor}`}>{patient.score}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Risk Score</span>
            </div>
          </div>
          
          <div className={`px-6 py-2 rounded-full font-black text-xs tracking-[0.2em] uppercase ${riskLevelColor} ${riskBgColor}`}>
            {patient.level} RISK
          </div>
        </div>

        {/* AI Reason Card */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 mb-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">AI Reason / कारण</h3>
          <div className="flex gap-4 items-start">
            <span className="text-2xl mt-1">💡</span>
            <p className="text-slate-700 font-medium leading-relaxed">
              {patient.reason}
            </p>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: "BP Systolic", val: patient.bp_systolic || "120", sub: "mmHg", icon: "💓" },
            { label: "SpO2 Level", val: patient.spo2 || "98", sub: "%", icon: "🫁" },
            { label: "Village", val: patient.village, icon: "📍" },
            { label: "Age", val: `${patient.age} Y`, icon: "🎂" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                <span className="text-sm">{item.icon}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{item.val}</span>
                {item.sub && <span className="text-[10px] font-bold text-slate-400 uppercase">{item.sub}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate(`/scan/${patient.id}`)}
            className="w-full bg-primary hover:bg-teal-dark text-white font-bold py-5 rounded-2xl shadow-lg shadow-teal-900/10 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <span className="text-xl">👁️</span>
            Run Anemia Scan (VisionCare)
          </button>
          
          <button
            onClick={() => setVisited(!visited)}
            className={`w-full font-bold py-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
              visited 
                ? "bg-emerald-50 border-emerald-500 text-emerald-600" 
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="text-xl">{visited ? "✅" : "🔘"}</span>
            {visited ? "Visited Today / आज का दौरा पूरा" : "Mark as Visited / दौरा चिह्नित करें"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientDetail;
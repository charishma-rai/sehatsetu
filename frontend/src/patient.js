import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VisitForm from "./components/VisitForm";

const badgeStyles = {
  CRITICAL: "bg-red-600 text-white",
  HIGH: "bg-orange-500 text-white",
  MODERATE: "bg-amber-500 text-white",
  LOW: "bg-emerald-500 text-white",
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);

  const fetchPatient = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/patient/${id}`);
      const data = await res.json();
      if (data.success) {
        setPatient(data.patient);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse">Loading Profile...</div>;
  if (!patient) return <div className="p-10 text-center font-bold text-red-500">Patient Not Found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 sticky top-0 z-10 border-b flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400">←</button>
        <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">Patient Case File</h1>
        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">📋</div>
      </header>

      {/* Profile Card */}
      <div className="p-6">
        <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden mb-6">
           <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${badgeStyles[patient.level]}`}>
             {patient.level}
           </div>
           
           <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl border border-slate-100 shadow-inner">
                {patient.is_pregnant ? '🤰' : (patient.age > 60 ? '👴' : '👤')}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight mb-1">{patient.name}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{patient.village} · ID: {patient.id}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
                 <p className="text-base font-black text-slate-800">{patient.age} Years</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                 <p className="text-base font-black text-slate-800">{patient.is_pregnant ? 'Pregnant' : 'General'}</p>
              </div>
           </div>

           <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Index</span>
                 <span className="text-xs font-black text-slate-900">{patient.score}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${patient.score > 75 ? 'bg-red-600' : 'bg-teal-500'}`} style={{ width: `${patient.score}%` }} />
              </div>
           </div>
        </div>

        {/* AI Insight */}
        <div className="bg-teal-900 rounded-[32px] p-6 text-white mb-6 shadow-xl shadow-teal-900/20">
          <div className="flex items-center gap-2 mb-3">
             <span className="text-lg">🤖</span>
             <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-300">AI Risk Reason</h3>
          </div>
          <p className="text-sm font-bold leading-relaxed mb-4">
            {patient.reason}
          </p>
          <div className="flex gap-2">
            {patient.conditions.map((c, i) => (
              <span key={i} className="text-[9px] font-black bg-white/10 px-2 py-1 rounded-md uppercase border border-white/5">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <button 
             onClick={() => setShowVisitForm(true)}
             className="bg-teal-700 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-teal-900/20 active:scale-95 transition-all"
           >
             Start Field Visit
           </button>
           <button 
             onClick={() => navigate(`/scan/${patient.id}`)}
             className="bg-white text-teal-700 border-2 border-teal-700/20 p-5 rounded-3xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
           >
             VisionCare Scan
           </button>
        </div>

        {/* Latest Vitals */}
        <div className="mb-8">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Latest Clinical Vitals</h3>
           <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Pressure</p>
                <p className="text-base font-black text-slate-800">{patient.bp_systolic}/{patient.bp_diastolic} <span className="text-[10px] text-slate-400 font-bold ml-1">mmHg</span></p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SPO2 Level</p>
                <p className="text-base font-black text-teal-600">{patient.spo2}% <span className="text-[10px] text-slate-400 font-bold ml-1">Oxygen</span></p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Temperature</p>
                <p className="text-base font-black text-slate-800">{patient.temperature}°F</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Anemia Screening</p>
                <p className="text-xs font-black text-orange-600 uppercase tracking-wider">{patient.visioncare_result || 'Pending'}</p>
              </div>
           </div>
        </div>

        {/* Visit History */}
        <div>
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Visit Logs & History</h3>
           <div className="space-y-3">
              {patient.history && patient.history.length > 0 ? patient.history.map((h, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                   <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 text-xs font-bold">
                     {h.date.split(' ')[0]}
                   </div>
                   <div>
                      <h4 className="text-xs font-black text-slate-800 mb-0.5">{h.type}</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{h.notes}</p>
                   </div>
                </div>
              )) : (
                <div className="bg-slate-50 p-6 rounded-2xl text-center border-2 border-dashed border-slate-200">
                   <p className="text-xs font-bold text-slate-400 italic">No recent visit logs found for this patient.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {showVisitForm && (
        <VisitForm 
          patient={patient} 
          onCancel={() => setShowVisitForm(false)} 
          onSubmit={(updatedPatient) => {
            setPatient(updatedPatient);
            setShowVisitForm(false);
          }}
        />
      )}
    </div>
  );
}
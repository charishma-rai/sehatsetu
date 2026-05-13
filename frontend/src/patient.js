import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VisitForm from "./components/VisitForm";

const badgeStyles = {
  CRITICAL: "bg-red-600 text-white shadow-lg shadow-red-900/20",
  HIGH: "bg-orange-500 text-white shadow-md shadow-orange-900/10",
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

  if (loading) return <div className="min-h-screen bg-slate-50 p-10 flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading Patient Data...</div>;
  if (!patient) return <div className="min-h-screen bg-slate-50 p-10 flex items-center justify-center font-bold text-red-500">Patient Not Found</div>;

  const isHighBP = patient.bp_systolic > 140 || patient.bp_diastolic > 90;
  const isLowSpo2 = patient.spo2 < 93;
  const hasFever = patient.temperature > 99.5;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 sticky top-0 z-10 border-b border-slate-100 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">←</button>
        <h1 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Case Management</h1>
        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-700">📋</div>
      </header>

      <div className="p-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden mb-6">
           <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${badgeStyles[patient.level]}`}>
             {patient.level} RISK
           </div>
           
           <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl border border-slate-100 shadow-inner">
                {patient.type === 'maternal' ? '🤰' : (patient.type === 'child' ? '👶' : (patient.age > 60 ? '👴' : '👤'))}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight mb-1">{patient.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{patient.village}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age {patient.age}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">PID: {patient.id} · {patient.type} Profile</p>
              </div>
           </div>

           <div className="flex flex-col gap-3">
              <div className="flex items-end justify-between px-2">
                 <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Calculated Risk Index</span>
                   <span className="text-2xl font-black text-slate-900 leading-none">{patient.score}<span className="text-sm text-slate-400">/100</span></span>
                 </div>
                 <div className="text-right">
                    {patient.score > 50 ? <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded uppercase tracking-widest">Action Required</span> : <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">Stable</span>}
                 </div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full transition-all duration-1000 ${patient.score >= 76 ? 'bg-red-600' : (patient.score >= 51 ? 'bg-orange-500' : 'bg-teal-500')}`} style={{ width: `${patient.score}%` }} />
              </div>
           </div>
        </div>

        {/* Dynamic AI Reasoning */}
        <div className={`rounded-[32px] p-6 mb-6 shadow-xl ${patient.score >= 76 ? 'bg-red-900 text-white shadow-red-900/20' : 'bg-teal-900 text-white shadow-teal-900/20'}`}>
          <div className="flex items-center gap-2 mb-3">
             <span className="text-xl">🤖</span>
             <h3 className={`text-[10px] font-black uppercase tracking-widest ${patient.score >= 76 ? 'text-red-300' : 'text-teal-300'}`}>RiskSense AI Analysis</h3>
          </div>
          <p className="text-sm font-bold leading-relaxed mb-4 tracking-wide">
            {patient.reason}
          </p>
          <div className="flex flex-wrap gap-2">
            {patient.conditions && patient.conditions.map((c, i) => (
              <span key={i} className="text-[9px] font-black bg-white/10 px-2 py-1 rounded-md uppercase border border-white/10">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Smart Workflow Actions */}
        <div className="mb-8">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">ASHA Workflow Actions</h3>
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowVisitForm(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white p-4 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-teal-900/20 transition-all flex flex-col items-center justify-center gap-2"
              >
                <span className="text-2xl">📝</span>
                Conduct Visit
              </button>
              <button 
                onClick={() => navigate(`/scan/${patient.id}`)}
                className="bg-white hover:bg-slate-50 border-2 border-teal-700/20 text-teal-800 p-4 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all flex flex-col items-center justify-center gap-2 shadow-sm"
              >
                <span className="text-2xl">📷</span>
                VisionCare Scan
              </button>
              <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 p-4 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all flex flex-col items-center justify-center gap-2 shadow-sm">
                <span className="text-2xl">📅</span>
                Schedule Follow-up
              </button>
              <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 p-4 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all flex flex-col items-center justify-center gap-2 shadow-sm">
                <span className="text-2xl">🏥</span>
                Refer to PHC
              </button>
           </div>
        </div>

        {/* Dynamic Vitals Dashboard */}
        <div className="mb-8">
           <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Vitals Monitor</h3>
             <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-1 rounded uppercase">Live Data</span>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
              {/* BP Card */}
              <div className={`p-5 rounded-3xl border ${isHighBP ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                   <p className={`text-[9px] font-black uppercase tracking-widest ${isHighBP ? 'text-red-500' : 'text-slate-400'}`}>Blood Pressure</p>
                   {isHighBP && <span className="text-red-500 text-xs">⚠️</span>}
                </div>
                <p className={`text-xl font-black ${isHighBP ? 'text-red-700' : 'text-slate-800'}`}>
                  {patient.bp_systolic}/{patient.bp_diastolic}
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">mmHg</p>
              </div>

              {/* SpO2 Card */}
              <div className={`p-5 rounded-3xl border ${isLowSpo2 ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                   <p className={`text-[9px] font-black uppercase tracking-widest ${isLowSpo2 ? 'text-red-500' : 'text-slate-400'}`}>Blood Oxygen</p>
                   {isLowSpo2 && <span className="text-red-500 text-xs">⚠️</span>}
                </div>
                <p className={`text-xl font-black ${isLowSpo2 ? 'text-red-700' : 'text-teal-600'}`}>
                  {patient.spo2}%
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">SpO2 Level</p>
              </div>

              {/* Temp Card */}
              <div className={`p-5 rounded-3xl border ${hasFever ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                   <p className={`text-[9px] font-black uppercase tracking-widest ${hasFever ? 'text-orange-500' : 'text-slate-400'}`}>Temperature</p>
                   {hasFever && <span className="text-orange-500 text-xs">⚠️</span>}
                </div>
                <p className={`text-xl font-black ${hasFever ? 'text-orange-700' : 'text-slate-800'}`}>
                  {patient.temperature}°F
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Body Temp</p>
              </div>

              {/* VisionCare Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">VisionCare Screen</p>
                <p className={`text-sm font-black leading-tight ${patient.visioncare_result?.includes('Severe') ? 'text-red-600' : (patient.visioncare_result?.includes('Moderate') ? 'text-orange-600' : 'text-teal-600')}`}>
                  {patient.visioncare_result || 'Pending Scan'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">AI Model Tool</p>
              </div>
           </div>
        </div>

        {/* Contextual Modules (Maternal / Child) */}
        {patient.type === 'maternal' && (
           <div className="mb-8 bg-pink-50/50 rounded-[32px] p-6 border border-pink-100 shadow-sm">
              <h3 className="text-[10px] font-black text-pink-800 uppercase tracking-widest mb-4">Maternal Health Tracking</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[9px] font-black text-pink-600 uppercase tracking-widest mb-1">Pregnancy Stage</p>
                    <p className="text-sm font-black text-slate-800">Month {patient.pregnancy_month}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-pink-600 uppercase tracking-widest mb-1">ANC Compliance</p>
                    <p className={`text-sm font-black ${patient.anc_missed > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {patient.anc_missed > 0 ? `${patient.anc_missed} Missed` : 'On Track'}
                    </p>
                 </div>
                 <div className="col-span-2 mt-2 bg-white p-4 rounded-2xl border border-pink-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Upcoming Delivery Plan</p>
                    <p className="text-xs font-bold text-slate-700">Institutional Delivery: <span className="text-emerald-600">Pending Confirmation</span></p>
                 </div>
              </div>
           </div>
        )}

        {patient.type === 'child' && (
           <div className="mb-8 bg-blue-50/50 rounded-[32px] p-6 border border-blue-100 shadow-sm">
              <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-4">Pediatric Monitoring</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Immunization</p>
                    <p className={`text-sm font-black ${patient.immunization_overdue ? 'text-red-600' : 'text-emerald-600'}`}>
                      {patient.immunization_overdue ? 'OVERDUE ⚠️' : 'Up to Date'}
                    </p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Fever Log</p>
                    <p className={`text-sm font-black ${patient.fever_days > 2 ? 'text-orange-600' : 'text-slate-800'}`}>
                      {patient.fever_days || 0} Days
                    </p>
                 </div>
              </div>
           </div>
        )}

        {/* Health Trends Visualizer (Mock for Prototype) */}
        <div className="mb-8">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Health Trajectory</h3>
           <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Score Trend (Last 3 Visits)</p>
              <div className="flex items-end justify-between h-24 pt-4 pb-2 border-b-2 border-slate-100 px-2">
                 <div className="flex flex-col items-center justify-end h-full">
                    <div className="w-8 bg-teal-200 rounded-t-md" style={{height: '40%'}}></div>
                    <p className="text-[8px] font-black text-slate-400 mt-2 uppercase">Visit 1</p>
                 </div>
                 <div className="flex flex-col items-center justify-end h-full">
                    <div className="w-8 bg-orange-300 rounded-t-md" style={{height: '70%'}}></div>
                    <p className="text-[8px] font-black text-slate-400 mt-2 uppercase">Visit 2</p>
                 </div>
                 <div className="flex flex-col items-center justify-end h-full">
                    <div className={`w-8 rounded-t-md ${patient.score > 75 ? 'bg-red-500' : 'bg-teal-500'}`} style={{height: `${Math.max(20, patient.score)}%`}}></div>
                    <p className="text-[8px] font-black text-slate-400 mt-2 uppercase">Current</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Interactive Visit History */}
        <div>
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Timeline & Care Logs</h3>
           <div className="space-y-4 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
              {patient.history && patient.history.length > 0 ? patient.history.map((h, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                   <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-teal-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-4"></div>
                   <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="text-xs font-black text-slate-900">{h.type}</h4>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{h.date.split(' ')[0]} {h.date.split(' ')[1]}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">{h.notes}</p>
                   </div>
                </div>
              )) : (
                <div className="bg-slate-50 p-6 rounded-3xl text-center border-2 border-dashed border-slate-200 relative z-10 ml-8">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No visit logs recorded yet.</p>
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
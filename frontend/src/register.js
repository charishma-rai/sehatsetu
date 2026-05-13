import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("maternal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", age: "", village: "", phone: "",
    is_pregnant: 1, pregnancy_month: 1, anc_missed: 0,
    bp_systolic: 120, bp_diastolic: 80, hemoglobin: "",
    previous_complications: "", expected_delivery: "",
    institutional_delivery: false, danger_symptoms: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = { ...formData };
      if (activeTab === "child") {
        payload.is_pregnant = 0;
        payload.type = "child";
      } else {
        payload.type = "maternal";
        // Calculate risks
        if (formData.bp_systolic > 140) payload.conditions = ["Hypertension detected"];
        if (formData.hemoglobin && parseFloat(formData.hemoglobin) < 10.0) {
           payload.conditions = [...(payload.conditions || []), "Low Hemoglobin Alert"];
           payload.visioncare_result = "Moderate Anemia (Self-reported Hb)";
        }
      }

      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/patient/${data.patient_id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-teal-900 pt-10 pb-6 px-6 shadow-lg shadow-teal-900/20 sticky top-0 z-10 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate(-1)} className="text-white text-xl">←</button>
          <h1 className="text-xl font-black text-white tracking-tight">New Registration</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 px-6 mt-6 mb-6">
        <button
          onClick={() => setActiveTab("maternal")}
          className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "maternal" ? "bg-teal-700 text-white shadow-md shadow-teal-900/20" : "bg-white text-slate-400 border border-slate-200"
          }`}
        >
          Maternal
        </button>
        <button
          onClick={() => setActiveTab("child")}
          className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "child" ? "bg-teal-700 text-white shadow-md shadow-teal-900/20" : "bg-white text-slate-400 border border-slate-200"
          }`}
        >
          Child Health
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-2">General Details</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Patient Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-teal-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Age</label>
              <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-teal-500 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Village</label>
              <input required type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-teal-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {activeTab === "maternal" && (
          <div className="bg-teal-50/50 p-6 rounded-3xl border border-teal-100 shadow-sm space-y-4">
            <h2 className="text-[10px] font-black text-teal-800 uppercase tracking-widest mb-2 border-b border-teal-200 pb-2">Maternal Health Data</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pregnancy Month</label>
                <select value={formData.pregnancy_month} onChange={e => setFormData({...formData, pregnancy_month: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-teal-500 focus:outline-none">
                  {[1,2,3,4,5,6,7,8,9].map(m => <option key={m} value={m}>Month {m}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Expected Delivery</label>
                <input type="date" value={formData.expected_delivery} onChange={e => setFormData({...formData, expected_delivery: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-teal-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">BP Systolic</label>
                <input type="number" value={formData.bp_systolic} onChange={e => setFormData({...formData, bp_systolic: e.target.value})} className={`w-full bg-white border ${formData.bp_systolic > 140 ? 'border-red-500 text-red-600' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold focus:outline-none`} />
                {formData.bp_systolic > 140 && <p className="text-[9px] text-red-600 font-bold">High BP Alert</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hemoglobin (Hb)</label>
                <input type="number" step="0.1" placeholder="e.g. 11.0" value={formData.hemoglobin} onChange={e => setFormData({...formData, hemoglobin: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Danger Symptoms (if any)</label>
              <input type="text" placeholder="e.g. Severe headache, swelling" value={formData.danger_symptoms} onChange={e => setFormData({...formData, danger_symptoms: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="inst_delivery" checked={formData.institutional_delivery} onChange={e => setFormData({...formData, institutional_delivery: e.target.checked})} className="w-5 h-5 accent-teal-600" />
              <label htmlFor="inst_delivery" className="text-xs font-bold text-slate-700">Institutional Delivery Planned?</label>
            </div>
          </div>
        )}

        {activeTab === "child" && (
           <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
              <h2 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2 border-b border-emerald-200 pb-2">Child Growth & Monitoring</h2>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Weight (kg)</label>
                    <input type="number" step="0.1" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Height (cm)</label>
                    <input type="number" step="0.1" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                 </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-emerald-200 mt-4">
                 <input type="checkbox" id="imm_overdue" onChange={e => setFormData({...formData, immunization_overdue: e.target.checked ? 1 : 0})} className="w-5 h-5 accent-emerald-600" />
                 <label htmlFor="imm_overdue" className="text-xs font-bold text-red-600">Immunization Overdue?</label>
              </div>
           </div>
        )}

        <button type="submit" disabled={isSubmitting} className="w-full bg-teal-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
          {isSubmitting ? "Registering..." : `Register ${activeTab === 'maternal' ? 'Pregnant Woman' : 'Child Patient'}`}
        </button>
      </form>
    </div>
  );
}

import React, { useState } from "react";

export default function VisitForm({ patient, onCancel, onSubmit }) {
  const [formData, setFormData] = useState({
    bp_systolic: patient.bp_systolic || 120,
    bp_diastolic: patient.bp_diastolic || 80,
    spo2: patient.spo2 || 98,
    temperature: patient.temperature || 98.6,
    medication_adherence: patient.medication_adherence || 1.0,
    notes: "",
    is_pregnant: patient.is_pregnant || 0,
    anemia_result: patient.visioncare_result || "Not Screened",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          ...formData,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        onSubmit(result.patient);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto pb-10">
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-400 text-xl">✕</button>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Record Field Visit</h2>
        <div className="w-6" />
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-8">
        {/* Patient Context */}
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
           <div className="text-2xl">👩‍⚕️</div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visiting</p>
              <h3 className="text-base font-black text-slate-900">{patient.name}</h3>
           </div>
        </div>

        {/* Vitals Section */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Vitals</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">BP Systolic</label>
              <input 
                type="number" 
                value={formData.bp_systolic}
                onChange={e => setFormData({...formData, bp_systolic: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">BP Diastolic</label>
              <input 
                type="number" 
                value={formData.bp_diastolic}
                onChange={e => setFormData({...formData, bp_diastolic: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">SpO2 (%)</label>
              <input 
                type="number" 
                value={formData.spo2}
                onChange={e => setFormData({...formData, spo2: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Temp (°F)</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.temperature}
                onChange={e => setFormData({...formData, temperature: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Maternal Section */}
        {patient.is_pregnant === 1 && (
          <section className="bg-teal-50/30 p-6 rounded-[32px] border border-teal-100/50">
            <h3 className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-4">Maternal Health Tracking</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">ANC Visit Completed?</span>
                  <input type="checkbox" className="w-5 h-5 accent-teal-600" />
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">Iron Tablets Taken?</span>
                  <input type="checkbox" className="w-5 h-5 accent-teal-600" defaultChecked />
               </div>
            </div>
          </section>
        )}

        {/* Adherence */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Medication Adherence</h3>
          <div className="flex gap-2">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setFormData({...formData, medication_adherence: val})}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black border transition-all ${
                  formData.medication_adherence === val 
                    ? 'bg-teal-600 border-teal-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {val * 100}%
              </button>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Notes</h3>
          <textarea 
            placeholder="Describe observations, symptoms, or concerns..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold h-32 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </section>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-800 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-teal-900/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Syncing Data..." : "Submit Field Visit"}
          </button>
          <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
            Data will be synced with PHC Central Server
          </p>
        </div>
      </form>
    </div>
  );
}

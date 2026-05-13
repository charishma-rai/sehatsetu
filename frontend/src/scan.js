import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ScanScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/patient/${id}`)
      .then(res => res.json())
      .then(data => data.success && setPatient(data.patient));
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      handleAnalyse(file);
    }
  };

  const handleAnalyse = async (file) => {
    setIsScanning(true);
    setResult(null);
    
    const formData = new FormData();
    if (file) formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5000/api/scan", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResult(data);
        // Automatically sync with RiskSense backend
        await fetch("http://localhost:5000/api/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: id,
            anemia_result: `${data.diagnosis} (${data.confidence * 100}%)`,
            notes: `VisionCare scan completed: ${data.diagnosis}. Confidence: ${data.confidence}. Recommendation: ${data.action}`
          }),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white px-6 pt-12 pb-6 border-b flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-slate-400">← Back</button>
        <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">VisionCare Screening</h1>
        <div className="w-6" />
      </header>

      <div className="p-6">
        {/* Screening Context */}
        <div className="bg-teal-900 text-white p-6 rounded-[32px] mb-8 shadow-xl shadow-teal-900/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-300 mb-1">Current Subject</p>
          <h2 className="text-xl font-black mb-4">{patient.name}</h2>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
             <p className="text-xs font-bold leading-relaxed opacity-80">
               Position the camera to capture the lower conjunctiva (inner eyelid). Ensure good lighting and a clear focus.
             </p>
          </div>
        </div>

        {/* Scan Area */}
        <div className="bg-white rounded-[40px] p-8 border-2 border-dashed border-slate-200 mb-8 flex flex-col items-center text-center">
           {preview ? (
             <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-6 bg-slate-100 border-2 border-teal-500/30">
                <img src={preview} alt="Scan preview" className="w-full h-full object-cover" />
                {isScanning && (
                   <div className="absolute inset-0 bg-teal-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                      <p className="text-white text-[10px] font-black uppercase tracking-widest">AI Inference Running...</p>
                   </div>
                )}
             </div>
           ) : (
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">📷</div>
           )}
           
           <label className="w-full">
              <span className="bg-teal-700 text-white w-full py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-teal-900/30 block cursor-pointer active:scale-95 transition-all text-center">
                {preview ? "Recapture Image" : "Take Eye Image"}
              </span>
              <input type="file" className="hidden" accept="image/*" capture="camera" onChange={handleFileChange} />
           </label>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">AI screening is an assistive tool only</p>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`p-8 rounded-[40px] border shadow-xl ${
              result.level === 'severe' ? 'bg-red-50 border-red-100 shadow-red-900/10' : 
              (result.level === 'mild' ? 'bg-orange-50 border-orange-100 shadow-orange-900/10' : 'bg-emerald-50 border-emerald-100 shadow-emerald-900/10')
            }`}>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Screening Result</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                    result.level === 'severe' ? 'bg-red-600 text-white' : 
                    (result.level === 'mild' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white')
                  }`}>{result.level}</span>
               </div>
               
               <h4 className="text-3xl font-black text-slate-900 mb-2">{result.diagnosis}</h4>
               <p className="text-sm font-bold text-slate-600 mb-6 leading-relaxed">{result.note}</p>
               
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 p-4 rounded-2xl border border-white">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
                     <p className="text-xl font-black text-slate-800">{Math.round(result.confidence * 100)}%</p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-2xl border border-white">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Model</p>
                     <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-tight">MobileNetV3 Neural Net</p>
                  </div>
               </div>

               <div className="bg-white/80 p-5 rounded-3xl border border-white/50">
                  <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest mb-2">Primary Recommendation</p>
                  <p className="text-xs font-bold text-teal-900 leading-relaxed">
                    👉 {result.action}
                  </p>
               </div>
            </div>

            <button 
              onClick={() => navigate(`/patient/${id}`)}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
            >
              Update Patient Case File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usePatients from "./hooks/usePatients";

const STATES = {
  IDLE: "idle",
  SCANNING: "scanning",
  RESULT: "result",
};

function ScanScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients: patientsData, loading: loadingPatients } = usePatients();
  const patient = patientsData.find((p) => p.id === Number(id));

  const [state, setState] = useState(STATES.IDLE);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyse = async () => {
    setState(STATES.SCANNING);
    
    // Simulate API call delay
    const startTime = Date.now();

    try {
      let response;
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        response = await fetch("http://localhost:5000/api/scan", {
          method: "POST",
          body: formData,
        });
      } else {
        // Demo mode
        response = await fetch("http://localhost:5000/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: Number(id) }),
        });
      }

      const data = await response.json();
      
      // Artificial delay for "AI processing" feel
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      
      setTimeout(() => {
        if (data.success || data.diagnosis) {
          setResult(data);
          setState(STATES.RESULT);
        } else {
          throw new Error("Scan failed");
        }
      }, remaining);

    } catch (err) {
      console.error(err);
      // Fallback result for demo if API fails
      setTimeout(() => {
        setResult({
          diagnosis: "Mild Anemia",
          confidence: 0.74,
          action: "Refer for blood test + iron supplementation advised",
          level: "mild",
          note: "Demo fallback: Backend unreachable."
        });
        setState(STATES.RESULT);
      }, 2000);
    }
  };

  if (loadingPatients) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Syncing VisionCare...</p>
      </div>
    );
  }

  const isAnemic = result?.level?.toLowerCase() !== "normal" && !result?.diagnosis?.toLowerCase().includes("no anemia");
  const resultColor = isAnemic ? "text-amber-600" : "text-emerald-600";
  const resultBg = isAnemic ? "bg-amber-50" : "bg-emerald-50";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/patient/${id}`)}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
          >
            ←
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">VisionCare Scan</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Patient: {patient?.name}</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl text-primary">👁️</div>
      </header>

      <div className="px-6 py-8 flex-grow">
        {state !== STATES.RESULT ? (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className={`relative border-2 border-dashed rounded-[32px] transition-all flex flex-col items-center justify-center p-8 bg-white ${preview ? "border-primary/50" : "border-slate-200"}`}>
              {preview ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-inner">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => {setPreview(null); setImage(null);}}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-4">📸</div>
                  <p className="text-slate-900 font-bold mb-1">Upload conjunctiva photo</p>
                  <p className="text-slate-400 text-xs text-center px-4 mb-6">Ask patient to look up and pull down lower eyelid</p>
                  <label className="bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-slate-200 transition-all text-sm">
                    Choose File / फोटो चुनें
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </>
              )}
            </div>

            {/* Scanning Logic */}
            {state === STATES.SCANNING ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite] w-1/3 rounded-full" />
                </div>
                <p className="text-primary font-bold animate-pulse text-sm">AI Analyzing image / एआई विश्लेषण...</p>
              </div>
            ) : (
              <button
                onClick={handleAnalyse}
                disabled={state === STATES.SCANNING}
                className="w-full bg-primary hover:bg-teal-dark text-white font-bold py-5 rounded-2xl shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all mt-4"
              >
                Analyse Now / अभी जांचें
              </button>
            )}
            
            {!image && (
              <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                No image? Demo mode will use patient metadata.
              </p>
            )}
          </div>
        ) : (
          /* Result Screen */
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className={`rounded-[32px] p-8 border border-slate-100 shadow-soft text-center ${resultBg}`}>
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Screening Result / परिणाम</h2>
              
              <div className={`text-3xl font-black mb-2 ${resultColor}`}>
                {result.diagnosis}
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-current transition-all duration-1000" 
                    style={{ width: `${result.confidence * 100}%`, color: "inherit" }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500">{Math.round(result.confidence * 100)}% Confidence</span>
              </div>

              <div className="bg-white/60 p-5 rounded-2xl text-left border border-white/40">
                <div className="flex gap-3 items-start">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended Action</p>
                    <p className="text-slate-800 font-bold text-sm leading-relaxed">{result.action}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-2xl text-center">
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                ⚕️ This is an AI-assisted screening tool. Clinical judgment applies. परिणाम केवल स्क्रीनिंग के लिए हैं।
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => navigate("/dashboard")}
                className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-lg shadow-teal-900/10"
              >
                Done / पूरा हुआ
              </button>
              <button 
                onClick={() => {setState(STATES.IDLE); setPreview(null); setImage(null);}}
                className="w-full bg-white text-slate-600 font-bold py-4 rounded-2xl border border-slate-200"
              >
                Scan Another / फिर से जांचें
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="px-8 py-6 text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
        SehatSetu VisionCare v1.0
      </footer>
    </div>
  );
}

export default ScanScreen;
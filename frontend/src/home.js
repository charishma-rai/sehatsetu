import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [workerId, setWorkerId] = useState("");
  const [village, setVillage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate field worker login
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen px-8 pt-20 pb-10 bg-white">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-16">
        <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-xl shadow-teal-900/20" style={{background: 'hsl(178 65% 28%)'}}>
          <span className="text-white font-black text-4xl italic">S</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">SehatSetu</h1>
        <p className="text-teal-700 font-black tracking-[0.2em] uppercase text-[10px]">Rural Health Intelligence</p>
      </div>

      {/* Login Form */}
      <div className="flex-grow">
        <div className="mb-10 text-center">
           <h2 className="text-xl font-black text-slate-800 mb-2">Field Worker Login</h2>
           <p className="text-sm font-semibold text-slate-400">Secure access for authorized ASHA workers</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Worker ID</label>
            <input
              type="text"
              required
              placeholder="e.g. ASHA-1092"
              className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-900 placeholder:text-slate-300 shadow-inner"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Block</label>
            <input
              type="text"
              required
              placeholder="e.g. Rampur"
              className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-900 placeholder:text-slate-300 shadow-inner"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-900 hover:bg-teal-950 text-white font-black uppercase tracking-widest text-xs py-6 rounded-[32px] shadow-2xl shadow-teal-900/30 transition-all active:scale-[0.98] mt-4"
          >
            Start Session →
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] opacity-50">
          State Health Mission · 2025
        </p>
      </div>
    </div>
  );
}

export default Login;
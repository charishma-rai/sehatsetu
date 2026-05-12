import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [workerId, setWorkerId] = useState("");
  const [village, setVillage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen px-8 pt-20 pb-10 bg-white">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-16">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-teal-900/20" style={{background: 'hsl(178 65% 28%)'}}>
          <span className="text-white font-bold text-3xl">से</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">SehatSetu</h1>
        <p className="text-primary font-medium tracking-[0.15em] uppercase text-xs">Rural Health Intelligence</p>
      </div>

      {/* Login Form */}
      <div className="flex-grow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Worker ID / कार्यकर्ता आईडी</label>
            <input
              type="text"
              required
              placeholder="e.g. ASHA-1092"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Village or Block / गांव या ब्लॉक</label>
            <input
              type="text"
              required
              placeholder="e.g. Rampur"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-teal-dark text-white font-bold py-5 rounded-2xl shadow-lg shadow-teal-900/20 transition-all active:scale-[0.98] mt-4"
          >
            Aage Badhein / आगे बढ़ें →
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          Powered by AI · Built for Bharat
        </p>
      </div>
    </div>
  );
}

export default Login;
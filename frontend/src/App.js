import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./home";
import Dashboard from "./patients";
import PatientDetail from "./patient";
import ScanScreen from "./scan";
import "./App.css";

// Splash Screen Component inspired by user's reference
const SplashScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="flex flex-col items-center gap-4 animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20" style={{background: 'hsl(178 65% 28%)'}}>
        <span className="text-white font-bold text-2xl">से</span>
      </div>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SehatSetu</h1>
        <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1">Rural Health Intelligence</p>
      </div>
      <div className="mt-4 w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading/auth check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-2xl relative overflow-hidden">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patient/:id" element={<PatientDetail />} />
            <Route path="/scan/:id" element={<ScanScreen />} />
            {/* User reference paths mapped to existing screens */}
            <Route path="/risksense" element={<Dashboard />} />
            <Route path="/visioncare" element={<ScanScreen />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

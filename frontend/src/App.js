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
        <span className="text-white font-bold text-2xl">S</span>
      </div>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SehatSetu</h1>
        <p className="text-[10px] text-teal-700 font-bold uppercase tracking-[0.2em] mt-1">Rural Health Intelligence</p>
      </div>
      <div className="mt-4 w-8 h-8 border-2 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
    </div>
  </div>
);

import Schedule from "./schedule";
import Register from "./register";
import Requests from "./requests";

const Settings = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Settings & Profile</h2>
    <div className="space-y-4">
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-sm font-bold">ASHA Worker: Lakshmi Singh</p>
        <p className="text-xs text-slate-500">ID: ASHA-UP-7821</p>
      </div>
      <button className="w-full p-4 text-left text-sm font-semibold border-b">Language (English)</button>
      <button className="w-full p-4 text-left text-sm font-semibold border-b">Sync Data</button>
      <button className="w-full p-4 text-left text-sm font-semibold text-red-600">Logout</button>
    </div>
  </div>
);

import BottomNav from "./components/BottomNav";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
        <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-[0_0_50px_-12px_rgb(0,0,0,0.1)] relative overflow-hidden flex flex-col">
          <main className="flex-1 overflow-y-auto pb-24">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Dashboard />} />
              <Route path="/patient/:id" element={<PatientDetail />} />
              <Route path="/scan/:id" element={<ScanScreen />} />
              <Route path="/risksense" element={<Dashboard />} />
              <Route path="/visioncare" element={<ScanScreen />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/register" element={<Register />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate replace to="/dashboard" />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </div>
    </Router>
  );
}

export default App;

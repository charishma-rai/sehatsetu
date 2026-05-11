import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Patient from "./components/Patient";
import Scan from "./components/Scan";
import Dashboard from "./components/Dashboard";
import BottomNav from "./components/BottomNav";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto min-h-screen max-w-[430px] pb-28">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patient/:id" element={<Patient />} />
            <Route path="/scan/:id" element={<Scan />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Patient from "./components/Patient";
import Scan from "./components/Scan";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient/:id" element={<Patient />} />
          <Route path="/scan/:id" element={<Scan />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
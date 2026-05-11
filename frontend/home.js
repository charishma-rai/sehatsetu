import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import patientsData from "../data/patients";

function Home() {
  const navigate = useNavigate();

  // Keep a local visited-state overlay (not persisted)
  const [visited, setVisited] = useState(
    patientsData.reduce((acc, p) => ({ ...acc, [p.id]: false }), {})
  );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const counts = patientsData.reduce(
    (acc, p) => { acc[p.level] = (acc[p.level] || 0) + 1; return acc; },
    {}
  );

  const sorted = [...patientsData].sort((a, b) => b.score - a.score);

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="header-top">
          <span className="logo-icon">🌿</span>
          <span className="app-name">SehatSetu</span>
        </div>
        <div className="header-subtitle">ASHA Worker Dashboard</div>
        <div className="header-date">📅 {today}</div>
      </div>

      {/* Summary chips */}
      <div className="summary-bar">
        {["HIGH", "MEDIUM", "LOW"].map((lvl) => (
          <div key={lvl} className={`summary-chip chip-${lvl}`}>
            <div className="chip-num">{counts[lvl] || 0}</div>
            <div className="chip-label">{lvl}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="section-label">Today's Priority List</div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="big-icon">🎉</div>
          <p>All patients visited today!</p>
        </div>
      ) : (
        sorted.map((patient) => (
          <div
            key={patient.id}
            className="patient-card"
            onClick={() => navigate(`/patient/${patient.id}`)}
            style={{ opacity: visited[patient.id] ? 0.5 : 1 }}
          >
            {/* Avatar */}
            <div className={`avatar avatar-${patient.level}`}>
              {patient.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="card-info">
              <div className="card-name">
                {patient.name}
                {visited[patient.id] && " ✓"}
              </div>
              <div className="card-reason">{patient.reason}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                📍 {patient.village} &nbsp;|&nbsp; Age {patient.age}
              </div>
            </div>

            {/* Score */}
            <div className="card-right">
              <div className={`risk-badge badge-${patient.level}`}>
                {patient.level}
              </div>
              <div className={`score-text score-${patient.level}`}>
                {patient.score}
              </div>
            </div>
          </div>
        ))
      )}

      <div style={{ height: 32 }} />
    </div>
  );
}

export default Home;
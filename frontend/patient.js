import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import patientsData from "../data/patients";

function Patient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patientsData.find((p) => p.id === Number(id));

  const [visited, setVisited] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!patient) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <p>Patient not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          ← Go Back
        </button>
      </div>
    );
  }

  const handleVisited = () => {
    setVisited(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const riskColor = {
    HIGH: "var(--red)",
    MEDIUM: "var(--orange)",
    LOW: "var(--green)",
  }[patient.level];

  return (
    <div>
      {/* Header */}
      <div className="header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="header-top">
          <span className="logo-icon">🌿</span>
          <span className="app-name">Patient Detail</span>
        </div>
        <div className="header-subtitle">SehatSetu · ASHA Dashboard</div>
      </div>

      <div className="detail-body">
        {/* Main card */}
        <div className="detail-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="detail-name">{patient.name}</div>
              <div className={`risk-badge badge-${patient.level}`} style={{ fontSize: 12 }}>
                {patient.level} RISK
              </div>
            </div>
            <div className={`avatar avatar-${patient.level}`} style={{ width: 52, height: 52, fontSize: 22 }}>
              {patient.name.charAt(0)}
            </div>
          </div>

          {/* Score bar */}
          <div className="score-display">
            <div className="score-big" style={{ color: riskColor }}>
              {patient.score}
            </div>
            <div className="score-label">/ 100 Risk Score</div>
          </div>

          {/* Score visual bar */}
          <div style={{
            width: "100%",
            height: 8,
            background: "var(--border)",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 12,
          }}>
            <div style={{
              width: `${patient.score}%`,
              height: "100%",
              background: riskColor,
              borderRadius: 10,
              transition: "width 0.6s ease",
            }} />
          </div>

          <div className="detail-reason">
            ⚠️ <strong>Reason: </strong>{patient.reason}
          </div>
        </div>

        {/* Info rows */}
        <div className="detail-card">
          {[
            { key: "Village",    val: patient.village },
            { key: "Age",        val: `${patient.age} years` },
            { key: "Phone",      val: patient.phone },
            { key: "Last Visit", val: patient.lastVisit },
          ].map(({ key, val }) => (
            <div className="info-row" key={key}>
              <span className="info-key">{key}</span>
              <span className="info-val">{val}</span>
            </div>
          ))}
        </div>

        {/* Conditions */}
        {patient.conditions.length > 0 && (
          <div className="detail-card">
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
              Known Conditions
            </div>
            {patient.conditions.map((c) => (
              <div key={c} style={{
                display: "inline-block",
                background: "var(--orange-light)",
                color: "var(--orange)",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 13,
                fontWeight: 600,
                marginRight: 8,
                marginBottom: 6,
              }}>
                {c}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 8 }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/scan/${patient.id}`)}
          >
            👁️ Scan for Anemia (VisionCare)
          </button>

          {!visited ? (
            <button className="btn btn-secondary" onClick={handleVisited}>
              ✅ Mark as Visited
            </button>
          ) : (
            <button className="btn btn-success" disabled>
              ✅ Visited Today
            </button>
          )}
        </div>
      </div>

      {showToast && (
        <div className="toast">✅ {patient.name} marked as visited!</div>
      )}
    </div>
  );
}

export default Patient;
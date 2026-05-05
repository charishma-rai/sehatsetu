import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import patientsData from "../data/patients";

// Dummy scan results keyed by patient id
const scanResults = {
  1: { diagnosis: "Moderate Anemia",  confidence: 0.81, recommendation: "Refer to PHC immediately" },
  2: { diagnosis: "No Anemia Detected", confidence: 0.91, recommendation: "Continue routine monitoring" },
  3: { diagnosis: "No Anemia Detected", confidence: 0.88, recommendation: "Continue routine monitoring" },
  4: { diagnosis: "Mild Anemia",      confidence: 0.72, recommendation: "Refer to PHC + iron supplements" },
  5: { diagnosis: "Mild Anemia",      confidence: 0.65, recommendation: "Iron supplementation advised" },
};

const STATES = {
  IDLE:     "idle",
  SCANNING: "scanning",
  RESULT:   "result",
};

function Scan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patientsData.find((p) => p.id === Number(id));

  const [state, setState] = useState(STATES.IDLE);
  const result = scanResults[Number(id)] || {
    diagnosis: "Mild Anemia",
    confidence: 0.72,
    recommendation: "Refer to PHC",
  };

  const handleCapture = () => {
    setState(STATES.SCANNING);
    setTimeout(() => {
      setState(STATES.RESULT);
    }, 2200);
  };

  const handleReset = () => {
    setState(STATES.IDLE);
  };

  const confidencePct = Math.round(result.confidence * 100);
  const isAnemia = !result.diagnosis.toLowerCase().includes("no anemia");
  const resultColor = isAnemia ? "var(--orange)" : "var(--green)";
  const resultBorderColor = isAnemia ? "var(--orange)" : "var(--green)";
  const resultBg = isAnemia ? "var(--orange-light)" : "var(--green-light)";

  return (
    <div>
      {/* Header */}
      <div className="header">
        <button
          className="back-btn"
          onClick={() => navigate(patient ? `/patient/${id}` : "/")}
        >
          ← Back
        </button>
        <div className="header-top">
          <span className="logo-icon">👁️</span>
          <span className="app-name">VisionCare</span>
        </div>
        <div className="header-subtitle">
          AI Anemia Scan{patient ? ` · ${patient.name}` : ""}
        </div>
      </div>

      <div className={`scan-body ${state === STATES.SCANNING ? "scanning" : ""}`}>

        {/* Camera box */}
        {state !== STATES.RESULT && (
          <div className="camera-box">
            <div className="camera-corner corner-tl" />
            <div className="camera-corner corner-tr" />
            <div className="camera-corner corner-bl" />
            <div className="camera-corner corner-br" />

            {state === STATES.IDLE && (
              <>
                <div className="camera-icon">📷</div>
                <div className="camera-hint">
                  Point camera at patient's lower eyelid for anemia detection
                </div>
              </>
            )}

            {state === STATES.SCANNING && (
              <>
                <div style={{ fontSize: 56 }}>🔍</div>
                <div className="camera-hint" style={{ color: "var(--accent)" }}>
                  Analysing image… Please hold steady
                </div>
              </>
            )}
          </div>
        )}

        {/* Loading bar */}
        {state === STATES.SCANNING && (
          <>
            <div className="loading-bar">
              <div className="loading-fill" />
            </div>
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
              🤖 AI model processing…
            </p>
          </>
        )}

        {/* Capture button */}
        {state === STATES.IDLE && (
          <>
            <div style={{
              background: "var(--orange-light)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--orange)",
              fontWeight: 600,
              marginBottom: 16,
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}>
              <span>⚠️</span>
              <span>Ask patient to pull down lower eyelid gently before scanning.</span>
            </div>
            <button className="btn btn-primary" onClick={handleCapture}>
              📸 Capture Image
            </button>
          </>
        )}

        {/* Result */}
        {state === STATES.RESULT && (
          <>
            {/* Thumbnail preview replacement */}
            <div style={{
              width: "100%",
              background: "#1A202C",
              borderRadius: 14,
              height: 120,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
            }}>
              📷 Image captured
            </div>

            <div
              className="result-card"
              style={{ borderColor: resultBorderColor }}
            >
              <div className="result-title">🔬 Scan Result</div>

              <div className="result-diagnosis" style={{ color: resultColor }}>
                {result.diagnosis}
              </div>

              {/* Confidence */}
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                Confidence Level
              </div>
              <div className="confidence-row">
                <div className="conf-bar-wrap">
                  <div
                    className="conf-bar-fill"
                    style={{ width: `${confidencePct}%`, background: resultColor }}
                  />
                </div>
                <span className="conf-label" style={{ color: resultColor }}>
                  {confidencePct}%
                </span>
              </div>

              {/* Recommendation */}
              <div
                className="result-rec"
                style={{ background: resultBg, color: resultColor }}
              >
                <span>💊</span>
                <span><strong>Action:</strong> {result.recommendation}</span>
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, textAlign: "center" }}>
                ⚕️ This is an AI-assisted screening tool. Clinical judgment applies.
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                🏠 Back to Dashboard
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                🔄 Scan Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Scan;
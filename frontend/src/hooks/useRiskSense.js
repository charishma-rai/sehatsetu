import { useEffect, useMemo, useState } from "react";
import fallbackPatients from "../patients";

const API_URL = "http://localhost:5000/api/riskscore";

const extractPatientsFromResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.top_5_prioritized)) {
    return data.top_5_prioritized;
  }
  if (Array.isArray(data.patients)) {
    return data.patients;
  }
  return [];
};

const normalizePatient = (raw) => {
  const scoreValue = raw.score ?? raw.riskScore ?? raw.risk_score ?? 0;
  let score = Number(scoreValue) || 0;
  if (score >= 0 && score <= 1) {
    score = Math.round(score * 100);
  }
  const reason = raw.reason ?? raw.reasonText ?? raw.explanation ?? "";
  const riskLevel = score >= 80 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW";

  return {
    ...raw,
    riskScore: score,
    reason,
    riskLevel,
  };
};

const buildRiskSensePayload = (patientsList) => {
  return {
    patients: patientsList.map((patient) => ({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      bp_systolic: (patient.bp_systolic ?? patient.bp) || 0,
      days_since_discharge: patient.dischargeDays ?? patient.days_since_discharge ?? 0,
      diagnosis_code: patient.diagnosis_code ?? patient.diagnosis ?? "E11",
      last_visit_gap_days: patient.last_visit_gap_days ?? patient.lastVisitGapDays ?? 0,
      medication_adherence: patient.medication_adherence ?? patient.medicationAdherence ?? (patient.medication ? 0.85 : 0.4),
      missed_visits: patient.missed_visits ?? patient.missedVisits ?? patient.missed_visits_count ?? 0,
      spo2: patient.spo2 ?? 95,
    })),
  };
};

const mergeBackendWithFallback = (backendPatients, fallback) => {
  const fallbackById = new Map(fallback.map((patient) => [patient.id, patient]));
  return backendPatients.map((raw) => {
    const fallback = fallbackById.get(raw.id) || {};
    return {
      ...fallback,
      ...normalizePatient(raw),
      id: raw.id ?? fallback.id,
      name: raw.name ?? fallback.name,
    };
  });
};

export default function useRiskSense() {
  const [patients, setPatients] = useState(fallbackPatients);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchPatients = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildRiskSensePayload(fallbackPatients)),
        });

        if (!response.ok) {
          throw new Error(`Backend returned status ${response.status}`);
        }

        const data = await response.json();
        const rawPatients = extractPatientsFromResponse(data);
        if (rawPatients.length === 0) {
          throw new Error("Backend returned no patient records");
        }

        const mergedPatients = mergeBackendWithFallback(rawPatients, fallbackPatients);
        if (active) {
          setPatients(mergedPatients);
          setError(null);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message);
          setPatients(fallbackPatients);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPatients();

    return () => {
      active = false;
    };
  }, []);

  const hasBackendData = useMemo(() => error === null && !loading, [error, loading]);

  return {
    patients,
    loading,
    error,
    hasBackendData,
  };
}

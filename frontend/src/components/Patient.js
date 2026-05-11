import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useRiskSense from "../hooks/useRiskSense";

const riskStyles = {
  HIGH: 'border-red-500 text-red-700 bg-red-50',
  MEDIUM: 'border-amber-500 text-amber-700 bg-amber-50',
  LOW: 'border-emerald-500 text-emerald-700 bg-emerald-50',
};

export default function Patient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, loading, error } = useRiskSense();
  const patient = useMemo(
    () => patients.find((item) => item.id === Number(id)),
    [patients, id]
  );
  const [visited, setVisited] = useState(false);
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    if (patient) {
      setVisited(patient.lastVisit === 'today');
    }
  }, [patient]);

  if (loading) {
    return (
      <div className="px-4 pt-10 text-center text-slate-700">
        <div className="mb-4 text-5xl animate-pulse">⏳</div>
        <p className="mb-4 text-lg font-semibold">Loading patient information...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="px-4 pt-10 text-center text-slate-700">
        <div className="mb-4 text-5xl">😕</div>
        <p className="mb-4 text-lg font-semibold">Patient not found</p>
        <button className="mx-auto rounded-3xl bg-emerald-600 px-6 py-4 text-sm font-semibold text-white" onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  const handleVisited = () => setVisited(true);
  const handleEscalate = () => {
    setAlertShown(true);
    setTimeout(() => setAlertShown(false), 2400);
  };

  const isVisited = visited || patient.lastVisit === 'today';

  return (
    <main className="px-4 pt-5 pb-28">
      <button className="mb-4 inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Patient</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{patient.name}</h1>
          </div>
          <div className={`rounded-3xl border px-4 py-2 text-sm font-semibold ${riskStyles[patient.riskLevel]}`}>
            {patient.riskLevel} RISK
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Age</span>
            <strong>{patient.age}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Village</span>
            <strong>{patient.village}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Diagnosis</span>
            <strong>{patient.diagnosis}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Anemia status</span>
            <strong>{patient.anemia || 'Not scanned'}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Days since discharge</span>
            <strong>{patient.dischargeDays}</strong>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-center">
          <p className="text-sm text-slate-600">Risk score gauge</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-semibold text-slate-900 shadow-sm">{patient.riskScore}</div>
            <div className="text-sm text-slate-600">out of 100</div>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Risk factors</div>
          <div className="grid gap-2 text-sm text-slate-700">
            <div className="rounded-3xl bg-white p-3 shadow-sm">Medication adherence: <strong>{patient.medication ? 'On track' : 'Missed doses'}</strong></div>
            <div className="rounded-3xl bg-white p-3 shadow-sm">Diagnosis: <strong>{patient.diagnosis}</strong></div>
            <div className="rounded-3xl bg-white p-3 shadow-sm">Days since discharge: <strong>{patient.dischargeDays}</strong></div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button className="w-full rounded-3xl bg-emerald-600 px-5 py-4 text-base font-semibold text-white shadow-sm" onClick={() => navigate(`/scan/${patient.id}`)}>
            Start VisionCare Scan
          </button>
          <button className="w-full rounded-3xl bg-slate-900 px-5 py-4 text-base font-semibold text-white shadow-sm" onClick={handleVisited}>
            {isVisited ? 'Visited' : 'Mark Visited'}
          </button>
          <button className="w-full rounded-3xl border border-red-300 bg-white px-5 py-4 text-base font-semibold text-red-700 shadow-sm" onClick={handleEscalate}>
            Escalate to PHC
          </button>
        </div>
      </div>

      {alertShown && (
        <div className="fixed bottom-24 left-1/2 z-30 w-[calc(100%-2rem)] -translate-x-1/2 rounded-3xl bg-red-600 px-5 py-4 text-sm font-semibold text-white shadow-2xl sm:max-w-[420px]">
          PHC escalation requested for {patient.name}.
        </div>
      )}
    </main>
  );
}

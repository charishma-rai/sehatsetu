import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useRiskSense from "../hooks/useRiskSense";

const badgeStyles = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-emerald-100 text-emerald-700',
};

const dotStyles = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-emerald-500',
};

export default function Home() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const { patients, loading, error } = useRiskSense();
  const ordered = useMemo(
    () => [...patients].sort((a, b) => b.riskScore - a.riskScore),
    [patients]
  );

  return (
    <main className="px-4 pt-5 pb-28">
      <section className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-2xl">🌿</div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">SehatSetu – सेहत + सेतु</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Know who to visit. Know what to look for.</h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">Today · {today}</p>
      </section>

      <section className="mt-5">
        <div className="mb-3 rounded-3xl bg-slate-100 p-4 text-sm text-slate-700">
          RiskSense priorities for today's ASHA visits. Tap a card to review the patient and start VisionCare.
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-5 text-sm text-slate-600 shadow-sm">
            Fetching latest risk data from backend...
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-3xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
            Backend unavailable, showing local patients. Error: {error}
          </div>
        )}

        <div className="space-y-4">
          {ordered.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => navigate(`/patient/${patient.id}`)}
              className="w-full rounded-[32px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`h-3.5 w-3.5 rounded-full ${dotStyles[patient.riskLevel]}`} />
                    <div className="text-lg font-semibold text-slate-900">{patient.name}</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{patient.village}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {patient.riskScore}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badgeStyles[patient.riskLevel]}`}>
                  {patient.riskLevel}
                </span>
                <span className="text-sm text-slate-500">{patient.reason}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

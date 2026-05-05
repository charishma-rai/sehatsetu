import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import patients from "../patients";

const resultConfig = {
  Normal: { color: 'text-emerald-800 bg-emerald-50', label: 'Normal' },
  Mild: { color: 'text-amber-800 bg-amber-50', label: 'Mild Anemia' },
  Severe: { color: 'text-red-800 bg-red-50', label: 'Severe Anemia' },
};

export default function Scan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patients.find((item) => item.id === Number(id));
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const fallbackResult = {
    1: 'Severe',
    3: 'Normal',
  };

  useEffect(() => {
    if (status === 'scanning') {
      const timeout = window.setTimeout(() => {
        const raw = patient?.anemia ?? fallbackResult[Number(id)] ?? 'Mild';
        const label = raw === 'Normal' ? 'Normal' : raw === 'Mild' ? 'Mild' : 'Severe';
        const nextResult = resultConfig[label];
        setResult(nextResult);
        if (patient && patient.anemia == null) {
          patient.anemia = raw;
          patient.lastVisit = 'today';
        }
        setStatus('result');
      }, 3000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [status, patient, id]);

  if (!patient) {
    return (
      <div className="px-4 pt-10 text-center text-slate-700">
        <div className="mb-4 text-5xl">😕</div>
        <p className="mb-4 text-lg font-semibold">Patient not found</p>
        <button className="mx-auto rounded-3xl bg-emerald-600 px-6 py-4 text-sm font-semibold text-white" onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  return (
    <main className="px-4 pt-5 pb-28">
      <button className="mb-4 inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" onClick={() => navigate(`/patient/${patient.id}`)}>
        ← Back to Patient
      </button>

      <section className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-2xl">👁️</div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">VisionCare</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Scan lower inner eyelid</h1>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Instructions</p>
          <ul className="mt-3 space-y-2">
            <li>• Ask patient to look up.</li>
            <li>• Scan lower inner eyelid.</li>
            <li>• Keep lighting steady and include a white card if possible.</li>
          </ul>
        </div>

        <div className="mt-6 rounded-[32px] border border-slate-200 bg-slate-900 p-8 text-center text-white shadow-sm">
          <div className={status === 'scanning' ? 'animate-pulse text-6xl' : 'text-6xl'}>📷</div>
          <p className="mt-4 text-sm leading-6">{status === 'scanning' ? 'Scanning...' : 'Ready to start the simulated scan.'}</p>
        </div>

        {status === 'idle' && (
          <button className="mt-6 w-full rounded-3xl bg-emerald-600 px-5 py-4 text-base font-semibold text-white shadow-sm" onClick={() => setStatus('scanning')}>
            Start Scan
          </button>
        )}

        {status === 'scanning' && (
          <div className="mt-6 rounded-3xl bg-slate-100 p-4 text-sm text-slate-700">
            <div className="mb-3 h-3.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-full animate-[progress_3s_ease-out] bg-emerald-600" />
            </div>
            <p>Scanning the eyelid and analyzing color markers.</p>
          </div>
        )}

        {status === 'result' && result && (
          <div className="mt-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-4 rounded-3xl px-4 py-3 text-center text-sm font-semibold ${result.color}`}>
              {result.label}
            </div>
            <p className="text-sm text-slate-700">Result logged. Return to the patient detail screen to continue follow-up.</p>
            <button className="mt-6 w-full rounded-3xl bg-emerald-600 px-5 py-4 text-base font-semibold text-white shadow-sm" onClick={() => navigate(`/patient/${patient.id}`)}>
              Result logged. Return to patient.
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

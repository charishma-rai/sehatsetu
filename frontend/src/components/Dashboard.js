import { useMemo, useState } from 'react';
import patients from '../patients';

const riskStyles = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-emerald-100 text-emerald-700',
};

export default function Dashboard() {
  const [filter, setFilter] = useState('ALL');

  const summary = useMemo(() => {
    const total = patients.length;
    const highRisk = patients.filter((p) => p.riskLevel === 'HIGH').length;
    const visitedToday = patients.filter((p) => p.lastVisit === 'today').length;
    const pending = patients.filter((p) => p.lastVisit !== 'today').length;
    return { total, highRisk, visitedToday, pending };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return patients;
    return patients.filter((patient) => patient.riskLevel === filter);
  }, [filter]);

  return (
    <div className="px-4 pt-5 pb-28">
      <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">PHC Dashboard</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-emerald-50 p-4">
            <div className="text-sm text-slate-500">Total Patients</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{summary.total}</div>
          </div>
          <div className="rounded-3xl bg-red-50 p-4">
            <div className="text-sm text-slate-500">High Risk Count</div>
            <div className="mt-2 text-3xl font-semibold text-red-800">{summary.highRisk}</div>
          </div>
          <div className="rounded-3xl bg-sky-50 p-4">
            <div className="text-sm text-slate-500">Visited Today</div>
            <div className="mt-2 text-3xl font-semibold text-sky-700">{summary.visitedToday}</div>
          </div>
          <div className="rounded-3xl bg-amber-50 p-4">
            <div className="text-sm text-slate-500">Pending Follow-ups</div>
            <div className="mt-2 text-3xl font-semibold text-amber-800">{summary.pending}</div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setFilter(level)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === level ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Village</th>
              <th className="px-4 py-3 font-semibold">Risk Score</th>
              <th className="px-4 py-3 font-semibold">Days Since Discharge</th>
              <th className="px-4 py-3 font-semibold">ASHA Assigned</th>
              <th className="px-4 py-3 font-semibold">Last Visited</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((patient) => (
              <tr key={patient.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{patient.name}</td>
                <td className="px-4 py-3 text-slate-700">{patient.village}</td>
                <td className="px-4 py-3 text-slate-700">{patient.riskScore}</td>
                <td className="px-4 py-3 text-slate-700">{patient.dischargeDays}</td>
                <td className="px-4 py-3 text-slate-700">{patient.asha}</td>
                <td className="px-4 py-3 text-slate-700">{patient.lastVisit || 'Not visited'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${riskStyles[patient.riskLevel]}`}>
                    {patient.riskLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { graphqlRequest } from "../lib/graphclient";

const EMPLOYEES_QUERY = `
  query ReportEmployees {
    employees {
      id
      name
      attendance
      department
    }
  }
`;

function AttendanceReportPage({ token }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await graphqlRequest(EMPLOYEES_QUERY, {}, token);
        setEmployees(data.employees);
      } catch (err) {
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const valid = employees.filter((e) => e.attendance != null);
  const avg =
    valid.length > 0
      ? valid.reduce((sum, e) => sum + e.attendance, 0) / valid.length
      : null;

  const best = [...valid].sort((a, b) => b.attendance - a.attendance)[0];
  const worst = [...valid].sort((a, b) => a.attendance - b.attendance)[0];

  return (
    <div className="rounded-2xl bg-slate-950/70 border border-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.9)] p-4 md:p-6">
      <h1 className="text-lg font-semibold text-slate-50 mb-1">
        Attendance Report
      </h1>
      <p className="text-xs text-slate-400 mb-4">
        High-level snapshot of employee attendance based on the current dataset.
      </p>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {error && (
        <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-800/70 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <StatCard
              label="Employees counted"
              value={valid.length}
              hint="With non-empty attendance"
            />
            <StatCard
              label="Average attendance"
              value={avg != null ? `${avg.toFixed(1)}%` : "—"}
              hint="Across all counted employees"
            />
            <StatCard
              label="Data rows"
              value={employees.length}
              hint="Total employees in system"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <HighlightCard
              title="Top Attendance"
              employee={best}
              emptyText="No attendance data yet."
            />
            <HighlightCard
              title="Lowest Attendance"
              employee={worst}
              emptyText="No attendance data yet."
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-base font-semibold text-slate-50 mt-1">{value}</p>
      {hint && (
        <p className="text-[11px] text-slate-500 mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}

function HighlightCard({ title, employee, emptyText }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3">
      <p className="text-[11px] text-slate-400 mb-2">{title}</p>
      {employee ? (
        <>
          <p className="text-sm font-semibold text-slate-50">
            {employee.name}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Department: {employee.department || "—"}
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Attendance: {employee.attendance}%
          </p>
        </>
      ) : (
        <p className="text-xs text-slate-400">{emptyText}</p>
      )}
    </div>
  );
}

export default AttendanceReportPage;

import React, { useEffect, useState } from "react";
import { graphqlRequest } from "../lib/graphclient";

const EMPLOYEES_QUERY = `
  query ClassReport {
    employees {
      id
      name
      class
      department
    }
  }
`;

function ClassReportPage({ token }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await graphqlRequest(EMPLOYEES_QUERY, {}, token);
        const byClass = new Map();

        data.employees.forEach((e) => {
          const key = e.class || "Unassigned";
          if (!byClass.has(key)) {
            byClass.set(key, []);
          }
          byClass.get(key).push(e);
        });

        setGroups(
          Array.from(byClass.entries()).map(([className, emps]) => ({
            className,
            count: emps.length,
            departments: Array.from(
              new Set(emps.map((e) => e.department || "—"))
            ),
          }))
        );
      } catch (err) {
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <div className="rounded-2xl bg-slate-950/70 border border-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.9)] p-4 md:p-6">
      <h1 className="text-lg font-semibold text-slate-50 mb-1">
        Class-wise Distribution
      </h1>
      <p className="text-xs text-slate-400 mb-4">
        How employees are spread across different classes in the system.
      </p>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {error && (
        <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-800/70 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {groups.map((g) => (
            <div
              key={g.className}
              className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3"
            >
              <p className="text-[11px] text-slate-400">Class</p>
              <p className="text-sm font-semibold text-slate-50">
                {g.className}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Employees: {g.count}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Departments:
              </p>
              <p className="text-[11px] text-slate-300">
                {g.departments.join(", ")}
              </p>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="text-xs text-slate-400">
              No employees found. Add some employees to see data here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ClassReportPage;

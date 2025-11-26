import React, { useEffect, useState } from "react";
import { graphqlRequest } from "../lib/graphclient";
import { toast } from "react-toastify";

const EMPLOYEES_QUERY = `
  query Employees($page: Int, $pageSize: Int) {
    employeesPaginated(
      page: $page,
      pageSize: $pageSize,
      sortBy: NAME,
      sortOrder: ASC
    ) {
      totalCount
      page
      pageSize
      items {
        id
        name
        age
        class
        department
        attendance
        email
        phone
        flagged
        subjects
      }
    }
  }
`;

const UPDATE_EMPLOYEE_MUTATION = `
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      id
      name
      age
      class
      department
      attendance
      email
      phone
      flagged
      subjects
    }
  }
`;

const DELETE_EMPLOYEE_MUTATION = `
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

function EmployeesPage({ token, isAdmin }) {
  const [employees, setEmployees] = useState([]);
  const [view, setView] = useState("grid");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await graphqlRequest(
          EMPLOYEES_QUERY,
          { page, pageSize },
          token
        );
        const pageData = data.employeesPaginated;
        setEmployees(pageData.items);
        setTotalCount(pageData.totalCount);
      } catch (err) {
        setError(err.message || "Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalCount);

  const ensureAdmin = () => {
    if (!isAdmin) {
      toast.error("Only admins can perform this action.");
      return false;
    }
    return true;
  };

  const handleToggleFlag = async (emp) => {
    if (!ensureAdmin()) return;
    try {
      setMutating(true);
      const data = await graphqlRequest(
        UPDATE_EMPLOYEE_MUTATION,
        {
          input: {
            id: emp.id,
            flagged: !emp.flagged,
          },
        },
        token
      );
      const updated = data.updateEmployee;
      setEmployees((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      toast.success(
        updated.flagged
          ? `Flagged ${updated.name}`
          : `Unflagged ${updated.name}`
      );
    } catch (err) {
      toast.error(err.message || "Failed to flag employee");
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (emp) => {
    if (!ensureAdmin()) return;
    const sure = window.confirm(
      `Delete employee "${emp.name}"? This cannot be undone.`
    );
    if (!sure) return;

    try {
      setMutating(true);
      const data = await graphqlRequest(
        DELETE_EMPLOYEE_MUTATION,
        { id: emp.id },
        token
      );
      if (data.deleteEmployee) {
        setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
        toast.success(`Deleted: ${emp.name}`);
        // optionally refetch page if needed when page becomes empty
      } else {
        toast.error("Employee could not be deleted");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete employee");
    } finally {
      setMutating(false);
    }
  };

  const handleEditSave = async (values) => {
    if (!ensureAdmin()) return;
    try {
      setMutating(true);
      const data = await graphqlRequest(
        UPDATE_EMPLOYEE_MUTATION,
        {
          input: {
            id: values.id,
            name: values.name,
            class: values.class || null,
            department: values.department || null,
            attendance: values.attendance
              ? Number(values.attendance)
              : null,
          },
        },
        token
      );
      const updated = data.updateEmployee;
      setEmployees((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      setEditing(null);
      toast.success("Employee updated");
    } catch (err) {
      toast.error(err.message || "Failed to update employee");
    } finally {
      setMutating(false);
    }
  };

  const handlePageChange = (direction) => {
    if (direction === "prev" && page > 1) {
      setPage((p) => p - 1);
    } else if (direction === "next" && page < totalPages) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950/70 border border-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.9)] p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">
            Employees Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Switch between grid and tile view. Click a tile to see full details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-500">
            Total:{" "}
            <span className="text-slate-200 font-medium">
              {totalCount}
            </span>
          </div>
          <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 p-1 text-xs">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1 rounded-full ${
                view === "grid"
                  ? "bg-sky-500 text-slate-950"
                  : "text-slate-300"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView("tiles")}
              className={`px-3 py-1 rounded-full ${
                view === "tiles"
                  ? "bg-sky-500 text-slate-950"
                  : "text-slate-300"
              }`}
            >
              Tiles
            </button>
          </div>
        </div>
      </div>

      {/* error / loading */}
      {loading && <p className="text-sm text-slate-400">Loading employees…</p>}
      {error && (
        <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-800/70 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && employees.length > 0 && (
        <>
          {view === "grid" ? (
            <GridView employees={employees} onSelect={setSelected} />
          ) : (
            <TileView
              employees={employees}
              onSelect={setSelected}
              onEdit={setEditing}
              onFlag={handleToggleFlag}
              onDelete={handleDelete}
              mutating={mutating}
              isAdmin={isAdmin}
            />
          )}

          {/* Pagination controls */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[11px] text-slate-400">
            <div>
              {totalCount > 0 ? (
                <span>
                  Showing{" "}
                  <span className="text-slate-200">
                    {startIdx}–{endIdx}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-200">{totalCount}</span>
                </span>
              ) : (
                <span>No employees found.</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2.5 py-1 rounded-full border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
                disabled={page === 1}
                onClick={() => handlePageChange("prev")}
              >
                ◀ Prev
              </button>
              <span>
                Page{" "}
                <span className="text-slate-200">{page}</span> /{" "}
                <span className="text-slate-200">{totalPages}</span>
              </span>
              <button
                className="px-2.5 py-1 rounded-full border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
                disabled={page === totalPages || totalCount === 0}
                onClick={() => handlePageChange("next")}
              >
                Next ▶
              </button>
            </div>
          </div>
        </>
      )}

      <DetailModal employee={selected} onClose={() => setSelected(null)} />
      <EditModal
        employee={editing}
        onClose={() => setEditing(null)}
        onSave={handleEditSave}
        mutating={mutating}
        isAdmin={isAdmin}
      />
    </div>
  );
}

/* ----- Grid, Tiles, Modals stay mostly same, small changes for isAdmin ----- */

function GridView({ employees, onSelect }) {
  return (
    <div className="mt-2 overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-950/80">
          <tr className="text-[11px] uppercase text-slate-400">
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Dept</th>
            <th className="px-3 py-2 text-left">Class</th>
            <th className="px-3 py-2 text-left">Age</th>
            <th className="px-3 py-2 text-left">Attendance</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Phone</th>
            <th className="px-3 py-2 text-left">Subjects</th>
            <th className="px-3 py-2 text-left">Flagged</th>
            <th className="px-3 py-2 text-left">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
          {employees.map((e) => (
            <tr
              key={e.id}
              className="hover:bg-slate-900/80 transition-colors"
            >
              <td className="px-3 py-2 whitespace-nowrap text-slate-100">
                {e.name}
              </td>
              <td className="px-3 py-2 text-slate-300">
                {e.department || "—"}
              </td>
              <td className="px-3 py-2 text-slate-300">
                {e.class || "—"}
              </td>
              <td className="px-3 py-2 text-slate-300">
                {e.age ?? "—"}
              </td>
              <td className="px-3 py-2 text-slate-300">
                {e.attendance != null ? `${e.attendance}%` : "—"}
              </td>
              <td className="px-3 py-2 text-slate-400">
                {e.email || "—"}
              </td>
              <td className="px-3 py-2 text-slate-400">
                {e.phone || "—"}
              </td>
              <td className="px-3 py-2 text-slate-300">
                {e.subjects?.join(", ") || "—"}
              </td>
              <td className="px-3 py-2 text-slate-300">
                {e.flagged ? "🚩" : "—"}
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onSelect(e)}
                  className="text-[11px] px-2 py-1 rounded-full bg-sky-500 text-slate-950 hover:bg-sky-400"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TileView({
  employees,
  onSelect,
  onEdit,
  onFlag,
  onDelete,
  mutating,
  isAdmin,
}) {
  return (
    <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {employees.map((e) => (
        <div
          key={e.id}
          className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3"
        >
          <div
            className="cursor-pointer mb-2"
            onClick={() => onSelect(e)}
          >
            <h3 className="text-sm font-semibold text-slate-50">
              {e.name}
            </h3>
            <p className="text-[11px] text-slate-400 mb-1">
              {e.department || "No department"}
            </p>
            <p className="text-xs text-slate-300">
              Class: {e.class || "—"}
            </p>
            <p className="text-xs text-slate-300">
              Attendance:{" "}
              {e.attendance != null ? `${e.attendance}%` : "—"}
            </p>
            {e.flagged && (
              <p className="text-[11px] text-amber-300 mt-1">
                🚩 Flagged
              </p>
            )}
          </div>

          <div className="flex justify-end gap-1 mt-1">
            <button
              disabled={mutating || !isAdmin}
              onClick={() =>
                isAdmin ? onEdit(e) : toast.error("Admins only")
              }
              className="px-2 py-1 rounded-full bg-slate-800 text-[10px] text-slate-200 hover:bg-slate-700 disabled:opacity-40"
            >
              Edit
            </button>
            <button
              disabled={mutating || !isAdmin}
              onClick={() =>
                isAdmin ? onFlag(e) : toast.error("Admins only")
              }
              className="px-2 py-1 rounded-full bg-amber-500/90 text-[10px] text-slate-950 hover:bg-amber-400 disabled:opacity-40"
            >
              {e.flagged ? "Unflag" : "Flag"}
            </button>
            <button
              disabled={mutating || !isAdmin}
              onClick={() =>
                isAdmin ? onDelete(e) : toast.error("Admins only")
              }
              className="px-2 py-1 rounded-full bg-rose-500/90 text-[10px] text-slate-950 hover:bg-rose-400 disabled:opacity-40"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailModal({ employee, onClose }) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-slate-500 hover:text-slate-200 text-lg"
        >
          ×
        </button>
        <h2 className="text-base font-semibold text-slate-50 mb-3">
          {employee.name}
        </h2>
        <div className="space-y-1.5 text-xs text-slate-300">
          <p>
            <span className="text-slate-400">Department:</span>{" "}
            {employee.department || "—"}
          </p>
          <p>
            <span className="text-slate-400">Class:</span>{" "}
            {employee.class || "—"}
          </p>
          <p>
            <span className="text-slate-400">Age:</span>{" "}
            {employee.age ?? "—"}
          </p>
          <p>
            <span className="text-slate-400">Email:</span>{" "}
            {employee.email || "—"}
          </p>
          <p>
            <span className="text-slate-400">Phone:</span>{" "}
            {employee.phone || "—"}
          </p>
          <p>
            <span className="text-slate-400">Subjects:</span>{" "}
            {employee.subjects?.join(", ") || "—"}
          </p>
          <p>
            <span className="text-slate-400">Attendance:</span>{" "}
            {employee.attendance != null ? `${employee.attendance}%` : "—"}
          </p>
          <p>
            <span className="text-slate-400">Flagged:</span>{" "}
            {employee.flagged ? "Yes 🚩" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
}

function EditModal({ employee, onClose, onSave, mutating, isAdmin }) {
  const [values, setValues] = useState(null);

  useEffect(() => {
    if (employee) {
      setValues({
        id: employee.id,
        name: employee.name || "",
        class: employee.class || "",
        department: employee.department || "",
        attendance:
          employee.attendance != null ? String(employee.attendance) : "",
      });
    } else {
      setValues(null);
    }
  }, [employee]);

  if (!employee || !values) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Admins only");
      return;
    }
    onSave(values);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-slate-500 hover:text-slate-200 text-lg"
        >
          ×
        </button>
        <h2 className="text-base font-semibold text-slate-50 mb-3">
          Edit {employee.name}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Name</label>
            <input
              name="name"
              value={values.name}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Class</label>
              <input
                name="class"
                value={values.class}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Department</label>
              <input
                name="department"
                value={values.department}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 mb-1">
              Attendance (%)
            </label>
            <input
              name="attendance"
              value={values.attendance}
              onChange={handleChange}
              type="number"
              step="0.1"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={mutating || !isAdmin}
              className="px-4 py-2 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 disabled:opacity-40"
            >
              {mutating ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:border-slate-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeesPage;
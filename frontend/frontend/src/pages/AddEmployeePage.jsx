import React, { useState } from "react";
import { graphqlRequest } from "../lib/graphclient";
import { toast } from "react-toastify";

const ADD_EMPLOYEE_MUTATION = `
  mutation AddEmployee($input: AddEmployeeInput!) {
    addEmployee(input: $input) {
      id
      name
      department
    }
  }
`;

function AddEmployeePage({ token }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    class: "",
    department: "",
    subjects: "",
    attendance: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const input = {
        name: form.name,
        age: form.age ? Number(form.age) : null,
        class: form.class || null,
        department: form.department || null,
        attendance: form.attendance ? Number(form.attendance) : null,
        email: form.email || null,
        phone: form.phone || null,
        subjects: form.subjects
          ? form.subjects.split(",").map((s) => s.trim())
          : [],
      };

      const data = await graphqlRequest(
        ADD_EMPLOYEE_MUTATION,
        { input },
        token
      );
      setMessage(`Employee "${data.addEmployee.name}" created successfully.`);
      toast.success(`Employee "${data.addEmployee.name}" created`);
      setForm({
        name: "",
        age: "",
        class: "",
        department: "",
        subjects: "",
        attendance: "",
        email: "",
        phone: "",
      });
    } catch (err) {
        toast.error(err.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950/70 border border-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.9)] p-4 md:p-6">
      <h1 className="text-lg font-semibold text-slate-50 mb-1">
        Add New Employee
      </h1>
      <p className="text-xs text-slate-400 mb-4">
        Create a new employee record that will appear in the grid and tile view.
      </p>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <label className="block text-slate-300">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Amit Sharma"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-300">Age</label>
          <input
            name="age"
            value={form.age}
            onChange={handleChange}
            type="number"
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="29"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-300">Class</label>
          <input
            name="class"
            value={form.class}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="A1"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-300">Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Engineering"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="block text-slate-300">Subjects (comma separated)</label>
          <input
            name="subjects"
            value={form.subjects}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Math, Science"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-300">Attendance (%)</label>
          <input
            name="attendance"
            value={form.attendance}
            onChange={handleChange}
            type="number"
            step="0.1"
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="92.5"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-300">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="amit@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-300">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="9876500011"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Create Employee"}
          </button>
          {message && (
            <span className="text-[11px] text-emerald-400">{message}</span>
          )}
          {error && (
            <span className="text-[11px] text-rose-400">{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}

export default AddEmployeePage;

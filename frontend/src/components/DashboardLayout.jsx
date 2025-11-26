import React, { useState } from "react";
import EmployeesPage from "../pages/EmployeePage.jsx";
import AddEmployeePage from "../pages/AddEmployeePage.jsx";
import AttendanceReportPage from "../pages/AttendanceReportPage.jsx";
import ClassReportPage from "../pages/ClassReportPage.jsx";

function DashboardLayout({ user, onLogout, token }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("employees-list");

  const isAdmin = user?.role === "ADMIN";

  const handleNav = (page) => {
    setActivePage(page);
    setSidebarOpen(false); // drawer band ho jaye click pe
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top horizontal nav */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="flex items-center gap-3">
          {/* hamburger always visible */}
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 hover:border-sky-500 text-slate-300"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            ☰
          </button>
          <span className="font-semibold text-slate-50 tracking-tight">
            Employees Dashboard
          </span>
        </div>

        {/* horizontal nav */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          {/* Add Employee chip (admin only) */}
          {isAdmin && (
            <span
              className={`px-3 py-1 rounded-full cursor-pointer ${
                activePage === "employees-add"
                  ? "border border-sky-500/60 bg-sky-500/10 text-sky-300"
                  : "border border-transparent text-slate-400 hover:text-slate-100"
              }`}
              onClick={() => handleNav("employees-add")}
            >
              Add Employee
            </span>
          )}

          {/* Employees List chip */}
          <span
            className={`px-3 py-1 rounded-full cursor-pointer ${
              activePage === "employees-list"
                ? "border border-sky-500/60 bg-sky-500/10 text-sky-300"
                : "border border-transparent text-slate-400 hover:text-slate-100"
            }`}
            onClick={() => handleNav("employees-list")}
          >
            Employees
          </span>

          {/* Reports chip (admin only) */}
          {isAdmin && (
            <span
              className={`px-3 py-1 rounded-full cursor-pointer ${
                activePage === "reports-attendance" ||
                activePage === "reports-class"
                  ? "border border-sky-500/60 bg-sky-500/10 text-sky-300"
                  : "border border-transparent text-slate-400 hover:text-slate-100"
              }`}
              onClick={() => handleNav("reports-attendance")}
            >
              Reports
            </span>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-200">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-slate-500 uppercase">
              {user?.role}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-[11px] px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 hover:border-rose-500 hover:text-rose-300"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Drawer sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-30 w-60 bg-slate-950 border-r border-slate-800 transition-transform duration-200`}
        >
          <div className="h-12 flex items-center px-4 border-b border-slate-800">
            <span className="text-sm font-semibold">Navigation</span>
          </div>

          <div className="p-3 space-y-4 text-sm">
            {/* Employees section */}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                Employees
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav("employees-list")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                    activePage === "employees-list"
                      ? "bg-slate-800/90 text-slate-50"
                      : "hover:bg-slate-900 text-slate-300"
                  }`}
                >
                  List
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNav("employees-add")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                      activePage === "employees-add"
                        ? "bg-slate-800/90 text-slate-50"
                        : "hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    Add New
                  </button>
                )}
              </div>
            </div>

            {/* Reports section – admins only */}
            {isAdmin && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                  Reports
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNav("reports-attendance")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                      activePage === "reports-attendance"
                        ? "bg-slate-800/90 text-slate-50"
                        : "hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => handleNav("reports-class")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                      activePage === "reports-class"
                        ? "bg-slate-800/90 text-slate-50"
                        : "hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    By Class
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <div className="max-w-6xl mx-auto">
            {activePage === "employees-list" && (
              <EmployeesPage token={token} isAdmin={isAdmin} />
            )}
            {activePage === "employees-add" && isAdmin && (
              <AddEmployeePage token={token} />
            )}
            {activePage === "reports-attendance" && isAdmin && (
              <AttendanceReportPage token={token} />
            )}
            {activePage === "reports-class" && isAdmin && (
              <ClassReportPage token={token} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

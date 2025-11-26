import React, { useState } from "react";
import { graphqlRequest } from "../lib/graphclient";
import { toast } from "react-toastify";

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");

    try {
      if (mode === "login") {
        const data = await graphqlRequest(LOGIN_MUTATION, { email, password });
        const { token, user } = data.login;
        toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
        onLogin(token, user);
      } else {
        const data = await graphqlRequest(REGISTER_MUTATION, {
          name,
          email,
          password,
        });
        const { token, user } = data.register;
        toast.success("Account created! Logged in as employee.");
        onLogin(token, user);
      }
    } catch (err) {
      const msg = err.message || "Request failed";
      setErrorText(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-2xl shadow-sky-900/40 p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-slate-50">
            UltraShip Employee Console
          </h1>
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-full border border-slate-700 bg-slate-950/80 p-1 text-xs mb-5">
          <button
            className={`px-4 py-1.5 rounded-full ${
              isLogin
                ? "bg-sky-500 text-slate-950"
                : "text-slate-300 hover:text-slate-50"
            }`}
            onClick={() => {
              setMode("login");
              setErrorText("");
            }}
          >
            Login
          </button>
          <button
            className={`px-4 py-1.5 rounded-full ${
              !isLogin
                ? "bg-sky-500 text-slate-950"
                : "text-slate-300 hover:text-slate-50"
            }`}
            onClick={() => {
              setMode("signup");
              setErrorText("");
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {errorText && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-md px-3 py-2">
              {errorText}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 text-sm font-medium py-2.5 mt-2 transition"
          >
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        {isLogin && (
          <p className="mt-6 text-[11px] text-slate-500">
            Demo admin:{" "}
            <span className="font-mono">
              admin@example.com / password123
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;

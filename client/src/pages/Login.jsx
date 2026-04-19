import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-5xl items-center">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-panel backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-ink via-brand-slate to-slate-900 px-8 py-10 text-white sm:px-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-brand-teal/20 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
              Welcome back
            </p>
            <h2 className="mt-4 text-4xl font-semibold">
              Sign in to manage smarter shared spending.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
              Jump back into your dashboard, review balances, and continue your
              group conversations from one clean workspace.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Track balances across all shared expenses",
                "Start private and group conversations instantly",
                "Keep every bill visible to the people involved",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-8 sm:py-10">
          <p className="soft-label">Account access</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-950">Login</h3>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to continue to SmartSplit AI.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="soft-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="soft-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-ink px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-slate disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Do not have an account?{" "}
            <Link to="/register" className="font-semibold text-brand-teal hover:underline">
              Register
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

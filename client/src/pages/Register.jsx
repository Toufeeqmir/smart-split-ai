import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
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
      const { data } = await api.post("/auth/register", formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: data._id,
          username: data.username,
          email: data.email,
        })
      );
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-5xl items-center">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-panel backdrop-blur-xl lg:grid-cols-[0.98fr_1.02fr]">
        <section className="px-6 py-8 sm:px-8 sm:py-10">
          <p className="soft-label">Create your workspace</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Register</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create your SmartSplit AI account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="soft-label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Your name"
              />
            </div>

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
                placeholder="Create password"
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
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-teal hover:underline">
              Login
            </Link>
          </p>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-br from-[#f9fbff] via-white to-[#eef7f5] px-8 py-10 sm:px-10">
          <div className="absolute right-8 top-8 h-20 w-20 rounded-full border border-brand-gold/25 bg-brand-gold/10 animate-float" />
          <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full border border-brand-teal/20 bg-brand-teal/10 blur-sm" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Team ready
            </p>
            <h3 className="mt-4 text-4xl font-semibold text-slate-950">
              Bring your group into one polished expense workflow.
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              Set up your account, invite collaborators, split costs fairly,
              and keep all of your messages close to the numbers they affect.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Fast account setup for new groups",
                "A cleaner view of balances and member shares",
                "Built-in messaging for follow-ups and coordination",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

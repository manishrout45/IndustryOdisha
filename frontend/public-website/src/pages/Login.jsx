import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  getAuthApiBase,
  redirectByRole,
} from "../utils/authRedirect";
import logo from "../assets/logos/industryodishalogo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const base = getAuthApiBase();
      const res = await axios.post(
        `${base}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      const payload = res.data?.data || res.data;
      const token = payload?.token;
      const user = payload?.user;
      if (!token || !user) throw new Error("Token not found in login response");

      redirectByRole(token, user, "public");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Sign in failed"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#eef1f5]">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink text-white p-12 xl:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(198,40,40,0.4),transparent_55%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/5 blur-2xl" />

        <div className="relative">
          <img
            src={logo}
            alt="Industry Odisha"
            className="h-14 xl:h-16 object-contain brightness-0 invert"
          />
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Industry Odisha
          </p>
          <h1 className="font-display text-4xl xl:text-5xl font-bold mt-3 leading-[1.15]">
            Stories that shape Odisha
          </h1>
          <p className="mt-5 text-base text-white/65 leading-relaxed">
            Sign in to continue to your workspace and manage the day’s coverage.
          </p>
        </div>

        <p className="relative text-sm text-white/40">
          Trusted headlines · Local insight · Clear reporting
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img
              src={logo}
              alt="Industry Odisha"
              className="h-12 object-contain mb-4"
            />
            <p className="text-sm text-ink-muted">Sign in to continue</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200/90 shadow-soft rounded-2xl p-7 sm:p-9"
          >
            <div className="hidden lg:block mb-7">
              <img
                src={logo}
                alt="Industry Odisha"
                className="h-11 object-contain mb-5"
              />
              <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                Sign in
              </h2>
              <p className="text-sm text-ink-muted mt-1.5">
                Enter your email and password to continue
              </p>
            </div>

            <div className="lg:hidden mb-6 text-left">
              <h2 className="font-display text-2xl font-bold text-ink">
                Sign in
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Enter your email and password to continue
              </p>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl bg-accent-softbg border border-accent/15 p-3 text-sm text-accent">
                {error}
              </div>
            ) : null}

            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/10 mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />

            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/10 mb-6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-soft disabled:opacity-55"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            <Link to="/" className="font-semibold text-ink hover:text-accent transition">
              ← Back to Industry Odisha
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

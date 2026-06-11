// NexusHR: Premium split-screen Login page.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnvelopeSimple, Lock, SignIn, WarningCircle, ShieldWarning, ArrowRight, Users, ChartBar, Sparkle, SunDim, Moon, ShieldCheck } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const features = [
  { icon: Users, title: "Smart HR Management", desc: "Manage your entire workforce with intelligent automation and real-time insights." },
  { icon: ChartBar, title: "Live Analytics", desc: "Interactive dashboards with live payroll, attendance, and performance data." },
  { icon: ShieldCheck, title: "Role-Based Access", desc: "Admin, HR, and Employee portals with precision permission controls." },
  { icon: Sparkle, title: "AI Co-Pilot", desc: "Predict attrition risks, skill gaps, and engagement trends with AI-powered analysis." },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify and try again.");
    } finally { setLoading(false); }
  };

  const fillCredentialsAndLogin = async (email, pwd) => {
    setForm({ email, password: pwd }); setError(""); setLoading(true);
    try {
      await login(email, pwd);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify and try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0A0A0A] transition-colors duration-300">

      {/* Theme toggle */}
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center transition-all hover:scale-105"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark"
            ? <SunDim size={16} className="text-amber-400" />
            : <Moon size={16} className="text-slate-600" />}
        </button>
      </div>

      {/* ── LEFT BRAND PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: "var(--canvas-bg)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Background glow accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-primary)]/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="18" rx="1.5" fill="var(--brand-primary)" opacity="0.9" />
              <rect x="13" y="3" width="8" height="18" rx="1.5" fill="var(--brand-primary)" opacity="0.35" />
              <rect x="7" y="8" width="10" height="2" rx="0.5" fill="var(--brand-primary)" />
              <rect x="7" y="14" width="10" height="2" rx="0.5" fill="var(--brand-primary)" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-[0.1em] uppercase font-display" style={{ color: "var(--ink-primary)" }}>
            Nexus<span className="font-normal" style={{ color: "var(--ink-secondary)" }}>HR</span>
          </span>
        </div>

        {/* Main headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <span className="inline-block text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-[0.18em] font-body mb-4 border border-[var(--brand-primary)]/25 px-3 py-1 rounded-full bg-[var(--brand-primary)]/8">
              Enterprise HR Platform
            </span>
            <h1
              className="text-[3.25rem] font-extrabold leading-[1.05] tracking-[-0.045em] mb-4"
              style={{
                fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
                color: "var(--ink-primary)",
              }}
            >
              Manage your entire<br />
              <span className="text-[var(--brand-primary)]">workforce</span> smarter.
            </h1>
            <p
              className="text-[1.05rem] font-normal leading-[1.65] tracking-[-0.005em] max-w-sm mt-3"
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "var(--ink-secondary)",
              }}
            >
              NexusHR unifies payroll, attendance, performance reviews, and AI workforce analytics into one seamless platform.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="p-4 rounded-xl transition-all border"
                  style={{
                    background: "var(--bg-card-alt)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <Icon size={16} className="text-[var(--brand-primary)] mb-2" weight="duotone" />
                  <p className="text-[11px] font-semibold leading-tight font-body" style={{ color: "var(--ink-primary)" }}>{f.title}</p>
                  <p className="text-[10px] mt-1 leading-relaxed font-body" style={{ color: "var(--ink-secondary)" }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-[10px] font-body" style={{ color: "var(--ink-secondary)" }}>© 2026 NexusHR Systems · Enterprise Edition · v3.1</p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="18" rx="1.5" fill="var(--brand-primary)" opacity="0.9" />
                <rect x="13" y="3" width="8" height="18" rx="1.5" fill="var(--brand-primary)" opacity="0.35" />
                <rect x="7" y="8" width="10" height="2" rx="0.5" fill="var(--brand-primary)" />
                <rect x="7" y="14" width="10" height="2" rx="0.5" fill="var(--brand-primary)" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-[0.1em] uppercase font-display" style={{ color: "var(--ink-primary)" }}>
              Nexus<span className="font-normal" style={{ color: "var(--ink-secondary)" }}>HR</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Sign in to your workspace
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-body">Enter your credentials to continue.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs leading-relaxed font-body">
              <WarningCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <EnvelopeSimple size={14} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2 rounded-xl text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <SignIn size={14} weight="bold" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-3">
              <ShieldWarning size={12} className="text-slate-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wider font-body text-slate-500">
                Developer Demo Access
              </p>
            </div>
            <div className="space-y-2">
              {[
                { label: "Admin Console", email: "admin@nexushr.com", pass: "admin123" },
                { label: "HR Department", email: "hr@nexushr.com", pass: "hr123456" },
                { label: "Employee View", email: "employee@nexushr.com", pass: "emp12345" },
              ].map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => fillCredentialsAndLogin(cred.email, cred.pass)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 hover:border-[var(--brand-primary)]/40 hover:bg-slate-100/50 dark:hover:bg-white/[0.04] flex items-center justify-between group transition-all"
                  disabled={loading}
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-[var(--brand-primary)] block text-[9px] uppercase tracking-wider font-body">{cred.label}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 block font-body">{cred.email}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-body font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{cred.pass}</span>
                    <ArrowRight size={11} className="text-slate-400 group-hover:text-[var(--brand-primary)] transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

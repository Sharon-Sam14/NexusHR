// NexusHR: Premium split-screen Login page with registration and password reset flows.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnvelopeSimple, Lock, SignIn, WarningCircle, ShieldWarning, ArrowRight, Users, ChartBar, Sparkle, SunDim, Moon, ShieldCheck, User, Key, ArrowLeft, CheckCircle, Info } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { authService } from "../../services/authService";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  { icon: Users, title: "Smart HR Management", desc: "Manage your entire workforce with intelligent automation and real-time insights." },
  { icon: ChartBar, title: "Live Analytics", desc: "Interactive dashboards with live payroll, attendance, and performance data." },
  { icon: ShieldCheck, title: "Role-Based Access", desc: "Admin, HR, and Employee portals with precision permission controls." },
  { icon: Sparkle, title: "AI Co-Pilot", desc: "Predict attrition risks, skill gaps, and engagement trends with AI-powered analysis." },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState("LOGIN"); // LOGIN, REGISTER, FORGOT, RESET
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "EMPLOYEE",
    token: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify and try again.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Email might already be taken.");
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) { setError("Please enter your email address"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      await authService.forgotPassword(form.email);
      setSuccess("Simulated reset email sent. Check the backend server terminal console logs for the reset token.");
      setForm((prev) => ({ ...prev, token: "" }));
      setMode("RESET");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Make sure the email is registered.");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!form.token || !form.password || !form.confirmPassword) { setError("Please fill in all fields"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("New password must be at least 6 characters"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      await authService.resetPassword(form.token, form.password);
      setSuccess("Password reset successfully. You can now log in.");
      setMode("LOGIN");
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "", token: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Check if the token is correct and not expired.");
    } finally { setLoading(false); }
  };

  const fillCredentialsAndLogin = async (email, pwd) => {
    setForm((prev) => ({ ...prev, email, password: pwd })); setError(""); setSuccess(""); setLoading(true);
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
        <div className="w-full max-w-[400px]">
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

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {/* Error Banner */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs leading-relaxed font-body">
                  <WarningCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {success && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex items-start gap-2.5 text-emerald-600 dark:text-emerald-455 text-xs leading-relaxed font-body">
                  <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* ────────────────── LOGIN MODE ────────────────── */}
              {mode === "LOGIN" && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      Sign in to your workspace
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-body">Enter your credentials to continue.</p>
                  </div>

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
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="login-password">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => { setMode("FORGOT"); setError(""); setSuccess(""); }}
                          className="text-[10px] font-semibold text-[var(--brand-primary)] hover:underline tracking-wider uppercase font-body"
                        >
                          Forgot Password?
                        </button>
                      </div>
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
                          required
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

                    <div className="mt-4 text-center border-t border-slate-200 dark:border-slate-800/80 pt-4">
                      <button
                        type="button"
                        onClick={() => { setMode("REGISTER"); setError(""); setSuccess(""); }}
                        className="text-xs text-slate-650 hover:text-[var(--brand-primary)] dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-body"
                      >
                        Don't have an account? <span className="font-semibold text-[var(--brand-primary)]">Sign Up</span>
                      </button>
                    </div>
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
                </>
              )}

              {/* ────────────────── REGISTER MODE ────────────────── */}
              {mode === "REGISTER" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      Create your account
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-body">Join the NexusHR workspace.</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="register-name">
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <User size={14} />
                        </span>
                        <input
                          id="register-name"
                          type="text"
                          placeholder="Aarav Sharma"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="input-field pl-10"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="register-email">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <EnvelopeSimple size={14} />
                        </span>
                        <input
                          id="register-email"
                          type="email"
                          placeholder="name@company.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="input-field pl-10"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="register-password">
                        Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Lock size={14} />
                        </span>
                        <input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="input-field pl-10"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="register-role">
                        Select Workspace Role
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <ShieldCheck size={14} />
                        </span>
                        <select
                          id="register-role"
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                          className="select-field pl-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                          disabled={loading}
                        >
                          <option value="EMPLOYEE">Employee (Standard View)</option>
                          <option value="HR">HR Department Manager</option>
                          <option value="ADMIN">System Administrator</option>
                        </select>
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
                          <span>Create Account</span>
                          <ArrowRight size={14} weight="bold" />
                        </>
                      )}
                    </button>

                    <div className="mt-6 text-center border-t border-slate-200 dark:border-slate-800/80 pt-4">
                      <button
                        type="button"
                        onClick={() => { setMode("LOGIN"); setError(""); setSuccess(""); }}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 mx-auto font-body"
                      >
                        <ArrowLeft size={12} />
                        <span>Already have an account? <span className="font-semibold text-[var(--brand-primary)]">Sign In</span></span>
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* ────────────────── FORGOT MODE ────────────────── */}
              {mode === "FORGOT" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      Reset your password
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-body">Enter your email to request a reset token.</p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="forgot-email">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <EnvelopeSimple size={14} />
                        </span>
                        <input
                          id="forgot-email"
                          type="email"
                          placeholder="name@company.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="input-field pl-10"
                          disabled={loading}
                          required
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
                          <span>Send Reset Token</span>
                          <ArrowRight size={14} weight="bold" />
                        </>
                      )}
                    </button>

                    <div className="mt-6 text-center border-t border-slate-200 dark:border-slate-800/80 pt-4 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => { setMode("RESET"); setError(""); setSuccess(""); }}
                        className="text-xs text-[var(--brand-primary)] font-semibold hover:underline font-body"
                      >
                        Already have a reset token? Reset Password
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMode("LOGIN"); setError(""); setSuccess(""); }}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 mx-auto font-body"
                      >
                        <ArrowLeft size={12} />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* ────────────────── RESET MODE ────────────────── */}
              {mode === "RESET" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      Define New Password
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-body">Provide your reset token and new credentials.</p>
                  </div>

                  <div className="mb-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-body flex items-start gap-2 leading-relaxed">
                    <Info size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Since this is a demo environment, check the backend server terminal console logs to copy the reset token.</span>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="reset-token">
                        Reset Token
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Key size={14} />
                        </span>
                        <input
                          id="reset-token"
                          type="text"
                          placeholder="uuid-reset-token"
                          value={form.token}
                          onChange={(e) => setForm({ ...form, token: e.target.value })}
                          className="input-field pl-10 font-mono text-xs"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="reset-password">
                        New Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Lock size={14} />
                        </span>
                        <input
                          id="reset-password"
                          type="password"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="input-field pl-10"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-semibold text-slate-550 dark:text-slate-400 tracking-wider font-body" htmlFor="reset-confirm-password">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Lock size={14} />
                        </span>
                        <input
                          id="reset-confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          className="input-field pl-10"
                          disabled={loading}
                          required
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
                          <span>Reset Password</span>
                          <ArrowRight size={14} weight="bold" />
                        </>
                      )}
                    </button>

                    <div className="mt-6 text-center border-t border-slate-200 dark:border-slate-800/80 pt-4">
                      <button
                        type="button"
                        onClick={() => { setMode("LOGIN"); setError(""); setSuccess(""); }}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 mx-auto font-body"
                      >
                        <ArrowLeft size={12} />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

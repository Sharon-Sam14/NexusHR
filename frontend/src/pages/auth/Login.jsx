import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Sparkles, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentialsAndLogin = async (email, pwd) => {
    setForm({ email, password: pwd });
    setError("");
    setLoading(true);
    try {
      await login(email, pwd);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-500/30 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-950/90 backdrop-blur-3xl rounded-3xl p-8 md:p-10 relative z-10"
        >
          {/* Top subtle visual accent */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-650 shadow-lg shadow-cyan-500/20 mb-4 border border-cyan-400/20 animate-pulse" style={{ animationDuration: "3s" }}>
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              Access HR OS
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">
              NexusHR Autonomous Intelligence Suite
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs leading-relaxed"
              >
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="input-label" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11 py-3 text-xs"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="input-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 py-3 text-xs"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <LogIn size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-8 pt-6 border-t border-slate-900/80">
            <div className="flex items-center gap-1.5 justify-center mb-3 text-slate-600">
              <ShieldAlert size={12} />
              <p className="text-[9px] font-bold uppercase tracking-widest">
                Developer Credentials
              </p>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Admin Console", email: "admin@nexushr.com", pass: "admin123" },
                { label: "HR Department", email: "hr@nexushr.com", pass: "hr123456" },
                { label: "Employee View", email: "employee@nexushr.com", pass: "emp12345" }
              ].map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => fillCredentialsAndLogin(cred.email, cred.pass)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-slate-900/60 hover:border-slate-800/80 hover:bg-slate-900/20 text-[10px] flex items-center justify-between group transition-all"
                  disabled={loading}
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-cyan-400 block text-[9px] uppercase tracking-wider">{cred.label}</span>
                    <span className="text-slate-400 truncate mt-0.5 block">{cred.email}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-slate-500 group-hover:text-slate-400">{cred.pass}</span>
                    <ArrowRight size={10} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

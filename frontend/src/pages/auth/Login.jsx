import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Sparkles, AlertCircle } from "lucide-react";
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
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 lg:p-10 shadow-2xl relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 mb-4">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Welcome to NexusHR
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Enterprise Smart HR Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-medium"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="input-label" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-11"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-11"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 pt-6 border-t border-slate-700/30">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mb-3">
            Demo Credentials
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30 flex justify-between items-center">
              <div>
                <span className="font-semibold text-cyan-400">Admin: </span>
                <span className="text-slate-300">admin@nexushr.com</span>
              </div>
              <span className="text-slate-500 font-mono">admin123</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30 flex justify-between items-center">
              <div>
                <span className="font-semibold text-cyan-400">HR Manager: </span>
                <span className="text-slate-300">hr@nexushr.com</span>
              </div>
              <span className="text-slate-500 font-mono">hr123456</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30 flex justify-between items-center">
              <div>
                <span className="font-semibold text-cyan-400">Employee: </span>
                <span className="text-slate-300">employee@nexushr.com</span>
              </div>
              <span className="text-slate-500 font-mono">emp12345</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}

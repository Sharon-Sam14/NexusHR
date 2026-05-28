import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Compass, User, Clock, Calendar, DollarSign, Sparkles, LogOut, Bell, Building2, Briefcase, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout, isHR } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Command palette entries
  const commands = [
    { name: "Go to Dashboard", category: "Navigation", icon: Compass, action: () => navigate("/dashboard") },
    { name: "Manage Employees", category: "Navigation", icon: User, action: () => navigate("/employees"), hrOnly: true },
    { name: "View Departments", category: "Navigation", icon: Building2, action: () => navigate("/departments"), hrOnly: true },
    { name: "Recruitment Portal", category: "Navigation", icon: Briefcase, action: () => navigate("/recruitment"), hrOnly: true },
    { name: "Clock In / Attendance", category: "Operations", icon: Clock, action: () => navigate("/attendance") },
    { name: "Apply for Leave", category: "Operations", icon: Calendar, action: () => navigate("/leave") },
    { name: "Run Payroll / Salary", category: "Operations", icon: DollarSign, action: () => navigate("/payroll"), hrOnly: true },
    { name: "My Payroll / Payslips", category: "Operations", icon: DollarSign, action: () => navigate("/payroll"), employeeOnly: true },
    { name: "Performance Appraisals", category: "Growth", icon: Star, action: () => navigate("/performance") },
    { name: "AI Workforce Insights", category: "Growth", icon: Sparkles, action: () => navigate("/insights"), hrOnly: true },
    { name: "Account Profile", category: "Settings", icon: User, action: () => navigate("/profile") },
    { name: "Notifications Hub", category: "Settings", icon: Bell, action: () => navigate("/notifications") },
    { name: "Trigger HR AI Assistant", category: "AI Co-Pilot", icon: Sparkles, action: () => {
      window.dispatchEvent(new CustomEvent("open-ai-assistant"));
      onClose();
    }, hrOnly: true },
    { name: "Sign Out of NexusHR", category: "System", icon: LogOut, action: () => { logout(); navigate("/"); onClose(); } }
  ];

  // Filter based on query and role
  const filtered = commands.filter(cmd => {
    if (cmd.hrOnly && !isHR()) return false;
    if (cmd.employeeOnly && isHR()) return false;
    return cmd.name.toLowerCase().includes(query.toLowerCase()) || 
           cmd.category.toLowerCase().includes(query.toLowerCase());
  });

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Key navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 modal-backdrop">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            ref={containerRef}
            className="w-full max-w-xl bg-[#020617] overflow-hidden shadow-2xl border border-slate-800 rounded-2xl relative z-50"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/60 bg-slate-950/20">
              <Search size={18} className="text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages, run commands or ask AI..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-semibold px-2 py-0.5 rounded">
                ESC
              </span>
            </div>

            {/* Content List */}
            <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No commands or pages found.
                </div>
              ) : (
                Object.entries(
                  filtered.reduce((acc, curr) => {
                    if (!acc[curr.category]) acc[curr.category] = [];
                    acc[curr.category].push(curr);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category} className="space-y-0.5">
                    <p className="px-3 pt-2 pb-1 text-[9px] font-semibold text-slate-550 uppercase tracking-widest">
                      {category}
                    </p>
                    {items.map((cmd) => {
                      const Icon = cmd.icon;
                      const globalIdx = filtered.indexOf(cmd);
                      const isSelected = globalIdx === selectedIndex;
                      return (
                        <button
                          key={cmd.name}
                          onClick={() => { cmd.action(); onClose(); }}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-cyan-500/15 to-indigo-650/10 text-white border-l-2 border-cyan-400"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={15} className={isSelected ? "text-cyan-400" : "text-slate-500"} />
                            <span className="text-xs font-medium">{cmd.name}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
                              Enter ↵
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer shortcuts helper */}
            <div className="px-4 py-2.5 border-t border-slate-800/60 bg-slate-950/40 flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">↑↓</span> Move
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">Enter</span> Select
                </span>
              </div>
              <div>
                <span>AI Operating System v0.1</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

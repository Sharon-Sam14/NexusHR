import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, ChevronRight, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/notificationService";
import { timeAgo } from "../utils/formatters";
import { getInitials } from "../utils/formatters";
import CommandPalette from "./CommandPalette";

// Map location to page title
const pageTitles = {
  "/dashboard": "Dashboard Overview",
  "/employees": "Employees Directory",
  "/attendance": "Attendance Logs",
  "/leave": "Leave Management",
  "/payroll": "Payroll Overview",
  "/performance": "Performance Evaluation",
  "/recruitment": "Recruitment Portal",
  "/notifications": "Notifications Hub",
  "/profile": "My Profile",
  "/departments": "Departments Directory",
  "/insights": "AI Workforce Insights",
};

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const bellRef = useRef(null);

  const pageTitle = pageTitles[location.pathname] || "NexusHR";

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
    }
  }, [user]);

  // Keyboard binding for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getForUser(user.email);
      setNotifications(data.slice(0, 8));
      setUnreadCount(data.filter(n => !n.read).length);
    } catch {
      // silent fail
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user.email);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/60 flex items-center px-6 gap-4 sticky top-0 z-30 justify-between">
      {/* Page title & Console trigger */}
      <div className="flex items-center gap-6">
        <h2 className="text-md font-bold text-white tracking-tight hidden md:block">
          {pageTitle}
        </h2>
        
        {/* Search Console button */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-slate-500 hover:text-slate-400 hover:border-slate-700/35 transition-all text-left text-[11px] w-52 sm:w-60 select-none relative group"
        >
          <Search size={13} className="text-slate-500 group-hover:text-slate-400 transition-colors" />
          <span>Search or run action...</span>
          <span className="absolute right-2 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            Ctrl K
          </span>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button
            id="topbar-notifications-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative btn-icon"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                {unreadCount > 9 ? "9" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <>
                <div
                  className="fixed inset-0 z-45"
                  onClick={() => setShowNotifs(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-[#020617] overflow-hidden z-50 shadow-xl border border-slate-800 rounded-2xl"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-950/20">
                    <span className="font-bold text-xs text-white uppercase tracking-wider">Notifications</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-slate-500 text-xs">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`px-4 py-3 cursor-pointer hover:bg-slate-800/25 transition-colors ${!n.read ? "bg-cyan-500/5" : ""}`}
                        >
                          <div className="flex items-start gap-2.5">
                            {!n.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 animate-pulse" />
                            )}
                            <div className={!n.read ? "" : "pl-4"}>
                              <p className="text-xs font-semibold text-white">{n.title}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-[9px] text-slate-600 mt-1 font-medium">{timeAgo(n.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/20">
                    <button
                      onClick={() => { setShowNotifs(false); navigate("/notifications"); }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      View all notifications <ChevronRight size={10} />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/20 border border-transparent hover:border-slate-800/50 transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-cyan-500/10">
            {getInitials(user?.name || "U")}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-none">{user?.name?.split(" ")[0]}</p>
            <p className="text-[9px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">{user?.role}</p>
          </div>
        </button>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}

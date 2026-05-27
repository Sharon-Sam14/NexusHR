import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, ChevronRight, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/notificationService";
import { timeAgo } from "../utils/formatters";
import { getInitials } from "../utils/formatters";

// Map location to page title
const pageTitles = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/leave": "Leave Management",
  "/payroll": "Payroll",
  "/performance": "Performance",
  "/recruitment": "Recruitment",
  "/notifications": "Notifications",
  "/profile": "My Profile",
  "/departments": "Departments",
};

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const bellRef = useRef(null);

  const pageTitle = pageTitles[location.pathname] || "NexusHR";

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
    }
  }, [user]);

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

  const typeColors = {
    LEAVE: "bg-yellow-500/20 text-yellow-400",
    PAYROLL: "bg-emerald-500/20 text-emerald-400",
    ATTENDANCE: "bg-blue-500/20 text-blue-400",
    SYSTEM: "bg-cyan-500/20 text-cyan-400",
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Page title */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>
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
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center min-w-[18px] px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifs(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-card overflow-hidden z-50 shadow-xl"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`px-4 py-3 border-b border-slate-700/30 cursor-pointer hover:bg-slate-800/40 transition-colors ${!n.read ? "bg-cyan-500/5" : ""}`}
                        >
                          <div className="flex items-start gap-2.5">
                            {!n.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                            )}
                            <div className={!n.read ? "" : "pl-4"}>
                              <p className="text-sm font-medium text-white">{n.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-slate-700/50">
                    <button
                      onClick={() => { setShowNotifs(false); navigate("/notifications"); }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      View all notifications <ChevronRight size={12} />
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
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {getInitials(user?.name || "U")}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-white leading-none">{user?.name?.split(" ")[0]}</p>
            <p className="text-[10px] text-slate-500">{user?.role}</p>
          </div>
        </button>
      </div>
    </header>
  );
}

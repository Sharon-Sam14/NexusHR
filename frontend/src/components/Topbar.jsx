import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BellSimple, CaretRight, MagnifyingGlass, CalendarDots } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/notificationService";
import { timeAgo, getInitials } from "../utils/formatters";
import CommandPalette from "./CommandPalette";
import ThemeToggle from "./ThemeToggle";

// Simple date formatter — no dependency needed
const formatDate = (d) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(d);

// Map location to page info
const pageInfo = {
  "/dashboard":     { title: "Dashboard",           subtitle: "Welcome back — here's what's happening today." },
  "/employees":     { title: "Employees",           subtitle: "Manage your workforce directory." },
  "/attendance":    { title: "Attendance",          subtitle: "Track daily logs and work hours." },
  "/leave":         { title: "Leave Management",    subtitle: "Review, approve, and manage time off." },
  "/payroll":       { title: "Payroll",             subtitle: "Process payments and generate payslips." },
  "/performance":   { title: "Performance",         subtitle: "Appraisals, goals, and growth tracking." },
  "/recruitment":   { title: "Recruitment",         subtitle: "Job board, pipeline, and hiring tools." },
  "/notifications": { title: "Notifications",       subtitle: "Stay up to date with your alerts." },
  "/profile":       { title: "My Profile",          subtitle: "Your account and personal settings." },
  "/departments":   { title: "Departments",         subtitle: "Org structure and team management." },
  "/insights":      { title: "AI Insights",         subtitle: "Predictive workforce intelligence." },
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

  const page = pageInfo[location.pathname] || { title: "NexusHR", subtitle: "" };

  // Get user initials
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  useEffect(() => {
    if (user?.email) fetchNotifications();
  }, [user]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for sidebar search click
  useEffect(() => {
    const handleOpen = () => setPaletteOpen(true);
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getForUser(user.email);
      setNotifications(data.slice(0, 8));
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch { /* silent */ }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <header
      className="h-[62px] flex items-center justify-between px-6 sticky top-0 z-30"
      style={{
        background: "var(--bg-body)",
        borderBottom: "1px solid var(--border-divider)",
        boxShadow: "var(--shadow-topbar)",
      }}
    >
      {/* Left: Page title */}
      <div>
        <h1
          className="text-[18px] font-bold leading-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          {page.title}
        </h1>
        <p className="text-[12px] leading-tight" style={{ color: "var(--text-muted)" }}>
          {page.subtitle}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Date chip */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[8px]"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CalendarDots size={14} weight="light" style={{ color: "var(--text-secondary)" }} />
          <span
            className="text-[12px]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-ui)" }}
          >
            {formatDate(new Date())}
          </span>
        </div>

        {/* Search button */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[8px] transition-all duration-150"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            color: "var(--text-muted)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <MagnifyingGlass size={14} weight="light" />
          <span className="text-[12px]" style={{ fontFamily: "var(--font-ui)" }}>Search...</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-[4px]"
            style={{
              background: "var(--bg-hover)",
              color: "var(--text-muted)",
              fontFamily: "var(--font-ui)",
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button
            id="topbar-notifications-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors duration-150"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-card)",
            }}
          >
            <BellSimple size={17} weight="light" style={{ color: "var(--text-secondary)" }} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "var(--brand-blue)" }}
              />
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setShowNotifs(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 overflow-hidden z-50"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-card)",
                    boxShadow: "var(--shadow-dropdown)",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: "1px solid var(--border-divider)" }}
                  >
                    <span
                      className="text-[12px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}
                    >
                      Notifications
                    </span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[12px] font-medium"
                      style={{ color: "var(--brand-blue)" }}
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div
                        className="py-10 text-center text-[13px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-100"
                          style={{
                            background: n.read ? "transparent" : "var(--brand-blue-soft)",
                            borderBottom: "1px solid var(--border-divider)",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? "transparent" : "var(--brand-blue-soft)"; }}
                        >
                          {!n.read && (
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ background: "var(--brand-blue)" }}
                            />
                          )}
                          <div className={!n.read ? "" : "ml-5"}>
                            <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{n.message}</p>
                            <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
                              {timeAgo(n.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div
                    className="px-4 py-2.5"
                    style={{ borderTop: "1px solid var(--border-divider)" }}
                  >
                    <button
                      onClick={() => { setShowNotifs(false); navigate("/notifications"); }}
                      className="text-[12px] font-medium flex items-center gap-1"
                      style={{ color: "var(--brand-blue)" }}
                    >
                      View all notifications <CaretRight size={10} />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white transition-all duration-200"
          style={{
            background: "var(--brand-blue)",
            boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
          }}
          title={user?.name}
        >
          {initials}
        </button>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}

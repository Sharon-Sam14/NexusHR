import { NavLink, useMatch, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SquaresFour, UsersThree, CalendarDots, ClockCountdown,
  CurrencyDollar, Target, ChartBar, BellSimple,
  User, SignOut, Buildings, Sparkle, MagnifyingGlass,
  Briefcase, CaretDown, CalendarCheck
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/notificationService";
import { useState, useEffect } from "react";

// ── NavGroup ──────────────────────────────────────────────────────────────
const NavGroup = ({ label, children }) => (
  <div className="mb-1">
    <p
      className="px-5 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase"
      style={{ color: "rgba(160,168,184,0.5)", fontFamily: "var(--font-ui)" }}
    >
      {label}
    </p>
    {children}
  </div>
);

// ── NavItem ───────────────────────────────────────────────────────────────
const NavItem = ({ to, icon: Icon, label, badge }) => {
  const match = useMatch(to);
  const isActive = Boolean(match);
  return (
    <NavLink to={to} className="block px-2 mb-0.5">
      <div
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-[10px]
          transition-all duration-150
          ${isActive ? "" : "hover:bg-[rgba(255,255,255,0.06)]"}
        `}
        style={{
          background: isActive ? "var(--brand-blue)" : "transparent",
        }}
      >
        <Icon
          size={16}
          weight={isActive ? "bold" : "light"}
          style={{ color: isActive ? "#fff" : "var(--text-sidebar)", flexShrink: 0 }}
        />
        <span
          className="text-[13px] font-medium flex-1 truncate"
          style={{
            color: isActive ? "#fff" : "var(--text-sidebar)",
            fontFamily: "var(--font-ui)",
          }}
        >
          {label}
        </span>
        {badge > 0 && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
            style={{
              background: isActive ? "rgba(255,255,255,0.25)" : "var(--brand-blue)",
              color: "#fff",
              fontFamily: "var(--font-ui)",
            }}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
    </NavLink>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user, logout, isHR } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Get initials
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  const roleLabel =
    user?.role === "ADMIN" ? "Administrator" :
    user?.role === "HR"    ? "HR Manager"    : "Employee";

  useEffect(() => {
    if (user?.email) {
      notificationService.getForUser(user.email)
        .then((data) => setUnreadCount(data.filter((n) => !n.read).length))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearchClick = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <motion.aside
      initial={{ x: -220, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="w-[220px] shrink-0 h-screen flex flex-col sticky top-0 overflow-y-auto"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="18" rx="1.5" fill="var(--brand-primary)" opacity="0.9" />
              <rect x="13" y="3" width="8" height="18" rx="1.5" fill="var(--brand-primary)" opacity="0.35" />
              <rect x="7" y="8" width="10" height="2" rx="0.5" fill="var(--brand-primary)" />
              <rect x="7" y="14" width="10" height="2" rx="0.5" fill="var(--brand-primary)" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-[0.1em] uppercase font-display text-white">
            Nexus<span className="font-normal text-slate-400">HR</span>
          </span>
        </div>
      </div>

      {/* ── User Role Pill ─────────────────────────────────────────────── */}
      <div
        className="mx-3 mb-3 px-3 py-2.5 rounded-[10px]"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: "var(--brand-blue)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[12px] font-semibold truncate leading-tight"
              style={{ color: "#fff" }}
            >
              {user?.name}
            </p>
            <p
              className="text-[10px] uppercase tracking-wider leading-tight mt-0.5 truncate"
              style={{ color: "var(--text-sidebar)", fontFamily: "var(--font-ui)" }}
            >
              {roleLabel}
            </p>
          </div>
          <CaretDown size={12} style={{ color: "var(--text-sidebar)", flexShrink: 0 }} />
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────── */}
      <div
        className="mx-3 mb-3 px-3 py-2 rounded-[10px] flex items-center gap-2 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.05)" }}
        onClick={handleSearchClick}
        role="button"
        tabIndex={0}
      >
        <MagnifyingGlass size={13} style={{ color: "var(--text-sidebar)" }} />
        <span className="text-[12px] flex-1" style={{ color: "var(--text-sidebar)" }}>
          Search...
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-[4px]"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "var(--text-sidebar)",
            fontFamily: "var(--font-ui)",
          }}
        >
          ⌘K
        </span>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto">
        {/* Overview */}
        <NavGroup label="Overview">
          <NavItem to="/dashboard" icon={SquaresFour} label="Dashboard" />
        </NavGroup>

        {/* Operations */}
        <NavGroup label="Operations">
          <NavItem to="/attendance" icon={CalendarDots}   label="Attendance" />
          <NavItem to="/schedule"   icon={CalendarCheck}  label="Schedule" />
          <NavItem to="/leave"      icon={ClockCountdown} label="Leave" />
          <NavItem to="/payroll"    icon={CurrencyDollar} label="Payroll" />
        </NavGroup>

        {/* People — HR/Admin only */}
        {isHR() && (
          <NavGroup label="People">
            <NavItem to="/employees"   icon={UsersThree} label="Employees" />
            <NavItem to="/departments" icon={Buildings}  label="Departments" />
            <NavItem to="/recruitment" icon={Briefcase}  label="Recruitment" />
          </NavGroup>
        )}

        {/* Growth */}
        <NavGroup label="Growth">
          <NavItem to="/performance" icon={Target}   label="Performance" />
          {isHR() && <NavItem to="/insights" icon={ChartBar} label="AI Insights" />}
        </NavGroup>

        {/* Account */}
        <NavGroup label="Account">
          <NavItem to="/notifications" icon={BellSimple} label="Notifications" badge={unreadCount} />
          <NavItem to="/profile"       icon={User}       label="Profile" />
        </NavGroup>
      </nav>

      {/* ── Sign Out ──────────────────────────────────────────────────── */}
      <div className="mt-auto mb-4 mx-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-colors duration-150"
          style={{ color: "var(--text-sidebar)", background: "transparent" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <SignOut size={16} weight="light" />
          <span className="text-[13px]" style={{ fontFamily: "var(--font-ui)" }}>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Clock, Calendar,
  DollarSign, Star, Briefcase, Bell,
  User, Settings, LogOut, ChevronRight,
  Building2, Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/formatters";

const navSections = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Employees", path: "/employees", icon: Users },
      { name: "Departments", path: "/departments", icon: Building2, adminOnly: false },
      { name: "Recruitment", path: "/recruitment", icon: Briefcase },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Attendance", path: "/attendance", icon: Clock },
      { name: "Leave", path: "/leave", icon: Calendar },
      { name: "Payroll", path: "/payroll", icon: DollarSign },
    ],
  },
  {
    label: "Growth",
    items: [
      { name: "Performance", path: "/performance", icon: Star },
      { name: "AI Insights", path: "/insights", icon: Sparkles, adminOnly: true },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Notifications", path: "/notifications", icon: Bell },
      { name: "Profile", path: "/profile", icon: User },
    ],
  },
];

export default function Sidebar() {
  const { user, logout, isHR } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filterItems = (items) => {
    return items.filter(item => {
      if (item.adminOnly && !isHR()) return false;
      return true;
    });
  };

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="w-[260px] h-screen bg-slate-900/95 border-r border-slate-800/60 fixed left-0 top-0 z-40 flex flex-col backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">NexusHR</h1>
            <p className="text-xs text-slate-500">Smart HR Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => {
          const filteredItems = filterItems(section.items);
          if (filteredItems.length === 0) return null;
          return (
            <div key={section.label}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? "nav-item-active" : ""}`
                      }
                    >
                      <Icon size={17} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        {/* Role badge */}
        <div className="px-3 py-2 mb-2">
          <span className="text-xs text-slate-500">Signed in as</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(user?.name || "U")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
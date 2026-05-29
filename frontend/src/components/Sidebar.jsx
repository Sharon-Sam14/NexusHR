import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Clock, Calendar,
  IndianRupee, Star, Briefcase, Bell,
  User, LogOut, Sparkles, Building2
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
      { name: "Employees", path: "/employees", icon: Users, adminOnly: true },
      { name: "Departments", path: "/departments", icon: Building2, adminOnly: true },
      { name: "Recruitment", path: "/recruitment", icon: Briefcase, adminOnly: true },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Attendance", path: "/attendance", icon: Clock },
      { name: "Leave", path: "/leave", icon: Calendar },
      { name: "Payroll", path: "/payroll", icon: IndianRupee },
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
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="w-[260px] h-screen bg-slate-950/70 border-r border-slate-900/80 fixed left-0 top-0 z-40 flex flex-col backdrop-blur-2xl"
    >
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-900/80 bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-650 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">NexusHR</h1>
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mt-1">Smart AI Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navSections.map((section) => {
          const filteredItems = filterItems(section.items);
          if (filteredItems.length === 0) return null;
          return (
            <div key={section.label} className="space-y-1">
              <p className="px-4 text-[9px] font-semibold uppercase tracking-widest text-slate-600">
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
                        `nav-item group ${isActive ? "nav-item-active text-white" : "text-slate-450 hover:text-slate-200"}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon 
                            size={15} 
                            className={`transition-transform duration-200 ${
                              isActive 
                                ? "text-cyan-400 scale-105" 
                                : "text-slate-500 group-hover:text-slate-400"
                            }`} 
                          />
                          <span>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Profile & Sign Out Footer */}
      <div className="px-3 py-4 border-t border-slate-900/80 bg-slate-950/20">
        <div className="px-4 py-2.5 mb-3 rounded-xl bg-slate-950/30 border border-slate-900/40">
          <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">Signed in as</span>
          <div className="flex items-center gap-2.5 mt-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-650 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-cyan-500/10">
              {getInitials(user?.name || "U")}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">{user?.name}</p>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mt-0.5 block">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400/90 hover:text-red-350 hover:bg-red-500/5 px-4"
        >
          <LogOut size={15} className="text-red-550 group-hover:scale-105 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
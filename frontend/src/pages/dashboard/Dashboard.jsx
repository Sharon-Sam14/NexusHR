import { useState, useEffect } from "react";
import {
  UsersThree, Clock, Calendar, CurrencyInr, Star, Briefcase,
  TrendUp, Pulse, Plus, FileText, Sparkle, ArrowUpRight, CaretDown, EnvelopeSimple, Phone,
  User, Trash, X, Shield, Warning
} from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboardService";
import StatsCard from "../../components/StatsCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-950 border border-slate-700 px-3 py-2 shadow-lg text-[11px] rounded font-body text-left leading-relaxed">
        <p className="font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-1">{label}</p>
        <div className="space-y-0.5">
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-slate-200 font-bold">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const DEFAULT_SCHEDULE = [
  { id: 1, title: "Team Sync-Up (Marketing)", time: "09:00 - 11:00 AM", location: "Room B", color: "blue" },
  { id: 2, title: "Lunch Break", time: "12:00 - 13:00 PM", location: "", color: "slate", dashed: true },
  { id: 3, title: "Interview: Sarah Lee (Dev)", time: "14:00 - 15:00 PM", location: "Room D", color: "emerald" },
];

export default function Dashboard() {
  const { user, isHR, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Today's schedule date helper
  const [currentDateStr, setCurrentDateStr] = useState("");

  // Schedule state for add/delete
  const [scheduleItems, setScheduleItems] = useState(DEFAULT_SCHEDULE);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", time: "", location: "", color: "blue" });

  const addScheduleItem = () => {
    if (!newItem.title.trim() || !newItem.time.trim()) return;
    setScheduleItems(prev => [
      ...prev,
      { ...newItem, id: Date.now() }
    ]);
    setNewItem({ title: "", time: "", location: "", color: "blue" });
    setShowAddForm(false);
  };

  const deleteScheduleItem = (id) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    fetchStats();
    // Set formatted current date for schedule
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    setCurrentDateStr(new Date().toLocaleDateString('en-US', options));
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mock data for trends
  const trendData = [
    { name: "Jan", Employees: 45, Attendance: 92, Expenses: 180000 },
    { name: "Feb", Employees: 52, Attendance: 94, Expenses: 210000 },
    { name: "Mar", Employees: 64, Attendance: 96, Expenses: 250000 },
    { name: "Apr", Employees: 78, Attendance: 93, Expenses: 290000 },
    { name: "May", Employees: (stats?.activeEmployees || 90), Attendance: Math.round((stats?.presentToday / (stats?.activeEmployees || 1)) * 100) || 94, Expenses: (stats?.totalPayrollThisMonth || 320000) },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* welcome notification summary bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 shadow-sm font-body text-xs text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Workspace actively monitoring. You have <span className="font-bold text-slate-800 dark:text-slate-200">{stats?.unreadNotifications || 0}</span> unread notifications.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/attendance" className="text-[var(--brand-primary)] hover:underline font-semibold font-body">Check Logs &rarr;</Link>
          </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isHR() ? (
            <>
              {/* Card 1: Active Employees (mock bento blue background) */}
              <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-cyan-500/10 hover:shadow-[0_8px_30px_rgba(6,174,195,0.25)] transition-all flex flex-col justify-between h-[155px] text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100 font-body">Active Employees</span>
                  <Link to="/employees" className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <ArrowUpRight size={13} weight="bold" />
                  </Link>
                </div>
                <div className="mt-2 relative z-10 flex items-baseline gap-2">
                  <span className="text-4xl font-normal tracking-tight font-display">{stats?.activeEmployees || 0}</span>
                  <span className="text-[10px] font-bold font-body bg-white/10 rounded px-1.5 py-0.5 inline-flex items-center gap-0.5 text-white/95">
                    +12% &uarr;
                  </span>
                </div>
                <p className="text-[10px] text-cyan-100/80 mt-1 relative z-10 font-body">Total active workforce members enrolled.</p>
              </div>

              {/* Card 2: Attendance Today */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[155px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">Attendance Today</span>
                  <Link to="/attendance" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-750 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors">
                    <Clock size={13} weight="bold" />
                  </Link>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-normal tracking-tight font-display text-slate-800 dark:text-slate-100">
                    {stats?.activeEmployees ? `${Math.round((stats.presentToday / stats.activeEmployees) * 100)}%` : "0%"}
                  </span>
                  <span className="text-[10px] font-bold font-body bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded px-1.5 py-0.5 inline-flex items-center">
                    +4% &uarr;
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-body">Compliance score for shift presence today.</p>
              </div>

              {/* Card 3: Pending Leaves */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[155px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">Pending Leaves</span>
                  <Link to="/leave" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-750 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors">
                    <Calendar size={13} weight="bold" />
                  </Link>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-normal tracking-tight font-display text-slate-850 dark:text-slate-100">{stats?.pendingLeaves || 0}</span>
                  <span className="text-[10px] font-bold font-body bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded px-1.5 py-0.5">
                    Awaiting
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-body">Leave requests requiring approval reviews.</p>
              </div>

              {/* Card 4: Monthly Payroll */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[155px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">Monthly Payroll</span>
                  <Link to="/payroll" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-750 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors">
                    <CurrencyInr size={13} weight="bold" />
                  </Link>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-normal tracking-tight font-display text-slate-850 dark:text-slate-100">{formatCurrency(stats?.totalPayrollThisMonth || 0)}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-body">Calculated payouts for current pay interval.</p>
              </div>
            </>
          ) : (
            <>
              {/* Employee Dashboard Stats */}
              <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-cyan-500/10 hover:shadow-[0_8px_30px_rgba(6,174,195,0.25)] transition-all flex flex-col justify-between h-[155px] text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100 font-body">My Status</span>
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <UsersThree size={13} weight="bold" />
                  </span>
                </div>
                <div className="mt-2 relative z-10">
                  <span className="text-4xl font-normal tracking-tight font-display">Active</span>
                </div>
                <p className="text-[10px] text-cyan-100/80 mt-1 relative z-10 font-body">Your workspace status profile is active.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[155px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">My Check-In Today</span>
                  <Link to="/attendance" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-750 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors">
                    <Clock size={13} weight="bold" />
                  </Link>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-normal tracking-tight font-display text-slate-800 dark:text-slate-100">
                    {stats?.presentToday === 1 ? "Present" : "Not Checked In"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-body">Current check-in logging record status.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[155px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">My Pending Leaves</span>
                  <Link to="/leave" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-750 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors">
                    <Calendar size={13} weight="bold" />
                  </Link>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-normal tracking-tight font-display text-slate-850 dark:text-slate-100">{stats?.pendingLeaves || 0}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-body">Leaves requesting review validation.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[155px] text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">My Monthly Payout</span>
                  <Link to="/payroll" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-750 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors">
                    <CurrencyInr size={13} weight="bold" />
                  </Link>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-normal tracking-tight font-display text-slate-850 dark:text-slate-100">{formatCurrency(stats?.totalPayrollThisMonth || 0)}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-body">Direct deposit total for pay interval.</p>
              </div>
            </>
          )}
        </div>

        {/* ── Admin Approval Queue ─────────────────────────────────────────── */}
        {isHR() && isAdmin() && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
                <Warning size={12} className="text-amber-500" weight="fill" />
                Pending Admin Actions
              </h2>
              <span className="text-[9px] font-semibold font-mono text-slate-400 uppercase tracking-wider">Requires your review</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Pending Salary Approvals */}
              <Link to="/payroll" className="group">
                <div className={`relative overflow-hidden rounded-2xl p-5 text-left border transition-all duration-150 hover:shadow-lg ${
                  (stats?.pendingSalaryApprovals || 0) > 0
                    ? "bg-amber-500 border-amber-400 text-white shadow-amber-500/20 shadow-md"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60"
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl rounded-full pointer-events-none" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider font-mono block ${
                    (stats?.pendingSalaryApprovals || 0) > 0 ? "text-amber-100" : "text-slate-500 dark:text-slate-400"
                  }`}>Salary Approvals</span>
                  <p className={`text-3xl font-normal font-mono mt-2 ${
                    (stats?.pendingSalaryApprovals || 0) > 0 ? "text-white" : "text-amber-500"
                  }`}>{stats?.pendingSalaryApprovals || 0}</p>
                  <p className={`text-[10px] mt-1 font-body ${
                    (stats?.pendingSalaryApprovals || 0) > 0 ? "text-amber-100/80" : "text-slate-400"
                  }`}>Pending review</p>
                </div>
              </Link>

              {/* Pending Payroll Approval */}
              <Link to="/payroll" className="group">
                <div className={`relative overflow-hidden rounded-2xl p-5 text-left border transition-all duration-150 hover:shadow-lg ${
                  (stats?.pendingPayrollApprovals || 0) > 0
                    ? "bg-violet-500 border-violet-400 text-white shadow-violet-500/20 shadow-md"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60"
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl rounded-full pointer-events-none" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider font-mono block ${
                    (stats?.pendingPayrollApprovals || 0) > 0 ? "text-violet-100" : "text-slate-500 dark:text-slate-400"
                  }`}>Payroll Approval</span>
                  <p className={`text-3xl font-normal font-mono mt-2 ${
                    (stats?.pendingPayrollApprovals || 0) > 0 ? "text-white" : "text-violet-500"
                  }`}>{stats?.pendingPayrollApprovals || 0}</p>
                  <p className={`text-[10px] mt-1 font-body ${
                    (stats?.pendingPayrollApprovals || 0) > 0 ? "text-violet-100/80" : "text-slate-400"
                  }`}>Awaiting approval</p>
                </div>
              </Link>

              {/* Pending Leave Requests */}
              <Link to="/leave" className="group">
                <div className={`relative overflow-hidden rounded-2xl p-5 text-left border transition-all duration-150 hover:shadow-lg ${
                  (stats?.pendingLeaveRequests || 0) > 0
                    ? "bg-blue-500 border-blue-400 text-white shadow-blue-500/20 shadow-md"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60"
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl rounded-full pointer-events-none" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider font-mono block ${
                    (stats?.pendingLeaveRequests || 0) > 0 ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                  }`}>Leave Requests</span>
                  <p className={`text-3xl font-normal font-mono mt-2 ${
                    (stats?.pendingLeaveRequests || 0) > 0 ? "text-white" : "text-blue-500"
                  }`}>{stats?.pendingLeaveRequests || 0}</p>
                  <p className={`text-[10px] mt-1 font-body ${
                    (stats?.pendingLeaveRequests || 0) > 0 ? "text-blue-100/80" : "text-slate-400"
                  }`}>Pending review</p>
                </div>
              </Link>

              {/* Audit Log shortcut */}
              <Link to="/audit-logs" className="group">
                <div className="relative overflow-hidden rounded-2xl p-5 text-left border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-150">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-2xl rounded-full pointer-events-none" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono block text-slate-500 dark:text-slate-400">Audit Log</span>
                  <div className="mt-2 flex items-center gap-2">
                    <Shield size={24} className="text-[var(--brand-primary)]" weight="duotone" />
                  </div>
                  <p className="text-[10px] mt-1 font-body text-slate-400">View full trail →</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ── HR Action Items (HR-only, non-admin) ─────────────────────────── */}
        {isHR() && !isAdmin() && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
              <Pulse size={12} className="text-[var(--brand-primary)]" weight="fill" />
              Your Action Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/payroll" className="group">
                <div className={`rounded-2xl p-5 text-left border transition-all hover:shadow-md ${
                  (stats?.payrollDrafts || 0) > 0
                    ? "bg-gradient-to-tr from-blue-600 to-cyan-600 text-white border-blue-500/30 shadow-md"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60"
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider font-mono block ${
                    (stats?.payrollDrafts || 0) > 0 ? "text-cyan-100" : "text-slate-500 dark:text-slate-400"
                  }`}>Payroll Drafts</span>
                  <p className={`text-3xl font-normal font-mono mt-2 ${
                    (stats?.payrollDrafts || 0) > 0 ? "text-white" : "text-[var(--brand-primary)]"
                  }`}>{stats?.payrollDrafts || 0}</p>
                  <p className={`text-[10px] mt-1 font-body ${
                    (stats?.payrollDrafts || 0) > 0 ? "text-cyan-100/80" : "text-slate-400"
                  }`}>Submit for approval</p>
                </div>
              </Link>

              <Link to="/payroll" className="group">
                <div className="rounded-2xl p-5 text-left border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 hover:shadow-md transition-all">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono block text-slate-500 dark:text-slate-400">Salary Requests Sent</span>
                  <p className="text-3xl font-normal font-mono text-amber-500 mt-2">{stats?.salaryRequestsSent || 0}</p>
                  <p className="text-[10px] mt-1 font-body text-slate-400">Awaiting Admin approval</p>
                </div>
              </Link>

              <Link to="/recruitment" className="group">
                <div className="rounded-2xl p-5 text-left border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 hover:shadow-md transition-all">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono block text-slate-500 dark:text-slate-400">Recruitment Pipeline</span>
                  <p className="text-3xl font-normal font-mono text-emerald-500 mt-2">{stats?.recruitmentPipelineCount || 0}</p>
                  <p className="text-[10px] mt-1 font-body text-slate-400">Active candidates</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Bento Grid layout */}
        {isHR() ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            
            {/* Bento cell 1: Best Employee (colspan 4) */}
            <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[420px] transition-colors duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/40 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">Best Employee</h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-350 px-2.5 py-0.5 rounded font-medium font-body">This Month</span>
              </div>
              <div className="my-auto text-center flex flex-col items-center">
                {stats?.bestEmployeePhoto ? (
                  <img 
                    src={stats.bestEmployeePhoto} 
                    alt={(stats?.bestEmployeeName || "Best Employee") + " Profile"} 
                    className="w-24 h-24 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm mb-3 mt-2" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-750 shadow-sm mb-3 mt-2 flex items-center justify-center text-slate-400 dark:text-slate-300">
                    <User size={44} weight="duotone" />
                  </div>
                )}
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-none">{stats?.bestEmployeeName || "Rachel Johnson"}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-body">{stats?.bestEmployeeDesignation || "Marketing Director"}</p>
                <span className="mt-3.5 inline-block text-[10px] bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-body">
                  Rating: {stats?.bestEmployeeRating?.toFixed(1) || "5.0"} ⭐
                </span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/40 space-y-2 text-xs font-body">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tenure / Service</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stats?.bestEmployeeTenure ? `${stats.bestEmployeeTenure.toFixed(1)} Years` : "4.2 Years"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stats?.bestEmployeePhone || "(406) 555-0120"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={stats?.bestEmployeeEmail || "r.johnson@mail.com"}>{stats?.bestEmployeeEmail || "r.johnson@mail.com"}</span>
                </div>
              </div>
            </div>

            {/* Bento cell 2: Worked Hours chart (colspan 4) */}
            <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[420px] transition-colors duration-150">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] block animate-pulse" />
                  <span>Worked Hours & Trend</span>
                </h3>
                <div className="h-[210px] w-full mt-2 font-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad-hours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: 'var(--font-ui)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fontFamily: 'var(--font-ui)' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area name="Attendance Rate" type="monotone" dataKey="Attendance" stroke="var(--brand-primary)" strokeWidth={1.5} fill="url(#grad-hours)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/40 grid grid-cols-2 gap-4 text-xs font-body">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded border border-slate-200/50 dark:border-slate-700/30">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-1">Current Period</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">134h 21m</span>
                  <span className="text-[8px] text-slate-500 block mt-0.5">Apr 01 - Apr 15</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded border border-slate-200/50 dark:border-slate-700/30">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-1">Previous Period</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">110h 12m</span>
                  <span className="text-[8px] text-slate-500 block mt-0.5">Mar 16 - Mar 31</span>
                </div>
              </div>
            </div>

            {/* Bento cell 3: Today's Schedule (colspan 4) */}
            <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[420px] transition-colors duration-150">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/40 pb-3 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">Today's Schedule</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold font-body">{currentDateStr}</span>
                    <button
                      onClick={() => setShowAddForm(v => !v)}
                      title="Add schedule item"
                      className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)] transition-colors"
                    >
                      {showAddForm ? <X size={11} weight="bold" /> : <Plus size={11} weight="bold" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/30 p-1.5 rounded-lg mb-3 text-center font-body">
                  {['M', 'T', 'W', 'T', 'F'].map((day, idx) => (
                    <div 
                      key={idx} 
                      className={`flex-1 py-1 rounded text-xs cursor-pointer ${idx === 2 ? 'bg-[var(--brand-primary)] text-white font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
                    >
                      <p className="text-[9px] scale-[0.8] leading-none opacity-60 font-body">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][idx]}</p>
                      <p className="font-semibold mt-0.5">{idx + 1}</p>
                    </div>
                  ))}
                </div>

                {/* Add Schedule Form */}
                {showAddForm && (
                  <div className="mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 space-y-2">
                    <input
                      type="text"
                      placeholder="Event title *"
                      value={newItem.title}
                      onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                      className="w-full text-[11px] px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/50 font-body"
                    />
                    <input
                      type="text"
                      placeholder="Time (e.g. 10:00 - 11:00 AM) *"
                      value={newItem.time}
                      onChange={e => setNewItem(p => ({ ...p, time: e.target.value }))}
                      className="w-full text-[11px] px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/50 font-body"
                    />
                    <input
                      type="text"
                      placeholder="Location (optional)"
                      value={newItem.location}
                      onChange={e => setNewItem(p => ({ ...p, location: e.target.value }))}
                      className="w-full text-[11px] px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/50 font-body"
                    />
                    <select
                      value={newItem.color}
                      onChange={e => setNewItem(p => ({ ...p, color: e.target.value }))}
                      className="w-full text-[11px] px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/50 font-body"
                    >
                      <option value="blue">🔵 Blue</option>
                      <option value="emerald">🟢 Green</option>
                      <option value="amber">🟡 Amber</option>
                      <option value="rose">🔴 Red</option>
                      <option value="slate">⚪ Slate</option>
                    </select>
                    <button
                      onClick={addScheduleItem}
                      disabled={!newItem.title.trim() || !newItem.time.trim()}
                      className="w-full py-1.5 text-[11px] font-bold rounded bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-body"
                    >
                      + Add to Schedule
                    </button>
                  </div>
                )}

                {/* Schedule Items List */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {scheduleItems.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-6 font-body">No scheduled events today.</p>
                  )}
                  {scheduleItems.map(item => {
                    const colorMap = {
                      blue: "border-blue-500 bg-blue-500/5",
                      emerald: "border-emerald-500 bg-emerald-500/5",
                      amber: "border-amber-500 bg-amber-500/5",
                      rose: "border-rose-500 bg-rose-500/5",
                      slate: "border-slate-300 bg-slate-200/10 border-dashed",
                    };
                    return (
                      <div
                        key={item.id}
                        className={`pl-3 pr-2 py-1.5 border-l-2 text-xs text-left flex items-start justify-between gap-2 group rounded-r ${colorMap[item.color] || colorMap.blue}`}
                      >
                        <div className="min-w-0">
                          <p className={`font-bold leading-tight truncate ${
                            item.color === "slate" ? "text-slate-500" : "text-slate-800 dark:text-slate-200"
                          }`}>{item.title}</p>
                          <p className="text-[10px] text-slate-500 font-body mt-0.5">
                            {item.time}{item.location ? ` • ${item.location}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteScheduleItem(item.id)}
                          title="Delete event"
                          className="flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash size={11} weight="bold" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-right text-[10px] font-bold text-[var(--brand-primary)] font-body mt-3 flex-shrink-0">
                <Link to="/schedule" className="hover:underline flex items-center justify-end gap-1">
                  <span>View Schedule</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Bento cell 4: Onboarding Tasks Card (colspan 6) */}
            <div className="col-span-12 md:col-span-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[250px] transition-colors duration-150">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body mb-4 flex items-center gap-2">
                  <span>Onboarding Tasks compliance</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded font-body font-bold">60% Complete</span>
                </h3>
                <div className="flex h-5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/30">
                  <div className="bg-cyan-500 h-full w-[60%]" title="Completed" />
                  <div className="bg-indigo-500 h-full w-[20%]" title="On Going" />
                  <div className="bg-amber-500 h-full w-[10%]" title="Waiting" />
                  <div className="bg-slate-300 dark:bg-slate-700 h-full w-[10%]" title="Others" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 font-body text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 block" />
                    <span className="text-slate-500">Completed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
                    <span className="text-slate-500">On Going</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                    <span className="text-slate-500">Waiting</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 block" />
                    <span className="text-slate-500">Others</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-550 mt-2 font-body">Calculated for 4 newly onboarding hires this month.</p>
            </div>

            {/* Bento cell 5: Shortcuts & Platform Health Card (colspan 6) */}
            <div className="col-span-12 md:col-span-6 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[250px] transition-colors duration-150">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body mb-4">Quick Navigation Shortcuts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Link to="/employees" className="flex items-center justify-center p-2.5 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:border-[var(--brand-primary)]/40 transition-colors text-center font-body">
                    + Add Employee
                  </Link>
                  <Link to="/payroll" className="flex items-center justify-center p-2.5 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:border-[var(--brand-primary)]/40 transition-colors text-center font-body">
                    Run Payroll
                  </Link>
                  <Link to="/recruitment" className="flex items-center justify-center p-2.5 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:border-[var(--brand-primary)]/40 transition-colors text-center font-body">
                    Post Job
                  </Link>
                  <Link to="/leave" className="flex items-center justify-center p-2.5 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:border-[var(--brand-primary)]/40 transition-colors text-center font-body">
                    Request Leave
                  </Link>
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700/40 pt-4 grid grid-cols-3 gap-4 text-xs font-body">
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-0.5">Performance Avg</span>
                  <span className="font-bold text-amber-500">{stats?.avgPerformanceRating ? `${stats.avgPerformanceRating.toFixed(1)} / 5.0` : "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-0.5">Open Vacancies</span>
                  <span className="font-bold text-[var(--brand-primary)]">{stats?.openJobPositions || 0} active</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-0.5">Departments</span>
                  <span className="font-bold text-emerald-500">{stats?.totalDepartments || 0} active</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Employee Dashboard View - Styled and clean but keeping original content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Attendance Shift Info */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2 font-body">
                    <Clock size={14} className="text-[var(--brand-primary)]" />
                    <span>Attendance & Shift Info</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/30">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Today's Check-In</span>
                      <p className={`text-lg font-bold mt-1 ${stats?.presentToday === 1 ? "text-emerald-500" : "text-amber-500"}`}>
                        {stats?.presentToday === 1 ? "Present" : "Not Checked In"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-body">
                        {stats?.presentToday === 1 ? "Checked in successfully (Standard Shift)" : "You have not clocked in today."}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/30">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Default Shift</span>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1 font-body">09:00 AM – 06:00 PM</p>
                      <p className="text-xs text-slate-500 mt-1 font-body">Standard 8.0 hr work schedule</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/30 text-xs text-slate-550 dark:text-slate-400 flex items-start gap-2.5 font-body">
                  <Clock size={14} className="text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                  <span>Ensure you punch in/out daily to track working hours accurately. You can manage logs in the Attendance page.</span>
                </div>
              </div>

              {/* Card 2 & 3: Leaves and Performance row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2 font-body">
                      <Calendar size={14} className="text-[var(--brand-primary)]" />
                      <span>My Leave Summary</span>
                    </h3>
                    <div className="space-y-3.5 my-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Pending Requests</span>
                        <span className="font-semibold text-amber-500 font-body">{stats?.pendingLeaves || 0} requested</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded"
                          style={{ width: `${Math.min((stats?.pendingLeaves || 0) * 15, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <Link to="/leave" className="w-full mt-2">
                    <Button variant="secondary" className="w-full py-1.5 text-xs">
                      Manage Leaves
                    </Button>
                  </Link>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2 font-body">
                      <Star size={14} className="text-[var(--brand-primary)]" />
                      <span>My Performance Rating</span>
                    </h3>
                    <div className="space-y-3.5 my-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Average Review Rating</span>
                        <span className="font-semibold text-amber-500 font-body">
                          {stats?.avgPerformanceRating ? `${stats.avgPerformanceRating.toFixed(1)} / 5.0` : "No reviews yet"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div
                          className="bg-[var(--brand-primary)] h-full rounded"
                          style={{ width: `${(stats?.avgPerformanceRating || 0) * 20}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            weight={star <= Math.round(stats?.avgPerformanceRating || 0) ? "fill" : "regular"}
                            className={
                              star <= Math.round(stats?.avgPerformanceRating || 0)
                                ? "text-amber-500"
                                : "text-slate-300 dark:text-slate-700"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Link to="/performance" className="w-full mt-2">
                    <Button variant="secondary" className="w-full py-1.5 text-xs">
                      View Feedback
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

            {/* Employee Quick Actions Column */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2 font-body">
                    <Pulse size={14} className="text-[var(--brand-primary)]" />
                    <span>Quick Actions</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/attendance"
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 hover:border-[var(--brand-primary)]/40 hover:bg-slate-100/30 dark:hover:bg-white/[0.02] transition-all text-center group"
                    >
                      <Clock size={18} className="text-slate-400 group-hover:text-[var(--brand-primary)] mb-1.5" />
                      <span className="text-xs font-semibold text-slate-650 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white">Clock In/Out</span>
                    </Link>
                    <Link
                      to="/leave"
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 hover:border-[var(--brand-primary)]/40 hover:bg-slate-100/30 dark:hover:bg-white/[0.02] transition-all text-center group"
                    >
                      <Calendar size={18} className="text-slate-400 group-hover:text-[var(--brand-primary)] mb-1.5" />
                      <span className="text-xs font-semibold text-slate-650 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white">Request Leave</span>
                    </Link>
                    <Link
                      to="/payroll"
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 hover:border-[var(--brand-primary)]/40 hover:bg-slate-100/30 dark:hover:bg-white/[0.02] transition-all text-center group"
                    >
                      <CurrencyInr size={18} className="text-slate-400 group-hover:text-[var(--brand-primary)] mb-1.5" />
                      <span className="text-xs font-semibold text-slate-650 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white">My Payroll</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 hover:border-[var(--brand-primary)]/40 hover:bg-slate-100/30 dark:hover:bg-white/[0.02] transition-all text-center group"
                    >
                      <FileText size={18} className="text-slate-400 group-hover:text-[var(--brand-primary)] mb-1.5" />
                      <span className="text-xs font-semibold text-slate-650 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white">View Profile</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}

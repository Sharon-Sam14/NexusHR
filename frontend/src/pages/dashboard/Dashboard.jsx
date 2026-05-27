import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Clock, Calendar, DollarSign, Star, Briefcase,
  TrendingUp, Activity, Plus, FileText, Send, Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboardService";
import StatsCard from "../../components/StatsCard";
import AreaChartWidget from "../../components/charts/AreaChartWidget";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, isHR } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/40 border border-slate-700/50"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-cyan-500/10 to-indigo-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-medium text-sm">
              <Sparkles size={16} />
              <span>System active</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
              {getGreeting()}, {user?.name.split(" ")[0]}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Here is your overview for today. You have <span className="text-cyan-400 font-semibold">{stats?.unreadNotifications || 0}</span> unread notifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/attendance" className="btn-primary flex items-center gap-1.5 py-2.5 text-xs">
              <Clock size={15} /> Check In / Out
            </Link>
            <Link to="/leave" className="btn-secondary flex items-center gap-1.5 py-2.5 text-xs">
              <Calendar size={15} /> Request Leave
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Employees"
          value={stats?.activeEmployees || 0}
          subtitle={`Total headcount: ${stats?.totalEmployees || 0}`}
          icon={Users}
          color="cyan"
          trend={12}
          index={0}
        />
        <StatsCard
          title="Attendance Today"
          value={stats?.activeEmployees ? `${Math.round((stats.presentToday / stats.activeEmployees) * 100)}%` : "0%"}
          subtitle={`${stats?.presentToday || 0} present, ${stats?.absentToday || 0} absent`}
          icon={Clock}
          color="indigo"
          index={1}
        />
        <StatsCard
          title="Pending Leaves"
          value={stats?.pendingLeaves || 0}
          subtitle={`${stats?.approvedLeavesToday || 0} approved today`}
          icon={Calendar}
          color="yellow"
          index={2}
        />
        <StatsCard
          title="Monthly Payroll"
          value={`$${(stats?.totalPayrollThisMonth || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle="All payroll status"
          icon={DollarSign}
          color="emerald"
          index={3}
        />
      </div>

      {/* Charts & Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <AreaChartWidget
            title="Headcount & Attendance Trend (Last 5 Months)"
            data={trendData}
            dataKeys={["Employees", "Attendance"]}
          />
          <AreaChartWidget
            title="Payroll Expenses ($)"
            data={trendData}
            dataKeys={["Expenses"]}
          />
        </div>

        {/* Right 1 col - Quick actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="glass-card p-5 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              <span>Quick Actions</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {isHR() && (
                <>
                  <Link
                    to="/employees"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group"
                  >
                    <Plus size={20} className="text-slate-400 group-hover:text-cyan-400 mb-1.5" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">Add Employee</span>
                  </Link>
                  <Link
                    to="/payroll"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-center group"
                  >
                    <DollarSign size={20} className="text-slate-400 group-hover:text-emerald-400 mb-1.5" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">Run Payroll</span>
                  </Link>
                  <Link
                    to="/recruitment"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-center group"
                  >
                    <Briefcase size={20} className="text-slate-400 group-hover:text-indigo-400 mb-1.5" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">Post Job</span>
                  </Link>
                  <Link
                    to="/performance"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all text-center group"
                  >
                    <Star size={20} className="text-slate-400 group-hover:text-yellow-400 mb-1.5" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">New Review</span>
                  </Link>
                </>
              )}
              <Link
                to="/leave"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-center group"
              >
                <Calendar size={20} className="text-slate-400 group-hover:text-purple-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-300 group-hover:text-white">Request Leave</span>
              </Link>
              <Link
                to="/profile"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group"
              >
                <FileText size={20} className="text-slate-400 group-hover:text-cyan-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-300 group-hover:text-white">View Profile</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="glass-card p-5 border border-slate-700/50 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              <span>Platform Health</span>
            </h3>
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Average Performance</span>
                  <span className="font-semibold text-yellow-400">{stats?.avgPerformanceRating ? `${stats.avgPerformanceRating.toFixed(1)} / 5.0` : "N/A"}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full"
                    style={{ width: `${(stats?.avgPerformanceRating || 0) * 20}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Open Job Openings</span>
                  <span className="font-semibold text-indigo-400">{stats?.openJobPositions || 0} active</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                    style={{ width: `${Math.min((stats?.openJobPositions || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Total Departments</span>
                  <span className="font-semibold text-cyan-400">{stats?.totalDepartments || 0} active</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full"
                    style={{ width: `${Math.min((stats?.totalDepartments || 0) * 12.5, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

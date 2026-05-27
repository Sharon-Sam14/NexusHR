import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Check, CheckSquare, Trash, Calendar, DollarSign, Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import Badge from "../../components/Badge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { timeAgo } from "../../utils/formatters";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL or UNREAD

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getForUser(user.email);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user.email);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "LEAVE":
        return <Calendar size={16} className="text-yellow-400" />;
      case "PAYROLL":
        return <DollarSign size={16} className="text-emerald-400" />;
      case "ATTENDANCE":
        return <Clock size={16} className="text-blue-400" />;
      default:
        return <ShieldAlert size={16} className="text-cyan-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "LEAVE":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "PAYROLL":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "ATTENDANCE":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-cyan-500/10 border-cyan-500/20";
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <Bell size={24} className="text-cyan-400 animate-pulse" />
            <span>Notifications Centre</span>
          </h1>
          <p className="page-subtitle">Track important updates, approval notifications, and payroll releases.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary flex items-center gap-1.5 py-2 text-xs"
          >
            <CheckSquare size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${filter === "ALL"
            ? "border-cyan-500 text-white bg-slate-900/10"
            : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          All Updates ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${filter === "UNREAD"
            ? "border-cyan-500 text-white bg-slate-900/10"
            : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className="glass-card py-20">
          <EmptyState
            message={filter === "UNREAD" ? "All caught up!" : "No notifications"}
            description={filter === "UNREAD" ? "You have no unread notifications." : "We'll notify you here when you have updates."}
            icon={filter === "UNREAD" ? Check : BellOff}
          />
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNotifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className={`glass-card p-4.5 border flex items-start gap-4 transition-all ${notif.read ? "border-slate-800/80 bg-slate-900/20" : "border-cyan-500/20 bg-cyan-500/5 glow-cyan"}`}
            >
              {/* Type Icon */}
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${getTypeColor(notif.type)}`}>
                {getTypeIcon(notif.type)}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h3 className={`text-sm font-semibold text-white truncate ${notif.read ? "opacity-75" : ""}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>
                <p className={`text-xs mt-1 text-slate-300 leading-relaxed ${notif.read ? "text-slate-400 opacity-80" : ""}`}>
                  {notif.message}
                </p>
              </div>

              {/* Actions */}
              {!notif.read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="p-1 rounded-lg text-cyan-400 hover:bg-cyan-500/10 flex-shrink-0 transition-colors"
                  title="Mark as Read"
                >
                  <Check size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

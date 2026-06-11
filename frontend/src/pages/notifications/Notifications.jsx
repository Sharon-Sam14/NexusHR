// NexusHR: Premium Notifications Workspace.
import { useState, useEffect } from "react";
import { BellSimple, CalendarDots, CurrencyDollar, ClockCountdown, WarningCircle, Check, Trash } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import Badge from "../../components/Badge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { timeAgo } from "../../utils/formatters";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";

const TabPills = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 p-1 rounded-[12px]"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      boxShadow: 'var(--shadow-card)',
    }}>
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className="px-4 py-2 rounded-[9px] text-[13px] font-medium transition-all duration-150 cursor-pointer"
        style={{
          background: active === t.id ? 'var(--brand-blue)' : 'transparent',
          color: active === t.id ? '#fff' : 'var(--text-secondary)',
          fontFamily: 'var(--font-ui)',
          boxShadow: active === t.id ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" or "unread"

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

  const getNotifDetails = (category) => {
    const cat = (category || "").toUpperCase();
    switch (cat) {
      case "LEAVE":
        return {
          icon: CalendarDots,
          bg: "var(--color-warning-bg)",
          color: "var(--color-warning)",
        };
      case "PAYROLL":
        return {
          icon: CurrencyDollar,
          bg: "var(--color-success-bg)",
          color: "var(--color-success)",
        };
      case "ATTENDANCE":
        return {
          icon: ClockCountdown,
          bg: "var(--brand-blue-soft)",
          color: "var(--brand-blue)",
        };
      default:
        return {
          icon: WarningCircle,
          bg: "var(--color-danger-bg)",
          color: "var(--color-danger)",
        };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
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
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Filter & Actions Row */}
        <div className="flex items-center justify-between mb-4">
          <TabPills
            tabs={[
              { id: 'all', label: `All Updates (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` }
            ]}
            active={filter}
            onChange={setFilter}
          />
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[13px] font-semibold transition-all hover:opacity-80 cursor-pointer"
              style={{ color: 'var(--brand-blue)', fontFamily: 'var(--font-ui)' }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        {filteredNotifications.length === 0 ? (
          <Card padding="p-12" className="text-center">
            <EmptyState
              message={filter === "unread" ? "All caught up!" : "No notifications"}
              description={filter === "unread" ? "You have no unread notifications." : "We'll notify you here when you have updates."}
              icon={filter === "unread" ? Check : BellSimple}
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((n) => {
              const details = getNotifDetails(n.type); // database matches type field
              const IconComp = details.icon;
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-4 rounded-[12px] transition-colors duration-150 relative"
                  style={{
                    background: n.read ? 'transparent' : 'var(--brand-blue-soft)',
                    border: `1px solid ${n.read ? 'var(--border-card)' : 'var(--brand-blue-mid)'}`,
                  }}
                >
                  {/* Category icon */}
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ background: details.bg, color: details.color }}
                  >
                    <IconComp size={16} weight="light" />
                  </div>

                  {/* Message details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                    >
                      {n.title}
                    </p>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}
                    >
                      {n.message}
                    </p>
                  </div>

                  {/* Time + Action */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className="text-[11px]"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {timeAgo(n.createdAt)}
                    </span>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1 rounded transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: 'var(--brand-blue)' }}
                        title="Mark as read"
                      >
                        <Check size={14} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

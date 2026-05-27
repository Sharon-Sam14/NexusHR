import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "cyan", trend, index = 0 }) {
  const colorMap = {
    cyan:    { bg: "from-cyan-500/20 to-cyan-600/10", icon: "bg-cyan-500/20 text-cyan-400", border: "border-cyan-500/20" },
    indigo:  { bg: "from-indigo-500/20 to-indigo-600/10", icon: "bg-indigo-500/20 text-indigo-400", border: "border-indigo-500/20" },
    emerald: { bg: "from-emerald-500/20 to-emerald-600/10", icon: "bg-emerald-500/20 text-emerald-400", border: "border-emerald-500/20" },
    yellow:  { bg: "from-yellow-500/20 to-yellow-600/10", icon: "bg-yellow-500/20 text-yellow-400", border: "border-yellow-500/20" },
    red:     { bg: "from-red-500/20 to-red-600/10", icon: "bg-red-500/20 text-red-400", border: "border-red-500/20" },
    purple:  { bg: "from-purple-500/20 to-purple-600/10", icon: "bg-purple-500/20 text-purple-400", border: "border-purple-500/20" },
    orange:  { bg: "from-orange-500/20 to-orange-600/10", icon: "bg-orange-500/20 text-orange-400", border: "border-orange-500/20" },
  };

  const c = colorMap[color] || colorMap.cyan;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-emerald-400" : trend < 0 ? "text-red-400" : "text-slate-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden glass-card p-5 bg-gradient-to-br ${c.bg} border ${c.border}`}
    >
      {/* Decorative circle */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.icon} opacity-20`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-1.5 leading-none tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
              <TrendIcon size={12} />
              <span className="text-xs font-medium">
                {trend > 0 ? "+" : ""}{trend}% vs last month
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

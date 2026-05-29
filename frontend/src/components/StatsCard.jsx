import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Custom hook to animate numeric value changes
function useCountUp(targetVal, duration = 800) {
  const [count, setCount] = useState("0");

  useEffect(() => {
    const valueString = String(targetVal);
    const numericStr = valueString.replace(/[^0-9.]/g, "");
    const target = parseFloat(numericStr);
    
    if (isNaN(target)) {
      setCount(targetVal);
      return;
    }

    const isPercent = valueString.includes("%");
    const isRupee = valueString.includes("₹") || valueString.includes("₹");
    const start = 0;
    const end = target;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + easeProgress * (end - start);

      let formatted = "";
      if (isPercent) {
        formatted = `${Math.round(currentVal)}%`;
      } else if (isRupee) {
        formatted = `₹${Math.round(currentVal).toLocaleString("en-IN")}`;
      } else {
        formatted = Math.round(currentVal).toLocaleString();
      }

      setCount(formatted);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(targetVal);
      }
    };

    requestAnimationFrame(updateCount);
  }, [targetVal, duration]);

  return count;
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "cyan", trend, index = 0 }) {
  const displayVal = useCountUp(value);

  const colorMap = {
    cyan:    { bg: "from-cyan-500/10 via-cyan-600/5 to-transparent", icon: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", glow: "shadow-cyan-500/5" },
    indigo:  { bg: "from-indigo-500/10 via-indigo-600/5 to-transparent", icon: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", glow: "shadow-indigo-500/5" },
    emerald: { bg: "from-emerald-500/10 via-emerald-600/5 to-transparent", icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", glow: "shadow-emerald-500/5" },
    yellow:  { bg: "from-yellow-500/10 via-yellow-600/5 to-transparent", icon: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", glow: "shadow-yellow-500/5" },
    red:     { bg: "from-red-500/10 via-red-600/5 to-transparent", icon: "bg-red-500/10 text-red-400 border-red-500/20", glow: "shadow-red-500/5" },
    purple:  { bg: "from-purple-500/10 via-purple-600/5 to-transparent", icon: "bg-purple-500/10 text-purple-400 border-purple-500/20", glow: "shadow-purple-500/5" },
  };

  const c = colorMap[color] || colorMap.cyan;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-emerald-400" : trend < 0 ? "text-red-400" : "text-slate-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden glass-card p-5 bg-gradient-to-br ${c.bg} ${c.glow} group border border-slate-800/80`}
    >
      {/* Decorative gradient corner glow */}
      <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${c.bg} filter blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-extrabold text-white mt-2 leading-none tracking-tight tabular-nums">
            {displayVal}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-550 mt-2 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 block" />
              {subtitle}
            </p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2.5 ${trendColor} text-[10px] font-semibold uppercase tracking-wider`}>
              <TrendIcon size={12} />
              <span>
                {trend > 0 ? "+" : ""}{trend}% vs last month
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${c.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

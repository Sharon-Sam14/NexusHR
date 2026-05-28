import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 py-2.5 shadow-xl text-[11px] leading-relaxed">
        <p className="text-slate-500 font-bold uppercase tracking-wider mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 font-medium">{entry.name}:</span>
              <span className="text-white font-bold">
                {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AreaChartWidget({ data, dataKeys, title, height = 260 }) {
  const colors = ["#06b5d5", "#6366f1", "#10b981", "#f59e0b"];

  return (
    <div className="glass-card p-5 border border-slate-800/60">
      {title && (
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 block" />
          <span>{title}</span>
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            {/* Soft area gradient fills */}
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
              </linearGradient>
            ))}
            
            {/* SVG line glow filter */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComponentTransfer in="blur" result="glow1">
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(100,116,139,0.06)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: "#475569", fontSize: 10, fontWeight: "bold" }} 
            axisLine={false} 
            tickLine={false} 
            dy={8}
          />
          <YAxis 
            tick={{ fill: "#475569", fontSize: 10, fontWeight: "bold" }} 
            axisLine={false} 
            tickLine={false} 
            dx={-8}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(6, 181, 213, 0.15)", strokeWidth: 1 }} />
          {dataKeys.length > 1 && (
            <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold", paddingTop: "12px", color: "#64748b" }} />
          )}
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              fill={`url(#grad-${key})`}
              filter="url(#neon-glow)"
              dot={false}
              activeDot={{ r: 4.5, fill: colors[i % colors.length], stroke: "#020617", strokeWidth: 1.5 }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

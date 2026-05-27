import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2.5 shadow-xl text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AreaChartWidget({ data, dataKeys, title, height = 260 }) {
  const colors = ["#06b5d5", "#6366f1", "#10b981", "#f59e0b"];

  return (
    <div className="glass-card p-5">
      {title && <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {dataKeys.length > 1 && <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />}
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              fill={`url(#grad-${key})`}
              dot={false}
              activeDot={{ r: 5, fill: colors[i % colors.length] }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

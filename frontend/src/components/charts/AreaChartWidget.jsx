import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import Card from "../ui/Card";

const CHART_COLORS = ['#06AEC3', '#E8542A', '#22A866', '#3B82F6', '#D97706'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div 
        className="border border-[var(--border-card)] px-3 py-2.5 shadow-[var(--shadow-card)] text-[12px] leading-relaxed rounded-[4px]"
        style={{ 
          background: 'var(--surface-elevated)', 
          fontFamily: 'var(--font-mono)',
        }}
      >
        <p className="font-bold uppercase tracking-wider mb-1.5 text-slate-800 dark:text-slate-200">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500 dark:text-slate-400 font-medium">{entry.name}:</span>
              <span className="text-slate-800 dark:text-slate-100 font-bold">
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
  return (
    <Card className="p-5">
      {title && (
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-mono)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] block" />
          <span>{title}</span>
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid strokeDasharray="4 4" stroke="var(--border-default)" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'rgb(var(--slate-500-rgb))' }} 
            axisLine={false} 
            tickLine={false} 
            dy={8}
          />
          <YAxis 
            tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'rgb(var(--slate-500-rgb))' }} 
            axisLine={false} 
            tickLine={false} 
            dx={-8}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(6, 174, 195, 0.15)", strokeWidth: 1 }} />
          {dataKeys.length > 1 && (
            <Legend wrapperStyle={{ fontSize: "11px", fontFamily: 'var(--font-mono)', paddingTop: "12px", color: "rgb(var(--slate-500-rgb))" }} />
          )}
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={1.5}
              fill={`url(#grad-${key})`}
              dot={false}
              activeDot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length], stroke: "var(--surface-card)", strokeWidth: 1.5 }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

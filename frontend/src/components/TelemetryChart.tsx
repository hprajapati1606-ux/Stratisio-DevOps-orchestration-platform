import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Activity, Wifi } from 'lucide-react';

interface TelemetryChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  loading?: boolean;
  type?: 'area' | 'line';
  live?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
        <p className="text-[10px] font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-400">{payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  title, data, dataKey, color = "#6366f1", loading, type = 'area', live = false
}) => {
  const gradId = `grad-${dataKey}-${color.replace('#', '')}`;
  // Shimmer highlight line color based on chart color
  const accentStyle = live ? { '--chart-accent': color } as React.CSSProperties : {};

  return (
    <div
      style={accentStyle}
      className={`glass-card rounded-2xl p-5 relative overflow-hidden h-full transition-all duration-500 ${live ? 'neon-chart-pulse' : ''}`}
    >
      {/* Top accent line — matches chart color */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${color}55, transparent)` }}
      />

      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: `${color}18`, color }}>
            <Activity size={14} />
          </div>
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        </div>
        {live && (
          <div className="flex items-center gap-1.5">
            <div className="live-dot" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      <div className="w-full h-44">
        {loading ? (
          <div className="w-full h-full flex flex-col gap-3 pt-2">
            <div className="skeleton-box h-5 w-2/3" />
            <div className="skeleton-box flex-1 w-full rounded-xl" style={{ minHeight: '100px' }} />
            <div className="skeleton-box h-3 w-1/2" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Awaiting data stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }}
                  axisLine={false} tickLine={false} dy={6}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }}
                  axisLine={false} tickLine={false} dx={-4}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey={dataKey}
                  stroke={color} strokeWidth={2}
                  fillOpacity={1} fill={`url(#${gradId})`}
                  animationDuration={800}
                  dot={false}
                />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey={dataKey}
                  stroke={color} strokeWidth={2} dot={false}
                  animationDuration={800}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

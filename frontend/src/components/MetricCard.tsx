import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: string;
  loading?: boolean;
  accent?: 'blue' | 'green' | 'amber' | 'rose' | 'cyan';
}

const ACCENT_MAP = {
  blue:  { icon: 'bg-indigo-500/10 text-indigo-400',  badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', bar: '#6366f1' },
  green: { icon: 'bg-emerald-500/10 text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', bar: '#10b981' },
  amber: { icon: 'bg-amber-500/10 text-amber-400',     badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',     bar: '#f59e0b' },
  rose:  { icon: 'bg-rose-500/10 text-rose-400',       badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',       bar: '#f43f5e' },
  cyan:  { icon: 'bg-cyan-500/10 text-cyan-400',       badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',       bar: '#06b6d4' },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label, value, subValue, icon, trend, loading, accent = 'blue'
}) => {
  const a = ACCENT_MAP[accent];
  const isPositive = trend?.startsWith('+');
  const isNeutral  = trend === '0' || trend === '—' || trend?.includes('✓');

  return (
    <div className="glass-card rounded-2xl p-5 group cursor-default relative overflow-hidden">
      {/* Top accent bar — matches accent color on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${a.bar}60, transparent)` }}
      />
      {/* Radial glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${a.bar}0A 0%, transparent 60%)` }}
      />

      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${a.icon} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
            isNeutral  ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
            isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                         'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {trend}
          </span>
        )}
      </div>

      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[2px] mb-1">{label}</p>

      {loading ? (
        <div className="flex flex-col gap-2 mt-1">
          <div className="skeleton-box h-7 w-24 rounded-lg" />
          <div className="skeleton-box h-3 w-16 rounded" />
        </div>
      ) : (
        <div className="flex items-baseline gap-2 count-up">
          <h3 className="text-2xl font-black text-slate-100 tracking-tight transition-all group-hover:translate-x-0.5 duration-300">
            {value}
          </h3>
          {subValue && (
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{subValue}</span>
          )}
        </div>
      )}
    </div>
  );
};

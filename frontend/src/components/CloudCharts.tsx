import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// ─── Cloud Distribution Pie Chart ────────────────────────────────────────────

const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
        <p className="text-[10px] font-bold text-slate-300">{payload[0].name}</p>
        <p className="text-sm font-black text-indigo-400">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

interface PieData { name: string; value: number }

export const CloudPieChart: React.FC<{ data: PieData[]; title: string }> = ({ data, title }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <h3 className="text-sm font-bold text-slate-200 mb-4">{title}</h3>

      <div className="flex items-center gap-4">
        <div className="w-[140px] h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={42}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={900}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2.5">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[10px] font-semibold text-slate-400">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-300 w-8 text-right">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Cost Donut Chart ─────────────────────────────────────────────────────────

const DONUT_COLORS = ['#6366f1', '#06b6d4', '#10b981'];

export const CostDonutChart: React.FC<{ data: PieData[]; title: string; center?: string }> = ({
  data, title, center
}) => (
  <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    <h3 className="text-sm font-bold text-slate-200 mb-4">{title}</h3>

    <div className="relative w-full flex justify-center mb-4">
      <div className="w-[160px] h-[160px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={52}
              outerRadius={72}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
              animationBegin={0}
              animationDuration={900}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {center && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-100">{center}</span>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Total</span>
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2">
      {data.map((item, i) => (
        <div key={item.name} className="text-center">
          <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
          <p className="text-[9px] font-semibold text-slate-500">{item.name}</p>
          <p className="text-xs font-black text-slate-300">{item.value}%</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Cost Comparison Bar Chart ────────────────────────────────────────────────

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
        <p className="text-[10px] font-bold text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
            <p className="text-xs font-bold" style={{ color: p.fill }}>${p.value}/mo</p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface CloudCompareData { month: string; aws: number; azure: number; gcp: number; local: number }

export const CloudCompareChart: React.FC<{ data: CloudCompareData[]; title: string }> = ({ data, title }) => (
  <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    <h3 className="text-sm font-bold text-slate-200 mb-4">{title}</h3>

    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 4, left: -20, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 9, fill: '#475569', fontWeight: 700 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#475569' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomBarTooltip />} />
          <Bar dataKey="aws" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={800} />
          <Bar dataKey="azure" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={900} />
          <Bar dataKey="gcp" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={1000} />
          <Bar dataKey="local" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={1100} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="flex justify-center gap-4 mt-3">
      {[{ label: 'AWS', color: '#f59e0b' }, { label: 'Azure', color: '#3b82f6' }, { label: 'GCP', color: '#10b981' }, { label: 'Local', color: '#8b5cf6' }].map(l => (
        <div key={l.label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
          <span className="text-[9px] font-semibold text-slate-500">{l.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Cost Forecast Bar Chart ──────────────────────────────────────────────────

interface ForecastData { date: string; predicted_cost: number }

export const CostForecastChart: React.FC<{ data: ForecastData[]; title: string }> = ({ data, title }) => (
  <div className="glass-card rounded-2xl p-5 relative overflow-hidden h-full">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
    <h3 className="text-sm font-bold text-slate-200 mb-4">{title}</h3>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 8, fill: '#475569', fontWeight: 600 }} 
            axisLine={false} 
            tickLine={false} 
            interval={5}
          />
          <YAxis 
            tick={{ fontSize: 8, fill: '#475569' }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
            itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
          />
          <Bar 
            dataKey="predicted_cost" 
            fill="url(#costGradient)" 
            radius={[4, 4, 0, 0]} 
            animationDuration={1500} 
            maxBarSize={30}
          />
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

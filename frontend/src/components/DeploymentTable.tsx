import { Settings2, Cpu, MemoryStick, Clock, MoreHorizontal, Sparkles } from 'lucide-react';

interface Deployment {
  id: number;
  name: string;
  image: string;
  cloud: string;
  port: number;
  status: string;
  ip_address?: string;
  cpu_usage: string;
  memory_usage: string;
  container_id?: string;
  created_at: string;
}

interface DeploymentTableProps {
  data: Deployment[];
  onSettingsClick: (resource: any) => void;
  loading?: boolean;
}

const CLOUD_BADGE: Record<string, string> = {
  aws:   'badge-amber',
  azure: 'badge-blue',
  gcp:   'badge-green',
  local: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

const CLOUD_LABEL: Record<string, string> = {
  aws: 'AWS', azure: 'Azure', gcp: 'GCP', local: 'Local'
};

const STATUS_STYLE: Record<string, string> = {
  'Running':         'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Running (Demo)':  'bg-cyan-500/10    text-cyan-400    border-cyan-500/20',
  'Stopped':         'bg-slate-500/10   text-slate-400   border-slate-500/20',
  'Error':           'bg-rose-500/10    text-rose-400    border-rose-500/20',
};

export const DeploymentTable: React.FC<DeploymentTableProps> = ({ data, onSettingsClick, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/5 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-1/4" />
                <div className="h-2 bg-white/5 rounded w-1/3" />
              </div>
              <div className="w-16 h-6 bg-white/5 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Cpu size={20} className="text-indigo-400" />
        </div>
        <p className="text-sm font-bold text-slate-300 mb-1">No deployments yet</p>
        <p className="text-xs text-slate-600">Click "Provision Node" to deploy your first container.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-3 px-4 mb-1">
        {['Name', 'Provider', 'Status', 'CPU', 'Memory', 'Port', ''].map((h, i) => (
          <div
            key={h}
            className={`text-[9px] font-bold text-slate-600 uppercase tracking-[2px] ${
              i === 0 ? 'col-span-3' :
              i === 1 ? 'col-span-2' :
              i === 2 ? 'col-span-2' :
              i === 3 ? 'col-span-1' :
              i === 4 ? 'col-span-2' :
              i === 5 ? 'col-span-1' : 'col-span-1 text-right'
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      {data.map((dep) => {
        const cloudKey = (dep.cloud || 'local').toLowerCase();
        const statusStyle = STATUS_STYLE[dep.status] || STATUS_STYLE['Stopped'];
        const cloudBadge = CLOUD_BADGE[cloudKey] || CLOUD_BADGE['local'];

        return (
          <div
            key={dep.id}
            className="glass-card rounded-xl px-4 py-3 grid grid-cols-12 gap-3 items-center group hover:border-indigo-500/20 transition-all duration-200"
          >
            {/* Name */}
            <div className="col-span-3 flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Cpu size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{dep.name}</p>
                <p className="text-[9px] text-slate-600 truncate font-mono">{dep.image}</p>
              </div>
            </div>

            {/* Cloud */}
            <div className="col-span-2">
              <span className={`text-[9px] font-bold px-2 py-1 rounded-md border ${cloudBadge}`}>
                {CLOUD_LABEL[cloudKey] || dep.cloud}
              </span>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <span className={`text-[9px] font-bold px-2 py-1 rounded-md border ${statusStyle} flex items-center gap-1 w-fit`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  dep.status?.includes('Running') ? 'bg-emerald-400' : 'bg-slate-500'
                }`} />
                {dep.status?.replace(' (Demo)', '')}
              </span>
            </div>

            {/* CPU */}
            <div className="col-span-1">
              <p className="text-[10px] font-bold text-slate-300">{dep.cpu_usage}</p>
            </div>

            {/* Memory */}
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-slate-300 truncate">{dep.memory_usage}</p>
            </div>

            {/* Port */}
            <div className="col-span-1">
              <p className="text-[10px] font-mono text-slate-500">{dep.port}</p>
            </div>

            {/* Action */}
            <div className="col-span-1 flex items-center justify-end gap-2">
              <div className="flex flex-col items-end mr-2">
                 <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Confidence</span>
                 <span className="text-[10px] font-black text-indigo-400">98%</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  (window as any).explainResource?.(dep.name);
                }}
                className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                title="Explain My Cloud"
              >
                <Sparkles size={13} />
              </button>
              <button
                onClick={() => onSettingsClick(dep)}
                className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/08 flex items-center justify-center text-slate-600 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

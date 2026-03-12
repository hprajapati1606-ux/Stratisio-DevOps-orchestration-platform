"use client"

import React, { useState, useEffect, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import {
  BarChart3,
  Cloud,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  LayoutDashboard,
  Rocket,
  Settings,
  Zap,
  DollarSign,
  Plus,
  Activity,
  History,
  Lock,
  Globe,
  Server,
  X,
  RefreshCw,
  Trash2,
  LogOut,
  ChevronDown
} from 'lucide-react'

// --- Shared Utility Components ---

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600/15 text-blue-500 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      <span className="text-[13px] font-bold tracking-tight">{label}</span>
    </div>
  )
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  const isPositive = change.startsWith('+')
  return (
    <div className="glass-card rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex justify-between items-start mb-5">
        <div className="p-3 bg-white/5 rounded-2xl ring-1 ring-white/10 shadow-inner">
          {icon}
        </div>
        <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-1.5">{title}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  )
}

function ProviderUsage({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-2">
        <span className="text-slate-300">{label}</span>
        <span className="text-white">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function UserProfileCard({ username, onLogout }: { username: string, onLogout: () => void }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)

  const handleSettings = () => {
    setShowMenu(false)
    setShowSettings(true)
  }

  const handleSecurity = () => {
    setShowMenu(false)
    setShowSecurity(true)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full glass-card rounded-[24px] p-5 border-white/5 relative overflow-hidden group hover:border-white/10 transition-all cursor-pointer text-left"
      >
        <div className="absolute inset-0 bg-blue-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-lg shadow-xl ring-2 ring-white/10">
            {username.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-white truncate">{username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <p className="text-[9px] text-slate-400 font-bold uppercase truncate tracking-wider">Verified Enterprise</p>
            </div>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu - Dark Background */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0b0f1a] rounded-2xl border-white/20 border p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-xl">
            <div className="space-y-1">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Account</p>
                <p className="text-sm font-bold text-white mt-1">{username}</p>
                <p className="text-xs text-slate-500">hitesh123@gmail.com</p>
              </div>

              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
              >
                <Settings size={16} />
                Profile Settings
              </button>

              <button
                onClick={handleSecurity}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
              >
                <ShieldCheck size={16} />
                Security
              </button>

              <div className="border-t border-white/10 my-2" />

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all text-sm font-medium"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative bg-[#0b0f1a] rounded-3xl border border-white/20 p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>

            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <Settings size={24} className="text-blue-500" />
              Profile Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={username}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="hitesh123@gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all mt-6">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {showSecurity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSecurity(false)} />
          <div className="relative bg-[#0b0f1a] rounded-3xl border border-white/20 p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setShowSecurity(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>

            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <ShieldCheck size={24} className="text-blue-500" />
              Security Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Change Password</label>
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 mb-2"
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 mb-2"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-400 mb-2">🔒 Two-Factor Authentication</p>
                <button className="text-sm text-blue-400 hover:text-blue-300 font-bold">Enable 2FA</button>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all mt-6">
                Update Security
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DeploymentModal = ({ isOpen, onClose, onDeploy, isDeploying }: { isOpen: boolean, onClose: () => void, onDeploy: (data: any) => void, isDeploying: boolean }) => {
  const initialForm = {
    name: '',
    image: '',
    cloud: 'aws',
    port: 80
  }
  const [formData, setFormData] = useState(initialForm)

  const handleClose = () => {
    setFormData(initialForm)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card rounded-[32px] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white tracking-tight">Manual Provisioning</h3>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">App Name</label>
            <input
              type="text"
              placeholder="e.g. Nebula-API"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Container Image</label>
            <input
              type="text"
              placeholder="e.g. nginx:latest"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Cloud Provider</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                value={formData.cloud}
                onChange={(e) => setFormData({ ...formData, cloud: e.target.value })}
              >
                <option value="aws" className="bg-[#0b0f1a]">AWS</option>
                <option value="azure" className="bg-[#0b0f1a]">Azure</option>
                <option value="gcp" className="bg-[#0b0f1a]">GCP</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Service Port</label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => { onDeploy(formData); setFormData(initialForm); }}
          disabled={isDeploying || !formData.name || !formData.image}
          className={`w-full mt-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 ${isDeploying || !formData.name || !formData.image ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20'}`}
        >
          {isDeploying ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Rocket size={16} />}
          {isDeploying ? 'Deploying...' : 'Confirm Provisioning'}
        </button>
      </div>
    </div>
  )
}

// --- Specific View Components ---

const OverviewView = ({ stats, telemetry }: { stats: any, telemetry: any }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="space-y-6 max-w-7xl">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Deployments" value={(stats?.total_deployments ?? 0).toString()} change="+12%" icon={<Rocket className="text-blue-500" size={18} />} />
        <StatCard title="AI Confidence" value={stats?.ai_confidence ?? "94%"} change="+2.4%" icon={<Cpu className="text-purple-500" size={18} />} />
        <StatCard title="Monthly Spend" value={stats?.monthly_spend ?? "$0"} change="-4.5%" icon={<DollarSign className="text-emerald-500" size={18} />} />
        <StatCard title="Active Incidents" value={(stats?.active_incidents ?? 0).toString()} change="-1" icon={<ShieldCheck className="text-rose-500" size={18} />} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Real-time Telemetry
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-blue-600/10 text-blue-600 text-[9px] font-black rounded-full uppercase tracking-wider">CPU LOAD %</span>
            </div>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry.cpu_load}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex justify-between text-[9px] text-slate-600 font-black uppercase tracking-[2px] px-1">
            <span>T-15m</span><span>T-10m</span><span>T-5m</span><span>Now</span>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <h3 className="font-bold text-white text-base mb-6 flex items-center gap-2">
            <Globe size={18} className="text-cyan-400" /> Cloud Distribution
          </h3>
          <div className="space-y-5">
            <ProviderUsage label="AWS (Primary)" percentage={45} color="bg-blue-600" />
            <ProviderUsage label="Azure (Secondary)" percentage={30} color="bg-purple-600" />
            <ProviderUsage label="GCP (Edge)" percentage={20} color="bg-cyan-400" />
            <ProviderUsage label="Local" percentage={5} color="bg-slate-500" />
          </div>
          <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Primary Region</p>
            <p className="text-xs font-bold text-white">US-East-1 (Primary)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ResourceSettingsModal = ({ isOpen, onClose, resource, onAction, isProcessing }: { isOpen: boolean, onClose: () => void, resource: any, onAction: (action: string) => void, isProcessing: boolean }) => {
  if (!isOpen || !resource) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm glass-card rounded-[32px] border border-white/10 p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-white leading-tight">{resource.name}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{resource.cloud} • {resource.ip_address}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onAction('restart')}
            disabled={isProcessing}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
          >
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 group-hover:bg-blue-500/30 transition-colors">
              <RefreshCw size={18} className={isProcessing ? "animate-spin" : ""} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-white uppercase tracking-wider">Restart Node</p>
              <p className="text-[10px] text-slate-500">Soft reboot the container</p>
            </div>
          </button>

          <button
            onClick={() => onAction('terminate')}
            disabled={isProcessing}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all group"
          >
            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 group-hover:bg-rose-500/30 transition-colors">
              <Trash2 size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Terminate</p>
              <p className="text-[10px] text-rose-900/60">Destroy all resources</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

const ProvisionView = ({ inventory, onDeploy, isDeploying, onSettingsClick }: { inventory: any[], onDeploy: () => void, isDeploying: boolean, onSettingsClick: (resource: any) => void }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex justify-between items-end mb-12">
      <div>
        <h3 className="text-4xl font-black text-white tracking-tighter mb-2">Cloud Resource Inventory</h3>
        <p className="text-slate-500 text-sm font-medium">Manage and provision infrastructure across simulated clusters.</p>
      </div>
      <button
        onClick={onDeploy}
        disabled={isDeploying}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[20px] text-xs font-black shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 uppercase tracking-[2px]"
      >
        <Plus size={18} />
        {isDeploying ? 'Processing...' : 'New Deployment'}
      </button>
    </div>

    <div className="space-y-4">
      {inventory.length === 0 ? (
        <div className="p-20 text-center glass-card rounded-[40px] border border-dashed border-white/5">
          <p className="text-slate-600 font-bold uppercase tracking-[4px] text-[10px]">No Resources Provisioned</p>
        </div>
      ) : (
        inventory.map((item, idx) => (
          <div key={idx} className="glass-card p-8 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                <div className="w-6 h-4 bg-emerald-400/20 border-2 border-emerald-400 rounded-sm" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white mb-1">{item.name || 'Provisioning Node'}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.cloud || 'MULTI-CLOUD'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span className="text-[10px] font-bold text-slate-600">{item.image || 'container:latest'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span className="text-[10px] font-bold text-slate-700">{item.ip_address || '10.x.x.x'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-16">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Utilization</p>
                <p className="text-xl font-black text-white">{item.cpu_usage} CPU <span className="text-slate-700 mx-1">/</span> {item.memory_usage}</p>
              </div>
              <div className="text-right min-w-[100px]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'Running' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-sm font-black text-white uppercase tracking-wider">{item.status}</span>
                </div>
              </div>
              <button
                onClick={() => onSettingsClick(item)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                <Settings size={20} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)

const TelemetryStreamView = ({ telemetry }: { telemetry: any }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div>
      <h3 className="text-xl font-black text-white tracking-tight">Telemetry Stream</h3>
      <p className="text-slate-500 text-xs">Live data ingestion from multi-cloud Prometheus instances.</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-8 rounded-3xl border border-white/5">
        <h3 className="font-bold text-white mb-8 flex items-center gap-2">
          <Activity size={20} className="text-blue-500" /> Cluster Load (CPU %)
        </h3>
        <div className="space-y-6">
          {[
            { label: 'AWS Cluster (Ohio)', val: 89, color: 'bg-rose-500' },
            { label: 'Azure West (Amsterdam)', val: 34, color: 'bg-emerald-500' },
            { label: 'GCP Asia (Singapore)', val: 56, color: 'bg-blue-500' },
            { label: 'Local Dev Edge', val: 12, color: 'bg-emerald-500' }
          ].map((node, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-2">
                <span className="text-slate-400">{node.label}</span>
                <span className={`${node.val > 80 ? 'text-rose-500' : 'text-emerald-500'}`}>{node.val}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${node.color}`} style={{ width: `${node.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-purple-600/5 to-transparent">
        <h3 className="font-bold text-white mb-8 flex items-center gap-2">
          <Zap size={20} className="text-purple-500" /> Request Throughput
        </h3>
        <div className="w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={telemetry.throughput}>
              <Bar dataKey="value" fill="#9333ea" radius={[2, 2, 0, 0]} />
              <Tooltip cursor={{ fill: 'transparent' }} content={() => null} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[2px] text-slate-400">
            7.2k req / sec (AVG)
          </div>
        </div>
      </div>
    </div>

    <div className="glass-card p-6 rounded-2xl border border-white/5 font-mono text-[11px] text-emerald-400/80 bg-black/40 h-48 overflow-y-auto custom-scrollbar">
      <div className="space-y-1">
        <p>[19:43:01] INFO: Metrics scraped from aws-pod-a1</p>
        <p>[19:43:05] WARN: Higher latency (240ms) on azure-network-gateway</p>
        <p>[19:43:10] INFO: Scaling signal confirmed by AIOps Engine</p>
        <p>[19:43:12] DEBUG: Prometheus job 'stratos-exporter' finished in 12ms</p>
        <p>[19:43:15] INFO: Health check passed for 42/42 services</p>
        <p className="animate-pulse">_ Generating live stream...</p>
      </div>
    </div>
  </div>
)

const AIOpsView = ({ onManualSwitch, aiMode }: { onManualSwitch: () => void, aiMode: 'auto' | 'manual' }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="glass-card p-10 rounded-3xl bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 border-blue-600/20">
      <div className="flex items-center gap-5 mb-8">
        <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600 shadow-xl shadow-blue-600/10 border border-blue-600/20">
          <Activity size={32} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">AIOps Intelligence Hub</h3>
          <p className="text-slate-400 text-sm">Predictive orchestration powered by Z-Score Statistical Modeling.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Model Accuracy</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">92.8%</span>
            <span className="text-emerald-500 text-[10px] font-bold mb-1">+0.4%</span>
          </div>
        </div>
        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Analysis Frequency</p>
          <span className="text-3xl font-black text-white">12ms</span>
          <span className="text-slate-500 text-[9px] font-bold block mt-1">Real-time sampling rate</span>
        </div>
        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Insights Generated</p>
          <span className="text-3xl font-black text-white">1,452</span>
          <span className="text-slate-500 text-[9px] font-bold block mt-1">This 24-hour cycle</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-8 rounded-3xl border border-white/5">
        <h4 className="font-black text-white text-lg mb-6 uppercase tracking-tight">Active Recommendations</h4>
        <div className="space-y-4">
          {[
            { msg: "High latency detected on AWS-US-East-1. Recommend scaling order-service to 3 replicas.", time: "2 min ago", type: "CRITICAL" },
            { msg: "Predictive spike at 22:00 UTC. suggested pre-warming db-cache for Azure Region.", time: "15 min ago", type: "PREDICTED" },
            { msg: "Memory utilization anomaly on Local Node #2. Investigation recommended.", time: "32 min ago", type: "ANOMALY" }
          ].map((item, i) => (
            <div key={i} className="flex gap-5 p-5 hover:bg-white/5 rounded-3xl transition-all border border-transparent hover:border-white/5">
              <div className={`w-1.5 rounded-full ${item.type === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : item.type === 'PREDICTED' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-[1px] ${item.type === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>{item.type}</span>
                  <span className="text-[10px] text-slate-600 font-black">{item.time}</span>
                </div>
                <p className="text-sm text-slate-300 font-bold leading-relaxed">{item.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
        <div className={`w-24 h-24 ${aiMode === 'auto' ? 'bg-blue-600/5 border-blue-600/20 text-blue-500' : 'bg-rose-600/5 border-rose-600/20 text-rose-500'} rounded-full border flex items-center justify-center mb-6 shadow-3xl`}>
          {aiMode === 'auto' ? <Cpu size={48} className="animate-spin-slow" /> : <ShieldAlert size={48} />}
        </div>
        <h4 className="text-2xl font-black text-white mb-2">
          {aiMode === 'auto' ? 'Auto-Scaling Enabled' : 'Manual Mode Active'}
        </h4>
        <p className="text-slate-500 text-sm max-w-[300px]">
          {aiMode === 'auto'
            ? 'The engine is currently in Autonomous Mode. Scaling decisions are applied automatically based on 90%+ confidence thresholds.'
            : 'Autonomous actions are currently suspended. All scaling and performance adjustments require manual approval from an administrator.'}
        </p>
        <button
          onClick={onManualSwitch}
          className={`mt-8 px-8 py-3 font-black text-xs uppercase tracking-[3px] rounded-2xl transition-all shadow-xl ${aiMode === 'auto' ? 'bg-white text-black hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'}`}>
          {aiMode === 'auto' ? 'Switch to Manual' : 'Reactivate Auto-Scale'}
        </button>
      </div>
    </div>
  </div>
)

const CostView = ({ onOptimize }: { onOptimize: () => void }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div>
      <h3 className="text-xl font-black text-white tracking-tight">Cost Intelligence</h3>
      <p className="text-slate-500 text-xs">FinOps analysis and multi-cloud spend optimization.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <TrendingUp size={60} className="text-blue-600/10" />
        </div>
        <h3 className="font-black text-slate-500 text-xs uppercase tracking-[4px] mb-10">Monthly Projected Spend</h3>
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-white tracking-tighter">$14,200</span>
            <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20">
              -12.4% EFFICIENCY
            </div>
          </div>
          <div className="h-px bg-white/5" />
          <div className="space-y-6">
            <ProviderUsage label="AWS Compute Engine" percentage={65} color="bg-blue-600" />
            <ProviderUsage label="Azure Storage & DB" percentage={20} color="bg-purple-600" />
            <ProviderUsage label="GCP Networking" percentage={15} color="bg-cyan-400" />
          </div>
        </div>
      </div>

      <div className="glass-card p-10 rounded-[40px] border border-rose-500/10 bg-rose-500/5 flex flex-col justify-center items-center text-center">
        <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-8 shadow-3xl shadow-rose-500/10">
          <DollarSign size={48} />
        </div>
        <h4 className="text-3xl font-black text-white mb-4 tracking-tight">FinOps Alert</h4>
        <p className="text-slate-400 font-medium max-w-[320px] leading-relaxed">
          Consolidating your <b>GCP Coldline Storage</b> into the <b>AWS Archive Tier</b> could save you <b>$1,240/year</b> on backup costs.
        </p>
        <button
          onClick={onOptimize}
          className="mt-10 px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-[4px] rounded-3xl shadow-2xl shadow-rose-600/30 transition-all border border-rose-500/50">
          Optimize Now
        </button>
      </div>
    </div>
  </div>
)

const SecOpsView = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div>
      <h3 className="text-2xl font-black text-white tracking-tight">SecOps Center</h3>
      <p className="text-slate-500 text-sm">Security posture and compliance across all simulated clouds.</p>
    </div>

    <div className="glass-card p-10 rounded-[40px] border-emerald-500/20 bg-emerald-500/5 backdrop-blur-3xl">
      <div className="flex items-center gap-5 mb-10">
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Zero-Trust Guard</h3>
          <p className="text-slate-400 text-sm italic">Infrastructure is currently fully shielded and compliant.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Network Firewall', val: 'Active', color: 'text-emerald-500' },
          { label: 'mTLS Encryption', val: 'Forced', color: 'text-emerald-500' },
          { label: 'Access Control', val: 'RBAC Active', color: 'text-blue-500' },
          { label: 'Vulnerability Pool', val: '0 Critical', color: 'text-emerald-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-black/20 p-6 rounded-3xl border border-white/5 group hover:bg-black/40 transition-all">
            <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={`text-lg font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="glass-card p-8 rounded-3xl border border-white/5">
      <h4 className="font-black text-white text-lg mb-8 uppercase tracking-widest">Security Audit Log</h4>
      <div className="space-y-4">
        {[
          { event: "RBAC Token Rotation", node: "AUTH-GW-01", time: "5 min ago", status: "SECURE" },
          { event: "Ingress Rule Updated", node: "AWS-SG-PROD", time: "12 min ago", status: "MODIFIED" },
          { event: "Secret Scanned (Clean)", node: "GIT-HOOK", time: "42 min ago", status: "SECURE" },
          { event: "Suspicious API Request Blocked", node: "EDGE-POXY", time: "1h ago", status: "BLOCKED" }
        ].map((ev, i) => (
          <div key={i} className="flex justify-between items-center p-5 hover:bg-white/5 rounded-[20px] transition-all group border border-transparent hover:border-white/5">
            <div className="flex items-center gap-4">
              <div className={`w-2.5 h-2.5 rounded-full ${ev.status === 'BLOCKED' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-sm text-slate-300 font-bold group-hover:text-white transition-colors tracking-tight">{ev.event}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase bg-white/5 px-3 py-1 rounded-full">{ev.node}</span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${ev.status === 'BLOCKED' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{ev.status}</span>
              <span className="text-[10px] text-slate-600 font-black">{ev.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const IncidentView = ({ onPastIncidents, onManualAudit }: { onPastIncidents: () => void, onManualAudit: () => void }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <div>
      <h3 className="text-xl font-black text-white tracking-tight">Incident Feed</h3>
      <p className="text-slate-500 text-xs">Real-time alerts and historical outage tracking.</p>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center glass-card rounded-[50px] border border-dashed border-white/10 m-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-4xl shadow-emerald-500/10">
          <ShieldCheck size={40} />
        </div>
        <h3 className="text-3xl font-black text-white mb-2">All Systems Nominal</h3>
        <p className="text-slate-500 text-sm max-w-sm text-center leading-relaxed">
          No active high-priority incidents detected across 3 cloud regions. AI guardians are currently monitoring 4,800 sensors.
        </p>
        <div className="flex gap-4 mt-12">
          <button
            onClick={onPastIncidents}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[3px] rounded-2xl transition-all border border-white/10">
            Past Incidents
          </button>
          <button
            onClick={onManualAudit}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[3px] rounded-2xl transition-all shadow-xl shadow-blue-600/20">
            Manual Audit
          </button>
        </div>
      </div>
    </div>

    <div className="p-6 text-center">
      <p className="text-[10px] text-slate-700 font-black uppercase tracking-[5px]">Enterprise SLA: 99.99% Guaranteed</p>
    </div>
  </div>
)

// --- State Management: Reducer Pattern ---

const API_BASE = "http://127.0.0.1:8000/api/v1"

interface DashboardState {
  activeView: string;
  stats: {
    total_deployments: number;
    ai_confidence: string;
    monthly_spend: string;
    active_incidents: number;
  };
  inventory: any[];
  telemetry: {
    cpu_load: { time: string; value: number }[];
    throughput: { time: string; value: number }[];
  };
  isDeploying: boolean;
  isModalOpen: boolean;
  isSettingsOpen: boolean;
  selectedResource: any;
  notification: { msg: string, type: 'success' | 'error' | 'info' } | null;
  aiMode: 'auto' | 'manual';
  lastSync: string;
}

type Action =
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SET_STATS'; payload: any }
  | { type: 'SET_INVENTORY'; payload: any[] }
  | { type: 'SET_TELEMETRY'; payload: any }
  | { type: 'SET_DEPLOYING'; payload: boolean }
  | { type: 'TOGGLE_MODAL'; payload: boolean }
  | { type: 'TOGGLE_SETTINGS'; payload: boolean }
  | { type: 'SELECT_RESOURCE'; payload: any }
  | { type: 'SET_NOTIFICATION'; payload: { msg: string, type: 'success' | 'error' | 'info' } | null }
  | { type: 'TOGGLE_AI_MODE' }
  | { type: 'SET_SYNC', payload: string };

const initialState: DashboardState = {
  activeView: 'Overview',
  stats: {
    total_deployments: 0,
    ai_confidence: "0%",
    monthly_spend: "$0",
    active_incidents: 0
  },
  inventory: [],
  telemetry: { cpu_load: [], throughput: [] },
  isDeploying: false,
  isModalOpen: false,
  isSettingsOpen: false,
  selectedResource: null,
  notification: null,
  aiMode: 'auto',
  lastSync: 'Waiting for first sync...'
};

function dashboardReducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'SET_VIEW': return { ...state, activeView: action.payload };
    case 'SET_STATS': return { ...state, stats: action.payload };
    case 'SET_INVENTORY': return { ...state, inventory: action.payload };
    case 'SET_TELEMETRY': return { ...state, telemetry: action.payload };
    case 'SET_DEPLOYING': return { ...state, isDeploying: action.payload };
    case 'TOGGLE_MODAL': return { ...state, isModalOpen: action.payload };
    case 'TOGGLE_SETTINGS': return { ...state, isSettingsOpen: action.payload };
    case 'SELECT_RESOURCE': return { ...state, selectedResource: action.payload };
    case 'SET_NOTIFICATION': return { ...state, notification: action.payload };
    case 'TOGGLE_AI_MODE': return { ...state, aiMode: state.aiMode === 'auto' ? 'manual' : 'auto' };
    case 'SET_SYNC': return { ...state, lastSync: action.payload };
    default: return state;
  }
}

// --- Main Dashboard Controller ---

export default function DashboardPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [username, setUsername] = useState('Hitesh');

  // 1. Auth Guard - Check session on load
  useEffect(() => {
    const token = localStorage.getItem('stratis_token');
    const userStr = localStorage.getItem('stratis_user');
    
    if (!token) {
      router.push('/login');
    } else if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username || 'Hitesh');
      } catch (e) {
        console.error("Failed to parse user session");
      }
    }
  }, [router]);

  const fetchData = async () => {
    try {
      // 1. Fetch Real Deployments array
      const invRes = await authFetch(`${API_BASE}/deployments`)
      const invData = await invRes.json()
      dispatch({ type: 'SET_INVENTORY', payload: invData })

      // 2. Fetch Cost Estimation
      const costRes = await authFetch(`${API_BASE}/cost-estimation`)
      const costData = await costRes.json()

      // 3. Fetch AI Recommendation for confidence
      const aiRes = await authFetch(`${API_BASE}/recommendations`)
      const aiData = await aiRes.json()

      // 4. Fetch Health/Security for incidents
      const healthRes = await authFetch(`${API_BASE}/health`)
      const healthData = await healthRes.json()

      // Aggregate state mapped closely to the database
      const aggregatedStats = {
        total_deployments: invData.length || 0,
        ai_confidence: `${Math.round(aiData.confidence_score || 0)}%`,
        monthly_spend: costData.monthly_cost || '$0',
        active_incidents: healthData.incident_count || 0
      }
      dispatch({ type: 'SET_STATS', payload: aggregatedStats })

      // 5. Fetch Real-time Telemetry
      const telRes = await authFetch(`${API_BASE}/telemetry`)
      const telData = await telRes.json()
      const formattedTel = {
        cpu_load: (telData.cpu_load || []).map((v: number, i: number) => ({ time: `${i}:00`, value: v })),
        throughput: (telData.throughput || []).map((v: number, i: number) => ({ time: `${i}s`, value: v }))
      }
      dispatch({ type: 'SET_TELEMETRY', payload: formattedTel })
      
      // 6. Update Sync Status
      dispatch({ type: 'SET_SYNC', payload: new Date().toLocaleTimeString() })
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Sync Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, type: 'error' } })
      if (err instanceof Error && err.message.includes('401')) {
        router.push('/login')
      }
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const authFetch = async (url: string, options: any = {}) => {
    const token = localStorage.getItem('stratis_token');
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
  }

  const handleLogout = async () => {
    try {
      await authFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {
      console.error("Logout API failed, but clearing local session anyway.");
    }
    localStorage.removeItem('stratis_token');
    localStorage.removeItem('stratis_user');
    router.push('/login');
  }

  const handleDeploy = async (data: any) => {
    dispatch({ type: 'SET_DEPLOYING', payload: true })
    try {
      const res = await authFetch(`${API_BASE}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Successfully deployed ${data.name} to ${data.cloud.toUpperCase()}!`, type: 'success' } })
        dispatch({ type: 'TOGGLE_MODAL', payload: false })
      } else {
        dispatch({ type: 'SET_NOTIFICATION', payload: { msg: 'Deployment failed. Check logs.', type: 'error' } })
      }
      await fetchData()
    } catch (err) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: 'Network error. Backend offline.', type: 'error' } })
    } finally {
      dispatch({ type: 'SET_DEPLOYING', payload: false })
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: null }), 5000)
    }
  }

  const handleResourceAction = async (action: string) => {
    if (!state.selectedResource) return
    dispatch({ type: 'SET_DEPLOYING', payload: true })
    try {
      const res = await authFetch(`${API_BASE}/deployments/${state.selectedResource.id}/action?action=${action}`, {
        method: 'POST'
      })
      if (res.ok) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Action ${action} successful!`, type: 'success' } })
        dispatch({ type: 'TOGGLE_SETTINGS', payload: false })
      } else {
        dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Action failed.`, type: 'error' } })
      }
      await fetchData()
    } catch (err) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: 'Network error during action.', type: 'error' } })
    } finally {
      dispatch({ type: 'SET_DEPLOYING', payload: false })
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: null }), 5000)
    }
  }

  const handleGenericAction = async (endpoint: string, actionName: string) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST' })
      const data = await res.json()
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: data.message || `${actionName} triggered.`, type: 'info' } })
      if (endpoint.includes('recommendations')) {
        dispatch({ type: 'TOGGLE_AI_MODE' })
        await fetchData()
      }
    } catch (err) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Failed to trigger ${actionName}.`, type: 'error' } })
    } finally {
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: null }), 5000)
    }
  }

  const renderContent = () => {
    switch (state.activeView) {
      case 'Overview': return <OverviewView stats={state.stats} telemetry={state.telemetry} />
      case 'Provision': return <ProvisionView
        inventory={state.inventory}
        onDeploy={() => dispatch({ type: 'TOGGLE_MODAL', payload: true })}
        isDeploying={state.isDeploying}
        onSettingsClick={(r) => { dispatch({ type: 'SELECT_RESOURCE', payload: r }); dispatch({ type: 'TOGGLE_SETTINGS', payload: true }) }}
      />
      case 'Telemetry': return <TelemetryStreamView telemetry={state.telemetry} />
      case 'AIOps': return <AIOpsView onManualSwitch={() => handleGenericAction('/ai-ops/recommendations', 'Manual Switch')} aiMode={state.aiMode} />
      case 'Cost': return <CostView onOptimize={() => handleGenericAction('/cost/optimize', 'Cost Optimization')} />
      case 'SecOps': return <SecOpsView />
      case 'Incidents': return <IncidentView onPastIncidents={() => alert('Past Incidents loaded.')} onManualAudit={() => handleGenericAction('/security/audit', 'Security Audit')} />
      default: return <OverviewView stats={state.stats} telemetry={state.telemetry} />
    }
  }

  const NotificationToast = () => state.notification ? (
    <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-right-8 duration-500 ${state.notification.type === 'success' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500' :
      state.notification.type === 'error' ? 'bg-rose-600/10 border-rose-500/20 text-rose-500' :
        'bg-blue-600/10 border-blue-500/20 text-blue-500'
      }`}>
      {state.notification.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
      <p className="text-sm font-black tracking-tight">{state.notification.msg}</p>
      <button onClick={() => dispatch({ type: 'SET_NOTIFICATION', payload: null })} className="ml-4 hover:text-white transition-colors">
        <Plus size={16} className="rotate-45" />
      </button>
    </div>
  ) : null

  return (
    <div className="flex h-screen bg-[#010409] text-slate-200 overflow-hidden font-sans selection:bg-blue-600/30">
      {/* Sidebar Navigation */}
      <aside className="w-80 glass border-r border-white/5 flex flex-col z-30 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 ring-1 ring-white/20">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">StratisIO</h1>
              <div className="flex items-center gap-1.5 -mt-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-[10px] uppercase tracking-[3px] font-black text-slate-500">V2.0 CORE</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={18} />} label="Nebula Dashboard" active={state.activeView === 'Overview'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Overview' })} />
          <NavItem icon={<Rocket size={18} />} label="Provision Engine" active={state.activeView === 'Provision'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Provision' })} />
          <NavItem icon={<Activity size={18} />} label="Telemetry Stream" active={state.activeView === 'Telemetry'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Telemetry' })} />

          <NavItem icon={<Cpu size={18} />} label="AIOps Hub" active={state.activeView === 'AIOps'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'AIOps' })} />
          <NavItem icon={<DollarSign size={18} />} label="Cost Intelligence" active={state.activeView === 'Cost'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Cost' })} />

          <NavItem icon={<Lock size={18} />} label="SecOps Center" active={state.activeView === 'SecOps'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'SecOps' })} />
          <NavItem icon={<AlertTriangle size={18} />} label="Incident Feed" active={state.activeView === 'Incidents'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Incidents' })} />
        </nav>

        <div className="p-6">
          <UserProfileCard username={username} onLogout={handleLogout} />
        </div>
      </aside>

      {/* --- Main Experience Layer --- */}
      <main className="flex-1 overflow-y-auto p-12 relative">
        {/* Abstract Background Orbs */}
        <div className="fixed top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/[0.03] rounded-full blur-[180px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/[0.02] rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <header className="flex justify-between items-start mb-10 relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-2.5 py-0.5 bg-blue-600/10 rounded-full border border-blue-600/20 text-[9px] font-black uppercase tracking-[2px] text-blue-500">PLATFORM V2</div>
              <div className="w-1 h-1 bg-slate-800 rounded-full" />
              <div className="text-slate-500 font-bold text-[9px] uppercase tracking-[2px]">{state.activeView}</div>
              <div className="w-1 h-1 bg-slate-800 rounded-full" />
              <div className="text-blue-500/60 font-bold text-[9px] uppercase tracking-[2px]">Sync: {state.lastSync}</div>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-none">
              {state.activeView === 'Overview' ? 'Nebula' : state.activeView.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{state.activeView === 'Overview' ? 'Control' : state.activeView.split(' ')[1] || 'Engine'}</span>
            </h2>
            <p className="text-slate-500 font-medium text-base leading-relaxed opacity-80">
              Real-time multi-cloud orchestration engine with integrated AI diagnostics and cross-region provisioning capabilities.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-3 glass rounded-2xl flex items-center gap-3 border border-white/10 shadow-xl bg-white/[0.02]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Infrastructure</p>
                <p className="text-xs font-bold text-white">Healthy & Synced</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (state.activeView === 'Provision') {
                  dispatch({ type: 'TOGGLE_MODAL', payload: true })
                } else {
                  dispatch({ type: 'SET_VIEW', payload: 'Provision' })
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-[16px] text-[11px] font-black shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 group border border-blue-400/20"
            >
              <Zap size={16} className="group-hover:scale-110 transition-transform duration-500" />
              <span className="uppercase tracking-[2px]">Deploy Resource</span>
            </button>
          </div>
        </header>

        <div className="relative z-20">
          {renderContent()}
        </div>

        <NotificationToast />

        <DeploymentModal
          isOpen={state.isModalOpen}
          onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: false })}
          onDeploy={handleDeploy}
          isDeploying={state.isDeploying}
        />

        <ResourceSettingsModal
          isOpen={state.isSettingsOpen}
          onClose={() => dispatch({ type: 'TOGGLE_SETTINGS', payload: false })}
          resource={state.selectedResource}
          onAction={handleResourceAction}
          isProcessing={state.isDeploying}
        />
      </main>
    </div>
  )
}

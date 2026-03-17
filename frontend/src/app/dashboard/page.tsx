"use client"

import React, { useState, useEffect, useReducer, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Box, Activity, Cloud, Brain, AlertTriangle,
  DollarSign, Settings, ChevronRight, Plus, RefreshCw, Rocket,
  X, LogOut, Zap, Shield, Server, TrendingUp, TrendingDown,
  BarChart3, ArrowRightLeft, Copy, Check, ChevronDown,
  Bell, Search, User, Cpu, HardDrive, Wifi,
  Play, Square, RotateCcw, Trash2, Eye, Activity as ActivityIcon, Users,
  MessageSquare, Send, MinusCircle, FileText, History, Key, ShieldCheck, Undo2, Lock,
  Terminal
} from 'lucide-react'



import { API_BASE, WS_BASE, authFetch, wsConnect } from '../../config/api'

import { MetricCard } from '../../components/MetricCard'
import { TelemetryChart } from '../../components/TelemetryChart'
import { DeploymentTable } from '../../components/DeploymentTable'
import { CloudPieChart, CostDonutChart, CloudCompareChart, CostForecastChart } from '../../components/CloudCharts'
import { DeploymentFlowAnimation } from '../../components/DeploymentFlowAnimation'
import { SkeletonBlock, SkeletonCard } from '../../components/SkeletonBlock'

// ============================================================================
// TYPES
// ============================================================================

interface Deployment {
  id: number; name: string; image: string; cloud: string;
  port: number; status: string; ip_address?: string;
  cpu_usage: string; memory_usage: string;
  container_id?: string; created_at: string;
}

interface DashboardState {
  deployments: Deployment[]
  stats: any
  telemetry: any
  recommendations: any
  cloudAnalytics: any
  scalingEvents: any[]
  incidents: any[]
  lastSync: string
  notification: { msg: string; type: 'success' | 'error' | 'info' } | null
  zombies: any[]        // Phase 3
  costForecast: any     // Phase 3
  aiopsPrediction: any  // Phase 4
  securityInfo: any     // Phase 5
  teamInfo: any         // Phase 6
  projects: any[]       // Phase 7
  activeProjectId: string // Phase 7
  chatMessages: { role: 'user' | 'ai'; text: string }[] // Phase 7
  approvalQueue: any[] // Phase 8
  auditLogs: any[]     // Phase 8
}

const initialState: DashboardState = {
  deployments: [], stats: null, telemetry: null,
  recommendations: null, cloudAnalytics: null,
  scalingEvents: [], incidents: [], lastSync: '',
  notification: null,
  zombies: [],
  costForecast: null,
  aiopsPrediction: null,
  securityInfo: null,
  teamInfo: null,
  projects: [],
  activeProjectId: 'p-001',
  chatMessages: [{ role: 'ai', text: 'Hello! I am Cloud Sentry AI. How can I assist you today?' }],
  approvalQueue: [],
  auditLogs: [],
}

type Action =
  | { type: 'SET_DEPLOYMENTS'; payload: any[] }
  | { type: 'SET_STATS'; payload: any }
  | { type: 'SET_TELEMETRY'; payload: any }
  | { type: 'SET_RECOMMENDATIONS'; payload: any }
  | { type: 'SET_CLOUD_ANALYTICS'; payload: any }
  | { type: 'SET_SCALING_EVENTS'; payload: any[] }
  | { type: 'SET_INCIDENTS'; payload: any[] }
  | { type: 'SET_SYNC'; payload: string }
  | { type: 'SET_NOTIFICATION'; payload: DashboardState['notification'] }
  | { type: 'SET_ZOMBIES'; payload: any[] }
  | { type: 'SET_COST_FORECAST'; payload: any }
  | { type: 'SET_AIOPS_PREDICTION'; payload: any }
  | { type: 'SET_SECURITY_INFO'; payload: any }
  | { type: 'SET_TEAM_INFO'; payload: any }
  | { type: 'SET_PROJECTS'; payload: any[] }
  | { type: 'SET_ACTIVE_PROJECT'; payload: string }
  | { type: 'ADD_CHAT_MESSAGE'; payload: { role: 'user' | 'ai'; text: string } }
  | { type: 'SET_APPROVAL_QUEUE'; payload: any[] }
  | { type: 'SET_AUDIT_LOGS'; payload: any[] }

function dashboardReducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'SET_DEPLOYMENTS':     return { ...state, deployments: action.payload }
    case 'SET_STATS':           return { ...state, stats: action.payload }
    case 'SET_TELEMETRY':       return { ...state, telemetry: action.payload }
    case 'SET_RECOMMENDATIONS': return { ...state, recommendations: action.payload }
    case 'SET_CLOUD_ANALYTICS': return { ...state, cloudAnalytics: action.payload }
    case 'SET_SCALING_EVENTS':  return { ...state, scalingEvents: action.payload }
    case 'SET_INCIDENTS':       return { ...state, incidents: action.payload }
    case 'SET_SYNC':            return { ...state, lastSync: action.payload }
    case 'SET_NOTIFICATION':    return { ...state, notification: action.payload }
    case 'SET_ZOMBIES':         return { ...state, zombies: action.payload }
    case 'SET_COST_FORECAST':   return { ...state, costForecast: action.payload }
    case 'SET_AIOPS_PREDICTION': return { ...state, aiopsPrediction: action.payload }
    case 'SET_SECURITY_INFO':   return { ...state, securityInfo: action.payload }
    case 'SET_TEAM_INFO':       return { ...state, teamInfo: action.payload }
    case 'SET_PROJECTS':        return { ...state, projects: action.payload }
    case 'SET_ACTIVE_PROJECT':  return { ...state, activeProjectId: action.payload }
    case 'ADD_CHAT_MESSAGE':    return { ...state, chatMessages: [...state.chatMessages, action.payload] }
    case 'SET_APPROVAL_QUEUE':  return { ...state, approvalQueue: action.payload }
    case 'SET_AUDIT_LOGS':      return { ...state, auditLogs: action.payload }
    default: return state
  }
}

// ============================================================================
// SIDEBAR CONFIG
// ============================================================================

const SIDEBAR_ITEMS = [
  { id: 'overview',   label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'deploy',     label: 'Deployments',     icon: Box },
  { id: 'monitoring', label: 'Monitoring',      icon: Activity },
  { id: 'approval',   label: 'Approval Queue',  icon: ShieldCheck },
  { id: 'audit',      label: 'Audit Logs',      icon: History },
  { id: 'cloud',      label: 'Cloud Analytics', icon: Cloud },
  { id: 'aiops',      label: 'AI Ops Hub',      icon: Brain },
  { id: 'cost',       label: 'Cost',            icon: DollarSign },
  { id: 'security',   label: 'Security Hub',    icon: Shield },
  { id: 'team',       label: 'Team Hub',        icon: Users },
  { id: 'settings',   label: 'Cloud & System',  icon: Settings },
]

const CLOUD_COLORS: Record<string, string> = {
  aws: '#f59e0b', azure: '#6366f1', gcp: '#10b981', local: '#94a3b8'
}

// ============================================================================
// BLUEPRINT PRESETS
// ============================================================================

const BLUEPRINTS = [
  { label: 'Custom',       name: '',           image: '',                   port: 80,    cloud: 'local' },
  { label: '🟢 MERN',      name: 'mern-app',   image: 'mongo:7',            port: 27017, cloud: 'aws' },
  { label: '🐍 Flask',     name: 'flask-api',  image: 'python:3.11-slim',   port: 5000,  cloud: 'gcp' },
  { label: '🌐 Nginx',     name: 'nginx-web',  image: 'nginx:alpine',       port: 80,    cloud: 'local' },
  { label: '🐘 Postgres',  name: 'postgres-db',image: 'postgres:15-alpine', port: 5432,  cloud: 'local' },
  { label: '🔴 Redis',     name: 'redis-cache',image: 'redis:7-alpine',     port: 6379,  cloud: 'local' },
  { label: '📦 Node App',  name: 'node-app',   image: 'node:20-alpine',     port: 3000,  cloud: 'azure' },
]

// ============================================================================
// NOTIFICATION TOAST
// ============================================================================

const Toast = ({ msg, type, onClose }: { msg: string; type: string; onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const styles: Record<string, string> = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    error:   'bg-rose-500/10 border-rose-500/20 text-rose-400',
    info:    'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-3 ${styles[type] || styles.info} max-w-sm`}>
      <span className="text-sm font-semibold">{msg}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

// ============================================================================
// RESOURCE ACTION MODAL
// ============================================================================

const ResourceModal = ({
  resource, onClose, onAction
}: {
  resource: Deployment | null; onClose: () => void; onAction: (id: number, action: string) => void
}) => {
  if (!resource) return null
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm glass-card rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent rounded-t-2xl" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-black text-slate-100">{resource.name}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{resource.image}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => onAction(resource.id, 'restart')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all text-xs font-bold"
          >
            <RotateCcw size={12} /> Restart
          </button>
          <button
            onClick={() => onAction(resource.id, 'stop')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-bold"
          >
            <Square size={12} /> Stop
          </button>
        </div>
        <button
          onClick={() => onAction(resource.id, 'terminate')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-bold"
        >
          <Trash2 size={12} /> Terminate
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// DEPLOY MODAL
// ============================================================================

const DeployModal = ({
  isOpen, onClose, onDeploy, isDeploying, recommendation
}: {
  isOpen: boolean; onClose: () => void; onDeploy: (d: any) => void;
  isDeploying: boolean; recommendation?: any;
}) => {
  const [formData, setFormData] = useState({ name: '', image: '', cloud: 'local', port: 80 })
  const [blueprint, setBlueprint] = useState('Custom')

  const applyBlueprint = (label: string) => {
    const bp = BLUEPRINTS.find(b => b.label === label)
    if (bp) {
      setBlueprint(label)
      if (bp.name) setFormData({ name: bp.name, image: bp.image, port: bp.port, cloud: bp.cloud })
    }
  }

  const estCost: Record<string, string> = {
    aws: '~$145–$220/mo', azure: '~$130–$200/mo',
    gcp: '~$115–$180/mo', local: '~$0–$5/mo',
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        {/* Header */}
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-100">Provision Node</h3>
              <p className="text-xs text-slate-500 mt-0.5">Deploy containerized workloads to any cloud</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Blueprints */}
          <div>
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[2px] block mb-2">Quick Blueprints</label>
            <div className="flex flex-wrap gap-1.5">
              {BLUEPRINTS.map(bp => (
                <button
                  key={bp.label}
                  onClick={() => applyBlueprint(bp.label)}
                  className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                    blueprint === bp.label
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:border-indigo-500/20 hover:text-slate-300'
                  }`}
                >
                  {bp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[2px] block mb-1.5">App Name</label>
              <input
                type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. my-api-prod"
                className="input-dark w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[2px] block mb-1.5">Docker Image</label>
              <input
                type="text" value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="e.g. nginx:alpine"
                className="input-dark w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[2px] block mb-1.5">Cloud Provider</label>
              <select
                value={formData.cloud}
                onChange={e => setFormData({ ...formData, cloud: e.target.value })}
                className="input-dark w-full px-3.5 py-2.5 text-sm appearance-none cursor-pointer"
              >
                <option value="local">🖥️ Local (Docker)</option>
                <option value="aws">🟠 AWS Cloud</option>
                <option value="azure">🔵 Azure Cloud</option>
                <option value="gcp">🟢 GCP Cloud</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[2px] block mb-1.5">Port</label>
              <input
                type="number" value={formData.port}
                onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) || 80 })}
                className="input-dark w-full px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Cost & AI hint */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-3">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Est. Cost</p>
              <p className="text-xs font-black text-amber-400">{estCost[formData.cloud] || '~$0/mo'}</p>
            </div>
            {recommendation && (
              <div className="glass rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">AI Recommends</p>
                <p className="text-xs font-black text-indigo-400">{recommendation.best_cloud || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Deployment Flow Animation */}
          <DeploymentFlowAnimation isActive={isDeploying} />

          <button
            onClick={() => onDeploy(formData)}
            disabled={isDeploying || !formData.name || !formData.image}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isDeploying || !formData.name || !formData.image
                ? 'bg-white/[0.04] text-slate-600 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isDeploying ? <RefreshCw size={15} className="animate-spin" /> : <Rocket size={15} />}
            {isDeploying ? 'Provisioning...' : 'Launch Deployment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

const OverviewTab = ({ state, isLoading, wsData }: { state: DashboardState; isLoading: boolean; wsData: any }) => {
  const { stats, telemetry, deployments } = state

  const cpuChartData = (telemetry?.cpu_load ?? []).map((v: number, i: number) => ({
    time: `T-${(telemetry.cpu_load.length - i)}`,
    value: v
  }))
  const tpChartData = (telemetry?.throughput ?? []).map((v: number, i: number) => ({
    time: `T-${i}`,
    value: v
  }))

  const running = deployments.filter(d => d.status?.includes('Running')).length
  const stopped = deployments.filter(d => d.status === 'Stopped').length

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-base font-black text-slate-100 italic">System Intelligence</h2>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Real-time Cloud Monitoring</p>
         </div>
         <button 
           onClick={() => {
             alert('Generating Infrastructure Report...')
             setTimeout(() => window.print(), 500)
           }}
           className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs"
         >
           <FileText size={14} /> Export Report (PDF)
         </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Deployments"
          value={stats?.total_deployments ?? 0}
          subValue="nodes"
          icon={<Box size={18} />}
          trend={`${running} live`}
          loading={isLoading}
          accent="blue"
        />
        <MetricCard
          label="AI Confidence"
          value={stats?.ai_confidence ?? '—'}
          icon={<Brain size={18} />}
          trend="+2%"
          loading={isLoading}
          accent="cyan"
        />
        <MetricCard
          label="Monthly Spend"
          value={stats?.monthly_spend ?? '$0'}
          icon={<DollarSign size={18} />}
          trend="budget"
          loading={isLoading}
          accent="amber"
        />
        <MetricCard
          label="Incidents"
          value={state.incidents?.length ?? 0}
          icon={<AlertTriangle size={18} />}
          trend={state.incidents?.length === 0 ? '✓ Clear' : `${state.incidents.length} open`}
          loading={isLoading}
          accent="rose"
        />
      </div>

      {/* Live Metrics Row */}
      {wsData && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'CPU', val: `${wsData.cpu ?? 0}%`, sub: 'utilization', icon: <Cpu size={14} />, color: wsData.cpu > 80 ? 'text-rose-400' : 'text-indigo-400' },
            { label: 'Memory', val: `${wsData.memory ?? 0}%`, sub: 'used', icon: <HardDrive size={14} />, color: wsData.memory > 80 ? 'text-amber-400' : 'text-cyan-400' },
            { label: 'Disk', val: `${wsData.disk ?? 0}%`, sub: 'capacity', icon: <Server size={14} />, color: 'text-emerald-400' },
          ].map(m => (
            <div key={m.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${m.color}`}>{m.icon}</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{m.label}</p>
                <p className={`text-xl font-black tracking-tight ${m.color}`}>{m.val}</p>
                <p className="text-[9px] text-slate-600">{m.sub}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="live-dot" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TelemetryChart
          title="CPU Load"
          data={cpuChartData}
          dataKey="value"
          color="#6366f1"
          loading={isLoading}
          live
        />
        <TelemetryChart
          title="Network Throughput"
          data={tpChartData}
          dataKey="value"
          color="#06b6d4"
          type="line"
          loading={isLoading}
          live
        />
      </div>
    </div>
  )
}

// ============================================================================
// CLOUD ANALYTICS TAB
// ============================================================================

const CloudAnalyticsTab = ({ state, isLoading }: { state: DashboardState; isLoading: boolean }) => {
  const { cloudAnalytics } = state

  if (isLoading || !cloudAnalytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 page-enter">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} className="h-60" />
        ))}
        <div className="lg:col-span-3 glass-card rounded-2xl p-5 h-48 flex flex-col gap-3">
          <SkeletonBlock className="h-4 w-1/4" />
          <SkeletonBlock className="flex-1" variant="chart" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 page-enter">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CloudPieChart
          title="Cloud Distribution"
          data={cloudAnalytics.distribution || []}
        />
        <CostDonutChart
          title="Cost Breakdown"
          data={cloudAnalytics.cost_breakdown || []}
          center="62%"
        />
        <div className="glass-card rounded-2xl p-5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent rounded-t-2xl" />
          <h3 className="text-sm font-bold text-slate-200 mb-4">💡 Savings Suggestions</h3>
          <div className="space-y-3">
            {(cloudAnalytics.savings_suggestions || []).map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CloudCompareChart
        title="AWS vs Azure vs GCP vs Local — Monthly Cost Breakdown ($)"
        data={cloudAnalytics.cost_comparison || []}
      />

      {cloudAnalytics.top_expensive?.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4">💸 Top Expensive Deployments</h3>
          <div className="space-y-2">
            {cloudAnalytics.top_expensive.map((d: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-600 w-4">{i + 1}.</span>
                  <span className="text-xs font-bold text-slate-300">{d.name}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    d.cloud === 'aws' ? 'badge-amber' : d.cloud === 'azure' ? 'badge-blue' : 'badge-green'
                  }`}>{d.cloud?.toUpperCase() || 'LOCAL'}</span>
                </div>
                <span className="text-xs font-black text-amber-400">${d.cost}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// PHASE 4 — AI THINKING ANIMATION
// ============================================================================

const AIThinkingAnimation = () => (
  <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-5">
    <svg width="400" height="120" viewBox="0 0 400 120" className="opacity-40">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path 
        d="M0 60 H150 L180 30 H220 L250 60 H400" 
        stroke="#6366f1" strokeWidth="1" fill="none" 
        strokeDasharray="10,10"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="100" dur="5s" repeatCount="indefinite" />
      </path>
      <path 
        d="M0 80 H120 L150 110 H250 L280 80 H400" 
        stroke="#06b6d4" strokeWidth="1" fill="none" 
        strokeDasharray="8,8"
      >
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite" />
      </path>
      <circle cx="200" cy="60" r="4" fill="#6366f1" filter="url(#glow)">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="flex gap-1.5 mb-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
      </div>
      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[4px]">Neural Processing</p>
    </div>
  </div>
)

// ============================================================================
// PHASE 3 AI OPS TAB — Predictive Scaling, Self-Heal Log, Anomaly Alerts
// ============================================================================

const AnomalyBadge = ({ severity }: { severity: string }) => (
  <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
    severity === 'CRITICAL'
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
  }`}>{severity}</span>
)

const ConfidenceMeter = ({ pct }: { pct: number }) => {
  const r = 24, circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90 absolute">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke="url(#cg)" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <defs>
          <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-xs font-black text-indigo-400 z-10">{pct}%</span>
    </div>
  )
}

const AIOpsTab = ({ state, isLoading }: { state: DashboardState; isLoading: boolean }) => {
  const [predict, setPredict]       = React.useState<any>(null)
  const [anomalyData, setAnomaly]   = React.useState<any>(null)
  const [healLog, setHealLog]       = React.useState<any[]>([])
  const [aiStatus, setAiStatus]     = React.useState<any>(null)
  const [predictionInsights, setInsights] = React.useState<any>(null) // Phase 4
  const [loading, setLoading]       = React.useState(true)
  const [redAlert, setRedAlert]     = React.useState(false)
  const [alertMsg, setAlertMsg]     = React.useState('')

  const fetchAI = React.useCallback(async () => {
    try {
      const [pRes, aRes, hRes, sRes, iRes] = await Promise.allSettled([
        authFetch(`${API_BASE}/ai/predict`),
        authFetch(`${API_BASE}/ai/anomalies`),
        authFetch(`${API_BASE}/ai/heal-log`),
        authFetch(`${API_BASE}/ai/status`),
        authFetch(`${API_BASE}/aiops/predict`),
      ])
      if (pRes.status === 'fulfilled' && pRes.value.ok) {
        const d = await pRes.value.json()
        setPredict(d)
        if (d.alert && d.alert_message) { setRedAlert(true); setAlertMsg(d.alert_message) }
      }
      if (aRes.status === 'fulfilled' && aRes.value.ok) {
        const d = await aRes.value.json()
        setAnomaly(d)
        if (d.red_alert) { setRedAlert(true); setAlertMsg(d.anomalies?.[0]?.message || 'Critical anomaly detected!') }
      }
      if (hRes.status === 'fulfilled' && hRes.value.ok) setHealLog(await hRes.value.json())
      if (sRes.status === 'fulfilled' && sRes.value.ok) setAiStatus(await sRes.value.json())
      if (iRes.status === 'fulfilled' && iRes.value.ok) setInsights(await iRes.value.json())
    } catch {}
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchAI()
    const t = setInterval(fetchAI, 15000)
    return () => clearInterval(t)
  }, [fetchAI])

  // Build sparkline chart data from forecast
  const cpuForecastData = (predict?.labels ?? []).map((l: string, i: number) => ({
    name: l,
    cpu: predict?.cpu_forecast?.[i] ?? 0,
    mem: predict?.mem_forecast?.[i] ?? 0,
  }))

  return (
    <div className="space-y-5 page-enter">
      
      {/* PHASE 4: AI THINKING MODE */}
      {loading && <AIThinkingAnimation />}

      {/* 🔴 RED ALERT BANNER */}
      {redAlert && (
        <div className="glass-card rounded-2xl p-4 border border-rose-500/40 bg-rose-500/5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-black text-rose-400 uppercase tracking-wider">🚨 Red Alert — AI Anomaly Detected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{alertMsg}</p>
            </div>
            <button onClick={() => setRedAlert(false)} className="text-slate-600 hover:text-rose-400 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* AI ENGINE STATUS HEADER */}
      <div className="glass-card rounded-2xl p-5 gradient-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-[3px] mb-1">Phase 4 · Neural Operations Hub</p>
            <h2 className="text-lg font-black text-slate-100">
              {aiStatus?.ready ? 'Neural Engine Active' : 'Warming Up...'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {aiStatus?.status ?? 'Collecting baseline metrics...'}
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-indigo-400">
                {aiStatus?.samples_collected ?? 0}/{aiStatus?.max_history ?? 60} samples
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-emerald-400">
                {anomalyData?.count ?? 0} anomalies now
              </span>
              {state.recommendations && (
                <span className="text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg text-cyan-400">
                  Action: {state.recommendations?.action ?? 'Keep Current'}
                </span>
              )}
            </div>
          </div>
          <ConfidenceMeter pct={aiStatus?.confidence_pct ?? 0} />
        </div>
      </div>

      {/* PHASE 4: PREDICTIVE INSIGHTS CARDS */}
      {predictionInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Summary Card */}
           <div className="glass-card rounded-2xl p-5 border-l-4 border-l-indigo-500 bg-indigo-500/[0.02]">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                 <TrendingUp size={16} />
               </div>
               <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">7-Day Prediction Insight</h3>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed italic">"{predictionInsights.summary}"</p>
             <div className="mt-4 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">System Risk Level</span>
               <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                 predictionInsights.risk_level === 'HIGH' ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'
               }`}>{predictionInsights.risk_level} RISK</span>
             </div>
           </div>

           {/* Trend Chart (Simple SVG) */}
           <div className="glass-card rounded-2xl p-5 overflow-hidden">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Trend Forecast</h3>
               <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                    <span className="text-[8px] font-bold text-slate-600 uppercase">Traffic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/60" />
                    <span className="text-[8px] font-bold text-slate-600 uppercase">Risk</span>
                  </div>
               </div>
             </div>
             <div className="h-24 flex items-end gap-1 px-1">
               {predictionInsights.forecast.map((f: any, i: number) => (
                 <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 group h-full">
                   <div 
                     className="w-full bg-indigo-500/40 rounded-t-sm transition-all duration-700 hover:bg-indigo-500/60" 
                     style={{ height: `${f.traffic}%` }} 
                     title={`Traffic: ${f.traffic}%`}
                   />
                   <div 
                     className="w-full bg-rose-500/60 rounded-t-sm transition-all duration-700 hover:bg-rose-500/80" 
                     style={{ height: `${f.crash_prob * 3}%` }} 
                     title={`Crash Prob: ${f.crash_prob}%`}
                   />
                 </div>
               ))}
             </div>
             <div className="flex justify-between mt-2 px-1">
                {predictionInsights.forecast.map((f: any, i: number) => (
                  <span key={i} className="text-[7px] font-bold text-slate-700">{f.date.split(',')[0]}</span>
                ))}
             </div>
           </div>
        </div>
      )}

      {/* PREDICTIVE FORECAST CHART */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Predictive Scaling Forecast</h3>
            <p className="text-[10px] text-slate-600 mt-0.5">Linear regression · next 10 samples</p>
          </div>
          {predict?.alert && (
            <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
              <AlertTriangle size={10} /> Threshold Alert
            </span>
          )}
        </div>
        {loading ? (
          <div className="skeleton-box h-40 rounded-xl" />
        ) : cpuForecastData.length > 0 ? (
          <div className="h-40 w-full">
            {/* Simple SVG sparkline chart (no recharts dependency needed) */}
            <div className="relative h-full flex items-end gap-0.5">
              {cpuForecastData.map((d: any, i: number) => {
                const cpuH = Math.max(4, (d.cpu / 100) * 100)
                const memH = Math.max(4, (d.mem / 100) * 100)
                const isCritical = d.cpu > 85 || d.mem > 85
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group h-full justify-end">
                    <div className="relative w-full flex flex-col justify-end h-full gap-0.5">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${ isCritical ? 'bg-rose-500/60' : 'bg-indigo-500/50' }`}
                        style={{ height: `${cpuH}%` }}
                        title={`CPU: ${d.cpu}%`}
                      />
                    </div>
                    <span className="text-[7px] text-slate-700 group-hover:text-slate-500">{d.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-slate-600">Collecting data for forecast...</p>
          </div>
        )}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-indigo-500/60" />
            <span className="text-[9px] text-slate-600">CPU Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-rose-500/60" />
            <span className="text-[9px] text-slate-600">&gt;85% Critical Zone</span>
          </div>
          {predict?.current && (
            <span className="text-[9px] text-slate-600 ml-auto">
              Now: CPU {predict.current.cpu?.toFixed(1)}% · Mem {predict.current.memory?.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* LIVE ANOMALY MONITOR */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200">Live Anomaly Monitor</h3>
          <button
            onClick={fetchAI}
            className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all"
          >
            <RefreshCw size={12} />
          </button>
        </div>
        {anomalyData?.anomalies?.length > 0 ? (
          <div className="space-y-2">
            {anomalyData.anomalies.map((a: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                a.severity === 'CRITICAL'
                  ? 'bg-rose-500/5 border-rose-500/20'
                  : 'bg-amber-500/5 border-amber-500/15'
              }`}>
                <AnomalyBadge severity={a.severity} />
                <div className="flex-1">
                  <p className="text-[11px] text-slate-300 leading-relaxed">{a.message}</p>
                </div>
                <span className="text-[9px] font-mono text-slate-600 flex-shrink-0">z={a.z_score}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <Shield size={16} className="text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-emerald-400">All Systems Normal</p>
              <p className="text-[10px] text-slate-600">No anomalies detected in current window</p>
            </div>
          </div>
        )}
      </div>

      {/* SELF-HEAL ACTIVITY LOG */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4">Self-Heal Activity Log</h3>
        {healLog.length === 0 ? (
          <div className="text-center py-8">
            <Zap size={20} className="text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-600">No healing events yet</p>
            <p className="text-[10px] text-slate-700 mt-1">Auto-scaling will log actions here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {healLog.slice(0, 10).map((e: any) => (
              <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    e.action?.includes('Up') ? 'bg-emerald-400' :
                    e.action === 'Self-Heal'  ? 'bg-cyan-400' :
                    'bg-amber-400'
                  }`} />
                  <div>
                    <p className="text-xs font-bold text-slate-300">{e.deployment}</p>
                    <p className="text-[10px] text-slate-600 truncate max-w-[260px]">{e.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${
                    e.action?.includes('Up') ? 'bg-emerald-500/10 text-emerald-400' :
                    e.action === 'Self-Heal'  ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>{e.action}</span>
                  <span className="text-[9px] text-slate-700">{e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}




// ============================================================================
// ALERTS TAB
// ============================================================================

const AlertsTab = ({ state }: { state: DashboardState }) => (
  <div className="space-y-3 page-enter">
    {state.incidents?.length === 0 ? (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={20} className="text-emerald-400" />
        </div>
        <p className="text-sm font-bold text-slate-300">All Systems Operational</p>
        <p className="text-xs text-slate-600 mt-1">No active incidents detected.</p>
      </div>
    ) : (
      state.incidents.map((inc: any) => (
        <div key={inc.id} className={`glass-card rounded-xl p-4 border-l-2 ${
          inc.severity === 'CRITICAL' ? 'border-l-rose-500' : 'border-l-amber-500'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                  inc.severity === 'CRITICAL' ? 'badge-rose' : 'badge-amber'
                }`}>{inc.severity}</span>
                <p className="text-xs font-bold text-slate-200">{inc.title}</p>
              </div>
              <p className="text-[11px] text-slate-500">{inc.message}</p>
            </div>
            <p className="text-[9px] text-slate-600 flex-shrink-0">{inc.cloud}</p>
          </div>
        </div>
      ))
    )}
  </div>
)

// ============================================================================
// COST TAB
// ============================================================================
const CostTab = ({ state, dispatch, fetchData }: { state: DashboardState, dispatch: any, fetchData: any }) => {
  const { cloudAnalytics, zombies, costForecast } = state
  const [running, setRunning] = useState(false)

  const handleOptimize = async () => {
    setRunning(true)
    try {
      await authFetch(`${API_BASE}/finops/optimize`, { method: 'POST' })
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Optimization sequence initiated.`, type: 'success' } })
      fetchData()
    } catch (err: any) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Optimization failed: ${err.message}`, type: 'error' } })
    } finally {
      setTimeout(() => setRunning(false), 2000)
    }
  }

  return (
    <div className="space-y-5 page-enter">
      {/* Phase 3: FinOps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5"><DollarSign size={40} /></div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">Current Month</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{costForecast?.current_month_total || '--'}</span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5"><TrendingDown size={10} /> 2.4%</span>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-indigo-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5"><Brain size={40} /></div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">AI Prediction (Next Mo)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-400">{costForecast?.next_month_projected || '--'}</span>
            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">Acc: {costForecast?.confidence_score}%</span>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-rose-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5"><Zap size={40} /></div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">Zombie Leakage</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">
              ${zombies?.reduce((acc: number, z: any) => acc + parseFloat(z.potential_savings.replace('$', '')), 0).toFixed(2)}/mo
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {costForecast && (
          <div className="h-full">
            <CostForecastChart
              title="30-Day Cost Prediction Forecast"
              data={costForecast.forecast || []}
            />
          </div>
        )}
        {cloudAnalytics && (
          <CostDonutChart
            title="Current Spend Distribution"
            data={cloudAnalytics.cost_breakdown || []}
            center={costForecast?.current_month_total}
          />
        )}
      </div>

      {/* Phase 3: Zombie Detector Panel */}
      <div className="glass-card rounded-2xl overflow-hidden border border-rose-500/10">
        <div className="p-5 border-b border-white/[0.04] bg-rose-500/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shadow-inner">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 italic uppercase italic tracking-wider">Zombie Instance Scanner</h3>
              <p className="text-[10px] text-slate-500 font-bold">Phase 3 · Detecting idle/orphaned containers (&lt;1% CPU)</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-rose-500 text-white animate-pulse">
               {zombies?.length || 0} LEAKS DETECTED
             </span>
          </div>
        </div>
        <div className="">
          {zombies?.length === 0 ? (
            <div className="p-12 text-center">
              <Shield size={24} className="text-emerald-500 mx-auto mb-3 opacity-20" />
              <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Clean Architecture</p>
              <p className="text-[10px] text-slate-600 mt-1">No zombie instances detected in current scan.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {zombies.map((z: any) => (
                <div key={z.deployment_id} className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                       <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/40" />
                       <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-200 tracking-tight">{z.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold text-slate-600 bg-white/[0.03] px-1.5 py-0.5 rounded uppercase">ID: {z.deployment_id}</span>
                        <span className="text-[9px] font-bold text-slate-500">Wait: {z.uptime} · CPU: {z.cpu_usage_avg}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-black text-rose-400">{z.potential_savings}</p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Potential Saving</p>
                    </div>
                    <button 
                      onClick={async () => {
                         try {
                           await authFetch(`${API_BASE}/deployments/${z.deployment_id}/action?action=terminate`, { method: 'POST' });
                           dispatch({ type: 'SET_NOTIFICATION', payload: { msg: 'Zombie instance terminated successfully.', type: 'success' } });
                           fetchData();
                         } catch (err: any) {
                           dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Terminate failed: ${err.message}`, type: 'error' } });
                         }
                      }}
                      className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-600 hover:bg-rose-500 hover:text-white hover:border-rose-500 shadow-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
         <div className="glass-card rounded-2xl p-5 gradient-border h-full">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-sm font-black text-slate-200 uppercase">AI FinOps Advisor</h3>
               <span className="text-[9px] font-black text-indigo-400">ENGINE v2.1</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOptimize}
                disabled={running}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${running ? 'bg-white/5 text-slate-500 cursor-wait' : 'btn-primary shadow-indigo-500/20 shadow-lg'}`}
              >
                {running ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                {running ? 'OPTIMIZING...' : 'KILL ALL ZOMBIES & OPTIMIZE'}
              </button>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 leading-tight">AI will terminate idle resources, migrate workloads to optimized instances, and right-size containers automatically.</p>
              </div>
            </div>
         </div>
         <WhatIfSimulation dispatch={dispatch} />
      </div>
    </div>
  )
}

// ============================================================================
// SETTINGS TAB
// ============================================================================

const AIChatBot = ({ state, dispatch }: { state: DashboardState, dispatch: any }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    (window as any).explainResource = (resource: string) => {
      setIsOpen(true)
      const msg = `Explain the current status and performance of my cloud resource: ${resource}. Are there any risks or optimization opportunities?`
      setInput(msg)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    return () => { (window as any).explainResource = null }
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [state.chatMessages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'user', text: userMsg } })
    
    setLoading(true)
    try {
      const res = await authFetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: userMsg })
      })
      const data = await res.json()
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'ai', text: data.reply } })
    } catch {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'ai', text: "I'm having trouble connecting to the neural core. Please try again soon." } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border border-white/10"
      >
        {isOpen ? <X size={24} /> : (
           <div className="relative">
             <MessageSquare size={24} />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-indigo-600 rounded-full animate-ping" />
           </div>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[480px] glass-card rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
           <div className="p-4 bg-indigo-600/20 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <Brain size={16} className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest italic">Sentry Assistant</h3>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      Neural Core Online
                    </p>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
              {state.chatMessages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-bold leading-relaxed ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                 </div>
              ))}
              {loading && (
                 <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                       <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100" />
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200" />
                       </div>
                    </div>
                 </div>
              )}
           </div>

           <form onSubmit={handleSend} className="p-4 bg-white/[0.02] border-t border-white/10 flex gap-2">
              <input 
                ref={inputRef}
                value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask me something..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
              />
              <button type="submit" className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-all">
                 <Send size={16} />
              </button>
           </form>
        </div>
      )}
    </>
  )
}

const SecurityTab = ({ state, dispatch, fetchData }: { state: DashboardState, dispatch: any, fetchData: any }) => {
  const { securityInfo } = state
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    setScanning(true)
    try {
      await authFetch(`${API_BASE}/security/scan`, { method: 'POST' })
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: "Security scan initiated successfully.", type: 'success' } })
      await fetchData()
    } catch (err: any) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Scan failed: ${err.message}`, type: 'error' } })
    } finally {
      setTimeout(() => setScanning(false), 2000)
    }
  }


  if (!securityInfo) return <div className="skeleton-box h-64 rounded-2xl" />

  return (
    <div className="space-y-5 page-enter">
      {/* Compliance Score Header */}
      <div className="glass-card rounded-2xl p-6 gradient-border flex items-center justify-between">
        <div className="flex items-center gap-5">
           <div className="relative w-20 h-20 flex items-center justify-center">
             <svg width="80" height="80" className="-rotate-90 absolute">
               <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
               <circle 
                 cx="40" cy="40" r="32" fill="none" stroke="#10b981" strokeWidth="6"
                 strokeDasharray={2 * Math.PI * 32}
                 strokeDashoffset={2 * Math.PI * 32 * (1 - securityInfo.compliance_score / 100)}
                 strokeLinecap="round"
                 className="transition-all duration-1000"
               />
             </svg>
             <span className="text-xl font-black text-emerald-400">{securityInfo.compliance_score}%</span>
           </div>
           <div>
             <h2 className="text-lg font-black text-slate-100 italic">Security Compliance Score</h2>
             <p className="text-xs text-slate-500 font-bold mt-1">Based on CIS benchmarks and automated CVE scans.</p>
           </div>
        </div>
        <button onClick={handleScan} disabled={scanning} className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-emerald-500/20 shadow-lg transition-all active:scale-95">
          {scanning ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
          {scanning ? 'SCANNING...' : 'RE-SCAN HUB'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vulnerabilities List */}
        <div className="glass-card rounded-2xl overflow-hidden border border-rose-500/10 h-full">
          <div className="p-4 border-b border-white/[0.04] bg-rose-500/[0.02] flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-2 italic">
              <AlertTriangle size={14} className="text-rose-400" />
              CVE Vulnerabilities
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 tracking-tighter">
              {securityInfo.vulnerabilities?.length || 0} IDENTIFIED
            </span>
          </div>
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {securityInfo.vulnerabilities?.map((v: any, i: number) => (
              <div key={i} className="p-4 border-b border-white/[0.03] last:border-0 hover:bg-rose-500/[0.02] transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                      v.severity === 'CRITICAL' ? 'bg-rose-600 shadow-lg shadow-rose-600/30' : 
                      v.severity === 'HIGH' ? 'bg-amber-500' : 'bg-slate-700'
                    } text-white`}>{v.severity}</span>
                    <span className="text-xs font-black text-slate-200 group-hover:text-white transition-colors uppercase italic">{v.id}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{v.component}</span>
                </div>
                <p className="text-[10px] text-slate-500 group-hover:text-slate-400 leading-relaxed font-bold mb-3">{v.description}</p>
                {v.fix_available && (
                   <div className="flex items-center gap-2 text-emerald-400">
                     <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Check size={10} />
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest">Automatic Fix Available</span>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Secrets Scanner Results */}
        <div className="space-y-4 h-full">
          <div className="glass-card rounded-2xl overflow-hidden border border-amber-500/10 bg-amber-500/[0.01]">
            <div className="p-4 border-b border-white/[0.04] bg-amber-500/[0.03] flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest italic">Leaked Secrets Detector</h3>
              <span className="text-[10px] font-black text-amber-400">{securityInfo.secrets_found?.length || 0} INCIDENTS</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
               {securityInfo.secrets_found?.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-all">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-inner">
                         <Zap size={14} />
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-200">{s.secret_type}</p>
                         <p className="text-[10px] text-slate-600 font-mono italic mt-0.5">{s.file}</p>
                       </div>
                     </div>
                     <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                       s.risk === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                     }`}>{s.risk}</span>
                  </div>
               ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-indigo-500/10 bg-indigo-500/[0.02] gradient-border">
             <h3 className="text-xs font-black text-slate-200 uppercase mb-4 italic tracking-widest">Compliance Checklist</h3>
             <div className="space-y-4">
               {[
                 { label: 'Network Isolation (VPC)', status: true },
                 { label: 'RBAC Active', status: true },
                 { label: 'Secrets Encrypted (KMS)', status: false },
                 { label: 'Container Hardening', status: true },
                 { label: 'External SSH Disabled', status: true },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-black tracking-tight">{item.label}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.status ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                       {item.status ? <Check size={10} /> : <X size={10} />}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const WhatIfSimulation = ({ dispatch }: { dispatch: any }) => {
  const [killCount, setKillCount] = useState(0)
  const [scaleDown, setScaleDown] = useState(0)
  const [simResult, setSimResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSimulate = async () => {
    setLoading(true)
    try {
      const res = await authFetch(`${API_BASE}/cost/simulation`, {
        method: 'POST',
        body: JSON.stringify({ kill_count: killCount, scale_down_pct: scaleDown })
      })
      const data = await res.json()
      setSimResult(data)
    } catch (err: any) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Simulation failed: ${err.message}`, type: 'error' } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-indigo-500/10 bg-indigo-500/[0.02] gradient-border">
       <div className="flex items-center gap-3 mb-6">
         <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
           <BarChart3 size={20} />
         </div>
         <div>
           <h3 className="text-sm font-black text-slate-100 uppercase italic">Savings Simulator</h3>
           <p className="text-[10px] text-slate-500 font-bold">Predict "What-if" optimization results</p>
         </div>
       </div>

       <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
               <span>Instances to Stop</span>
               <span className="text-indigo-400">{killCount} nodes</span>
            </div>
            <input 
              type="range" min="0" max="100" value={killCount} 
              onChange={e => setKillCount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
               <span>Scale Down Impact</span>
               <span className="text-indigo-400">{scaleDown}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={scaleDown} 
              onChange={e => setScaleDown(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <button 
            onClick={handleSimulate} disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-500 text-white text-[10px] font-black tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Rocket size={14} />}
            {loading ? 'CALCULATING...' : 'RUN SIMULATION'}
          </button>

          {simResult && (
            <div className="pt-6 border-t border-white/[0.04] space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">Monthly Savings</p>
                     <p className="text-lg font-black text-emerald-400">${simResult.estimated_monthly_savings}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">Impact Score</p>
                     <p className="text-lg font-black text-indigo-400">+{Math.round(killCount * 1.5)}%</p>
                  </div>
               </div>
               <p className="text-[10px] text-slate-500 italic font-bold leading-relaxed">
                 {simResult.impact_description}
               </p>
            </div>
          )}
       </div>
    </div>
  )
}

const TeamTab = ({ state, dispatch }: { state: DashboardState, dispatch: any }) => {
  const { teamInfo } = state
  const [rooms, setRooms] = useState<any[]>([])
  const [archivedRooms, setArchivedRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoomTitle, setNewRoomTitle] = useState("")

  const fetchRooms = async () => {
    try {
      // Fetch active
      const resActive = await authFetch(`${API_BASE}/warrooms?status=active`)
      const activeData = await resActive.json()
      setRooms(activeData)

      // Fetch closed
      const resClosed = await authFetch(`${API_BASE}/warrooms?status=closed`)
      const closedData = await resClosed.json()
      setArchivedRooms(closedData)
    } catch (err) {}
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const handleCreateRoom = async () => {
    if (!newRoomTitle) return
    try {
      const res = await authFetch(`${API_BASE}/warrooms`, {
        method: 'POST',
        body: JSON.stringify({ title: newRoomTitle })
      })
      const data = await res.json()
      setRooms([...rooms, data])
      setShowCreateRoom(false)
      setNewRoomTitle("")
      handleJoinRoom(data)
    } catch (err) {}
  }

  const handleJoinRoom = async (room: any) => {
    if (ws) ws.close()
    setSelectedRoom(room)
    setLoading(true)
    
    try {
      const res = await authFetch(`${API_BASE}/warrooms/${room.id}/messages`)
      const history = await res.json()
      setMessages(history)
      
      if (room.status === 'active') {
        const newWs = new WebSocket(`${WS_BASE}/warroom/${room.id}`)
        newWs.onmessage = (event) => {
          const msg = JSON.parse(event.data)
          setMessages(prev => [...prev, msg])
        }
        setWs(newWs)
      } else {
        setWs(null)
      }
    } catch (err) {} finally {
      setLoading(false)
    }
  }

  const handleCloseRoom = async (roomId: number) => {
    try {
      await authFetch(`${API_BASE}/warrooms/${roomId}`, { method: 'DELETE' })
      const closedRoom = rooms.find(r => r.id === roomId)
      setRooms(rooms.filter(r => r.id !== roomId))
      if (closedRoom) setArchivedRooms([{ ...closedRoom, status: 'closed' }, ...archivedRooms])
      
      if (selectedRoom?.id === roomId) {
        setSelectedRoom({ ...selectedRoom, status: 'closed' })
        if (ws) ws.close()
        setWs(null)
      }
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: "War Room closed successfully.", type: 'info' } })
    } catch (err) {}
  }



  const handleSendMessage = async (e?: any) => {
    if (e) e.preventDefault()
    if (!inputText || !selectedRoom || !ws) return

    const msgObj = {
      room_id: selectedRoom.id,
      user: "abc123@gmail.com", // In a real app, use from auth state
      text: inputText,
      type: "chat"
    }

    try {
      // 1. Persist to DB
      await authFetch(`${API_BASE}/warrooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        body: JSON.stringify(msgObj)
      })
      
      // 2. Broadcast via WS
      ws.send(JSON.stringify(msgObj))
      setInputText("")
    } catch (err) {}
  }

  if (!teamInfo) return <div className="skeleton-box h-64 rounded-2xl" />

  return (
    <div className="space-y-5 page-enter">
      {/* Team Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-indigo-500 flex items-center justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5"><Users size={48} /></div>
           <div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Active War Rooms</p>
             <p className="text-2xl font-black text-indigo-400">{rooms.length || teamInfo.active_war_rooms}</p>
           </div>
           <button 
             onClick={() => setShowCreateRoom(true)}
             className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black hover:bg-indigo-500 hover:text-white transition-all uppercase"
           >
             NEW SESSION
           </button>
        </div>
        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500 flex items-center justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5"><DollarSign size={48} /></div>
           <div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Team Cost Savings</p>
             <p className="text-2xl font-black text-emerald-400">{teamInfo.total_savings_team}</p>
           </div>
           <Zap size={20} className="text-emerald-500/20" />
        </div>
      </div>

      {showCreateRoom && (
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/20 bg-indigo-500/5 animate-in fade-in zoom-in-95 duration-200">
           <h3 className="text-xs font-black text-slate-100 uppercase mb-4 italic">Initialize New War Room</h3>
           <div className="flex gap-2">
             <input 
               autoFocus
               value={newRoomTitle} onChange={e => setNewRoomTitle(e.target.value)}
               placeholder="Enter incident name (e.g. Prod API Outage)"
               className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
             />
             <button 
               onClick={handleCreateRoom}
               className="px-6 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-black hover:bg-indigo-600 transition-all font-mono"
             >
               CREATE
             </button>
             <button 
               onClick={() => setShowCreateRoom(false)}
               className="px-4 py-2 rounded-xl bg-white/5 text-slate-500 text-[10px] font-black hover:bg-white/10 transition-all font-mono"
             >
               CANCEL
             </button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Col: Rooms List & Leaderboard */}
        <div className="space-y-4 lg:col-span-1">
          {/* Active Rooms List */}
          <div className="glass-card rounded-2xl overflow-hidden border border-indigo-500/10">
            <div className="p-4 border-b border-white/[0.04] bg-indigo-500/[0.02] flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest italic">Live Sessions</h3>
              <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-emerald-500">{rooms.length} ACTIVE</span>
              </div>
            </div>
            <div className="max-h-[220px] overflow-y-auto custom-scrollbar divide-y divide-white/[0.03]">
               {rooms.length === 0 ? (
                 <div className="p-8 text-center">
                    <p className="text-[10px] font-bold text-slate-600 italic">No active rooms found.</p>
                 </div>
               ) : rooms.map((r: any) => (
                 <div 
                   key={r.id} 
                   onClick={() => handleJoinRoom(r)}
                   className={`p-4 cursor-pointer hover:bg-indigo-500/5 transition-all group ${selectedRoom?.id === r.id ? 'bg-indigo-500/10 border-r-2 border-r-indigo-500' : ''}`}
                 >
                   <div className="flex items-center justify-between">
                     <span className={`text-xs font-black uppercase ${selectedRoom?.id === r.id ? 'text-indigo-400' : 'text-slate-200'} group-hover:text-indigo-400`}>{r.title}</span>
                     <ChevronRight size={14} className="text-slate-700 group-hover:text-indigo-500" />
                   </div>
                   <p className="text-[9px] text-slate-600 font-bold mt-1 uppercase italic tracking-tighter">Opened {new Date(r.created_at).toLocaleTimeString()}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Archived Rooms List */}
          <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01]">
            <div className="p-4 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Session History</h3>
              <History size={14} className="text-slate-700" />
            </div>
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar divide-y divide-white/[0.03]">
               {archivedRooms.length === 0 ? (
                 <div className="p-6 text-center">
                    <p className="text-[9px] font-bold text-slate-700 italic uppercase">Log is empty</p>
                 </div>
               ) : archivedRooms.map((r: any) => (
                 <div 
                   key={r.id} 
                   onClick={() => handleJoinRoom(r)}
                   className={`p-3 cursor-pointer hover:bg-white/5 transition-all group ${selectedRoom?.id === r.id ? 'bg-white/5 border-r-2 border-r-slate-500' : ''}`}
                 >
                   <div className="flex items-center justify-between">
                     <span className={`text-[11px] font-black uppercase ${selectedRoom?.id === r.id ? 'text-slate-200' : 'text-slate-500'} group-hover:text-slate-300`}>{r.title}</span>
                     <span className="text-[8px] font-bold text-slate-700 uppercase">{new Date(r.created_at).toLocaleDateString()}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>


          {/* Leaderboard */}
          <div className="glass-card rounded-2xl overflow-hidden border border-indigo-500/10 h-full">
            <div className="p-4 border-b border-white/[0.04] bg-indigo-500/[0.02] flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest italic">DevOps Leaderboard</h3>
              <span className="text-[9px] font-black text-indigo-400">SEASON 1</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
               {teamInfo.leaderboard?.map((u: any, i: number) => (
                  <div key={i} className="p-4 hover:bg-white/[0.01] transition-all group">
                     {/* ... (leaderboard content remains same) */}
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                           <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                             i === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 
                             i === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' : 
                             'bg-white/5 text-slate-500 border border-white/10'
                           }`}>
                             {i + 1}
                           </div>
                           <span className="text-xs font-black text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{u.username}</span>
                        </div>
                        <span className="text-xs font-black text-indigo-400">{u.points} <span className="text-[8px] opacity-60">XP</span></span>
                     </div>
                     <div className="flex flex-wrap gap-1.5 mt-1">
                        {u.badges?.map((b: string) => (
                           <span key={b} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-500 border border-white/[0.05] uppercase tracking-tighter">
                             {b}
                           </span>
                        ))}
                     </div>
                     <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase">Impact: <span className="text-emerald-500">{u.impact}</span></p>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* War Room Terminal Interface */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden border border-slate-500/20 bg-[#0d1117] flex flex-col h-full shadow-2xl">
          <div className="p-3 bg-slate-800/40 border-b border-white/[0.05] flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
               </div>
               <div className="h-5 w-px bg-white/10 mx-1" />
               <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tight uppercase">
                 {selectedRoom ? `strat-os@war-room: ~/incidents/${selectedRoom.id}` : 'strat-os@cloud: ~/team-hub'}
               </span>
             </div>
             <div className="flex items-center gap-3">
                {selectedRoom && (
                  <>
                    <button 
                      onClick={() => handleCloseRoom(selectedRoom.id)}
                      className="text-[9px] font-black text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded uppercase tracking-[1px] transition-all"
                    >
                      Close Session
                    </button>
                    <span className="text-[9px] font-black text-emerald-400 animate-pulse bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-[1px]">Connected</span>
                  </>
                )}
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[1px] font-mono italic">ssh/collaborative-v2</span>
             </div>

          </div>
          
          <div className="p-6 font-mono text-[11px] leading-relaxed flex-1 overflow-y-auto space-y-2.5 custom-scrollbar min-h-[400px]">
             {!selectedRoom ? (
               <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
                 <Terminal size={48} className="mb-4 text-slate-500" />
                 <p className="text-xs font-black uppercase tracking-widest text-slate-500">Select a room to begin</p>
               </div>
             ) : (
               <>
                 <p className="text-indigo-400 mb-4 font-black">*** INITIALIZING JOINT DEBUG SESSION FOR: {selectedRoom.title} ***</p>
                 {loading ? (
                    <p className="text-slate-500 animate-pulse italic">Synchronizing message logs from cluster...</p>
                 ) : (
                   messages.map((m: any, i: number) => (
                     <div key={i} className="animate-in fade-in slide-in-from-left-1 duration-300">
                        <span className="text-slate-600 mr-2">[{new Date(m.timestamp).toLocaleTimeString()}]</span>
                        <span className={`${m.type === 'ai' ? 'text-indigo-400 font-black' : m.user === 'abc123@gmail.com' ? 'text-emerald-500' : 'text-amber-500'} mr-2 font-black uppercase`}>
                          {m.user}:
                        </span>
                        <span className={m.type === 'command' ? 'text-slate-100 italic' : 'text-slate-300'}>{m.text}</span>
                     </div>
                   ))
                 )}
                 <div className="h-px bg-white/5 my-4" />
                 {selectedRoom.status === 'active' ? (
                   <form onSubmit={handleSendMessage} className="flex items-center gap-3 pt-4">
                      <span className="text-emerald-500 font-black">stratisio@cloud:~$</span>
                      <input 
                         value={inputText} onChange={e => setInputText(e.target.value)}
                         placeholder="Enter command or message..."
                         className="flex-1 bg-transparent border-none text-slate-100 placeholder:text-slate-700 focus:outline-none w-full"
                      />
                      <div className="w-1.5 h-4 bg-indigo-500 animate-pulse" />
                   </form>
                 ) : (
                   <div className="flex items-center gap-3 pt-4 opacity-50">
                      <span className="text-slate-600 font-black">stratisio@cloud:~$</span>
                      <span className="text-slate-700 italic text-[10px]">Session ended. Terminal is read-only.</span>
                   </div>
                 )}

               </>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ApprovalQueueTab = ({ state, dispatch, fetchData }: { state: DashboardState, dispatch: any, fetchData: any }) => {
  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      await authFetch(`${API_BASE}/ai/${action}/${id}`, { method: 'POST' })
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Action ${action}d successfully.`, type: 'success' } })
      fetchData()
    } catch (err: any) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Action failed: ${err.message}`, type: 'error' } })
    }
  }

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-100 italic">Human-in-the-Loop Review</h2>
          <p className="text-xs text-slate-600">AI suggested actions require manual authorization</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Enterprise Guard Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {state.approvalQueue.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center border-dashed border-2 border-white/5">
            <Check size={32} className="text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-500">Queue is empty. Everything is optimized.</p>
          </div>
        ) : (
          state.approvalQueue.map((item: any) => (
            <div key={item.id} className="glass-card rounded-2xl p-5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.risk_level === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.action_type === 'shutdown' ? <Square size={18} /> : <RotateCcw size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-slate-100 uppercase tracking-tight">{item.action_type} {item.resource_id}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                      item.risk_level === 'high' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {item.risk_level} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-md">{item.recommendation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4 pr-4 border-r border-white/5">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Confidence</p>
                   <p className="text-sm font-black text-indigo-400">{item.confidence_score}%</p>
                </div>
                <button 
                  onClick={() => handleAction(item.id, 'reject')}
                  className="px-4 py-2 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-white/5 transition-all"
                >
                  REJECT
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'approve')}
                  className="px-5 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all"
                >
                  APPROVE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const AuditLogTab = ({ state, fetchData, dispatch }: { state: DashboardState, fetchData: any, dispatch: any }) => {
  const handleRollback = async (id: number) => {
    try {
      await authFetch(`${API_BASE}/ai/rollback/${id}`, { method: 'POST' })
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Rollback successful.`, type: 'success' } })
      fetchData()
    } catch (err: any) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Rollback failed: ${err.message}`, type: 'error' } })
    }
  }

  return (
    <div className="space-y-5 page-enter">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-100">Audit Trail</h2>
          <p className="text-xs text-slate-600">Compliance and action history across all workspaces</p>
        </div>
        <button onClick={() => fetchData()} className="text-slate-500 hover:text-indigo-400 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                {['Timestamp', 'User', 'Action', 'Resource', 'Status', 'Undo'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.auditLogs.map((log: any) => (
                <tr key={log.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4 text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-[11px] font-bold text-slate-300">Admin</td>
                  <td className="px-5 py-4 text-[11px] font-black text-indigo-400">{log.action}</td>
                  <td className="px-5 py-4 text-[11px] font-mono text-slate-500">{log.resource_id}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {log.action.toLowerCase().includes('executed') && (
                      <button 
                        onClick={() => handleRollback(log.id)}
                        className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-indigo-400 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Rollback Action"
                      >
                        <Undo2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const SettingsTab = ({ dispatch }: { dispatch: any }) => {
  const [provider, setProvider] = useState('AWS')
  const [accessKey, setAccessKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [region, setRegion] = useState('us-east-1')
  const [saving, setSaving] = useState(false)

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authFetch(`${API_BASE}/settings/cloud-keys`, {
        method: 'POST',
        body: JSON.stringify({ provider, access_key: accessKey, secret_key: secretKey, region })
      })
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `✓ ${provider} credentials encrypted and saved.`, type: 'success' } })
      setAccessKey(''); setSecretKey('')
    } catch (err: any) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Failed: ${err.message}`, type: 'error' } })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-enter">
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Key size={80} />
          </div>
          <h3 className="text-sm font-black text-slate-200 mb-5 flex items-center gap-2">
            <Key size={16} className="text-indigo-400" />
            Cloud Connectivity
          </h3>
          <form onSubmit={handleSaveKeys} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Provider</label>
                <select 
                  value={provider} onChange={e => setProvider(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
                >
                  <option>AWS</option>
                  <option>Azure</option>
                  <option>GCP</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Default Region</label>
                <input 
                  type="text" value={region} onChange={e => setRegion(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
                  placeholder="us-east-1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Access Key ID</label>
              <input 
                type="text" value={accessKey} onChange={e => setAccessKey(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500/50"
                placeholder="AKIA..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Secret Access Key</label>
              <input 
                type="password" value={secretKey} onChange={e => setSecretKey(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500/50"
                placeholder="••••••••••••••••"
              />
            </div>
            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-3">
               <Shield size={14} className="text-emerald-500 mt-0.5" />
               <p className="text-[9px] text-emerald-400 font-bold leading-relaxed">
                 StratisIO uses AES-256-CBC encryption to store your keys. Plain-text keys are never stored in the database.
               </p>
            </div>
            <button 
              type="submit" disabled={saving}
              className="w-full py-3 rounded-xl bg-indigo-500 text-white text-[10px] font-black tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw size={11} className="animate-spin" /> : <Lock size={11} />}
              {saving ? 'ENCRYPTING...' : 'SAVE ENCRYPTED KEYS'}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-5">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-200 mb-5">Platform Metadata</h3>
          <div className="space-y-3">
            {[
              { label: 'Core Version', value: '2.4.0-Enterprise' },
              { label: 'AI Engine', value: 'Llama-3-Cloud-Orchestrator' },
              { label: 'Audit System', value: 'Immutable Ledger Active' },
              { label: 'Encryption', value: 'Fernet/Cryptography 42.0' },
              { label: 'API Base', value: API_BASE },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.02] last:border-0">
                <span className="text-[10px] font-bold text-slate-600 uppercase">{item.label}</span>
                <span className="text-[10px] font-mono text-indigo-400">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function DashboardPage() {
  const router = useRouter()
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState('User')
  const [showDeploy, setShowDeploy] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Deployment | null>(null)
  const [wsData, setWsData] = useState<any>(null)

  // ── Auth Guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('stratis_token')
    if (!token) { router.push('/login'); return }
    try {
      const userJson = localStorage.getItem('stratis_user')
      if (userJson) setUsername(JSON.parse(userJson).username || 'User')
    } catch {}
  }, [router])

  // ── WebSocket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const cleanup = wsConnect('/ws/telemetry', (data) => {
      setWsData(data)
    })
    return cleanup
  }, [])

  // ── Data Fetcher ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        authFetch(`${API_BASE}/deployments`),
        authFetch(`${API_BASE}/overview-stats`),
        authFetch(`${API_BASE}/telemetry`),
        authFetch(`${API_BASE}/recommendations`),
        authFetch(`${API_BASE}/scaling-events`),
        authFetch(`${API_BASE}/health`),
        authFetch(`${API_BASE}/cloud-comparison`),
        authFetch(`${API_BASE}/finops/zombie-scan`),
        authFetch(`${API_BASE}/finops/cost-forecast`),
        authFetch(`${API_BASE}/security`),
        authFetch(`${API_BASE}/team/hub`),
        authFetch(`${API_BASE}/projects`),
        authFetch(`${API_BASE}/ai/recommendations`),
        authFetch(`${API_BASE}/audit-logs`),
      ])

      const [
        deploymentsRes, statsRes, telemetryRes, recsRes, 
        eventsRes, healthRes, cloudRes, zombiesRes, forecastRes, securityRes, teamRes, projectsRes,
        approvalRes, auditRes
      ] = results

      if (deploymentsRes.status === 'fulfilled') {
        const data = await deploymentsRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_DEPLOYMENTS', payload: data })
      }
      if (statsRes.status === 'fulfilled') {
        const data = await statsRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_STATS', payload: data })
      }
      if (telemetryRes.status === 'fulfilled') {
        const data = await telemetryRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_TELEMETRY', payload: data })
      }
      if (recsRes.status === 'fulfilled') {
        const data = await recsRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_RECOMMENDATIONS', payload: data })
      }
      if (eventsRes.status === 'fulfilled') {
        const data = await eventsRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_SCALING_EVENTS', payload: data })
      }
      if (healthRes.status === 'fulfilled') {
        const h = await healthRes.value.json().catch(() => null)
        if (h) dispatch({ type: 'SET_INCIDENTS', payload: h.incidents || [] })
      }
      if (cloudRes.status === 'fulfilled') {
        const data = await cloudRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_CLOUD_ANALYTICS', payload: data })
      }
      if (zombiesRes.status === 'fulfilled') {
        const data = await zombiesRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_ZOMBIES', payload: data })
      }
      if (forecastRes.status === 'fulfilled') {
        const data = await forecastRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_COST_FORECAST', payload: data })
      }
      if (securityRes.status === 'fulfilled') {
        const data = await securityRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_SECURITY_INFO', payload: data })
      }
      if (teamRes.status === 'fulfilled') {
        const data = await teamRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_TEAM_INFO', payload: data })
      }
      if (projectsRes.status === 'fulfilled') {
        const data = await projectsRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_PROJECTS', payload: data || [] })
      }
      if (approvalRes.status === 'fulfilled') {
        const data = await approvalRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_APPROVAL_QUEUE', payload: data || [] })
      }
      if (auditRes.status === 'fulfilled') {
        const data = await auditRes.value.json().catch(() => null)
        if (data) dispatch({ type: 'SET_AUDIT_LOGS', payload: data || [] })
      }

      dispatch({ type: 'SET_SYNC', payload: new Date().toLocaleTimeString() })
      setIsLoading(false)
    } catch (err) {
      console.error('Fetch error:', err)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // ── Deploy ──────────────────────────────────────────────────────────────────
  const handleDeploy = async (formData: any) => {
    setIsDeploying(true)
    try {
      const res = await authFetch(`${API_BASE}/deploy`, {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      const newDep = await res.json()
      dispatch({ type: 'SET_DEPLOYMENTS', payload: [...state.deployments, newDep] })
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `✓ ${formData.name} deployed successfully!`, type: 'success' } })
      setShowDeploy(false)
    } catch (err: any) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Deploy failed: ${err.message}`, type: 'error' } })
    } finally {
      setIsDeploying(false)
    }
  }

  // ── Container Actions ───────────────────────────────────────────────────────
  const handleAction = async (id: number, action: string) => {
    setSelectedResource(null)
    try {
      await authFetch(`${API_BASE}/deployments/${id}/action?action=${action}`, { method: 'POST' })
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `${action} successful`, type: 'success' } })
      await fetchData()
    } catch (err: any) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Action failed: ${err.message}`, type: 'error' } })
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await authFetch(`${API_BASE}/auth/logout`, { method: 'POST' }) } catch {}
    localStorage.removeItem('stratis_token')
    localStorage.removeItem('stratis_user')
    router.push('/login')
  }

  // ── Tab Content ─────────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewTab state={state} isLoading={isLoading} wsData={wsData} />
      case 'deploy':
        return (
          <div className="space-y-4 page-enter">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-100">Deployments</h2>
                <p className="text-xs text-slate-600">{state.deployments.length} active nodes</p>
              </div>
              <button onClick={() => setShowDeploy(true)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                <Plus size={14} /> Provision Node
              </button>
            </div>
            <DeploymentTable
              data={state.deployments}
              onSettingsClick={setSelectedResource}
              loading={isLoading}
            />
          </div>
        )
      case 'monitoring':
        return (
          <div className="space-y-4 page-enter">
            <h2 className="text-base font-black text-slate-100">System Monitoring</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {wsData && (
                <>
                  {[
                    { title: 'CPU Usage', val: wsData.cpu, color: '#6366f1' },
                    { title: 'Memory Usage', val: wsData.memory, color: '#06b6d4' },
                  ].map(m => (
                    <div key={m.title} className="glass-card rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-200">{m.title}</h3>
                        <div className="flex items-center gap-1.5">
                          <div className="live-dot" />
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-black" style={{ color: m.color }}>{m.val}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${m.val}%`, background: `linear-gradient(90deg, ${m.color}80, ${m.color})` }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
              <TelemetryChart
                title="CPU Load Over Time"
                data={(state.telemetry?.cpu_load ?? []).map((v: number, i: number) => ({ time: `T-${i}`, value: v }))}
                dataKey="value" color="#6366f1" loading={isLoading} live
              />
              <TelemetryChart
                title="Memory Trend"
                data={(state.telemetry?.throughput ?? []).map((v: number, i: number) => ({ time: `T-${i}`, value: v }))}
                dataKey="value" color="#06b6d4" type="line" loading={isLoading} live
              />
            </div>
          </div>
        )
      case 'aiops':      return <AIOpsTab state={state} isLoading={isLoading} />
      case 'approval':   return <ApprovalQueueTab state={state} dispatch={dispatch} fetchData={fetchData} />
      case 'audit':      return <AuditLogTab state={state} dispatch={dispatch} fetchData={fetchData} />
      case 'cloud':      return <CloudAnalyticsTab state={state} isLoading={isLoading} />
      case 'cost':       return <CostTab state={state} dispatch={dispatch} fetchData={fetchData} />
      case 'security':   return <SecurityTab state={state} dispatch={dispatch} fetchData={fetchData} />
      case 'team':       return <TeamTab state={state} dispatch={dispatch} />
      case 'settings':   return <SettingsTab dispatch={dispatch} />

      default:           return null
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen mesh-gradient grid-pattern overflow-hidden">
      {/* Sidebar and rest... */}
      <aside className="acrylic-sidebar w-56 flex-shrink-0 flex flex-col z-10">
        {/* ... */}
        {/* Logo */}
        <div className="p-5 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <Cloud size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-100 tracking-tight">StratisIO</p>
              <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-[2px]">Enterprise v2</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {SIDEBAR_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'} />
                <span className="text-xs font-semibold">{item.label}</span>
                {item.id === 'alerts' && state.incidents?.length > 0 && (
                  <span className="ml-auto w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {state.incidents.length}
                  </span>
                )}
                {isActive && <ChevronRight size={12} className="ml-auto text-indigo-500" />}
              </button>
            )
          })}
        </nav>

        {/* Bottom: User + Logout */}
        <div className="p-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03]">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-black flex-shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{username}</p>
              <p className="text-[9px] text-slate-600">Admin</p>
            </div>
            <button onClick={handleLogout} className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Phase 3: FinOps Zombie Alert Banner */}
        {state.zombies?.length > 0 && (
          <div className="bg-rose-600 px-6 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-700 shadow-2xl relative z-[100]">
            <div className="flex items-center gap-3">
              <AlertTriangle size={15} className="text-white animate-bounce" />
              <p className="text-[10px] font-black text-rose-50 uppercase tracking-widest leading-none">
                FinOps Alert: {state.zombies.length} Zombie Instances Detected! 
                <span className="hidden sm:inline opacity-70 ml-2">— Potential Loss: 
                  ${state.zombies.reduce((acc: number, z: any) => acc + (parseFloat(z.potential_savings.replace('$', '')) || 0), 0).toFixed(2)}/mo
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
               <button 
                 onClick={async () => {
                   try {
                     await authFetch(`${API_BASE}/finops/optimize`, { method: 'POST' });
                     dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Optimization sequence initiated. Zombies terminated.`, type: 'success' } });
                     fetchData();
                   } catch (err: any) {
                     dispatch({ type: 'SET_NOTIFICATION', payload: { msg: `Optimization failed: ${err.message}`, type: 'error' } });
                   }
                 }}
                 className="px-4 py-1.5 rounded-lg bg-white text-rose-600 text-[9px] font-black hover:bg-rose-50 transition-all shadow-lg active:scale-95"
               >
                 STOP & SAVE NOW
               </button>
               <button onClick={() => dispatch({ type: 'SET_ZOMBIES', payload: [] })} className="text-rose-200 hover:text-white">
                 <X size={14} />
               </button>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <header className="flex-shrink-0 h-14 border-b border-white/[0.04] flex items-center justify-between px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black text-slate-100 border-r border-white/10 pr-4">
              {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label ?? 'Dashboard'}
            </h1>
            
            {/* Phase 7: Project Switcher */}
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Workspace:</span>
               <select 
                 value={state.activeProjectId}
                 onChange={(e) => {
                   dispatch({ type: 'SET_ACTIVE_PROJECT', payload: e.target.value })
                   fetchData() // Refresh data for new project
                 }}
                 className="bg-transparent text-xs font-black text-indigo-400 focus:outline-none cursor-pointer hover:text-indigo-300"
               >
                 {state.projects.map((p: any) => (
                   <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">{p.name}</option>
                 ))}
               </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <div className="live-dot" />
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                {wsData ? 'Live' : 'Connecting'}
              </span>
            </div>
            <button
              onClick={() => fetchData()}
              className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/20 transition-all"
            >
              <RefreshCw size={13} />
            </button>
            <button
              onClick={() => setShowDeploy(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-xs"
            >
              <Plus size={13} /> Deploy
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {renderTab()}
        </main>
      </div>

      {/* ── MODALS & OVERLAYS ─────────────────────────────────────────────── */}
      <DeployModal
        isOpen={showDeploy}
        onClose={() => setShowDeploy(false)}
        onDeploy={handleDeploy}
        isDeploying={isDeploying}
        recommendation={state.recommendations}
      />
      <ResourceModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onAction={handleAction}
      />
      <AIChatBot state={state} dispatch={dispatch} />
      {state.notification && (
        <Toast
          msg={state.notification.msg}
          type={state.notification.type}
          onClose={() => dispatch({ type: 'SET_NOTIFICATION', payload: null })}
        />
      )}
    </div>
  )
}

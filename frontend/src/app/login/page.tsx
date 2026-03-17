"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cloud, Eye, EyeOff, X, KeyRound, CheckCircle2, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react'

const API_BASE = "http://127.0.0.1:8000/api/v1"

// ── Animated background orbs ─────────────────────────────────────────────────
const BgOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
    <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
    <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
    {/* Grid pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
      backgroundSize: '40px 40px'
    }} />
  </div>
)

// ── Feature badges shown on the right side ───────────────────────────────────
const FEATURES = [
  { icon: <Zap size={14} className="text-amber-400" />, label: 'AI-powered auto-scaling', bg: 'bg-amber-500/10 border-amber-500/20' },
  { icon: <Shield size={14} className="text-emerald-400" />, label: 'SOC2 & GDPR compliant', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: <BarChart3 size={14} className="text-indigo-400" />, label: 'Real-time cloud analytics', bg: 'bg-indigo-500/10 border-indigo-500/20' },
]

// ── Stat counters shown on hero side ─────────────────────────────────────────
const STATS = [
  { val: '99.99%', label: 'Uptime SLA' },
  { val: '$340',   label: 'Avg. monthly savings' },
  { val: '4.8×',   label: 'Faster deployments' },
]

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  // Forgot password flow
  const [showForgot, setShowForgot] = useState(false)
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotResult, setForgotResult] = useState<{ token?: string; message?: string } | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('stratis_token')) router.push('/')
  }, [router])

  // ── Auth handler ──────────────────────────────────────────────────────────
  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!username.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      setError('Server taking too long, please retry')
      setIsLoading(false)
    }, 10000) // 10s timeout

    try {
      console.log(`[AUTH] Initiating ${isLogin ? 'LOGIN' : 'SIGNUP'} for user: ${username.trim()}`)
      const res = await fetch(`${API_BASE}${isLogin ? '/auth/login' : '/auth/register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const data = await res.json()
      console.log(`[AUTH] Response received:`, data)

      if (res.ok && data.success) {
        if (isLogin && data.token) {
          localStorage.setItem('stratis_token', data.token)
          localStorage.setItem('stratis_user', JSON.stringify(data.user || { username }))
          console.log('[AUTH] Token stored. Redirecting to /dashboard...')
          router.push('/dashboard')
        } else if (!isLogin) {
          setIsLogin(true)
          setError('✓ Account created! Please log in.')
        }
      } else {
        setError(data.detail || data.message || 'Authentication failed.')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('[AUTH] Request timed out after 10s.')
      } else {
        console.error('[AUTH] Network or server error:', err)
        setError('Cannot reach server — is the backend running on :8000?')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotResult(null)
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUsername.trim() }),
      })
      const data = await res.json()
      setForgotResult({ token: data.demo_token, message: data.message })
      if (data.demo_token) setResetToken(data.demo_token)
    } catch {
      setForgotResult({ message: 'Network error.' })
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      })
      if (res.ok) {
        setResetSuccess(true)
        setTimeout(() => {
          setShowForgot(false); setShowReset(false); setForgotResult(null)
          setResetToken(''); setNewPassword(''); setResetSuccess(false)
        }, 2000)
      } else {
        const d = await res.json()
        setForgotResult({ message: d.detail || 'Reset failed.' })
      }
    } catch {
      setForgotResult({ message: 'Network error.' })
    } finally {
      setResetLoading(false)
    }
  }

  const handleOAuth = (provider: 'google' | 'github') => {
    fetch(`${API_BASE}/auth/${provider}`).then(r => r.json()).then(d => {
      if (d.url) window.location.href = d.url
    }).catch(() => setError(`${provider} login unavailable.`))
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen mesh-gradient grid-pattern flex items-center justify-center p-4 relative">
      <BgOrbs />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Login Card ──────────────────────────────────────────── */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-t-3xl" />

            <div className="p-8">
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-8">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Cloud size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-100 tracking-tight">StratisIO</p>
                  <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-[2px]">Enterprise v2</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-100 mb-1">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-xs text-slate-500 mb-7">
                {isLogin ? 'Sign in to your DevOps command center.' : 'Start managing your cloud infrastructure.'}
              </p>

              {/* OAuth */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleOAuth('google')}
                  className="btn-secondary flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.08] hover:border-white/[0.14] transition-all text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleOAuth('github')}
                  className="btn-secondary flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.08] hover:border-white/[0.14] transition-all text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  <svg className="w-4 h-4 fill-slate-300" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12"/></svg>
                  GitHub
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">or continue</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {error && (
                  <div className={`p-3 rounded-xl text-xs font-semibold border ${
                    error.startsWith('✓')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {error}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Email"
                    className="input-dark w-full px-4 py-3 text-sm"
                    required
                  />
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      className="input-dark w-full px-4 py-3 pr-11 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2 ${
                    isLoading ? 'bg-indigo-500/30 text-indigo-300 cursor-not-allowed' : 'btn-primary'
                  }`}
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <ArrowRight size={15} />
                  }
                  {isLoading ? 'Verifying...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError('') }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

          {/* ── RIGHT: Hero Panel ─────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-between p-8">
            {/* Headline */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-5">
                <div className="live-dot" />
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[2px]">Platform Online</span>
              </div>
              <h1 className="text-3xl font-black text-slate-100 leading-tight mb-3">
                Next-Gen AI{'\u00A0'}Cloud<br />
                <span className="text-gradient">Command Center</span>
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Manage AWS, Azure, GCP and Local Docker from a unified intelligent dashboard. Autopilot your infrastructure with AI.
              </p>
            </div>

            {/* Feature badges */}
            <div className="space-y-2.5 my-8">
              {FEATURES.map(f => (
                <div key={f.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${f.bg} backdrop-blur-sm`}>
                  {f.icon}
                  <span className="text-xs font-semibold text-slate-400">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {STATS.map(s => (
                <div key={s.val} className="glass-card rounded-2xl p-4 text-center">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent rounded-t-2xl" />
                  <p className="text-xl font-black text-gradient">{s.val}</p>
                  <p className="text-[9px] font-semibold text-slate-600 mt-0.5 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Floating mini chart preview */}
            <div className="mt-5 glass-card rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent rounded-t-2xl" />
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[2px] mb-3">Live System Pulse</p>
              <div className="flex items-end gap-1 h-10">
                {[30, 55, 40, 70, 45, 85, 60, 75, 50, 90, 65, 80, 55, 70, 95, 72].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm opacity-80 transition-all"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, #6366f1, #06b6d4)`,
                      opacity: 0.4 + (i / 16) * 0.6
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-slate-600">CPU load — live</span>
                <div className="flex items-center gap-1"><div className="live-dot" /><span className="text-[9px] text-emerald-400 font-bold">Healthy</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ─────────────────────────────────────────── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { setShowForgot(false); setForgotResult(null) }} />
          <div className="relative w-full max-w-sm glass-card rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <KeyRound size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-100">Reset Password</p>
                    <p className="text-[10px] text-slate-600">Enter your username to get a token</p>
                  </div>
                </div>
                <button onClick={() => { setShowForgot(false); setForgotResult(null) }} className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-600 hover:text-white transition-colors">
                  <X size={13} />
                </button>
              </div>

              {!forgotResult ? (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <input
                    type="text" value={forgotUsername}
                    onChange={e => setForgotUsername(e.target.value)}
                    placeholder="Your username"
                    className="input-light w-full px-4 py-2.5 text-sm"
                    required
                  />
                  <button
                    type="submit" disabled={forgotLoading || !forgotUsername.trim()}
                    className="w-full py-2.5 rounded-xl text-sm font-bold btn-primary disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Get Reset Token'}
                  </button>
                </form>
              ) : !showReset ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                    <p className="text-[10px] font-bold text-indigo-400 mb-1.5">Demo Token (no email configured):</p>
                    {forgotResult.token ? (
                      <code className="text-[9px] text-slate-400 break-all font-mono bg-black/30 px-2 py-1 rounded-lg border border-white/[0.06] block">{forgotResult.token}</code>
                    ) : (
                      <p className="text-xs text-slate-500">{forgotResult.message}</p>
                    )}
                  </div>
                  {forgotResult.token && (
                    <button onClick={() => setShowReset(true)} className="w-full py-2.5 rounded-xl text-sm font-bold btn-primary">
                      Set New Password →
                    </button>
                  )}
                </div>
              ) : resetSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-black text-slate-100">Password Updated!</p>
                  <p className="text-xs text-slate-600 mt-1">Redirecting to login...</p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[2px] block mb-1.5">Reset Token</label>
                    <input type="text" value={resetToken} onChange={e => setResetToken(e.target.value)} className="input-light w-full px-4 py-2.5 text-xs font-mono" placeholder="Paste token" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-[2px] block mb-1.5">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-light w-full px-4 py-2.5 text-sm" placeholder="Min 6 characters" />
                  </div>
                  {forgotResult?.message && <p className="text-xs text-rose-400">{forgotResult.message}</p>}
                  <button type="submit" disabled={resetLoading || !resetToken || !newPassword} className="w-full py-2.5 rounded-xl text-sm font-bold btn-primary disabled:opacity-50">
                    {resetLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

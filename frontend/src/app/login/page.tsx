"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cloud, Lock, User, Key, Eye, EyeOff, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

const API_BASE = "http://127.0.0.1:8000/api/v1"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('stratis_token')
    if (token) {
      router.push('/')
    }
  }, [router])

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (res.ok && data.access_token) {
        localStorage.setItem('stratis_token', data.access_token)
        localStorage.setItem('stratis_user', JSON.stringify(data.user || { username }))
        router.push('/')
      } else {
        setError(data.detail || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('Network error. Is the backend server running?')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setUsername('hitesh_admin')
    setPassword('demo123')
    setTimeout(() => {
        // We'll use a slightly different flow for demo if needed, 
        // but for now, just trigger real login with these creds
        const submitBtn = document.getElementById('login-btn')
        submitBtn?.click()
    }, 100)
  }

  return (
    <div className="flex min-h-screen bg-[#010409] text-slate-200 font-sans overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/[0.03] rounded-full blur-[180px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/[0.02] rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-600/30 ring-1 ring-white/20">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">StratisIO</h1>
            <p className="text-[10px] uppercase tracking-[4px] font-black text-slate-500 -mt-1">Enterprise Orchestrator</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md glass-card rounded-[40px] border border-white/10 p-10 shadow-3xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-700 delay-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">Welcome Back</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">Login to manage your cloud infrastructure.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 animate-in fade-in slide-in-from-top-2">
                <ShieldCheck size={18} />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username / Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium"
                  placeholder="admin_hitesh"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Key size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-600 focus:ring-offset-0" />
                <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-xs text-blue-500 hover:text-blue-400 font-bold transition-colors">Forgot Password?</a>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 border border-blue-400/20 mt-4 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-[2px] text-sm font-black">Authorize Session</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Or Continue With</span>
                <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={async () => {
                    setError("");
                    try {
                      const res = await fetch(`${API_BASE}/auth/google`);
                      const data = await res.json();
                      if (data.url) {
                        setError(`Social Auth Redirect: ${data.url}`);
                        // In a real app: window.location.href = data.url;
                      }
                    } catch (e) {
                      setError("Google service temporarily unavailable.");
                    }
                  }}
                  className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] py-3.5 rounded-2xl transition-all group"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" alt="Google" />
                    <span className="text-xs font-bold text-slate-300">Google</span>
                </button>
                <button 
                  onClick={async () => {
                    setError("");
                    try {
                      const res = await fetch(`${API_BASE}/auth/github`);
                      const data = await res.json();
                      if (data.url) {
                        setError(`Social Auth Redirect: ${data.url}`);
                        // In a real app: window.location.href = data.url;
                      }
                    } catch (e) {
                      setError("GitHub service temporarily unavailable.");
                    }
                  }}
                  className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] py-3.5 rounded-2xl transition-all group"
                >
                    <svg className="w-5 h-5 fill-slate-300 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12"/></svg>
                    <span className="text-xs font-bold text-slate-300">GitHub</span>
                </button>
            </div>
          </div>

          {/* Quick Access / Demo */}
          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-[3px] mb-6">Quick Access</p>
            <button
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                  <Zap size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-white uppercase tracking-wider leading-none mb-1">Demo Mode</p>
                  <p className="text-[10px] font-bold text-slate-500">Fast-track to Dashboard</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <p className="mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-[4px]">
          Secured by StratisIO Cryptography Engine
        </p>
      </div>

      {/* Side Visual Panel */}
      <div className="hidden lg:flex flex-1 bg-white/[0.01] items-center justify-center p-12 relative border-l border-white/5">
         <div className="max-w-md text-center">
            <div className="relative inline-block mb-12 animate-pulse transition-all duration-1000">
                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full scale-150" />
                <Lock size={120} className="text-blue-500 relative z-10" />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-wider leading-tight">Zero-Trust Infrastructure</h3>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Every resource request is cryptographically signed and verified in real-time. Experience the most secure cloud orchestration platform ever built.
            </p>
         </div>
         {/* Abstract Matrix Lines Background */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
    </div>
  )
}

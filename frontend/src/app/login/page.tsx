"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, ChevronRight, Cloud } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: 'hitesh123@gmail.com',
    password: 'admin123',
    username: 'Hitesh'
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register'

      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: isLogin ? formData.email : formData.username,
          password: formData.password,
          email: formData.email
        })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token || 'demo-token')
        localStorage.setItem('user', JSON.stringify({
          username: isLogin ? formData.email : formData.username,
          email: formData.email,
          status: 'VERIFIED ENTERPRISE'
        }))

        router.push('/')
      } else {
        alert('Authentication failed')
      }
    } catch (err) {
      console.error('Auth error:', err)
      alert('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f1629] to-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/[0.08] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/[0.06] rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 mb-6 shadow-2xl">
            <Cloud className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">StratisIO</h1>
          <p className="text-slate-400 text-sm font-medium">Enterprise Cloud Orchestration Platform</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-[32px] p-8 border border-white/10 backdrop-blur-xl shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${isLogin
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${!isLogin
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Hitesh Kumar"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  placeholder="hitesh123@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-xs uppercase tracking-[2px] rounded-xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-2">Demo Credentials</p>
            <p className="text-xs text-slate-300">Email: <span className="text-blue-400">hitesh123@gmail.com</span></p>
            <p className="text-xs text-slate-300">Password: <span className="text-blue-400">admin123</span></p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8 font-medium">
          StratisIO v2.0 Core | {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

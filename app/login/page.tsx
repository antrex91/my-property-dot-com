'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { alert('Please enter your email and password'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const userId = data.user?.id
      if (!userId) throw new Error('No user found')
      alert('Welcome back! 💜')
      router.push(`/my-office/${userId}`)
    } catch (err: any) {
      alert('Login failed: ' + err.message)
    }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) { alert('Please enter your email first, then tap Forgot Password'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) alert('Error: ' + error.message)
    else alert('Password reset link sent to your email 💜 Check your inbox')
  }

  const inputGlass = "w-full h-[52px] bg-white/60 backdrop-blur-md border border-white/70 rounded-full px-5 pr-12 outline-none placeholder:text-purple-900/50 text-purple-950 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:bg-white/80 focus:border-white focus:ring-2 focus:ring-purple-300 transition"
  const labelGlass = "text-[11px] tracking-[0.25em] font-black text-purple-800/70 ml-2"

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F5F0FF] via-[#D8B4FE] to-[#A78BFA] p-5 flex items-center justify-center">
      <div className="absolute -top-20 -left-20 w-[280px] h-[280px] rounded-full bg-white/30 blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-[320px] h-[320px] rounded-full bg-[#C4B5FD]/60 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 w-[260px] h-[260px] rounded-full bg-white/40 blur-3xl" />

      <div className="relative w-full max-w-[460px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(139,92,246,0.25)] rounded-[32px] p-6 sm:p-8">
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />

        <h1 className="text-[28px] font-black text-center text-purple-950 drop-shadow-sm">Welcome Back 💜</h1>
        <p className="text-center text-purple-900/70 text-sm mt-1">Login to your office</p>

        <div className="mt-6 space-y-4">
          <div>
            <p className={labelGlass}>EMAIL</p>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full h-[52px] bg-white/60 backdrop-blur-md border border-white/70 rounded-full px-5 outline-none placeholder:text-purple-900/50 text-purple-950 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:bg-white/80 focus:ring-2 focus:ring-purple-300 transition mt-1" />
          </div>

          <div>
            <p className={labelGlass}>PASSWORD</p>
            <div className="relative mt-1">
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Password" className={inputGlass} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleForgot} className="text-[13px] font-bold text-purple-800 hover:underline">Forgot Password?</button>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading} className="w-full bg-white/90 backdrop-blur-md text-purple-700 h-[54px] rounded-full font-black mt-4 shadow-[0_10px_30px_rgba(139,92,246,0.3)] border border-white hover:bg-white active:scale-[0.98] transition disabled:opacity-60">
          {loading ? 'Logging in...' : 'Login to My Office 💜'}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-[1px] bg-white/70" />
          <p className="text-[11px] tracking-[0.2em] font-bold text-purple-900/60">OR</p>
          <div className="flex-1 h-[1px] bg-white/70" />
        </div>

        <p className="text-center text-sm text-purple-900/80">
          Don't have an office yet?{' '}
          <button onClick={() => router.push('/signup')} className="font-black text-purple-800 underline">Create One</button>
        </p>

        <button onClick={() => router.push('/')} className="w-full text-center text-[13px] font-bold text-purple-900/60 mt-4 hover:underline">
          ← Back to Browse Properties
        </button>
      </div>
    </div>
  )
}
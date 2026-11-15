'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  // Check if the reset link is valid
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else setReady(true) // Still show form, Supabase will validate on update
    })
  }, [])

  const handleReset = async () => {
    if (!password || !confirmPassword) { alert('Please enter your new password twice'); return }
    if (password !== confirmPassword) { alert('Passwords do not match! Check again 💜'); return }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      alert('Password changed successfully! 💜 Please login with your new password')
      router.push('/login')
    } catch (err: any) {
      alert('Error: ' + err.message + '. Please request a new reset link from the Login page.')
    }
    setLoading(false)
  }

  const inputGlass = "w-full h-[52px] bg-white/60 backdrop-blur-md border border-white/70 rounded-full px-5 pr-12 outline-none placeholder:text-purple-900/50 text-purple-950 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:bg-white/80 focus:border-white focus:ring-2 focus:ring-purple-300 transition"
  const labelGlass = "text-[11px] tracking-[0.25em] font-black text-purple-800/70 ml-2"
  const passMatch = confirmPassword.length > 0 ? (password === confirmPassword ? 'text-green-600' : 'text-red-500') : 'text-purple-900/60'

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F5F0FF] via-[#D8B4FE] to-[#A78BFA] p-5 flex items-center justify-center">
      <div className="absolute -top-20 -left-20 w-[280px] h-[280px] rounded-full bg-white/30 blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-[320px] h-[320px] rounded-full bg-[#C4B5FD]/60 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 w-[260px] h-[260px] rounded-full bg-white/40 blur-3xl" />

      <div className="relative w-full max-w-[460px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(139,92,246,0.25)] rounded-[32px] p-6 sm:p-8">
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="text-center text-4xl">🔐</div>
        <h1 className="text-[28px] font-black text-center text-purple-950 drop-shadow-sm mt-2">Reset Password 💜</h1>
        <p className="text-center text-purple-900/70 text-sm mt-1">Create a new password for your office</p>

        <div className="mt-6 space-y-4">
          <div>
            <p className={labelGlass}>NEW PASSWORD</p>
            <div className="relative mt-1">
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="New Password" className={inputGlass} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div>
            <p className={labelGlass}>CONFIRM NEW PASSWORD</p>
            <div className="relative mt-1">
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirm ? 'text' : 'password'} placeholder="Confirm New Password" className={inputGlass} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">{showConfirm ? '🙈' : '👁️'}</button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-xs font-bold mt-1 ml-2 ${passMatch}`}>
                {password === confirmPassword ? '✅ Passwords match!' : '❌ Passwords do not match'}
              </p>
            )}
          </div>
        </div>

        <button onClick={handleReset} disabled={loading} className="w-full bg-white/90 backdrop-blur-md text-purple-700 h-[54px] rounded-full font-black mt-5 shadow-[0_10px_30px_rgba(139,92,246,0.3)] border border-white hover:bg-white active:scale-[0.98] transition disabled:opacity-60">
          {loading ? 'Saving...' : 'Save New Password 💜'}
        </button>

        <button onClick={() => router.push('/login')} className="w-full text-center text-[13px] font-bold text-purple-900/60 mt-4 hover:underline">
          ← Back to Login
        </button>

        <p className="text-center text-[11px] text-purple-900/60 mt-3">If this link has expired, go back to Login and tap Forgot Password again to get a new link.</p>
      </div>
    </div>
  )
}
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [phone, setPhone] = useState('')
  const [whyDeal, setWhyDeal] = useState('')
  const [preview, setPreview] = useState('')
  const [pictureFile, setPictureFile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showWhyPopup, setShowWhyPopup] = useState(false)
  const fileRef = useRef<any>(null)

  // Same compressor
  const compressImage = (file: any): Promise<any> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e: any) => {
        const img = new Image()
        img.src = e.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxSize = 800
          let width = img.width, height = img.height
          if (width > height) { if (width > maxSize) { height = height * maxSize / width; width = maxSize } }
          else { if (height > maxSize) { width = width * maxSize / height; height = maxSize } }
          canvas.width = width; canvas.height = height
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7)
        }
      }
    })
  }

  const pickPicture = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPictureFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) { alert('Fill name, email, password and confirm password'); return }
    if (password !== confirmPassword) { alert('Passwords do not match! Check again 💜'); return }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      const userId = authData.user?.id
      if (!userId) throw new Error('No user id')

      let avatarUrl = ''
      if (pictureFile) {
        const compressed = await compressImage(pictureFile)
        const fileName = `${userId}-${Date.now()}.jpg`
        const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, compressed)
        if (!upErr) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
          avatarUrl = data.publicUrl
        }
      }

      const { error: dbError } = await supabase.from('agent_profiles').insert([{
        id: userId,
        name, phone,
        why_deal: whyDeal,
        avatar_url: avatarUrl,
      }])
      if (dbError) throw dbError

      alert('Sign Up successful! 💜 Welcome ' + name)
      router.push(`/my-office/${userId}`)
    } catch (err: any) {
      alert('Error: ' + err.message)
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

      <div className="relative w-full max-w-[500px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(139,92,246,0.25)] rounded-[32px] p-6 sm:p-8">
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />

        <h1 className="text-[28px] font-black text-center text-purple-950 drop-shadow-sm">Create My Office 💜</h1>
        <p className="text-center text-purple-900/70 text-sm mt-1">Sign up as an agent</p>

        <div className="flex justify-center mt-6">
          <button onClick={() => fileRef.current?.click()} className="relative group">
            {preview ? (
              <img src={preview} className="w-[110px] h-[110px] rounded-full object-cover border-4 border-white/80 shadow-lg" alt="" />
            ) : (
              <div className="w-[110px] h-[110px] rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center text-4xl border-2 border-dashed border-white shadow-inner">📷</div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-sm w-[32px] h-[32px] rounded-full flex items-center justify-center border-2 border-white shadow-lg group-active:scale-90 transition">+</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickPicture} className="hidden" />
        </div>
        <p className="text-center text-xs text-purple-900/70 mt-2 font-medium">Tap to add your picture</p>

        <div className="mt-5 space-y-3">
          <div>
            <p className={labelGlass}>FULL NAME</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full h-[52px] bg-white/60 backdrop-blur-md border border-white/70 rounded-full px-5 outline-none placeholder:text-purple-900/50 text-purple-950 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:bg-white/80 focus:ring-2 focus:ring-purple-300 transition mt-1" />
          </div>
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

          <div>
            <p className={labelGlass}>CONFIRM PASSWORD</p>
            <div className="relative mt-1">
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" className={inputGlass} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">{showConfirm ? '🙈' : '👁️'}</button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-xs font-bold mt-1 ml-2 ${passMatch}`}>
                {password === confirmPassword ? '✅ Passwords match!' : '❌ Passwords do not match'}
              </p>
            )}
          </div>

          <div>
            <p className={labelGlass}>PHONE</p>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone e.g 0803..." className="w-full h-[52px] bg-white/60 backdrop-blur-md border border-white/70 rounded-full px-5 outline-none placeholder:text-purple-900/50 text-purple-950 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:bg-white/80 focus:ring-2 focus:ring-purple-300 transition mt-1" />
          </div>

          <div>
            <p className={labelGlass}>WHY DEAL WITH YOU?</p>
            <textarea
              value={whyDeal}
              onChange={e => setWhyDeal(e.target.value)}
              onFocus={() => setShowWhyPopup(true)}
              placeholder="Why should people deal with you? Tap to read first..."
              className="w-full h-[88px] bg-white/60 backdrop-blur-md border border-white/70 rounded-[24px] p-4 mt-1 outline-none placeholder:text-purple-900/50 text-purple-950 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:bg-white/80 focus:ring-2 focus:ring-purple-300 transition"
            />
            <p className="text-[11px] text-purple-900/60 ml-2 mt-1">Tap the box to read an important note before you write 💜</p>
          </div>
        </div>

        <button onClick={handleSignup} disabled={loading} className="w-full bg-white/90 backdrop-blur-md text-purple-700 h-[54px] rounded-full font-black mt-5 shadow-[0_10px_30px_rgba(139,92,246,0.3)] border border-white hover:bg-white active:scale-[0.98] transition disabled:opacity-60">
          {loading ? 'Creating...' : 'Create My Office 💜'}
        </button>
        <p className="text-center text-[11px] text-purple-900/60 mt-3">Your picture is compressed automatically, so it uploads fast 💜</p>
      </div>

      {/* WHY DEAL POPUP - 3 LINES */}
      {showWhyPopup && (
        <div className="fixed inset-0 z-50 bg-purple-950/50 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setShowWhyPopup(false)}>
          <div className="w-full max-w-[420px] bg-white/90 backdrop-blur-xl border border-white rounded-[28px] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center text-4xl">⭐</div>
            <h2 className="text-xl font-black text-center text-purple-950 mt-2">Before You Write...</h2>
            <p className="text-center text-purple-900/80 text-sm leading-relaxed mt-3">
              Treat every client well. Be honest, be kind, and keep your promises.
            </p>
            <p className="text-center text-purple-900/80 text-sm leading-relaxed mt-3">
              Your review will determine whether people will patronise you easily or not.
            </p>
            <p className="text-center text-purple-900/80 text-sm leading-relaxed mt-3">
              One good review can bring you many clients. One bad review can chase them away. So write what you will truly do — and then live it. 💜
            </p>
            <button onClick={() => setShowWhyPopup(false)} className="w-full bg-purple-600 text-white h-[50px] rounded-full font-black mt-5 active:scale-[0.98] transition">
              I Understand, Let Me Write ✨
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
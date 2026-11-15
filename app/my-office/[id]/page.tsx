'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function MyOfficePage() {
  const params = useParams()
  const agentId = params.id as string
  const [loading, setLoading] = useState(true)
  const [agent, setAgent] = useState<any>(null)
  const [props, setProps] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [name, setName] = useState('')
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<any>(null)

  useEffect(() => {
    const load = async () => {
      if (!agentId) return
      let profile: any = null
      try {
        const { data } = await supabase.from('agent_profiles').select('*').eq('id', agentId).single()
        if (data) profile = data
      } catch {}
      let properties: any[] = []
      try {
        const { data } = await supabase.from('properties').select('*').eq('user_id', agentId).order('id', { ascending: false })
        if (data) properties = data
      } catch {}
      if (properties.length === 0) {
        try {
          const { data } = await supabase.from('properties').select('*').eq('agent_id', agentId)
          if (data) properties = data
        } catch {}
      }
      let allRatings: any[] = []
      try {
        const { data } = await supabase.from('agent_ratings').select('*').eq('agent_id', agentId).order('created_at', { ascending: false })
        if (data) allRatings = data
      } catch {}
      const firstProp = properties[0]
      setAgent({
        name: profile?.name || firstProp?.agent_name || 'Agent',
        location: profile?.location || firstProp?.location || firstProp?.city || 'Nigeria',
        whyDeal: profile?.why_deal || firstProp?.why_deal || 'I show you real documents before you pay. No pressure, no rush. Visit the property and verify before you pay.',
        avatar: profile?.avatar_url || '',
        phone: profile?.phone || firstProp?.phone || '',
        whatsapp: profile?.whatsapp || firstProp?.whatsapp || '',
      })
      setProps(properties)
      setRatings(allRatings)
      setLoading(false)
    }
    load()
  }, [agentId])

  // --- COMPRESSOR - shrinks big photos before upload ---
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX = 800
          let w = img.width
          let h = img.height
          if (w > MAX) {
            h = (h * MAX) / w
            w = MAX
          }
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas failed'))
          ctx.drawImage(img, 0, 0, w, h)
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Compress failed'))
          }, 'image/jpeg', 0.7)
        }
        img.onerror = () => reject(new Error('Image load failed'))
      }
      reader.onerror = () => reject(new Error('File read failed'))
    })
  }

  // --- FACEBOOK STYLE CHANGE PICTURE + COMPRESSOR ---
  const changePicture = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // 1. Compress first - makes it small and fast
      const compressed = await compressImage(file)
      const fileName = `${agentId}-${Date.now()}.jpg`
      // 2. Upload compressed version to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, compressed, { contentType: 'image/jpeg', upsert: true })
      if (uploadError) throw uploadError
      // 3. Get public link
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const publicUrl = urlData.publicUrl
      // 4. Save link to database
      const { error: dbError } = await supabase.from('agent_profiles').update({ avatar_url: publicUrl }).eq('id', agentId)
      if (dbError) throw dbError
      // 5. Show it immediately
      setAgent((prev: any) => ({ ...prev, avatar: publicUrl }))
      alert('Profile picture changed 💜')
    } catch (err: any) {
      alert('Error changing picture: ' + err.message + ' - Have you created the avatars bucket in Supabase Storage?')
    }
    setUploading(false)
    if (e.target) e.target.value = ''
  }

  const submitRating = async () => {
    if (!name || !comment) { alert('Please enter your name and comment'); return }
    setSending(true)
    const { error } = await supabase.from('agent_ratings').insert([{ agent_id: agentId, name, stars, comment }])
    setSending(false)
    if (error) { alert('Error: ' + error.message); return }
    alert('Thank you! Your rating was added 💜')
    setName(''); setComment(''); setStars(5)
    const { data } = await supabase.from('agent_ratings').select('*').eq('agent_id', agentId).order('created_at', { ascending: false })
    if (data) setRatings(data)
  }

  if (loading) {
    return <div className="min-h-screen bg-[#F5F0FF] flex items-center justify-center">Loading My Beautiful Office... 💜</div>
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#F5F0FF] flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-2xl font-black">Agent not found</p>
          <p className="text-gray-500 text-sm mt-2">Check your Agent ID - copy it from Supabase agent_profiles table</p>
          <Link href="/" className="text-purple-500 underline text-sm">Back to Home</Link>
        </div>
      </div>
    )
  }

  const avgStars = ratings.length > 0 ? (ratings.reduce((s: number, r: any) => s + (r.stars || 5), 0) / ratings.length).toFixed(1) : 'New'

  return (
    <div className="min-h-screen bg-[#F5F0FF] text-black">
      <div className="bg-gradient-to-r from-[#D8B4FE] via-[#C4B5FD] to-[#A78BFA] text-white p-6 pb-10 rounded-b-[40px]">
        <div className="max-w-[700px] mx-auto">
          <Link href="/" className="text-white/80 text-sm">← Back to Home</Link>
          <div className="flex items-center gap-4 mt-6">
            <div className="relative">
              <button onClick={() => fileRef.current?.click()} className="block">
                {agent.avatar ? (
                  <img src={agent.avatar} className="w-[90px] h-[90px] rounded-full object-cover border-4 border-white shadow-lg" alt="" />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center text-4xl shadow-lg">💜</div>
                )}
              </button>
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 bg-white text-black text-xs font-bold w-[28px] h-[28px] rounded-full shadow flex items-center justify-center border">
                📷
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={changePicture} className="hidden" />
            </div>
            <div>
              <h1 className="text-2xl font-black">{agent.name} 💜</h1>
              <p className="text-white/90 text-sm">📍 {agent.location}</p>
              <p className="bg-white text-purple-600 text-xs font-bold px-3 py-1 rounded-full inline-block mt-2">⭐ {avgStars} / 5 • {ratings.length} Ratings • 🏠 {props.length} Properties</p>
              <p className="text-white/90 text-xs mt-2">{uploading ? 'Compressing & Uploading picture...' : 'Tap picture to change it 📷'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[700px] mx-auto p-5 -mt-4">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-purple-200">
          <p className="text-[11px] tracking-[0.3em] text-purple-500 font-black">💜 WHY YOU SHOULD DEAL WITH ME</p>
          <p className="mt-3 leading-relaxed text-[15px]">{agent.whyDeal}</p>
        </div>

        <Link href={`/chatprogress/${agentId}`} className="block text-center bg-black text-white h-[52px] leading-[52px] rounded-full font-black mt-4 shadow-lg">
          🤖 Check My AI Chat Progress →
        </Link>

        {agent.phone && <a href={`tel:${agent.phone}`} className="block text-center bg-green-500 text-white h-[52px] leading-[52px] rounded-full font-black mt-3">📞 Call {agent.name}</a>}
        {agent.whatsapp && <a href={`https://wa.me/${agent.whatsapp}`} target="_blank" className="block text-center bg-[#25D366] text-white h-[52px] leading-[52px] rounded-full font-black mt-3">💬 WhatsApp Me</a>}

        <h2 className="font-black text-xl mt-8">🏠 My Properties ({props.length})</h2>
        {props.length === 0 && <p className="text-gray-500 text-sm mt-2">No properties yet.</p>}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {props.map((p: any) => (
            <Link key={p.id} href={`/property/${p.id}`} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-purple-200">
              <img src={p.image_url || p.image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'} className="w-full h-[120px] object-cover" alt="" />
              <div className="p-3">
                <p className="font-bold text-sm line-clamp-1">{p.title || p.name}</p>
                <p className="text-purple-600 font-black text-sm mt-1">₦{Number(p.price || 0).toLocaleString()}</p>
                <p className="text-gray-500 text-xs">{p.location || p.city}</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="font-black text-xl mt-8">⭐ Rate This Agent ({ratings.length})</h2>
        <div className="bg-white rounded-[24px] p-5 mt-3 border border-purple-200">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full h-[48px] border rounded-full px-4 mb-3 outline-none" />
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setStars(s)} className={`h-[44px] flex-1 rounded-full font-black ${stars >= s ? 'bg-yellow-400' : 'bg-gray-100'}`}>{s} ⭐</button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell people about this agent..." className="w-full h-[80px] border rounded-2xl p-3 outline-none" />
          <button onClick={submitRating} disabled={sending} className="w-full bg-purple-500 text-white h-[48px] rounded-full font-black mt-3">{sending ? 'Sending...' : 'Send Rating 💜'}</button>
        </div>

        {ratings.map((r: any) => (
          <div key={r.id} className="bg-white rounded-2xl p-4 mt-3 border border-purple-200">
            <p className="font-bold text-sm">{r.name} - {'⭐'.repeat(r.stars || 5)}</p>
            <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
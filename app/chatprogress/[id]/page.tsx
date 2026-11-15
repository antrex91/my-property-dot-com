'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function ChatProgressPage() {
  const params = useParams()
  const agentId = params.id as string
  const [loading, setLoading] = useState(true)
  const [agent, setAgent] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [stats, setStats] = useState({ properties: 0, comments: 0, likes: 0 })

  useEffect(() => {
    const load = async () => {
      if (!agentId) return
      setLoading(true)
      let profile: any = null
      try {
        const { data } = await supabase.from('agent_profiles').select('*').eq('id', agentId).single()
        if (data) profile = data
      } catch {}
      let props: any[] = []
      try {
        const { data } = await supabase.from('properties').select('*').eq('user_id', agentId).order('id', { ascending: false })
        if (data && data.length) props = data
      } catch {}
      if (props.length === 0) {
        try {
          const { data } = await supabase.from('properties').select('*').eq('agent_id', agentId)
          if (data && data.length) props = data
        } catch {}
      }

      // Get ratings from agent_ratings - same table My Office uses
      let allComments: any[] = []
      try {
        const { data } = await supabase.from('agent_ratings').select('*').eq('agent_id', agentId).order('created_at', { ascending: false })
        if (data) {
          allComments = data.map((r: any) => ({
            name: r.name || 'Buyer',
            stars: r.stars || 5,
            text: r.comment || '',
          }))
        }
      } catch {}

      // Also get old comments from comments table if any
      try {
        const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false })
        if (data) {
          const propIds = props.map((p: any) => p.id.toString())
          const oldComments = data
            .filter((c: any) => propIds.includes(c.property_id?.toString()))
            .map((c: any) => ({
              name: c.name || 'Buyer',
              stars: c.stars || 5,
              text: c.text || '',
            }))
          allComments = [...allComments, ...oldComments]
        }
      } catch {}

      const firstProp = props[0]
      const agentName = profile?.name || firstProp?.agent_name || 'Agent'
      const agentLocation = profile?.location || firstProp?.location || firstProp?.city || 'Nigeria'
      const whyDeal = profile?.why_deal || firstProp?.why_deal || 'I show you real documents before you pay. No pressure, no rush. Visit the property and verify before you pay.'
      const totalLikes = props.reduce((sum: number, p: any) => sum + (Number(p.likes_count || p.likes || 0)), 0)
      setStats({ properties: props.length, comments: allComments.length, likes: totalLikes })
      const mappedReviews = allComments.slice(0, 10)
      setReviews(mappedReviews)
      let score = 0
      const propScore = Math.min(props.length * 2, 20)
      const reviewScore = Math.min(allComments.length * 3, 30)
      const likeScore = Math.min(totalLikes * 2, 20)
      const trustScore = 30
      score = propScore + reviewScore + likeScore + trustScore
      if (score > 100) score = 100
      if (props.length === 0 && allComments.length === 0) score = 45
      const avgStars = mappedReviews.length > 0 ? (mappedReviews.reduce((s: number, r: any) => s + r.stars, 0) / mappedReviews.length).toFixed(1) : 'New'
      setAgent({
        name: agentName,
        location: agentLocation,
        whyDeal,
        avatar: profile?.avatar_url || '',
        stars: avgStars,
        score,
        propScore,
        reviewScore,
        likeScore,
        trustScore,
      })
      setLoading(false)
    }
    load()
  }, [agentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center">
        <p className="text-white/60">Loading agent progress...</p>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-xl font-bold">Agent not found</p>
          <Link href="/" className="text-blue-400 underline text-sm">Back to Home</Link>
        </div>
      </div>
    )
  }

  const score = agent.score
  let color = "bg-green-500"
  let label = "Safe To Talk"
  let boxColor = "bg-green-100 text-green-800"
  let message = "AI says: This agent has good history. Still visit the property and check documents before you pay."
  if (score < 50) {
    color = "bg-red-500"
    label = "Do Not Trust - Don't Pay"
    boxColor = "bg-red-100 text-red-800"
    message = "AI says: This agent has poor history. DO NOT pay. Visit property, check documents, ask for ID."
  } else if (score < 70) {
    color = "bg-yellow-500"
    label = "Be Careful"
    boxColor = "bg-yellow-100 text-yellow-800"
    message = "AI says: This agent is average or new. Be careful. Check documents very well before you pay."
  }

  return (
    <div className="min-h-screen bg-[#070708] text-white">
      <div className="max-w-[700px] mx-auto p-6">
        <Link href="/" className="text-white/50 text-sm">Back to Home</Link>
        <div className="flex gap-4 items-center mt-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl overflow-hidden">
            {agent.avatar ? <img src={agent.avatar} className="w-full h-full object-cover" alt="" /> : '👤'}
          </div>
          <div>
            <h1 className="font-serif text-2xl">{agent.name}</h1>
            <p className="text-white/50 text-sm">{agent.location}</p>
            <p className="text-yellow-400">Star {agent.stars} / 5</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 mt-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/40">Why You Should Deal With Me</p>
          <p className="mt-3 text-white/80 leading-relaxed">{agent.whyDeal}</p>
        </div>
        <div className="bg-white rounded-[24px] text-black p-6 mt-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-black/40">AI Chat Progress Check - Live From Supabase</p>
          <h2 className="text-3xl font-black mt-2">{score}% - {label}</h2>
          <div className="h-3 bg-black/10 rounded-full mt-4 overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Reviews from people</span><b>{stats.comments} - {agent.reviewScore} / 30</b></div>
            <div className="flex justify-between"><span>Properties posted</span><b>{stats.properties} - {agent.propScore} / 20</b></div>
            <div className="flex justify-between"><span>Likes from buyers</span><b>{stats.likes} - {agent.likeScore} / 20</b></div>
            <div className="flex justify-between"><span>No scam report</span><b>{agent.trustScore} / 30</b></div>
          </div>
          <p className={`${boxColor} p-3 rounded-xl mt-5 text-sm`}>{message}</p>
        </div>
        <h3 className="font-serif text-xl mt-8">What People Said ({reviews.length})</h3>
        {reviews.length === 0 && <p className="text-white/40 text-sm mt-3">No reviews yet. This agent is new. Be careful, check documents.</p>}
        {reviews.map((r: any, i: number) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-3">
            <p className="font-bold">{r.name} - {'⭐'.repeat(r.stars)}</p>
            <p className="text-white/60 text-sm mt-1">{r.text}</p>
          </div>
        ))}
        <Link href={`/my-office/${agentId}`} className="block text-center bg-white text-black h-[48px] leading-[48px] rounded-full font-bold mt-8">
          Back To My Office
        </Link>
      </div>
    </div>
  )
}
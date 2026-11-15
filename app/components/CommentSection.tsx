'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { Heart, MessageCircle } from 'lucide-react'

export default function CommentSection({ propertyId, agentId }: { propertyId: string, agentId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  async function load() {
    const { data } = await supabase
      .from('comments')
      .select('*, comment_likes(count)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    setComments(data || [])
  }

  useEffect(() => { load() }, [propertyId])

  async function submit() {
    if (!text.trim()) return
    await supabase.from('comments').insert({
      property_id: propertyId,
      agent_id: agentId,
      user_name: name || 'Anonymous',
      content: text
    })
    setText('')
    load()
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18}/> Comments ({comments.length})</h3>

      <div className="flex gap-2 mt-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm w-32" />
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment about this agent..." className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm" />
        <button onClick={submit} className="bg-[#B8914A] px-5 py-2 rounded-full text-sm font-bold">Post</button>
      </div>

      <div className="mt-5 space-y-4">
        {comments.map(c => (
          <div key={c.id} className="bg-white/5 p-4 rounded-2xl">
            <p className="text-sm font-bold">{c.user_name} <span className="text-white/30 font-normal text-xs">{new Date(c.created_at).toLocaleDateString()}</span></p>
            <p className="text-sm text-white/70 mt-1">{c.content}</p>
            <p className="text-xs text-white/40 mt-2 flex items-center gap-1"><Heart size={12}/> {c.comment_likes?.[0]?.count || 0} likes</p>
          </div>
        ))}
      </div>
    </div>
  )
}
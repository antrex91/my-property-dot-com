'use client'
import { useState } from 'react'

type PropertyProps = {
  id: number;
  title: string;
  location: string;
  price: string;
  images: string[]; // KEY: This accepts unlimited images
  video?: string;
  type: "card" | "video";
  beds: number;
  baths: number;
  sqft: string;
  agentName: string;
  agentId: string;
  agentImage?: string;
  whatsapp: string;
  lat: number;
  lng: number;
  featured?: boolean;
  sold?: boolean;
  initialLikes?: number;
}

export default function PropertyCard({ 
  id, title, location, price, images = [], video, type, beds, baths, sqft, 
  agentName, agentId, agentImage, whatsapp, lat, lng, featured, sold, initialLikes = 0 
}: PropertyProps) {
  
  const [currentImg, setCurrentImg] = useState(0)
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollow = () => setIsFollowing(!isFollowing)
  const handleLike = () => { setIsLiked(!isLiked); setLikes(isLiked ? likes - 1 : likes + 1) }
  const openWhatsApp = () => window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello, I'm interested in: ${title}`)}`, '_blank')
  const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`

  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border-2 transition ${isFollowing ? 'border-blue-500' : 'border-gray-100'}`}>
      
      {/* AGENT HEADER */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {agentImage ? 
            <img src={agentImage} alt={agentName} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" /> :
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">{agentName.charAt(0)}</div>
          }
          <div>
            <p className="font-bold text-gray-900">{agentName}</p>
            <p className="text-xs text-gray-500">✓ Verified Agent</p>
          </div>
        </div>
        <button onClick={handleFollow} className={`px-4 py-2 rounded-full font-bold text-sm ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'}`}>
          {isFollowing ? 'Following' : '+ Follow'}
        </button>
      </div>

      {featured && <div className="px-4"><span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full">FEATURED</span></div>}

      {/* AUTO IMAGE SLIDER - WORKS WITH 1 OR 20 IMAGES */}
      <div className="relative mt-2">
        {type === "card" && images.length > 0 && (
          <div className="relative w-full h-80 bg-gray-200">
            {images.map((img, i) => (
              <img key={i} src={img} alt={`${title} ${i+1}`} className={`absolute w-full h-full object-cover transition-opacity duration-500 ${i === currentImg ? 'opacity-100' : 'opacity-0'}`} />
            ))}
            
            {/* AUTO DOTS - CREATED BASED ON IMAGE COUNT */}
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImg(currentImg === 0 ? images.length - 1 : currentImg - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full">‹</button>
                <button onClick={() => setCurrentImg((currentImg + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full">›</button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => <button key={i} onClick={() => setCurrentImg(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? 'bg-white w-6' : 'bg-white/60'}`} />)}
                </div>
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{currentImg + 1} / {images.length}</div>
              </>
            )}
          </div>
        )}
        
        {type === "video" && video && <video src={video} controls className="w-full h-80 object-cover bg-black" />}
        {sold && <div className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1.5 rounded-full font-extrabold text-xs">SOLD OUT</div>}
      </div>

      {/* DETAILS */}
      <div className="p-5">
        <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
        <p className="text-gray-600 text-sm mt-1">📍 {location}</p>
        <p className="text-4xl font-extrabold text-green-600 mt-2">{price}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="bg-gray-100 px-3 py-1.5 rounded-full text-sm font-semibold">🛏️ {beds} Beds</span>
          <span className="bg-gray-100 px-3 py-1.5 rounded-full text-sm font-semibold">🛁 {baths} Baths</span>
          <span className="bg-gray-100 px-3 py-1.5 rounded-full text-sm font-semibold">📐 {sqft} sqft</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <a href={googleMapsLink} target="_blank" className="bg-blue-600 text-white px-4 py-3 rounded-2xl font-bold text-sm text-center">📍 Directions</a>
          <button onClick={openWhatsApp} className="bg-green-600 text-white px-4 py-3 rounded-2xl font-bold text-sm">💬 WhatsApp</button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="border-t px-5 py-3">
        <button onClick={handleLike} className={`font-bold ${isLiked ? 'text-red-500' : 'text-gray-700'}`}>{isLiked ? '❤️' : '🤍'} {likes}</button>
      </div>
    </div>
  )
}
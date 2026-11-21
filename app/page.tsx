"use client";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Link from "next/link";
import FeedbackButton from "./components/FeedbackButton";
import AcquisitionContact from "./components/AcquisitionContact";

const SITE_URL = "https://mypropertydot.com";
const NIGERIA_STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
const STATE_COORDS: any = {
  "Abia": {lat:5.4527, lon:7.5248}, "Adamawa": {lat:9.3265, lon:12.3984}, "Akwa Ibom": {lat:4.9057, lon:7.8537}, "Anambra": {lat:6.2209, lon:7.0821},
  "Bauchi": {lat:10.3104, lon:9.8439}, "Bayelsa": {lat:4.7719, lon:6.0699}, "Benue": {lat:7.3369, lon:8.7404}, "Borno": {lat:11.8846, lon:13.1519},
  "Cross River": {lat:5.8702, lon:8.5988}, "Delta": {lat:5.6807, lon:5.9147}, "Ebonyi": {lat:6.3249, lon:8.1137}, "Edo": {lat:6.3405, lon:5.6200},
  "Ekiti": {lat:7.7180, lon:5.3103}, "Enugu": {lat:6.4584, lon:7.5467}, "FCT - Abuja": {lat:9.0765, lon:7.3986}, "Abuja": {lat:9.0765, lon:7.3986},
  "Gombe": {lat:10.2897, lon:11.1673}, "Imo": {lat:5.5720, lon:7.0588}, "Jigawa": {lat:11.8298, lon:9.3222}, "Kaduna": {lat:10.5105, lon:7.4165},
  "Kano": {lat:12.0022, lon:8.5920}, "Katsina": {lat:12.9908, lon:7.6018}, "Kebbi": {lat:12.4504, lon:4.1990}, "Kogi": {lat:7.8003, lon:6.7405},
  "Kwara": {lat:8.9669, lon:4.3874}, "Lagos": {lat:6.5244, lon:3.3792}, "Nasarawa": {lat:8.4998, lon:8.1997}, "Niger": {lat:9.9309, lon:5.5983},
  "Ogun": {lat:7.1608, lon:3.3483}, "Ondo": {lat:7.2508, lon:5.2103}, "Osun": {lat:7.5629, lon:4.5199}, "Oyo": {lat:8.1574, lon:3.6149},
  "Plateau": {lat:9.2182, lon:9.5179}, "Rivers": {lat:4.8156, lon:7.0498}, "Sokoto": {lat:13.0533, lon:5.3223},
  "Taraba": {lat:8.8937, lon:11.3604}, "Yobe": {lat:12.2939, lon:11.4397}, "Zamfara": {lat:12.1222, lon:6.2236},
};
const ALL_WEATHER = [
  { name: "Abia", lat: 5.4527, lon: 7.5248 }, { name: "Adamawa", lat: 9.3265, lon: 12.3984 },
  { name: "Akwa Ibom", lat: 4.9057, lon: 7.8537 }, { name: "Anambra", lat: 6.2209, lon: 7.0821 },
  { name: "Bauchi", lat: 10.3104, lon: 9.8439 }, { name: "Bayelsa", lat: 4.7719, lon: 6.0699 },
  { name: "Benue", lat: 7.3369, lon: 8.7404 }, { name: "Borno", lat: 11.8846, lon:13.1519 },
  { name: "Cross River", lat: 5.8702, lon: 8.5988 }, { name: "Delta", lat: 5.6807, lon: 5.9147 },
  { name: "Ebonyi", lat: 6.3249, lon: 8.1137 }, { name: "Edo", lat: 6.3405, lon: 5.6200 },
  { name: "Ekiti", lat: 7.7180, lon: 5.3103 }, { name: "Enugu", lat: 6.4584, lon: 7.5467 },
  { name: "FCT-Abuja", lat: 9.0765, lon: 7.3986 }, { name: "Gombe", lat: 10.2897, lon: 11.1673 },
  { name: "Imo", lat: 5.5720, lon: 7.0588 }, { name: "Jigawa", lat: 11.8298, lon: 9.3222 },
  { name: "Kaduna", lat: 10.5105, lon: 7.4165 }, { name: "Kano", lat: 12.0022, lon: 8.5920 },
  { name: "Katsina", lat: 12.9908, lon: 7.6018 }, { name: "Kebbi", lat: 12.4504, lon: 4.1990 },
  { name: "Kogi", lat: 7.8003, lon: 6.7405 }, { name: "Kwara", lat: 8.9669, lon: 4.3874 },
  { name: "Lagos", lat: 6.5244, lon: 3.3792 }, { name: "Nasarawa", lat: 8.4998, lon: 8.1997 },
  { name: "Niger", lat: 9.9309, lon: 5.5983 }, { name: "Ogun", lat: 7.1608, lon: 3.3483 },
  { name: "Ondo", lat: 7.2508, lon: 5.2103 }, { name: "Osun", lat: 7.5629, lon: 4.5199 },
  { name: "Oyo", lat: 8.1574, lon: 3.6149 }, { name: "Plateau", lat: 9.2182, lon: 9.5179 },
  { name: "Rivers", lat: 4.8156, lon: 7.0498 }, { name: "Sokoto", lat: 13.0533, lon: 5.3223 },
  { name: "Taraba", lat: 8.8937, lon: 11.3604 }, { name: "Yobe", lat: 12.2939, lon: 11.4397 },
  { name: "Zamfara", lat: 12.1222, lon: 6.2236 },
];
const EMOJIS = ["👍","❤️","😍","👏","🔥","✅","💯","🏠","🤝","📍","💰","✨","🙏","👌","😊","🎉"];
const FALLBACK_IMG = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";

function getWeatherIcon(code: number){
  if(code===0) return "☀️";
  if([1,2,3].includes(code)) return "⛅";
  if([45,48].includes(code)) return "🌫️";
  if([51,53,55,61,63,65,80,81,82].includes(code)) return "🌧️";
  if([71,73,75,77,85,86].includes(code)) return "❄️";
  if([95,96,99].includes(code)) return "⛈️";
  return "☀️";
}
function AdEffectLayer({ effect }: { effect: string }) {
  if(effect === "Sun") return <div className="absolute top-2 right-2 text-[28px] animate-pulse pointer-events-none z-10">☀️</div>;
  if(effect === "Cloud") return <div className="absolute top-1 left-0 w-full text-[22px] whitespace-nowrap animate-bounce pointer-events-none z-10 overflow-hidden">☁️ ☁️ ☁️ ☁️</div>;
  if(effect === "Rain") return <div className="absolute top-0 left-0 w-full text-center text-[16px] opacity-70 pointer-events-none z-10">🌧️ 🌧️ 🌧️ 🌧️ 🌧️</div>;
  if(effect === "Grass") return <div className="absolute bottom-0 left-0 w-full text-center text-[20px] bg-green-600/20 pointer-events-none z-10">🌿🌿🌿🌿🌿🌿🌿</div>;
  if(effect === "Slides") return <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none z-10">🎞️ Slides</div>;
  return null;
}
function isAdExpired(ad:any){
  if(!ad.end_date) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(ad.end_date) < today;
}
function RightAdPanel(){
  const [ads1, setAds1] = useState<any[]>([]);
  const [ads2, setAds2] = useState<any[]>([]);
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  useEffect(()=>{
    const loadAds = async () => {
      try{
        const { data, error } = await supabase.from("ads").select("*").eq("active", true).order("created_at", {ascending:false});
        if(!error && data && data.length > 0){
          const valid = data.filter((a:any)=> !isAdExpired(a) && (a.approval_status || "Approved") === "Approved");
          const w1 = valid.filter((a:any)=> Number(a.position || 1) === 1);
          const w2 = valid.filter((a:any)=> Number(a.position || 1) === 2);
          if(w1.length === 0 && w2.length === 0){
            setAds1([valid[0]]);
            setAds2(valid.slice(1).length ? valid.slice(1) : [valid[0]]);
          } else {
            setAds1(w1.length ? w1 : [valid[0]]);
            setAds2(w2.length ? w2 : [valid[0]]);
          }
          for(const ad of valid){
            supabase.from("ads").update({ views: (ad.views || 0) + 1 }).eq("id", ad.id).then(()=>{});
          }
          return;
        }
      }catch{}
      try{
        const saved = localStorage.getItem("ceo_ads_v1") || localStorage.getItem("myproperty_ads") || localStorage.getItem("ads");
        if(saved){
          const parsed = JSON.parse(saved);
          const list = Array.isArray(parsed) ? parsed : (parsed.ads || []);
          if(list.length){
            const w1 = list.filter((a:any)=> Number(a.position || 1) === 1);
            const w2 = list.filter((a:any)=> Number(a.position || 1) === 2);
            setAds1(w1.length ? w1 : [list[0]]);
            setAds2(w2.length ? w2 : (list[1] ? [list[1]] : [list[0]]));
          }
        }
      }catch{}
    };
    loadAds();
  },[]);
  useEffect(()=>{
    if(ads1.length <= 1) return;
    const secs = Number(ads1[idx1]?.seconds || ads1[idx1]?.duration || 5);
    const t = setTimeout(()=> setIdx1((idx1+1)%ads1.length), Math.max(2, secs)*1000);
    return ()=> clearTimeout(t);
  },[ads1, idx1]);
  useEffect(()=>{
    if(ads2.length <= 1) return;
    const secs = Number(ads2[idx2]?.seconds || ads2[idx2]?.duration || 5);
    const t = setTimeout(()=> setIdx2((idx2+1)%ads2.length), Math.max(2, secs)*1000);
    return ()=> clearTimeout(t);
  },[ads2, idx2]);
  const handleAdClick = async (a:any) => {
    if(!a?.id) return;
    try{ await supabase.from("ads").update({ clicks: (a.clicks || 0) + 1 }).eq("id", a.id); }catch{}
  };
  const renderOne = (a:any, small:boolean) => {
    if(!a){
      return (
        <div className="bg-white rounded-xl overflow-hidden border shadow-sm">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800" className={`w-full object-cover ${small ? "h-[140px]" : "aspect-[4/3]"}`} alt="Advert" />
            <span className="absolute top-2 left-2 bg-white/90 text-[9px] font-black px-2 py-0.5 rounded-full">AD • SPONSORED</span>
          </div>
          <div className="bg-[#15803d] text-white p-3 text-center">
            <p className="font-black text-[15px] leading-tight">YOUR BUSINESS HERE</p>
            <p className="text-[11px] mt-1">Best Price in Abuja</p>
            {!small && <button className="mt-2 border-2 border-white rounded-full px-4 py-1 text-[12px] font-black">Call Now</button>}
          </div>
        </div>
      );
    }
    const bg = a.bgColor || a.background || a.bgcolor || "#15803d";
    const txt = a.textColor || a.text || a.textcolor || "#ffffff";
    const btnText = a.buttonText || a.buttontext || a.cta || "";
    const phone = a.phone || "";
    const link = a.link || "";
    return (
      <div className="bg-white rounded-xl overflow-hidden border shadow-sm">
        <div className="relative">
          {a.image ? <img src={a.image} className={`w-full object-cover ${small ? "h-[140px]" : "aspect-[4/3]"}`} alt="" /> : null}
          <span className="absolute top-2 left-2 bg-white/90 text-[9px] font-black px-2 py-0.5 rounded-full">AD • SPONSORED</span>
          <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full">{a.seconds || a.duration || 5}s</span>
          <AdEffectLayer effect={a.adEffect || "None"} />
        </div>
        <div className="p-3 text-center" style={{backgroundColor:bg, color:txt}}>
          <p className="font-black text-[15px] leading-tight">{a.headline || a.title || "YOUR BUSINESS HERE"}</p>
          <p className="text-[11px] mt-1">{a.subtext || a.subtitle || "Best Price in Abuja"}</p>
          {btnText && <a onClick={()=>handleAdClick(a)} href={link ? link : (phone ? `tel:${phone}` : "#")} target={link ? "_blank" : undefined} className="inline-block mt-2 border-2 rounded-full px-4 py-1 text-[12px] font-black" style={{borderColor:txt}}>{btnText}</a>}
        </div>
      </div>
    );
  };
  const ad = ads1[idx1];
  const ad2 = ads2[idx2];
  return (
    <div className="sticky top-[220px] w-full flex flex-col gap-3">
      {renderOne(ad, false)}
      {renderOne(ad2, true)}
      <p className="text-[10px] text-gray-400 text-center">Sponsored • Ads rotate based on seconds you set in Admin</p>
    </div>
  );
}
function WeatherBar() {
  const [weather, setWeather] = useState<any[]>([]);
  const [activeState, setActiveState] = useState("FCT-Abuja");
  useEffect(() => {
    const cw = localStorage.getItem("ceo_weather_v2");
    const ct = localStorage.getItem("ceo_weather_time_v2");
    if(cw && ct && Date.now() - Number(ct) < 30*60*1000){ setWeather(JSON.parse(cw)); }
    else {
      const fetchWeather = async () => {
        const results = await Promise.all(ALL_WEATHER.map(async c => {
          try {
            const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current_weather=true&daily=weathercode,temperature_2m_max&timezone=Africa/Lagos`);
            const d = await r.json();
            const todayCode = d.current_weather?.weathercode ?? d.daily?.weathercode?.[0] ?? 0;
            const tomorrowCode = d.daily?.weathercode?.[1] ?? 0;
            return { name: c.name, temp: Math.round(d.current_weather?.temperature || 28), todayIcon: getWeatherIcon(todayCode), tomorrowTemp: Math.round(d.daily?.temperature_2m_max?.[1] || 28), tomorrowIcon: getWeatherIcon(tomorrowCode) };
          } catch { return { name: c.name, temp: 28, todayIcon:"☀️", tomorrowTemp:28, tomorrowIcon:"⛅" }; }
        }));
        setWeather(results);
        localStorage.setItem("ceo_weather_v2", JSON.stringify(results));
        localStorage.setItem("ceo_weather_time_v2", Date.now().toString());
      };
      fetchWeather();
    }
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        const {latitude, longitude} = pos.coords;
        let nearest = "FCT-Abuja";
        let minDist = Infinity;
        Object.keys(STATE_COORDS).forEach(state=>{
          const s = STATE_COORDS[state];
          const dist = Math.sqrt(Math.pow(s.lat-latitude,2)+Math.pow(s.lon-longitude,2));
          if(dist < minDist){ minDist=dist; nearest=state; }
        });
        if(nearest.includes("Abuja")) nearest="FCT-Abuja";
        setActiveState(nearest);
      }, ()=>{});
    }
  }, []);
  const loop = [...weather,...weather,...weather,...weather];
  return (
    <div className="sticky top-0 z-50 bg-[#1e293b] overflow-hidden shadow-md">
      <div className="flex items-center h-[52px]">
        <div className="bg-[#1e293b] z-10 flex items-center px-4 h-full shrink-0 border-r border-gray-600">
          <span className="font-black text-[#fbbf24] text-[14px] tracking-wide whitespace-nowrap">⛅ 36 STATES + FCT LIVE FORECAST:</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-3 w-max" style={{ animation: "smoothMarquee 300s linear infinite" }}>
            {loop.map((w, i) => {
              const isActive = activeState.toLowerCase().includes(w.name.toLowerCase().replace("fct-","")) || w.name.toLowerCase().includes(activeState.toLowerCase().replace("fct-","").replace(" - abuja",""));
              return (<span key={`${w.name}-${i}`} className={`px-4 py-[7px] rounded-full text-[14px] font-extrabold shrink-0 tracking-wide ${isActive? "bg-blue-600 text-white shadow-md" : "bg-[#334155] text-gray-100"}`}>{w.name}: {w.temp}°C {w.todayIcon} Today • Tomorrow {w.tomorrowTemp}°C {w.tomorrowIcon} {isActive? "• You 📍" : ""}</span>);
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes smoothMarquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} @keyframes earnScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes newGlow{0%{box-shadow:0 0 0 2px white,0 0 8px rgba(0,0,0,0.9),0 0 12px rgba(255,255,255,0.5)}50%{box-shadow:0 0 0 2px white,0 0 12px rgba(0,0,0,1),0 0 20px rgba(255,255,255,0.9)}100%{box-shadow:0 0 0 2px white,0 0 8px rgba(0,0,0,0.9),0 0 12px rgba(255,255,255,0.5)}}`}</style>
    </div>
  );
}
function formatPrice(p:any){ const n=Number(p); return isNaN(n)?p:`₦${n.toLocaleString()}`;}
function isNewProperty(p:any){ if(!p.created_at) return false; const created = new Date(p.created_at).getTime(); const diffDays = (Date.now() - created) / (1000*60*60*24); return diffDays <= 2; }
function formatTimeAgo(dateStr:string){
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs/60000);
  if(mins<1) return "Just now";
  if(mins<60) return `${mins}m ago`;
  const hrs = Math.floor(mins/60);
  if(hrs<24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}
function getStateFromAddress(address: any = "") {
  const text = String(address || "").toLowerCase();
  const states = [...NIGERIA_STATES].sort((a,b) => b.length - a.length);
  for (const st of states) {
    if (text.includes(st.toLowerCase())) return st;
    if (st === "FCT - Abuja" && text.includes("abuja")) return "FCT - Abuja";
  }
  return null;
}
async function getStaticBonusMonths(propertyAddress: any) {
  const state = getStateFromAddress(propertyAddress);
  if (!state) return 1;
  const { count, error } = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("plan_type", "Static").eq("plan_state", state).eq("got_bonus", true);
  if (error) return 1;
  return (count || 0) < 20 ? 2 : 1;
}
export default function Home() {
  const [properties, setProperties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [bedFilter, setBedFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [showStates, setShowStates] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [activeCommentId, setActiveCommentId] = useState<any>(null);
  const [likes, setLikes] = useState<{[k:number]:number}>({});
  const [liked, setLiked] = useState<{[k:number]:boolean}>({});
  const [followed, setFollowed] = useState<{[k:number]:boolean}>({});
  const [comments, setComments] = useState<{[k:string]:any[]}>({});
  const [newComment, setNewComment] = useState("");
  const [showPicker, setShowPicker] = useState<any>(null);
  const [showVideoPicker, setShowVideoPicker] = useState(false);
  const [youtubeVideo, setYoutubeVideo] = useState<any>(null);
  const [videoFollowed, setVideoFollowed] = useState(false);
  const [videoComments, setVideoComments] = useState<any[]>([]);
  const [showVideoComments, setShowVideoComments] = useState(false);
  const [cardSlide, setCardSlide] = useState<{[k:number]:number}>({});
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [videoLikesMap, setVideoLikesMap] = useState<{[k:string]:number}>({});
  const [videoLikedMap, setVideoLikedMap] = useState<{[k:string]:boolean}>({});
  const [showTerms, setShowTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const bannerEndDate = new Date("2027-01-06");
  const showBanner = new Date() < bannerEndDate;
  useEffect(()=>{
    if(typeof window!=="undefined" && "serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
      if(localStorage.getItem("ceo_push_subscribed")==="true") setPushSubscribed(true);
    }
    try{
      const saved = localStorage.getItem("ceo_video_likes_v1");
      if(saved) setVideoLikesMap(JSON.parse(saved));
      const savedLiked = localStorage.getItem("ceo_video_liked_v1");
      if(savedLiked) setVideoLikedMap(JSON.parse(savedLiked));
    }catch{}
  },[]);
  const subscribePush = async () =>{
    try{
      const perm = await Notification.requestPermission();
      if(perm!=="granted"){ alert("Please allow notifications 🙏"); return; }
      setPushSubscribed(true);
      localStorage.setItem("ceo_push_subscribed","true");
      alert("✅ Alerts ON!");
    }catch(e:any){
      setPushSubscribed(true);
      localStorage.setItem("ceo_push_subscribed","true");
      alert("✅ Alerts enabled!");
    }
  };
  useEffect(()=>{
    if(typeof window!=="undefined"){
      if(localStorage.getItem("ceo_terms_accepted")!=="true"){
        const t = setTimeout(()=> setShowTerms(true), 1500);
        return ()=> clearTimeout(t);
      }
    }
  },[]);
  const acceptTerms = () => {
    if(!termsChecked){ alert("Please tick 'I have read and agree' first 🙏"); return; }
    localStorage.setItem("ceo_terms_accepted","true");
    setShowTerms(false);
  };
  useEffect(() => {
    const load = async () => {
      const cachedProps = localStorage.getItem("ceo_properties_cache");
      const cacheTime = localStorage.getItem("ceo_properties_time");
      const isCacheValid = cachedProps && cacheTime && Date.now() - Number(cacheTime) < 5*60*1000;
      let propsForLikes: any[] = [];
      if(isCacheValid){ 
        const parsed = JSON.parse(cachedProps!);
        const validCached = parsed.filter((p:any)=> !p.expires_at || new Date(p.expires_at) > new Date());
        setProperties(validCached);
        propsForLikes = validCached;
      }
      try {
        const { data } = await supabase.from("properties").select("*").order("id",{ascending:false});
        if(data && data.length){
          const validProps = data.filter((p:any)=> !p.expires_at || new Date(p.expires_at) > new Date());
          setProperties(validProps);
          propsForLikes = validProps;
          localStorage.setItem("ceo_properties_cache", JSON.stringify(validProps));
          localStorage.setItem("ceo_properties_time", Date.now().toString());
        }
      } catch {}
      if(propsForLikes.length===0 && !isCacheValid){
        const fallback = [
          { id: 1, title: "Standard 2 Bedroom Flat & 1 Room BQ", price: 350000000, location: "Wuse 2, Abuja", city: "FCT - Abuja", created_at: new Date().toISOString(), likes_count: 0, agent_name: "Demo Agent", user_id: null, images: [FALLBACK_IMG], description: "This is a demo property description. It shows how the description will appear as the last slide after the pictures, so buyers can read the full details of the property before they contact the agent." },
        ];
        setProperties(fallback);
        propsForLikes = fallback;
      }
      const likeMap: any = {};
      propsForLikes.forEach((p:any)=>{ likeMap[p.id]= p.likes_count ?? p.likes ?? 0; });
      setLikes(likeMap);
      try {
        const { data: allComments } = await supabase.from("comments").select("*").order("created_at",{ascending:true});
        const cmap: any = {};
        const vcoms: any[] = [];
        if(allComments){
          allComments.forEach((c:any)=>{
            const pid = c.property_id;
            const timeAgo = formatTimeAgo(c.created_at);
            const obj = {name:c.name, text:c.text, time: timeAgo};
            if(pid==="video_feed"){ vcoms.push(obj); } else { if(!cmap[pid]) cmap[pid]=[]; cmap[pid].push(obj); }
          });
        }
        setComments(cmap);
        setVideoComments(vcoms);
      } catch { setComments({}); }
      try {
        const { data: vlikes } = await supabase.from("video_likes").select("*");
        if(vlikes && vlikes.length){
          const m:any = {};
          vlikes.forEach((r:any)=>{ m[r.video_key] = r.likes_count; });
          setVideoLikesMap(prev => ({...m, ...prev}));
        }
      } catch {}
    };
    load();
  }, []);
  const getBeds = (p:any) => { if(p.bedrooms) return Number(p.bedrooms); const m = (p.title||"").match(/(\d+)\s*bed/i); return m ? Number(m[1]) : 0; };
  const getType = (p:any) => { const t = (p.property_type || p.type || p.title || "").toLowerCase(); if(t.includes("land")) return "land"; if(t.includes("carcass") || t.includes("carcase")) return "carcass"; if(t.includes("duplex")) return "duplex"; if(t.includes("flat")) return "flat"; if(t.includes("bungalow")) return "bungalow"; if(t.includes("self")) return "self-contain"; return t; };
  const filtered = properties.filter(p => {
    const txt = `${p.title} ${p.location} ${p.city} ${p.property_type||""} ${p.agent_name||""} ${p.description||""}`.toLowerCase();
    const s = txt.includes(search.toLowerCase());
    const f = filter==="All" || (p.city||p.location||"").toLowerCase().includes(filter.toLowerCase()) || (filter==="FCT - Abuja" && (p.city||"").toLowerCase().includes("abuja"));
    let typeOk = true;
    if(typeFilter!=="All"){ typeOk = getType(p).includes(typeFilter.toLowerCase()); }
    let bedOk = true;
    if(bedFilter!=="All"){
      const b = getBeds(p);
      if(bedFilter==="5+") bedOk = b>=5;
      else bedOk = b===Number(bedFilter);
    }
    let priceOk = true;
    const price = Number(p.price)||0;
    if(priceFilter==="Under 50M") priceOk = price < 50000000;
    else if(priceFilter==="50M - 100M") priceOk = price>=50000000 && price<=100000000;
    else if(priceFilter==="100M - 350M") priceOk = price>100000000 && price<=350000000;
    else if(priceFilter==="Above 350M") priceOk = price>350000000;
    return s && f && typeOk && bedOk && priceOk;
  });
  const staticListings = filtered.filter((p:any) => !p.video_url);
  const videoListings = filtered.filter((p:any) => p.video_url);
  const chunks:any[] = [];
  for(let i=0; i<staticListings.length; i+=4){
    const chunkIndex = Math.floor(i / 4);
    chunks.push({ statics: staticListings.slice(i, i+4), video: videoListings[chunkIndex] || null });
  }
  if(staticListings.length === 0 && videoListings.length > 0){ videoListings.forEach((v:any) => chunks.push({ statics: [], video: v })); }
  if(staticListings.length > 0 && videoListings.length > chunks.length){ for(let vi = chunks.length; vi < videoListings.length; vi++){ chunks.push({ statics: [], video: videoListings[vi] }); } }
  const handleLike = async (p:any) => {
    if(!p || p.id == null) return;
    const alreadyLiked = liked[p.id];
    const newLiked = !alreadyLiked;
    setLiked(pr=>({...pr,[p.id]:newLiked}));
    setLikes(l=>{ const current = l[p.id] ?? p.likes_count ?? p.likes ?? 0; return {...l,[p.id]: current + (newLiked ? 1 : -1)}; });
    try {
      const currentCount = likes[p.id] ?? p.likes_count ?? p.likes ?? 0;
      const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
      await supabase.from("properties").update({ likes_count: newCount, likes: newCount }).eq("id", p.id);
      setProperties(prev => prev.map(item => item.id === p.id ? {...item, likes_count: newCount, likes: newCount} : item));
    } catch(e){}
  };
  const handleVideoLike = async (videoKey:string) => {
    const already = videoLikedMap[videoKey];
    const newLiked = !already;
    const current = videoLikesMap[videoKey] ?? 0;
    const newCount = newLiked ? current + 1 : Math.max(0, current - 1);
    setVideoLikedMap(prev=>({...prev,[videoKey]:newLiked}));
    setVideoLikesMap(prev=>{ const next = {...prev,[videoKey]:newCount}; try{ localStorage.setItem("ceo_video_likes_v1", JSON.stringify(next)); }catch{} return next; });
    try{ localStorage.setItem("ceo_video_liked_v1", JSON.stringify({...videoLikedMap,[videoKey]:newLiked})); }catch{}
    try {
      const { data: existing } = await supabase.from("video_likes").select("*").eq("video_key", videoKey).single();
      if(existing){ await supabase.from("video_likes").update({ likes_count: newCount }).eq("video_key", videoKey); }
      else { await supabase.from("video_likes").insert({ video_key: videoKey, likes_count: newCount }); }
    } catch {}
  };
  const handleShare = async (p:any) => {
    const text = `${p.title} - ${p.location} - ${formatPrice(p.price)} by ${p.agent_name || 'Agent'}`;
    const url = `${SITE_URL}/?property=${p.id}`;
    if(navigator.share){ try{ await navigator.share({title:p.title,text,url}); }catch{} }
    else { await navigator.clipboard.writeText(text+" "+url); alert("Link copied ✅"); }
  };
  const postComment = async (propId:any) => {
    if(!newComment.trim()) return;
    const pidStr = propId.toString();
    const newC = {name:"You", text:newComment, time:"Just now"};
    if(pidStr==="9999" || pidStr==="video_feed"){
      setVideoComments(prev=>[...prev,newC]);
      setNewComment("");
      setShowVideoPicker(false);
      try { await supabase.from("comments").insert({ property_id: "video_feed", name:"You", text:newComment }); } catch {}
      return;
    }
    setComments(prev=>{ const updated = {...prev, [pidStr]:[...(prev[pidStr]||[]), newC]}; return updated; });
    const textToSave = newComment;
    setNewComment("");
    setShowPicker(null);
    try { await supabase.from("comments").insert({ property_id: pidStr, name:"You", text:textToSave }); } catch(e){ console.log("comment save failed", e); }
  };
  const getImg = (p:any) => p?.images?.[0] || p?.image_url || FALLBACK_IMG;
  const getAllImgs = (p:any) => p?.images?.length? p.images : (p?.image_url? [p.image_url] : [FALLBACK_IMG]);
  const getTotalSlides = (p:any) => { const imgs = getAllImgs(p); const hasDesc = p?.description && String(p.description).trim().length > 0; const isStatic = !p?.video_url; return isStatic && hasDesc ? imgs.length + 1 : imgs.length; };
  const isDescSlide = (p:any, idx:number) => { const imgs = getAllImgs(p); const hasDesc = p?.description && String(p.description).trim().length > 0; const isStatic = !p?.video_url; return isStatic && hasDesc && idx === imgs.length; };
  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <WeatherBar />
      <header className="bg-white sticky top-[52px] z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-3">
          <Link href="/" className="shrink-0 flex items-center">
            <img src="/logo.png" alt="mypropertydot.com - Two hands giving you any property" className="h-[115px] w-auto max-w-[300px] md:max-w-[380px] object-contain" />
          </Link>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 w-full max-w-[600px]">
              <div className="flex-1 bg-[#f2f2f2] rounded-full px-4 h-[32px] flex items-center"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search agent, place, estate, land, carcass, 2 bed..." className="flex-1 bg-transparent text-[13px] outline-none" /></div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white h-[32px] px-5 rounded-full text-[12px] font-bold">Search</button>
              <button onClick={subscribePush} className={`h-[32px] px-4 rounded-full text-[11px] font-bold whitespace-nowrap transition ${pushSubscribed?"bg-green-600 text-white":"bg-black text-white hover:bg-gray-800"}`}>{pushSubscribed?"🔔 Alerts ON":"🔔 Get Alerts"}</button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[13px] font-black text-black whitespace-nowrap shrink-0 leading-none">
            <Link href="/login" className="hover:underline leading-none">Log In</Link>
            <span className="font-black leading-none text-[13px]">|</span>
            <Link href="/signup" className="hover:underline leading-none">Sign Up</Link>
          </div>
          <Link href="/upload" className="shrink-0 bg-black hover:bg-[#7C3AED] text-white h-[32px] px-4 rounded-full text-[12px] font-black flex items-center justify-center whitespace-nowrap transition">+ Post Property</Link>
        </div>
        {/* ===== FILTER ROW - SAME LEVEL: Filters LEFT, Earn Scrolling RIGHT, A BIT AWAY ===== */}
        <div className="max-w-[1400px] mx-auto px-4 pb-3 flex items-center gap-2 flex-nowrap overflow-hidden">
          <div className="relative shrink-0" onMouseEnter={()=>setShowStates(true)} onMouseLeave={()=>setShowStates(false)}>
            <button className="bg-[#f2f2f2] hover:bg-[#e5e5e5] h-[32px] px-4 rounded-lg text-[13px] font-medium flex items-center gap-1">States <span className="text-[10px]">▼</span></button>
            {showStates && (
              <div className="absolute top-[34px] left-0 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-xl p-3 w-[420px] z-50 grid grid-cols-3 gap-1">
                <button onClick={()=>{setFilter("All"); setShowStates(false)}} className={`text-left px-3 py-2 rounded-lg text-[12px] font-bold ${filter==="All"?"bg-blue-600 text-white":"bg-[#f2f2f2] hover:bg-[#e5e5e5]"}`}>All States</button>
                {NIGERIA_STATES.map(st=><button key={st} onClick={()=>{setFilter(st); setShowStates(false)}} className={`text-left px-3 py-1.5 rounded-lg text-[12px] truncate ${filter===st?"bg-blue-600 text-white":"bg-[#f2f2f2] hover:bg-[#e5e5e5]"}`}>{st}</button>)}
              </div>
            )}
          </div>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="bg-[#f2f2f2] h-[32px] px-3 rounded-lg text-[12px] font-medium shrink-0">
            <option value="All">All Types</option>
            <option value="duplex">Duplex</option>
            <option value="flat">Flat</option>
            <option value="bungalow">Bungalow</option>
            <option value="land">Empty Land</option>
            <option value="carcass">Carcass</option>
            <option value="self-contain">Self-Contain</option>
          </select>
          <select value={bedFilter} onChange={e=>setBedFilter(e.target.value)} className="bg-[#f2f2f2] h-[32px] px-3 rounded-lg text-[12px] font-medium shrink-0">
            <option value="All">All Beds</option>
            <option value="1">1 Bed</option>
            <option value="2">2 Beds</option>
            <option value="3">3 Beds</option>
            <option value="4">4 Beds</option>
            <option value="5+">5+ Beds</option>
          </select>
          <select value={priceFilter} onChange={e=>setPriceFilter(e.target.value)} className="bg-[#f2f2f2] h-[32px] px-3 rounded-lg text-[12px] font-medium shrink-0">
            <option value="All">All Prices</option>
            <option value="Under 50M">Under ₦50M</option>
            <option value="50M - 100M">₦50M - 100M</option>
            <option value="100M - 350M">₦100M - 350M</option>
            <option value="Above 350M">Above ₦350M</option>
          </select>
          {/* EARN SCROLLING - SAME LEVEL, A BIT AWAY FROM FILTERS, ON THE RIGHT - CORRECTED: Level 3 is 3% */}
          <div className="flex-1 min-w-[200px] ml-6 bg-black rounded-full overflow-hidden whitespace-nowrap h-[32px] flex items-center">
            <div className="inline-block text-[12px] font-bold tracking-wide" style={{ animation: "earnScroll 60s linear infinite" }}>
              <span className="mx-6 text-white">🔥 EARN BY INVITING AN AGENT TO THE PLATFORM — GET PAID EVERY FRIDAY 💰</span>
              <span className="mx-6 text-yellow-400">✦ Earn 10% On Level 1 • 5% On Level 2 • 3% On Level 3 ✦</span>
              <span className="mx-6 text-white">YOUR LINK = YOUR MONEY — SHARE IT, EARN FOR LIFE 💸</span>
              <span className="mx-6 text-yellow-400">✦ Terms &amp; Conditions Apply ✦</span>
              <span className="mx-6 text-white">🔥 EARN BY INVITING AN AGENT TO THE PLATFORM — GET PAID EVERY FRIDAY 💰</span>
              <span className="mx-6 text-yellow-400">✦ Earn 10% On Level 1 • 5% On Level 2 • 3% On Level 3 ✦</span>
              <span className="mx-6 text-white">YOUR LINK = YOUR MONEY — SHARE IT, EARN FOR LIFE 💸</span>
              <span className="mx-6 text-yellow-400">✦ Terms &amp; Conditions Apply ✦</span>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 pb-2 flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Found: {filtered.length} | {filter} | {typeFilter} | {bedFilter} Beds | {priceFilter}</span>
        </div>
      </header>
      <div className="max-w-[1400px] mx-auto px-3 pt-3">
        {showBanner && (
          <div className="bg-gradient-to-r from-[#F5F0FF] via-[#D8B4FE] to-[#A78BFA] text-purple-950 border border-purple-200 p-4 rounded-xl text-center font-bold shadow-[0_10px_30px_rgba(139,92,246,0.25)]">
            🎉 LOYALTY REWARD: POST 10 IN 7 DAYS, GET 2 FREE - Ends 6th Jan 2027
            <p className="text-sm font-normal mt-1">Pay for 10 listings WITHIN 7 DAYS, get FREE 1: 5 Static Sliding Pictures for 2 Weeks + FREE 2: 60 Sec Video for 1 Month. If you exceed 7 days, it will NOT count. 5 Day Free Package still active.</p>
          </div>
        )}
      </div>
      <div className="max-w-[1400px] mx-auto p-3 space-y-6">
        {chunks.map((chunk:any, gi:number)=>{
          const videoProp = chunk.video;
          const group = chunk.statics;
          const videoKey = videoProp ? `video-${videoProp.id}` : `video-empty-${gi}`;
          return (
          <div key={gi} className="space-y-6">
            {group.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {group.map((p:any)=>{
                const imgs = getAllImgs(p);
                const totalSlides = getTotalSlides(p);
                const cIdx = cardSlide[p.id] || 0;
                const showDescSlide = isDescSlide(p, cIdx);
                const showNew = isNewProperty(p);
                const agentName = p.agent_name;
                const agentId = p.user_id || p.agent_id;
                const waNumber = p.whatsapp_number || p.whatsapp || "";
                const pComments = comments[p.id.toString()] || [];
                return (
                <div key={p.id} className="bg-white rounded-xl overflow-hidden hover:shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition flex flex-col">
                  <div className="relative aspect-[16/9] bg-[#f2f2f2] cursor-pointer group overflow-hidden">
                    {showDescSlide ? (
                      <div onClick={()=>{setSelected(p); setImgIdx(cIdx);}} className="w-full h-full bg-[#F5F0FF] p-3 overflow-hidden flex flex-col">
                        <p className="text-[11px] font-black text-purple-700">📝 Description</p>
                        <p className="text-[11px] leading-relaxed text-gray-800 mt-1 line-clamp-6">{p.description}</p>
                        <p className="text-[10px] text-purple-600 font-bold mt-auto">Tap to read full →</p>
                      </div>
                    ) : (
                      <img src={imgs[cIdx] || FALLBACK_IMG} onClick={()=>{setSelected(p); setImgIdx(cIdx);}} className="w-full h-full object-cover" onError={(e:any)=> e.target.src=FALLBACK_IMG} alt="" />
                    )}
                    {showNew && (<span className="absolute top-2 left-2 bg-black text-white text-[8px] font-black px-2.5 py-0.5 rounded-full z-10 tracking-widest" style={{ animation: "newGlow 1.6s ease-in-out infinite" }}>NEW</span>)}
                    {totalSlides>1 && (
                      <>
                        <button onClick={(e)=>{e.stopPropagation(); setCardSlide(s=>({...s,[p.id]: cIdx===0? totalSlides-1 : cIdx-1}))}} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-600 hover:text-white w-7 h-7 rounded-full flex items-center justify-center shadow font-bold text-[14px] opacity-0 group-hover:opacity-100 md:opacity-100 transition">‹</button>
                        <button onClick={(e)=>{e.stopPropagation(); setCardSlide(s=>({...s,[p.id]: cIdx===totalSlides-1?0:cIdx+1}))}} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-600 hover:text-white w-7 h-7 rounded-full flex items-center justify-center shadow font-bold text-[14px] opacity-0 group-hover:opacity-100 md:opacity-100 transition">›</button>
                      </>
                    )}
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded cursor-pointer" onClick={()=>{setSelected(p); setImgIdx(cIdx);}}>{totalSlides>1? `${cIdx+1}/${totalSlides} ${showDescSlide ? "📝 Desc" : "📸"}` : "1 / 1"}</span>
                    <button onClick={(e)=>{e.stopPropagation(); setFollowed(pr=>({...pr,[p.id]:!pr[p.id]}))}} className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[9px] font-bold shadow transition ${followed[p.id]?"bg-white text-black":"bg-[#f2f2f2] hover:bg-blue-600 hover:text-white text-black"}`}>{followed[p.id]?"Following ✓":"+ Follow"}</button>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-medium text-[13px] leading-[1.3] line-clamp-2 cursor-pointer" onClick={()=>{setSelected(p); setImgIdx(cIdx);}}>{p.title} - {p.location}</h3>
                    <p className="text-[11px] text-gray-500 mt-1">📍 {p.location} • {formatPrice(p.price)} • {getBeds(p) ? `${getBeds(p)} Bed` : ""} • {getType(p)}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-[#0A1931] text-white flex items-center justify-center text-[12px] font-black">{agentName ? agentName[0].toUpperCase() : "A"}</div>
                      <div className="flex-1">
                        <p className="text-[12px] font-black text-[#0A1931] leading-none">{agentName || "Agent"}</p>
                        <p className="text-[9px] text-gray-400 font-bold mt-0.5">Property Agent • Posted {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      <button onClick={()=>handleLike(p)} className={`bg-[#f2f2f2] hover:bg-[#e5e5e5] px-3 h-[30px] rounded-full text-[11px] font-medium flex items-center gap-1 ${liked[p.id]?"bg-black text-white hover:bg-black":""}`}>👍 {likes[p.id] ?? p.likes_count ?? 0}</button>
                      <button onClick={()=>setActiveCommentId(activeCommentId===p.id?null:p.id)} className="bg-[#f2f2f2] hover:bg-[#e5e5e5] px-3 h-[30px] rounded-full text-[11px] font-medium">💬 {pComments.length}</button>
                      <button onClick={()=>handleShare(p)} className="bg-[#f2f2f2] hover:bg-[#e5e5e5] px-3 h-[30px] rounded-full text-[11px] font-medium">↗️ Share</button>
                      {agentId && (<Link href={`/my-office/${agentId}`} className="bg-black text-white h-[30px] px-4 rounded-full text-[11px] font-black flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition border border-black">My Office</Link>)}
                    </div>
                    {activeCommentId===p.id && (
                      <div className="mt-3 bg-[#f8f8f8] rounded-xl p-2.5">
                        <div className="space-y-2 mb-2 max-h-[120px] overflow-y-auto">
                          {pComments.length===0 && <p className="text-[10px] text-gray-400 text-center py-2">No comments yet — be first! 💬</p>}
                          {pComments.map((c:any,i:number)=><div key={i} className="bg-white rounded-lg px-2.5 py-1.5"><div className="flex justify-between"><b className="text-[10px]">{c.name}</b><span className="text-[8px] text-gray-400">{c.time}</span></div><p className="text-[11px] mt-0.5">{c.text}</p></div>)}
                        </div>
                        <div className="relative bg-white rounded-full flex items-center px-1 h-[30px] shadow-sm">
                          <button onClick={()=>setShowPicker(showPicker===p.id?null:p.id)} className="w-6 h-6 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[13px] ml-0.5">😊</button>
                          <input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-transparent px-2 text-[11px] outline-none" />
                          <button onClick={()=>postComment(p.id)} className="bg-blue-600 text-white px-3 h-[24px] rounded-full text-[10px] font-bold mr-0.5">Post</button>
                          {showPicker===p.id && (<div className="absolute bottom-[36px] left-0 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-xl p-2 w-[220px] z-20"><div className="grid grid-cols-8 gap-1">{EMOJIS.map(em=><button key={em} onClick={()=>setNewComment(prev=>prev+em)} className="w-6 h-6 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-full text-[13px]">{em}</button>)}</div></div>)}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location)}`} target="_blank" className="flex-1 bg-[#f2f2f2] hover:bg-blue-600 hover:text-white h-[32px] rounded-full text-[11px] font-bold flex items-center justify-center transition">Route</a>
                      {waNumber ? (<a href={`https://wa.me/${waNumber.replace(/[^0-9]/g,'')}`} target="_blank" className="flex-1 bg-green-500 hover:bg-green-600 text-white h-[32px] rounded-full text-[11px] font-bold flex items-center justify-center transition">WhatsApp</a>) : agentId ? (<Link href={`/my-office/${agentId}`} className="flex-1 bg-[#f2f2f2] hover:bg-black hover:text-white h-[32px] rounded-full text-[11px] font-bold flex items-center justify-center transition">Office</Link>) : (<a href={`https://wa.me/234`} target="_blank" className="flex-1 bg-[#f2f2f2] hover:bg-green-600 hover:text-white h-[32px] rounded-full text-[11px] font-bold flex items-center justify-center transition">WhatsApp</a>)}
                    </div>
                  </div>
                </div>
              )})}
            </div>
            )}
            {videoProp && (
            <div className="w-full">
              <div className="flex items-stretch gap-4 justify-center">
                <div className="hidden lg:flex w-[220px] shrink-0 flex-col justify-end">
                  <div className="sticky bottom-4"><FeedbackButton variant="inline" /><p className="text-[10px] text-gray-400 text-center mt-1">Report a problem here</p></div>
                </div>
                <div className="w-full max-w-[800px] flex-1 min-w-0">
              <div className="w-full">
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition">
                  <div className="relative aspect-video bg-black cursor-pointer" onClick={()=>setYoutubeVideo({poster: getImg(videoProp), videoUrl: videoProp?.video_url})}>
                    <img src={getImg(videoProp)} className="w-full h-full object-cover opacity-80" onError={(e:any)=> e.target.src=FALLBACK_IMG} alt="" />
                    <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">▶️</div></div>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">AD • VIDEO</span>
                    <button onClick={(e)=>{e.stopPropagation(); setVideoFollowed(!videoFollowed)}} className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[9px] font-bold shadow transition ${videoFollowed?"bg-white text-black":"bg-[#f2f2f2] hover:bg-blue-600 hover:text-white text-black"}`}>{videoFollowed?"Following ✓":"+ Follow"}</button>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-full bg-[#0A1931] text-white flex items-center justify-center text-[11px] font-black">{videoProp?.agent_name?.[0] || "A"}</div><span className="text-[12px] font-black">{videoProp?.agent_name || "Agent"}</span></div>
                    <h3 className="font-medium text-[13px]">Sponsored Tour - {videoProp?.location}</h3>
                    {videoProp?.description && <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{videoProp.description}</p>}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <button onClick={()=>handleVideoLike(videoKey)} className={`px-3 h-[30px] rounded-full text-[11px] font-medium transition flex items-center gap-1 ${videoLikedMap[videoKey]?"bg-blue-600 text-white":"bg-[#f2f2f2] hover:bg-[#e5e5e5]"}`}>👍 {videoLikesMap[videoKey] ?? 0}</button>
                      <button onClick={()=>setShowVideoComments(!showVideoComments)} className="bg-[#f2f2f2] hover:bg-[#e5e5e5] px-3 h-[30px] rounded-full text-[11px] font-medium">💬 {videoComments.length}</button>
                      <button onClick={()=>handleShare(videoProp)} className="bg-[#f2f2f2] hover:bg-[#e5e5e5] px-3 h-[30px] rounded-full text-[11px] font-medium">↗️ Share</button>
                      {videoProp?.user_id && <Link href={`/my-office/${videoProp.user_id}`} className="bg-black text-white h-[30px] px-4 rounded-full text-[11px] font-black flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition">My Office</Link>}
                    </div>
                    {showVideoComments && (
                      <div className="mt-3 bg-[#f8f8f8] rounded-xl p-2.5">
                        <div className="space-y-2 mb-2 max-h-[120px] overflow-y-auto">
                          {videoComments.length===0 && <p className="text-[10px] text-gray-400 text-center py-2">No comments yet on video tour! 💬</p>}
                          {videoComments.map((c:any,i:number)=><div key={i} className="bg-white rounded-lg px-2.5 py-1.5"><div className="flex justify-between"><b className="text-[10px]">{c.name}</b><span className="text-[8px] text-gray-400">{c.time}</span></div><p className="text-[11px] mt-0.5">{c.text}</p></div>)}
                        </div>
                        <div className="relative bg-white rounded-full flex items-center px-1 h-[30px] shadow-sm">
                          <button onClick={()=>setShowVideoPicker(!showVideoPicker)} className="w-6 h-6 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[13px] ml-0.5">😊</button>
                          <input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Comment on video tour..." className="flex-1 bg-transparent px-2 text-[11px] outline-none" />
                          <button onClick={()=>postComment("video_feed")} className="bg-blue-600 text-white px-3 h-[24px] rounded-full text-[10px] font-bold mr-0.5">Post</button>
                          {showVideoPicker && (<div className="absolute bottom-[36px] left-0 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-xl p-2 w-[220px] z-20"><div className="grid grid-cols-8 gap-1">{EMOJIS.map(em=><button key={em} onClick={()=>setNewComment(prev=>prev+em)} className="w-6 h-6 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-full text-[13px]">{em}</button>)}</div></div>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                </div>
                <div className="hidden lg:block w-[260px] shrink-0"><RightAdPanel /></div>
              </div>
              <div className="lg:hidden mt-3 space-y-3"><RightAdPanel /><FeedbackButton variant="inline" /></div>
            </div>
            )}
          </div>
          );
        })}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-2 md:p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden max-h-[92vh] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="relative h-[380px] md:h-[480px] bg-black flex items-center justify-center group">
              {isDescSlide(selected, imgIdx) ? (
                <div className="w-full h-full bg-[#F5F0FF] p-5 md:p-8 overflow-y-auto">
                  <p className="text-[13px] font-black text-purple-700">📝 Description — {selected.title}</p>
                  <p className="text-[14px] leading-relaxed text-gray-800 mt-3 whitespace-pre-wrap">{selected.description}</p>
                </div>
              ) : (
                <img src={getAllImgs(selected)[imgIdx] || FALLBACK_IMG} className="w-full h-full object-contain" onError={(e:any)=> e.target.src=FALLBACK_IMG} alt="" />
              )}
              <button onClick={()=>setSelected(null)} className="absolute top-3 right-3 bg-white w-8 h-8 rounded-full text-sm font-bold shadow z-20">✕</button>
              {getTotalSlides(selected)>1? (
                <>
                  <button onClick={()=>setImgIdx(prev=> prev===0? getTotalSlides(selected)-1 : prev-1)} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-blue-600 hover:text-white w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-2xl text-[26px] font-black z-20 transition">‹</button>
                  <button onClick={()=>setImgIdx(prev=> prev===getTotalSlides(selected)-1?0:prev+1)} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-blue-600 hover:text-white w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-2xl text-[26px] font-black z-20 transition">›</button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-1.5 rounded-full text-[12px] font-bold z-20">{imgIdx+1} / {getTotalSlides(selected)} {isDescSlide(selected, imgIdx) ? "📝 Description" : "📸 Slide"}</div>
                </>
              ) : null}
            </div>
            <div className="p-4 overflow-y-auto">
              <h2 className="font-bold text-[15px]">{selected.title}</h2>
              <p className="text-[12px] text-gray-500">📍 {selected.location} • by {selected.agent_name || "Agent"}</p>
              <p className="font-black text-green-600 mt-2 text-[18px]">{formatPrice(selected.price)}</p>
              {selected.description && (
                <div className="mt-3 bg-[#F5F0FF] rounded-xl p-3">
                  <p className="text-[12px] font-black">📝 Description</p>
                  <p className="text-[13px] leading-relaxed text-gray-800 mt-1 whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}
              {isNewProperty(selected) && <span className="mt-2 inline-block bg-black text-white text-[9px] font-black px-2.5 py-1 rounded-full" style={{ animation: "newGlow 1.6s ease-in-out infinite" }}>NEW • {new Date(selected.created_at).toLocaleDateString()}</span>}
              {selected.user_id && <Link href={`/my-office/${selected.user_id}`} className="mt-3 inline-block bg-black text-white px-5 py-2 rounded-full text-[12px] font-bold">View {selected.agent_name} Office →</Link>}
            </div>
          </div>
        </div>
      )}
      {youtubeVideo && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4" onClick={()=>setYoutubeVideo(null)}>
          <div className="bg-black rounded-xl max-w-3xl w-full overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center p-3 text-white"><p className="text-[12px] font-medium">▶️ Property Video Tour</p><button onClick={()=>setYoutubeVideo(null)} className="w-7 h-7 bg-white text-black rounded-full text-xs font-bold">✕</button></div>
            <video src={youtubeVideo.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} poster={youtubeVideo.poster} className="w-full aspect-video" controls autoPlay />
          </div>
        </div>
      )}
      {showTerms && (
        <div className="fixed inset-0 bg-black/85 z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[500px] w-full p-5 max-h-[85vh] overflow-y-auto">
            <h2 className="font-black text-[18px] text-center">Welcome to mypropertydot.com</h2>
            <p className="text-[12px] text-gray-500 text-center mt-1">Please read before you continue</p>
            <div className="bg-yellow-100 border border-yellow-400 p-3 rounded-xl mt-4 text-[12px] leading-relaxed">
              <b>⚠️ IMPORTANT:</b> mypropertydot.com is ONLY a listing platform. We do NOT own or guarantee any property.<br/><br/>
              If someone posts a <b>stolen / fake / disputed property</b>, <b>mypropertydot.com will NOT be held liable or responsible.</b><br/><br/>
              You are ADVISED to <b>check every client, check every property, check every document, and check your chat progress</b> before paying any money. Visit the property, ask for ID + proof of ownership, and use a lawyer.
            </div>
            <label className="flex items-start gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={termsChecked} onChange={e=>setTermsChecked(e.target.checked)} className="mt-1 w-4 h-4" />
              <span className="text-[12px]">I have read and agree to the <Link href="/terms" className="text-blue-600 font-bold underline">Terms & Conditions</Link>. I understand mypropertydot.com is not liable for stolen / fake property and I must verify before paying.</span>
            </label>
            <button onClick={acceptTerms} className="w-full bg-black text-white h-[42px] rounded-full text-[13px] font-bold mt-4">I Agree - Continue</button>
            <Link href="/terms" className="block text-center text-[11px] text-blue-600 font-bold mt-2 underline">Read Full Terms →</Link>
          </div>
        </div>
      )}
      <div className="max-w-[1400px] mx-auto px-3 md:px-4 pt-3 pb-1">
        <AcquisitionContact />
        <p className="text-center text-[10px] text-gray-300 mt-1.5">Or email CEO: <a href="mailto:ceo@mypropertydot.com" className="text-gray-400 underline underline-offset-2">ceo@mypropertydot.com</a></p>
      </div>
      <footer className="max-w-[1400px] mx-auto px-4 py-6 text-center border-t mt-4">
        <p className="text-[11px] text-gray-500">mypropertydot.com is only a listing platform. We are not liable for stolen / fake property. Always verify client, property, documents & chat before paying.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/terms" className="text-[12px] font-bold underline">Terms & Conditions</Link>
          <Link href="/" className="text-[12px] font-bold underline">Homepage</Link>
        </div>
      </footer>
    </main>
  );
}
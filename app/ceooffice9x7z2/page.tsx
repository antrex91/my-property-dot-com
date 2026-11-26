"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

const ADMIN_PASSWORD = "CEO2026";

const ADVERT_PRICES = [
  { name: "Small Base Advert", price: 8000, position: 2, durationDays: 7, desc: "Small Base • 7 Days" },
  { name: "Big Top Advert", price: 15000, position: 1, durationDays: 14, desc: "Big Top Window • 14 Days" },
];

const isExpired = (ad:any) => {
  if(!ad.end_date) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(ad.end_date) < today;
};

const FONTS = [
  { name: "Arial Black - Bold", value: "'Arial Black', Arial, sans-serif" },
  { name: "Georgia - Elegant", value: "Georgia, serif" },
  { name: "Impact - Strong", value: "Impact, sans-serif" },
  { name: "Trebuchet - Modern", value: "'Trebuchet MS', sans-serif" },
  { name: "Verdana - Clean", value: "Verdana, sans-serif" },
  { name: "Courier - Typewriter", value: "'Courier New', monospace" },
  { name: "Comic - Playful", value: "'Comic Sans MS', cursive" },
  { name: "Times - Classic", value: "'Times New Roman', serif" },
  { name: "Palatino - Royal", value: "Palatino, serif" },
  { name: "Brush Script - Handwriting", value: "'Brush Script MT', cursive" },
];

const loadPaystack = () => {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CeoOfficeAdsPage(){
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checking, setChecking] = useState(true);
  const [position, setPosition] = useState<1|2>(1);
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");
  const [buttonText, setButtonText] = useState("Call Now");
  const [phone, setPhone] = useState("");
  const [bgColor, setBgColor] = useState("#15803d");
  const [textColor, setTextColor] = useState("#ffffff");
  const [seconds, setSeconds] = useState(5);
  const [customSeconds, setCustomSeconds] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [existing, setExisting] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number|null>(null);
  const [advertiserName, setAdvertiserName] = useState("");
  const [advertiserEmail, setAdvertiserEmail] = useState("");
  const [advertiserPhone, setAdvertiserPhone] = useState("");
  const [price, setPrice] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Not Paid");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("Approved");
  const [filter, setFilter] = useState("All");
  const [pendingFilter, setPendingFilter] = useState("All");
  const [isSubmitMode, setIsSubmitMode] = useState(false);
  const [adEffect, setAdEffect] = useState("None");
  const [fontFamily, setFontFamily] = useState("'Arial Black', Arial, sans-serif");
  const [notifOn, setNotifOn] = useState(false);
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subHeadline, setSubHeadline] = useState("");
  const [subText, setSubText] = useState("");
  const [subImage, setSubImage] = useState("");
  const [subEffect, setSubEffect] = useState("None");
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [selectedAdvert, setSelectedAdvert] = useState(ADVERT_PRICES[1]);
  const [freeAdvertDays, setFreeAdvertDays] = useState(7);
  const knownIds = useRef<Set<any>>(new Set());

  useEffect(()=>{
    if(typeof window !== "undefined" && window.location.search.includes("submit=1")) setIsSubmitMode(true);
    if(typeof window !== "undefined"){
      const params = new URLSearchParams(window.location.search);
      const pkg = params.get("package");
      if(pkg){
        const found = ADVERT_PRICES.find(p => p.name.toLowerCase() === pkg.toLowerCase());
        if(found) setSelectedAdvert(found);
      }
    }
    try{ if(sessionStorage.getItem("ceooffice9x7z2_unlocked") === "yes"){ setUnlocked(true); loadExisting(); } }catch{}
    if(typeof window !== "undefined" && Notification.permission === "granted") setNotifOn(true);
    setChecking(false);
  },[]);

  useEffect(()=>{
    if(!unlocked) return;
    const channel = supabase.channel("ads-pending-buzz")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ads" }, (payload:any)=>{
        const ad = payload.new;
        if(ad?.approval_status === "Pending"){
          try{ if(navigator.vibrate) navigator.vibrate([200,100,200,100,300]); }catch{}
          try{ const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); const o = ctx.createOscillator(); o.frequency.value = 880; o.connect(ctx.destination); o.start(); setTimeout(()=>o.stop(), 400); }catch{}
          try{
            if(Notification.permission === "granted"){
              new Notification("📥 New Advert Request!", { body: `${ad.headline} • ${ad.position===1?"Window 1 - BIG":"Window 2 - SMALL"} • ₦${ad.price||0} • ${ad.payment_status||"Pending"} • Tap to design`, icon: "/favicon.ico" });
            }
          }catch{}
          alert(`📥 NEW ADVERT REQUEST!\n${ad.headline}\nWindow ${ad.position} • ₦${ad.price||0} • ${ad.payment_status}\nClick OK to see it in Pending Box.`);
          loadExisting();
        }
      })
      .subscribe();
    return ()=>{ supabase.removeChannel(channel); };
  },[unlocked]);

  const enableBuzz = async () => {
    try{
      const perm = await Notification.requestPermission();
      if(perm === "granted"){
        setNotifOn(true);
        try{ if(navigator.vibrate) navigator.vibrate([200,100,200]); }catch{}
        alert("✅ Phone Buzz ON! You will now get buzz when a client pays for Advert. Keep Chrome open on your phone.");
      } else alert("Please Allow notifications in Chrome settings to get buzz.");
    }catch{ alert("Notifications not supported on this browser. Use Chrome on Android."); }
  };

  const loadExisting = async () => {
    try{
      const { data } = await supabase.from("ads").select("*").order("created_at", {ascending:false});
      if(!data) return;
      const expired = data.filter((a:any)=> isExpired(a));
      if(expired.length > 0){ for(const ad of expired){ await supabase.from("ads").delete().eq("id", ad.id); } }
      const live = data.filter((a:any)=> !isExpired(a));
      const newPending = live.filter((a:any)=> a.approval_status==="Pending" && !knownIds.current.has(a.id));
      if(knownIds.current.size>0 && newPending.length>0 && unlocked){
        try{ if(navigator.vibrate) navigator.vibrate([200,100,200]); }catch{}
      }
      live.forEach((a:any)=> knownIds.current.add(a.id));
      setExisting(live);
    }catch{}
  };

  const tryUnlock = () => {
    if(passwordInput === ADMIN_PASSWORD){ setUnlocked(true); setPasswordError(""); try{ sessionStorage.setItem("ceooffice9x7z2_unlocked", "yes"); }catch{} loadExisting(); }
    else setPasswordError("Wrong password. Try again.");
  };
  const lockAgain = () => { setUnlocked(false); setPasswordInput(""); try{ sessionStorage.removeItem("ceooffice9x7z2_unlocked"); }catch{} };
  const onFile = (e:any) => { const f = e.target.files?.[0]; if(!f) return; setImageFile(f); setImage(URL.createObjectURL(f)); };
  const fileToBase64 = (file:File) => new Promise<string>((resolve, reject)=>{ const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = ()=> resolve(reader.result as string); reader.onerror = reject; });
  const finalSeconds = customSeconds && !isNaN(Number(customSeconds)) && Number(customSeconds) > 0 && !isSubmitMode ? Number(customSeconds) : seconds;

  const resetForm = () => {
    setHeadline(""); setSubtext(""); setButtonText("Call Now"); setPhone(""); setImage(""); setImageFile(null);
    setCustomSeconds(""); setEditingId(null); setAdvertiserName(""); setAdvertiserEmail(""); setAdvertiserPhone("");
    setPrice(""); setPaymentStatus("Not Paid"); setStartDate(""); setEndDate(""); setApprovalStatus("Approved"); setAdEffect("None");
    setFontFamily("'Arial Black', Arial, sans-serif");
  };

  const publish = async () => {
    if(!headline.trim()){ alert("Please write Headline / Company Name"); return; }
    if(!image){ alert("Please upload Advertiser Picture"); return; }
    if(!advertiserName.trim()){ alert("Please add Advertiser Name"); return; }
    if(endDate && startDate && new Date(endDate) < new Date(startDate)){ alert("End Date cannot be before Start Date"); return; }
    setPublishing(true);
    try{
      let finalImage = image; if(imageFile) finalImage = await fileToBase64(imageFile);
      const isLink = phone.includes("http") || phone.includes("wa.me");
      const payload:any = {
        headline: headline.trim(), subtext: subtext.trim(), image: finalImage,
        buttonText: buttonText.trim(), phone: isLink ? "" : phone.trim(),
        link: isLink ? phone.trim() : "", bgColor, textColor, seconds: finalSeconds, position, active: true,
        advertiser_name: advertiserName.trim(), advertiser_email: advertiserEmail.trim(), advertiser_phone: advertiserPhone.trim(),
        price: price ? Number(price) : 0, payment_status: paymentStatus,
        start_date: startDate || null, end_date: endDate || null, approval_status: approvalStatus, adEffect: adEffect,
        fontFamily: fontFamily, font_family: fontFamily,
      };
      if(editingId){ const { error } = await supabase.from("ads").update(payload).eq("id", editingId); if(error) throw error; alert("✅ Advert Updated! Views / Clicks kept."); }
      else { const { error } = await supabase.from("ads").insert({ ...payload, views: 0, clicks: 0 }); if(error) throw error; alert(`✅ Published to ${position === 1 ? "Window 1 - BIG TOP" : "Window 2 - SMALL BASE"}!`); }
      resetForm(); loadExisting();
    }catch(e:any){ alert("Could not publish: " + e.message); }
    setPublishing(false);
  };

  const giveFreeAdvert = async () => {
    if(!advertiserName.trim()){ alert("Enter advertiser name for FREE advert"); return; }
    if(!headline.trim() && !subtext.trim()){ alert("Fill Headline / What should it say in Designer above, or type headline first"); return; }
    const s = new Date(); const e = new Date(); e.setDate(e.getDate() + Number(freeAdvertDays || 7));
    setPublishing(true);
    try{
      let finalImage = image; if(imageFile) finalImage = await fileToBase64(imageFile);
      const { error } = await supabase.from("ads").insert({
        headline: headline.trim() || advertiserName.trim(), subtext: subtext.trim() || "FREE Advert by CEO", image: finalImage || "https://via.placeholder.com/600x400?text=FREE+Advert",
        buttonText: buttonText, phone: phone, bgColor, textColor, seconds: 5, position, active: true,
        advertiser_name: advertiserName.trim(), advertiser_email: advertiserEmail.trim(), advertiser_phone: advertiserPhone.trim(),
        price: 0, payment_status: "Free", start_date: s.toISOString().split("T")[0], end_date: e.toISOString().split("T")[0],
        approval_status: "Approved", adEffect, fontFamily, font_family: fontFamily, views: 0, clicks: 0,
      });
      if(error) throw error;
      alert(`✅ FREE Advert given to ${advertiserName} - Window ${position} - ${freeAdvertDays} Days. Ends ${e.toLocaleDateString()}`);
      loadExisting();
    }catch(err:any){ alert("Failed: " + err.message); }
    setPublishing(false);
  };

  const editAd = (ad:any) => {
    setEditingId(ad.id); setPosition(ad.position === 2 ? 2 : 1); setImage(ad.image || ""); setImageFile(null);
    setHeadline(ad.headline || ""); setSubtext(ad.subtext || ""); setButtonText(ad.buttonText || "Call Now");
    setPhone(ad.link || ad.phone || ""); setBgColor(ad.bgColor || ad.background || "#15803d"); setTextColor(ad.textColor || ad.text || "#ffffff");
    setSeconds(ad.seconds || ad.duration || 5);
    setAdvertiserName(ad.advertiser_name || ad.agent_name || ""); setAdvertiserEmail(ad.advertiser_email || ad.agent_email || ""); setAdvertiserPhone(ad.advertiser_phone || ad.phone || "");
    setPrice(ad.price ? String(ad.price) : ""); setPaymentStatus(ad.payment_status || "Not Paid");
    setStartDate(ad.start_date || ""); setEndDate(ad.end_date || ""); setApprovalStatus(ad.approval_status || "Approved"); setAdEffect(ad.adEffect || "None");
    setFontFamily(ad.fontFamily || ad.font_family || "'Arial Black', Arial, sans-serif");
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const loadPendingIntoDesigner = (ad:any) => {
    editAd(ad);
    if(ad.client_color_wish){
      const wish = String(ad.client_color_wish).toLowerCase();
      if(wish.includes("green")) setBgColor("#15803d");
      else if(wish.includes("blue")) setBgColor("#1e40af");
      else if(wish.includes("black")) setBgColor("#000000");
      else if(wish.includes("purple")) setBgColor("#7C3AED");
      else if(wish.includes("red")) setBgColor("#DC2626");
      else if(wish.includes("orange")) setBgColor("#EA580C");
    }
    alert("✅ Loaded! Now pick Font + Final Colours + Effect below, then Approve & Publish.");
  };

  const toggleActive = async (ad:any) => { await supabase.from("ads").update({active: !ad.active}).eq("id", ad.id); loadExisting(); };
  const deleteAd = async (id:number) => { if(!confirm("Delete this advert?")) return; await supabase.from("ads").delete().eq("id", id); loadExisting(); };
  const setApproval = async (ad:any, status:string) => { await supabase.from("ads").update({approval_status: status}).eq("id", ad.id); loadExisting(); };
  const markPaid = async (ad:any) => { await supabase.from("ads").update({payment_status: "Paid"}).eq("id", ad.id); loadExisting(); };

  const submitAdvertiserAd = async () => {
    if(!subName.trim() || !subHeadline.trim() || !subPhone.trim()){ alert("Please fill Name, Headline and Phone"); return; }
    if(!subEmail.trim()){ alert("Please fill Email for Paystack receipt"); return; }
    setSubSubmitting(true);
    try{
      const loaded = await loadPaystack();
      if(!loaded){ alert("Paystack failed to load. Check internet."); setSubSubmitting(false); return; }
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if(!publicKey){ alert("Paystack Public Key missing"); setSubSubmitting(false); return; }
      const reference = "AD" + Date.now() + Math.floor(Math.random() * 1000);
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: subEmail.trim(),
        amount: selectedAdvert.price * 100,
        currency: "NGN",
        ref: reference,
        metadata: { buyerName: subName.trim(), buyerPhone: subPhone.trim(), packageName: selectedAdvert.name, packagePrice: selectedAdvert.price },
        callback: async function (response: any) {
          try{
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: response.reference, expectedAmount: selectedAdvert.price, buyerName: subName.trim(), buyerPhone: subPhone.trim(), packageName: selectedAdvert.name, packagePrice: selectedAdvert.price }),
            });
            const verifyData = await verifyRes.json();
            if(!verifyData.ok){ alert("Payment verification failed: " + (verifyData.error || "Try again")); setSubSubmitting(false); return; }
            const start = new Date();
            const end = new Date(); end.setDate(end.getDate() + selectedAdvert.durationDays);
            const { error } = await supabase.from("ads").insert({
              headline: subHeadline.trim(), subtext: subText.trim(), image: subImage || "https://via.placeholder.com/600x400?text=Advert",
              buttonText: "Call Now", phone: subPhone.trim(), bgColor: "#15803d", textColor: "#ffffff",
              seconds: 5, position: selectedAdvert.position, active: false, advertiser_name: subName.trim(),
              advertiser_email: subEmail.trim(), advertiser_phone: subPhone.trim(),
              price: selectedAdvert.price, payment_status: "Paid", approval_status: "Pending", adEffect: subEffect,
              views: 0, clicks: 0,
              start_date: start.toISOString().split("T")[0],
              end_date: end.toISOString().split("T")[0],
              client_message: `Paid ₦${selectedAdvert.price} for ${selectedAdvert.name} - ${selectedAdvert.durationDays} Days. Waiting CEO scrutiny. If picture is already prepared, use it. If not, please prepare for me.`,
            });
            if(error) throw error;
            alert(`✅ Payment Verified + Submitted! ${selectedAdvert.name} - ₦${selectedAdvert.price.toLocaleString()} - ${selectedAdvert.durationDays} Days. CEO will scrutinise and post it.`);
            setSubName(""); setSubEmail(""); setSubPhone(""); setSubHeadline(""); setSubText(""); setSubImage(""); setSubEffect("None");
          }catch(e:any){ alert("Could not submit: " + e.message); }
          setSubSubmitting(false);
        },
        onClose: function(){ setSubSubmitting(false); },
      });
      handler.openIframe();
    }catch(e:any){ alert("Could not submit: " + e.message); setSubSubmitting(false); }
  };

  if(isSubmitMode){
    return (
      <main className="min-h-screen bg-[#f3e8ff] p-4 flex justify-center">
        <div className="bg-white rounded-2xl max-w-[520px] w-full p-5 shadow h-fit mt-6">
          <h1 className="font-black text-[20px] text-[#7C3AED]">📢 Submit Your Advert</h1>
          <p className="text-[12px] text-gray-500 mt-1">Pay first. After payment is confirmed, your picture + write-up goes to CEO for scrutiny. CEO will prepare / scrutinise and post it.</p>
          <p className="font-bold text-[13px] mt-4">Select Advert Package - Pay First:</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ADVERT_PRICES.map((p) => (
              <button key={p.name} type="button" onClick={() => setSelectedAdvert(p)} className={`text-left border-2 rounded-xl p-3 ${selectedAdvert.name === p.name ? "border-[#7C3AED] bg-[#e9d5ff]" : "border-gray-200 bg-[#f2f2f2]"}`}>
                <b className="text-[13px]">{p.name}</b><br/><b>₦{p.price.toLocaleString()}</b><br/><span className="text-[11px]">{p.desc}</span><br/><span className="text-[11px] font-bold text-[#7C3AED]">{selectedAdvert.name === p.name ? "✓ Selected" : "Tap to select →"}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 rounded-xl bg-[#f3e8ff] border border-purple-200 p-3 text-[13px] flex justify-between">
            <span><b>Package: </b>{selectedAdvert.name}</span><span><b>Amount: </b>₦{selectedAdvert.price.toLocaleString()}</span>
          </div>
          <label className="block text-[13px] font-bold mt-4">Your Name</label><input value={subName} onChange={e=>setSubName(e.target.value)} placeholder="e.g. Musa Ibrahim" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
          <label className="block text-[13px] font-bold mt-3">Email (for Paystack receipt)</label><input value={subEmail} onChange={e=>setSubEmail(e.target.value)} placeholder="you@email.com" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
          <label className="block text-[13px] font-bold mt-3">Phone / WhatsApp</label><input value={subPhone} onChange={e=>setSubPhone(e.target.value)} placeholder="080..." className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
          <label className="block text-[13px] font-bold mt-3">Advert Headline</label><input value={subHeadline} onChange={e=>setSubHeadline(e.target.value)} placeholder="e.g. Abuja Best Furniture" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
          <label className="block text-[13px] font-bold mt-3">What should it say? (Write-up)</label><input value={subText} onChange={e=>setSubText(e.target.value)} placeholder="e.g. 50% Off" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
          <label className="block text-[13px] font-bold mt-3">Picture / Already Prepared Advert Link (or leave blank - CEO office will prepare)</label><input value={subImage} onChange={e=>setSubImage(e.target.value)} placeholder="https://..." className="w-full bg-[#f2f2f2] rounded-xl p-3 mt-1 text-[13px] outline-none" />
          <label className="block text-[13px] font-bold mt-4">Pick Effect - What Do You Want?</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[{name:"None", emoji:"⬜"},{name:"Grass", emoji:"🌿"},{name:"Cloud", emoji:"☁️"},{name:"Sun", emoji:"☀️"},{name:"Slides", emoji:"🎞️"},{name:"Rain", emoji:"🌧️"}].map(e=>(
              <button key={e.name} type="button" onClick={()=>setSubEffect(e.name)} className={`h-[42px] rounded-xl font-bold text-[12px] border-2 ${subEffect===e.name ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-[#f2f2f2] border-gray-200"}`}>{e.emoji} {e.name}</button>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Picked: {subEffect} — This will show on homepage advert.</p>
          <button onClick={submitAdvertiserAd} disabled={subSubmitting} className="w-full bg-green-600 text-white h-[48px] rounded-full font-black text-[14px] mt-5 disabled:opacity-50">{subSubmitting ? "Verifying Payment..." : `Pay ₦${selectedAdvert.price.toLocaleString()} → Verify → Send Material`}</button>
          <Link href="/" className="block text-center mt-3 text-[12px] text-blue-600 font-bold underline">Back to Homepage</Link>
        </div>
      </main>
    );
  }

  if(checking) return <div className="min-h-screen flex items-center justify-center bg-[#f3e8ff]"><p className="font-bold">Loading...</p></div>;
  if(!unlocked){
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3e8ff] p-4">
        <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 text-center shadow">
          <p className="text-[40px]">🔒</p><h1 className="font-black text-[20px] mt-2">CEO Office - Private</h1>
          <p className="text-[13px] text-gray-500 mt-2">Enter your admin password to open Ads Creator.</p>
          <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") tryUnlock(); }} placeholder="Enter admin password" className="w-full bg-[#f2f2f2] rounded-xl p-3 mt-4 text-[14px] outline-none text-center" />
          {passwordError && <p className="text-red-600 text-[12px] font-bold mt-2">{passwordError}</p>}
          <button onClick={tryUnlock} className="w-full bg-black text-white h-[46px] rounded-full font-black text-[14px] mt-3">Unlock →</button>
          <Link href="/" className="block mt-3 text-[12px] text-blue-600 font-bold underline">Back to Homepage</Link>
          <Link href="/ceooffice9x7z2/ads?submit=1" className="block mt-2 text-[12px] text-[#7C3AED] font-bold underline">Advertiser? Submit your advert here →</Link>
        </div>
      </div>
    );
  }

  const previewAd = { headline: headline || "e.g. Abuja Best Furniture", subtext: subtext || "e.g. 50% Off - Free Delivery in Abuja", image, buttonText, seconds: finalSeconds, bgColor, textColor };
  const filtered = existing.filter((ad:any)=>{
    if(filter==="All") return true; if(filter==="Pending") return ad.approval_status==="Pending";
    if(filter==="Approved") return ad.approval_status==="Approved"; if(filter==="Paid") return ad.payment_status==="Paid";
    if(filter==="Not Paid") return ad.payment_status==="Not Paid";
    if(filter==="Active") return ad.active && !isExpired(ad);
    if(filter==="Expired") return isExpired(ad);
    return true;
  });
  const totalViews = existing.reduce((s,a)=> s + (a.views||0), 0);
  const totalClicks = existing.reduce((s,a)=> s + (a.clicks||0), 0);
  const pendingAll = existing.filter((a:any)=> a.approval_status === "Pending");
  const pendingRequests = pendingAll.filter((a:any)=>{
    if(pendingFilter==="Paid") return a.payment_status==="Paid";
    if(pendingFilter==="NotPaid") return a.payment_status!=="Paid";
    return true;
  });

  return (
    <main className="min-h-screen bg-[#f3e8ff] p-3 md:p-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/ceooffice9x7z2" className="text-[12px] font-bold underline">← Back to CEO Office</Link>
          <button onClick={lockAgain} className="bg-red-100 text-red-600 px-4 h-[32px] rounded-full text-[12px] font-bold">🔒 Lock</button>
        </div>
        <h1 className="font-black text-[22px] md:text-[28px] text-[#7C3AED] mt-2">✨ AI Ads Creator - CEO Only</h1>
        <p className="text-[13px] mt-1">Upload picture → Tap Colour → Pick Font → Set Seconds → Preview → Publish</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="bg-white px-3 py-1 rounded-full text-[12px] font-bold">👁️ Total Views: {totalViews}</span>
          <span className="bg-white px-3 py-1 rounded-full text-[12px] font-bold">👆 Total Clicks: {totalClicks}</span>
          <span className="bg-white px-3 py-1 rounded-full text-[12px] font-bold">📢 Adverts: {existing.length}</span>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[12px] font-bold">📥 Pending Requests: {pendingAll.length}</span>
          <button onClick={enableBuzz} className={`px-3 py-1 rounded-full text-[12px] font-bold ${notifOn ? "bg-green-600 text-white" : "bg-black text-white"}`}>{notifOn ? "🔔 Phone Buzz ON ✅" : "🔔 Allow Phone Buzz - Click Here"}</button>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.origin + "/ceooffice9x7z2/ads?submit=1"); alert("Submit link copied! Share to advertisers.");}} className="bg-[#7C3AED] text-white px-3 py-1 rounded-full text-[12px] font-bold">Copy Advertiser Submit Link</button>
        </div>

        <div className="bg-white rounded-2xl p-4 mt-4 shadow border-2 border-green-300">
          <h2 className="font-black text-[15px] text-green-700">🎁 Give FREE Advert (CEO Power) - With Duration</h2>
          <p className="text-[12px] text-gray-500 mt-1">Fill Designer below (Headline + Picture + Colours), then set days here and give FREE. It auto stops on End Date.</p>
          <div className="flex gap-2 mt-3 flex-wrap items-center">
            <span className="text-[13px] font-bold">FREE Duration (Days):</span>
            <input type="number" value={freeAdvertDays} onChange={e=>setFreeAdvertDays(Number(e.target.value))} className="w-[110px] border-2 border-[#d8b4fe] rounded-xl p-2 text-[13px]" />
            <span className="text-[12px] text-gray-500">Ends: {new Date(Date.now() + (freeAdvertDays||7)*24*60*60*1000).toLocaleDateString()}</span>
            <button onClick={giveFreeAdvert} disabled={publishing} className="bg-green-600 text-white px-5 h-[42px] rounded-full font-black text-[13px] disabled:opacity-50">{publishing ? "Giving..." : "Give FREE Advert →"}</button>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Uses Advertiser Name + Headline + Picture from Designer below. Price = ₦0, Payment = Free, Approval = Approved.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 mt-4 shadow border-2 border-orange-300">
          <h2 className="font-black text-[16px] text-orange-600">📥 Pending Advert Requests From Clients ({pendingRequests.length})</h2>
          <p className="text-[12px] text-gray-500 mt-1">Clients who paid for Advert on Upload Page OR submitted via Submit form. NOT live yet. Click “Use This Request” to load their picture + headline + wishes into Designer below.</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button onClick={()=>setPendingFilter("All")} className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${pendingFilter==="All"?"bg-black text-white":"bg-gray-100"}`}>All Pending ({pendingAll.length})</button>
            <button onClick={()=>setPendingFilter("Paid")} className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${pendingFilter==="Paid"?"bg-green-600 text-white":"bg-green-100 text-green-700"}`}>✅ Paid Only ({pendingAll.filter((a:any)=>a.payment_status==="Paid").length})</button>
            <button onClick={()=>setPendingFilter("NotPaid")} className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${pendingFilter==="NotPaid"?"bg-red-600 text-white":"bg-red-100 text-red-700"}`}>❌ Not Paid Only ({pendingAll.filter((a:any)=>a.payment_status!=="Paid").length})</button>
            <button onClick={loadExisting} className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#f3e8ff]">🔄 Refresh</button>
          </div>
          {pendingRequests.length === 0 && <p className="text-[12px] text-gray-400 bg-gray-50 rounded-xl p-3 mt-3 text-center">No pending requests in this filter. When a client pays for Window 1 / Window 2 Advert, it will appear here.</p>}
          <div className="space-y-3 mt-3">
            {pendingRequests.map((ad:any)=>(
              <div key={ad.id} className="border-2 border-orange-100 rounded-xl p-3 bg-orange-50/50">
                <div className="flex gap-3 flex-wrap">
                  <div className="w-[140px] shrink-0">
                    {ad.image ? <img src={ad.image} className="w-full h-[100px] object-cover rounded-lg border" alt="Client picture" /> : <div className="w-full h-[100px] bg-gray-200 rounded-lg flex items-center justify-center text-[11px]">No Picture</div>}
                    <p className="text-[10px] font-bold text-center mt-1">🖼️ Picture they want us to use</p>
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <p className="font-black text-[14px]" style={{ fontFamily: ad.fontFamily || ad.font_family || "'Arial Black', sans-serif" }}>{ad.headline}</p>
                    <p className="text-[12px] text-gray-600">{ad.subtext || ad.subtitle}</p>
                    <div className={`mt-2 p-2 rounded-lg text-[12px] font-black ${ad.payment_status==="Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                      {ad.payment_status==="Paid" ? "✅ PAID - You can Approve" : ad.payment_status==="Free" ? "🎁 FREE - CEO Given" : "❌ NOT PAID - Do NOT Approve Yet"} • 💰 ₦{ad.price||0} • Ref: {ad.payment_ref || "No Ref"} • 📅 {ad.start_date||"—"} → {ad.end_date||"—"}
                    </div>
                    <p className="text-[12px] font-bold mt-1">🪟 Category Paid For: {ad.position===1 ? "Window 1 - BIG TOP" : "Window 2 - SMALL BASE"} • ⏱️ {ad.seconds||5}s • 👤 {ad.advertiser_name || ad.agent_name || "—"} • 📞 {ad.advertiser_phone || ad.phone || "—"} • ✉️ {ad.advertiser_email || ad.agent_email || "—"}</p>
                    <div className="bg-white rounded-lg p-2 mt-2 text-[12px] border">
                      <b>💬 Client Wish:</b><br />
                      🎨 Colour Wish: <b>{ad.client_color_wish || "No colour wish - CEO choose"}</b> • ✍️ Font Wish: <b>{ad.client_font_wish || "No font wish - CEO choose"}</b><br />
                      📝 Message to CEO: <span>{ad.client_message || ad.ad_request_note || "No message - CEO design as you like"}</span><br />
                      {ad.property_id && <span>🏠 Linked Property ID: {ad.property_id}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button onClick={()=>loadPendingIntoDesigner(ad)} className="bg-[#7C3AED] text-white px-4 py-2 rounded-full text-[12px] font-black">✨ Use This Request → Load Into Designer</button>
                  <button onClick={()=>setApproval(ad, "Approved")} className="bg-green-600 text-white px-4 py-2 rounded-full text-[12px] font-bold">Approve As-Is ✅</button>
                  <button onClick={()=>setApproval(ad, "Rejected")} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-[12px] font-bold">Reject</button>
                  {ad.payment_status !== "Paid" && ad.payment_status !== "Free" && <button onClick={()=>markPaid(ad)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-[12px] font-bold">Mark as Paid</button>}
                  <button onClick={()=>deleteAd(ad.id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-[12px] font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 mt-4 shadow">
          <h2 className="font-black text-[14px]">0. WHERE are you uploading to? — Tap One</h2>
          <p className="text-[12px] text-gray-500 mt-1">This is exactly how it looks on homepage. Left = Feedback at base, Middle = Video, Right = Your 2 Advert Windows.</p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="flex flex-col justify-end min-h-[180px] bg-[#f8f8f8] rounded-xl p-2 border"><div className="bg-black text-white text-center text-[10px] font-black rounded-full py-2 px-1">💬 Report Issue / Feedback</div><p className="text-[9px] text-center text-gray-400 mt-1">LEFT - BASE</p></div>
            <div className="bg-black rounded-xl overflow-hidden relative min-h-[180px] flex items-center justify-center"><span className="text-white text-[24px]">▶️</span><span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1 rounded">VIDEO AD</span><p className="absolute top-1 left-1 bg-white/90 text-[8px] font-black px-1 rounded">MIDDLE</p></div>
            <div className="flex flex-col gap-2">
              <button onClick={()=>setPosition(1)} className={`flex-1 rounded-xl overflow-hidden border-4 text-left ${position===1 ? "border-[#7C3AED] shadow-lg" : "border-gray-200 opacity-70"}`}><div className="bg-[#15803d] text-white p-2 text-center"><p className="font-black text-[10px] leading-tight">WINDOW 1 - BIG</p><p className="text-[8px]">TOP - RIGHT</p></div><div className="bg-gray-100 h-[50px] flex items-center justify-center text-[20px]">🖼️</div>{position===1 && <p className="bg-[#7C3AED] text-white text-center text-[10px] font-black py-1">✅ YOU ARE HERE - UPLOADING TO BIG TOP</p>}{position!==1 && <p className="bg-gray-200 text-center text-[10px] py-1">Tap to upload here</p>}</button>
              <button onClick={()=>setPosition(2)} className={`rounded-xl overflow-hidden border-4 text-left ${position===2 ? "border-[#7C3AED] shadow-lg" : "border-gray-200 opacity-70"}`}><div className="bg-[#1e293b] text-white p-1.5 text-center"><p className="font-black text-[9px] leading-tight">WINDOW 2 - SMALL</p><p className="text-[8px]">BASE - RIGHT</p></div><div className="bg-gray-100 h-[30px] flex items-center justify-center text-[14px]">🖼️</div>{position===2 && <p className="bg-[#7C3AED] text-white text-center text-[10px] font-black py-1">✅ YOU ARE HERE - UPLOADING TO SMALL BASE</p>}{position!==2 && <p className="bg-gray-200 text-center text-[10px] py-1">Tap to upload here</p>}</button>
            </div>
          </div>
          <div className="flex gap-2 mt-3"><button onClick={()=>setPosition(1)} className={`flex-1 h-[42px] rounded-full font-black text-[13px] ${position===1 ? "bg-[#7C3AED] text-white" : "bg-[#f2f2f2]"}`}>Window 1 - Big Top</button><button onClick={()=>setPosition(2)} className={`flex-1 h-[42px] rounded-full font-black text-[13px] ${position===2 ? "bg-[#7C3AED] text-white" : "bg-[#f2f2f2]"}`}>Window 2 - Small Base</button></div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow">
            <h2 className="font-black text-[15px] text-[#7C3AED]">{editingId ? "Editing Advert - Fix It Then Publish Again" : "Create New Advert"}</h2>
            <label className="block text-[13px] font-bold mt-4">1. Upload Advertiser Picture</label>
            <input type="file" accept="image/*" onChange={onFile} className="w-full border-2 border-[#d8b4fe] rounded-xl p-2 mt-1 text-[13px]" />
            <input value={image} onChange={e=>setImage(e.target.value)} placeholder="Or paste image link here - https://..." className="w-full bg-[#f2f2f2] rounded-xl p-3 mt-2 text-[13px] outline-none" />
            <label className="block text-[13px] font-bold mt-4">2. Headline / Company Name</label><input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. Abuja Best Furniture" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
            <label className="block text-[13px] font-bold mt-4">3. What should it say?</label><input value={subtext} onChange={e=>setSubtext(e.target.value)} placeholder="e.g. 50% Off - Free Delivery in Abuja" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="block text-[13px] font-bold">4. Button Text</label><input value={buttonText} onChange={e=>setButtonText(e.target.value)} className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" /></div>
              <div><label className="block text-[13px] font-bold">5. Phone / WhatsApp Link</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="https://wa.me/234... or tel:080..." className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="block text-[13px] font-bold">Background Colour</label><div className="flex gap-2 mt-1 flex-wrap">{["#15803d","#1e293b","#7C3AED","#DC2626","#EA580C","#000000"].map(c=>(<button key={c} onClick={()=>setBgColor(c)} className={`w-8 h-8 rounded-full border-2 ${bgColor===c ? "border-black scale-110" : "border-gray-300"}`} style={{backgroundColor:c}} />))}<input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="w-8 h-8 rounded-full" /></div></div>
              <div><label className="block text-[13px] font-bold">Text Colour</label><div className="flex gap-2 mt-1">{["#ffffff","#000000","#fbbf24"].map(c=>(<button key={c} onClick={()=>setTextColor(c)} className={`w-8 h-8 rounded-full border-2 ${textColor===c ? "border-black scale-110" : "border-gray-300"}`} style={{backgroundColor:c}} />))}<input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="w-8 h-8 rounded-full" /></div></div>
            </div>
            <label className="block text-[13px] font-bold mt-4">✍️ 5b. Pick Beautiful Font</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {FONTS.map(f=>(
                <button key={f.value} type="button" onClick={()=>setFontFamily(f.value)} className={`p-2 rounded-xl border-2 text-left ${fontFamily===f.value ? "border-[#7C3AED] bg-[#f3e8ff]" : "border-gray-200 bg-[#f2f2f2]"}`}>
                  <span className="block text-[11px] text-gray-500">{f.name}</span>
                  <span className="block text-[15px] font-bold leading-tight truncate" style={{ fontFamily: f.value }}>Abuja Best</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Picked Font: {FONTS.find(f=>f.value===fontFamily)?.name}</p>
            <label className="block text-[13px] font-bold mt-4">6. HOW MANY SECONDS should this ad stay?</label>
            <select value={seconds} onChange={e=>setSeconds(Number(e.target.value))} className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px]"><option value={3}>3 seconds - Fast</option><option value={5}>5 seconds - Normal</option><option value={10}>10 seconds - Long</option><option value={15}>15 seconds - Very Long</option><option value={30}>30 seconds - Extra Long</option></select>
            <input value={customSeconds} onChange={e=>setCustomSeconds(e.target.value)} placeholder="Or type your own seconds here, e.g. 7" className="w-full bg-[#f2f2f2] rounded-xl p-3 mt-2 text-[13px] outline-none" />
            <label className="block text-[13px] font-bold mt-4">7. Pick Effect - What Client Wants?</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[{name:"None", emoji:"⬜"},{name:"Grass", emoji:"🌿"},{name:"Cloud", emoji:"☁️"},{name:"Sun", emoji:"☀️"},{name:"Slides", emoji:"🎞️"},{name:"Rain", emoji:"🌧️"}].map(e=>(
                <button key={e.name} onClick={()=>setAdEffect(e.name)} className={`h-[42px] rounded-xl font-bold text-[12px] border-2 ${adEffect===e.name ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-[#f2f2f2] border-gray-200"}`}>{e.emoji} {e.name}</button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Picked: {adEffect}</p>
            <div className="bg-[#f3e8ff] rounded-xl p-3 mt-5">
              <h3 className="font-black text-[14px] text-[#7C3AED]">💰 A. Money + Advertiser Details</h3>
              <label className="block text-[13px] font-bold mt-3">Advertiser Name *</label><input value={advertiserName} onChange={e=>setAdvertiserName(e.target.value)} placeholder="Who paid?" className="w-full border-2 border-white rounded-xl p-3 mt-1 text-[13px] outline-none" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><label className="block text-[12px] font-bold">Advertiser Phone</label><input value={advertiserPhone} onChange={e=>setAdvertiserPhone(e.target.value)} placeholder="080..." className="w-full border-2 border-white rounded-xl p-3 mt-1 text-[13px] outline-none" /></div>
                <div><label className="block text-[12px] font-bold">Advertiser Email</label><input value={advertiserEmail} onChange={e=>setAdvertiserEmail(e.target.value)} placeholder="email" className="w-full border-2 border-white rounded-xl p-3 mt-1 text-[13px] outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><label className="block text-[12px] font-bold">Price (₦)</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="e.g. 8000" className="w-full border-2 border-white rounded-xl p-3 mt-1 text-[13px] outline-none" /></div>
                <div><label className="block text-[12px] font-bold">Payment Status</label><select value={paymentStatus} onChange={e=>setPaymentStatus(e.target.value)} className="w-full border-2 border-white rounded-xl p-3 mt-1 text-[13px]"><option>Paid</option><option>Not Paid</option><option>Free</option></select></div>
              </div>
              <label className="block text-[12px] font-bold mt-2">Approval</label><select value={approvalStatus} onChange={e=>setApprovalStatus(e.target.value)} className="w-full border-2 border-white rounded-xl p-3 mt-1 text-[13px]"><option>Approved</option><option>Pending</option><option>Rejected</option></select>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 mt-4">
              <h3 className="font-black text-[14px]">📅 START DATE + END DATE</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><label className="block text-[12px] font-bold">Start Date</label><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full border rounded-xl p-3 mt-1 text-[13px]" /></div>
                <div><label className="block text-[12px] font-bold">End Date - Auto Stops</label><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full border rounded-xl p-3 mt-1 text-[13px]" /></div>
              </div>
            </div>
            <button onClick={publish} disabled={publishing} className="w-full bg-black text-white h-[48px] rounded-full font-black text-[14px] mt-5 disabled:opacity-50">{publishing ? "Publishing..." : editingId ? `Update Advert → Window ${position}` : `Publish to Window ${position} ${position===1 ? "- BIG TOP" : "- SMALL BASE"} →`}</button>
            {editingId && <button onClick={resetForm} className="w-full bg-[#f2f2f2] h-[42px] rounded-full font-bold text-[13px] mt-2">Cancel Edit</button>}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow">
              <h2 className="font-black text-[15px]">👀 PREVIEW — How It Will Look On Homepage</h2>
              <p className="text-[12px] text-gray-500 mt-1">Window {position} — {position===1 ? "BIG TOP" : "SMALL BASE"} • Effect: {adEffect} • Font: {FONTS.find(f=>f.value===fontFamily)?.name}</p>
              <div className="mt-3">
                <div className="bg-white rounded-xl overflow-hidden border shadow-sm max-w-[320px] mx-auto">
                  <div className="relative overflow-hidden">
                    {previewAd.image ? <img src={previewAd.image} className={`w-full object-cover ${position===2 ? "h-[140px]" : "aspect-[4/3]"}`} alt="Preview" /> : <div className={`w-full bg-gray-200 flex items-center justify-center ${position===2 ? "h-[140px]" : "aspect-[4/3]"}`}>No Picture Yet</div>}
                    <span className="absolute top-2 left-2 bg-white/90 text-[9px] font-black px-2 py-0.5 rounded-full">AD • SPONSORED</span>
                    <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full">{finalSeconds}s</span>
                    {adEffect==="Sun" && <div className="absolute top-2 right-2 text-[28px] animate-pulse">☀️</div>}
                    {adEffect==="Cloud" && <div className="absolute top-1 left-0 w-full text-[22px] whitespace-nowrap animate-bounce">☁️ ☁️ ☁️ ☁️</div>}
                    {adEffect==="Rain" && <div className="absolute top-0 left-0 w-full text-center text-[16px] opacity-70">🌧️ 🌧️ 🌧️ 🌧️ 🌧️</div>}
                    {adEffect==="Grass" && <div className="absolute bottom-0 left-0 w-full text-center text-[20px] bg-green-600/20">🌿🌿🌿🌿🌿🌿🌿</div>}
                    {adEffect==="Slides" && <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">🎞️ Slides Effect</div>}
                  </div>
                  <div className="p-3 text-center" style={{backgroundColor:previewAd.bgColor, color:previewAd.textColor, fontFamily: fontFamily}}>
                    <p className="font-black text-[15px] leading-tight">{previewAd.headline}</p><p className="text-[11px] mt-1">{previewAd.subtext}</p>
                    {position===1 && <button className="mt-2 border-2 border-white rounded-full px-4 py-1 text-[12px] font-black">{previewAd.buttonText || "Call Now"}</button>}
                    {position===2 && <p className="text-[10px] mt-1 opacity-80">Button: {previewAd.buttonText || "Call Now"} (shows on homepage)</p>}
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-3 text-[12px]"><b>Check before Publish:</b><br/>- Picture clear? • Headline readable? • Button correct? • Seconds {finalSeconds}s? • Effect: {adEffect} • Font: {FONTS.find(f=>f.value===fontFamily)?.name} • Price ₦{price || "0"} • {paymentStatus} • {startDate || "No start"} → {endDate || "No end"}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow">
              <h2 className="font-black text-[15px]">Your Adverts In Supabase ({filtered.length})</h2>
              <div className="flex gap-1 mt-2 flex-wrap">{["All","Pending","Approved","Paid","Not Paid","Active","Expired"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded-full text-[11px] font-bold ${filter===f ? "bg-black text-white" : "bg-[#f2f2f2]"}`}>{f}</button>))}</div>
              <div className="space-y-2 mt-3">
                {filtered.length===0 && <p className="text-[12px] text-gray-400">No adverts yet.</p>}
                {filtered.map((ad:any)=>(
                  <div key={ad.id} className="border rounded-xl p-2">
                    <div className="flex gap-2 items-center">
                      {ad.image && <img src={ad.image} className="w-[70px] h-[50px] object-cover rounded" alt="" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[12px] truncate" style={{ fontFamily: ad.fontFamily || ad.font_family || undefined }}>{ad.headline} <span className="bg-[#7C3AED] text-white text-[9px] px-1 rounded">W{ad.position}</span> <span className="text-[9px] text-gray-400">{ad.seconds}s</span></p>
                        <p className="text-[11px] text-gray-500 truncate">{ad.subtext}</p>
                        <p className="text-[11px] font-bold">👤 {ad.advertiser_name || ad.agent_name || "—"} • ₦{ad.price || 0} • {ad.payment_status || "Not Paid"} • ✨ {ad.adEffect || "None"}</p>
                        <p className="text-[10px] text-gray-500">📅 {ad.start_date || "—"} → {ad.end_date || "—"} • {isExpired(ad) ? "🔴 EXPIRED" : "🟢 ACTIVE"} • {ad.approval_status || "Approved"}</p>
                        <p className="text-[10px]">👁️ {ad.views||0} views • 👆 {ad.clicks||0} clicks • {ad.active ? "✅ Active" : "⏸️ Paused"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <button onClick={()=>editAd(ad)} className="bg-black text-white px-2 py-1 rounded-full text-[10px] font-bold">Edit</button>
                      <button onClick={()=>toggleActive(ad)} className="bg-[#f2f2f2] px-2 py-1 rounded-full text-[10px] font-bold">{ad.active ? "Pause" : "Activate"}</button>
                      <button onClick={()=>setApproval(ad, "Approved")} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">Approve</button>
                      <button onClick={()=>setApproval(ad, "Rejected")} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-[10px] font-bold">Reject</button>
                      {ad.payment_status !== "Paid" && ad.payment_status !== "Free" && <button onClick={()=>markPaid(ad)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-bold">Mark Paid</button>}
                      <button onClick={()=>deleteAd(ad.id)} className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-[10px] font-bold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
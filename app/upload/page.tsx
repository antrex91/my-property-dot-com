"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const PACKAGES = [
  { name: "5 Day Free", price: 0, type: "static", duration: "5 Days", desc: "Static + Sliding • 5 Days", maxImages: 5, maxVideoSec: 0 },
  { name: "Static", price: 6500, type: "static", duration: "1 Month / First 20 Users 2 Months", desc: "5 Sliding Pictures • 1 Month\nFirst 20 Users • 2 Months", maxImages: 5, maxVideoSec: 0 },
  { name: "Premium Video", price: 12500, type: "video", duration: "2 Months", desc: "60 Sec Video • 2 Months", maxImages: 0, maxVideoSec: 60 },
  { name: "COMBO", price: 16000, type: "combo", duration: "2 Months 2 Weeks", desc: "1 Min 20 Sec Video • 2 Months 2 Weeks", maxImages: 5, maxVideoSec: 80 },
];

const ADVERT_PACKAGES = [
  { name: "Small Base Advert", price: 8000, desc: "Small Base • 7 Days" },
  { name: "Big Top Advert", price: 15000, desc: "Big Top Window • 14 Days" },
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

export default function UploadPage() {
  const [selected, setSelected] = useState(PACKAGES[1]);
  const [paying, setPaying] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [paid, setPaid] = useState(false);
  const [paidPackage, setPaidPackage] = useState<any>(null);
  const [hasUsedFree, setHasUsedFree] = useState(false);
  const [freeExpiry, setFreeExpiry] = useState("");
  const [title, setTitle] = useState("");
  const [propPrice, setPropPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState("");
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const visiblePackages = hasUsedFree ? PACKAGES.filter(p => p.name !== "5 Day Free") : PACKAGES;

  useEffect(() => {
    setAgentName(localStorage.getItem("agent_name") || "");
    setAgentEmail(localStorage.getItem("agent_email") || "");
    const freeUsed = localStorage.getItem("free_used");
    const freeExpiryStored = localStorage.getItem("free_expiry");
    if (freeUsed === "true") {
      setHasUsedFree(true);
      if (freeExpiryStored) setFreeExpiry(freeExpiryStored);
      setSelected(PACKAGES[1]);
    }
    const saved = localStorage.getItem("paid_package");
    if (saved) {
      const p = JSON.parse(saved);
      setPaid(true);
      setPaidPackage(p);
      setSelected(p);
    }
  }, []);

  const unlockUpload = (pkg: any) => {
    if (pkg.name === "5 Day Free") {
      const expiry = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const expiryStr = expiry.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
      localStorage.setItem("free_used", "true");
      localStorage.setItem("free_used_date", new Date().toISOString());
      localStorage.setItem("free_expiry", expiryStr);
      setHasUsedFree(true);
      setFreeExpiry(expiryStr);
    }
    setPaid(true);
    setPaidPackage(pkg);
    localStorage.setItem("paid_package", JSON.stringify(pkg));
  };

  const handlePay = async () => {
    const buyerId = localStorage.getItem("agent_id");
    if (!buyerId) { alert("Please register as Agent first"); window.location.href = "/agent-register"; return; }
    if (!agentPhone.trim()) { alert("Enter phone"); return; }
    if (!agentEmail.trim()) { alert("Enter email for receipt"); return; }
    if (selected.name === "5 Day Free" && hasUsedFree) {
      alert("❌ You have already used your FREE package once. It is once only. Please choose a paid package.");
      return;
    }
    if (selected.price === 0) {
      alert(`✅ 5 Day Free Confirmed! Valid for 5 days only. You can now upload STATIC pictures only. This FREE is once only.`);
      unlockUpload(selected);
      return;
    }
    setPaying(true);
    const loaded = await loadPaystack();
    if (!loaded) { alert("Paystack failed to load. Check internet."); setPaying(false); return; }
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) { alert("Paystack Public Key missing"); setPaying(false); return; }
    const reference = "MP" + Date.now() + Math.floor(Math.random() * 1000);
    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email: agentEmail.trim(),
      amount: selected.price * 100,
      currency: "NGN",
      ref: reference,
      metadata: { buyerId, buyerName: agentName || "Agent", buyerPhone: agentPhone, packageName: selected.name, packagePrice: selected.price },
      callback: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference, expectedAmount: selected.price, buyerId, buyerName: agentName || "Agent", buyerPhone: agentPhone, packageName: selected.name, packagePrice: selected.price }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.ok) { alert("Verification failed: " + (verifyData.error || "Try again")); setPaying(false); return; }
          alert(`✅ Payment Verified! ${selected.name} - ₦${selected.price.toLocaleString()}. You can now upload.`);
          unlockUpload(selected);
          setPaying(false);
        } catch (e: any) { alert("Verification error: " + e.message); setPaying(false); }
      },
      onClose: function () { setPaying(false); },
    });
    handler.openIframe();
  };

  const canUploadImages = paidPackage?.type === "static" || paidPackage?.type === "combo";
  const canUploadVideo = paidPackage?.type === "video" || paidPackage?.type === "combo";

  const handleImagePick = (e: any) => {
    if (!canUploadImages) { alert(`❌ You paid for ${paidPackage?.name} - VIDEO only, not pictures.`); return; }
    const files = Array.from(e.target.files) as File[];
    const bad = files.find(f => f.type.startsWith("video/"));
    if (bad) { alert("❌ You paid for STATIC pictures, not video. Please select pictures only."); return; }
    if (images.length + files.length > (paidPackage?.maxImages || 5)) { alert(`❌ Max ${paidPackage?.maxImages} pictures for ${paidPackage?.name}`); return; }
    setImages([...images, ...files]);
  };

  const handleVideoPick = (e: any) => {
    if (!canUploadVideo) { alert(`❌ You paid for ${paidPackage?.name} - STATIC pictures only, not video. You paid for static pictures, not video.`); return; }
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) { alert(`❌ You paid for VIDEO, not pictures.`); return; }
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const dur = Math.floor(v.duration);
      const max = paidPackage?.maxVideoSec || 60;
      if (dur > max) { setVideoError(`❌ Video is ${dur} sec. Your package allows max ${max} sec (${paidPackage?.name}). Please trim / compress.`); setVideoFile(null); }
      else { setVideoError(""); setVideoFile(file); alert(`✅ Video accepted: ${dur} sec / max ${max} sec. System will compress it maximally.`); }
      URL.revokeObjectURL(url);
    };
    v.src = url;
  };

  const handlePublish = async () => {
    if (!title.trim() || !propPrice.trim() || !location.trim()) { alert("Fill Title, Price, Location"); return; }
    if (canUploadImages && images.length === 0 && !canUploadVideo) { alert("Select pictures to upload"); return; }
    if (canUploadVideo && !videoFile && paidPackage?.type === "video") { alert("Select video to upload"); return; }
    setUploading(true);
    setTimeout(() => {
      alert(`✅ Published! Package: ${paidPackage?.name} - Duration: ${paidPackage?.duration}. Video will be compressed maximally.`);
      setUploading(false);
      window.location.href = "/agent-dashboard";
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#f3e8ff] p-3 sm:p-4 flex justify-center">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl max-w-[560px] w-full p-4 sm:p-5 h-fit mt-4 sm:mt-6 shadow border border-purple-200">
        <div className="mb-4 rounded-2xl border border-[#d8b4fe] bg-[#e9d5ff]/90 backdrop-blur-md p-4 text-center shadow-sm">
          <p className="font-black text-[#4c1d95] text-[13px] sm:text-[15px] leading-snug">LOYALTY REWARD: POST 10 IN 7 DAYS, GET 2 FREE - Ends 6th Jan 2027</p>
          <p className="text-[11px] sm:text-[12px] text-[#6b21a8] mt-2 leading-relaxed">Pay for 10 listings WITHIN 7 DAYS, get FREE 1: 5 Static Sliding Pictures for 2 Weeks + FREE 2: 60 Sec Video for 1 Month. If you exceed 7 days, it will NOT count. 5 Day Free Package still active.</p>
        </div>
        <h1 className="font-black text-[22px]">📦 Buy Package / Upload</h1>
        <p className="text-[12px] text-gray-500">Pay first. System verifies payment, then unlocks upload for that package only.</p>
        {!paid ? (
          <>
            {hasUsedFree ? (
              <div className="mt-3 rounded-xl bg-gray-100 border border-gray-300 p-3 text-[12px] text-gray-600 font-bold text-center">✅ You already used your 5 Day Free once {freeExpiry ? `(Expired ${freeExpiry})` : ""} — FREE is once only. Choose a paid package below.</div>
            ) : (
              <div className="mt-3 rounded-xl bg-green-50 border border-green-300 p-3 text-[12px] text-green-800 font-bold text-center">🎁 Your 5 Day Free is still available — Once only, valid for 5 days after you use it.</div>
            )}
            <p className="font-bold text-[13px] mt-4">Step 1: Select Package:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {visiblePackages.map((p) => (
                <button key={p.name} type="button" onClick={() => setSelected(p)} className={`text-left border-2 rounded-xl p-2.5 backdrop-blur-md transition active:scale-[0.97] leading-tight ${selected.name === p.name ? "border-[#7C3AED] bg-[#e9d5ff] shadow-md" : "border-purple-200 bg-white/80 shadow-sm"}`}>
                  <span className="block font-black text-[13px] sm:text-[14px] text-purple-900 leading-none">{p.name}</span>
                  <span className="block font-extrabold text-[16px] sm:text-[18px] mt-1 text-purple-900 leading-none">{p.price === 0 ? "FREE" : `₦${p.price.toLocaleString()}`}</span>
                  <span className="block text-[11px] text-gray-600 mt-1.5 whitespace-pre-line leading-[1.3]">{p.desc}</span>
                  <span className="block text-[11px] text-gray-500 mt-1 leading-none">{p.price > 0 && `Referral ₦${(p.price * 0.10).toLocaleString()} / ₦${(p.price * 0.05).toLocaleString()} / ₦${(p.price * 0.03).toLocaleString()}`}{p.price === 0 && `Once only • 5 days`}</span>
                  <span className="block text-[11px] font-bold mt-1.5 leading-none text-[#7C3AED]">{selected.name === p.name ? "✓ Selected" : "Tap to select →"}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-[#f3e8ff] border border-purple-200 p-3 text-[13px] flex justify-between">
              <span><span className="font-bold">Package: </span>{selected.name}</span>
              <span><span className="font-bold">Amount: </span>{selected.price === 0 ? "FREE" : `₦${selected.price.toLocaleString()}`}</span>
            </div>
            <label className="block text-[13px] font-bold mt-4">Your Name</label>
            <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Your full name" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none bg-white" />
            <label className="block text-[13px] font-bold mt-3">Your Phone</label>
            <input value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="070..." className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none bg-white" />
            <label className="block text-[13px] font-bold mt-3">Your Email (for Paystack receipt)</label>
            <input value={agentEmail} onChange={e => setAgentEmail(e.target.value)} placeholder="you@email.com" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none bg-white" />
            <button onClick={handlePay} disabled={paying} className="w-full bg-green-600 text-white h-[48px] rounded-full font-black mt-5 disabled:opacity-50">{paying ? "Verifying Payment..." : selected.price === 0 ? "Confirm FREE Package → Unlock Upload" : `Pay ₦${selected.price.toLocaleString()} → Verify → Unlock Upload`}</button>
          </>
        ) : (
          <>
            <div className="mt-4 rounded-xl bg-green-100 border border-green-300 p-3 text-[13px] font-bold text-green-800">✅ Payment Verified: {paidPackage?.name} — ₦{paidPackage?.price?.toLocaleString()} — Duration: {paidPackage?.duration} — Upload Unlocked{paidPackage?.name === "5 Day Free" && freeExpiry ? ` — Expires ${freeExpiry}` : ""}</div>
            <div className="mt-3 rounded-xl bg-[#f3e8ff] border border-purple-200 p-3 text-[13px] flex justify-between">
              <span><span className="font-bold">Package: </span>{paidPackage?.name}</span>
              <span><span className="font-bold">Amount: </span>{paidPackage?.price === 0 ? "FREE" : `₦${paidPackage?.price?.toLocaleString()}`}</span>
            </div>
            <label className="block text-[13px] font-bold mt-4">Property Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 3 Bedroom Flat in Abuja" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none bg-white" />
            <label className="block text-[13px] font-bold mt-3">Price (₦)</label>
            <input value={propPrice} onChange={e => setPropPrice(e.target.value)} placeholder="e.g. 2500000" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none bg-white" />
            <label className="block text-[13px] font-bold mt-3">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Wuse 2, Abuja" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none bg-white" />
            <label className="block text-[13px] font-bold mt-3">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe property..." className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none bg-white h-[80px]" />
            <p className="font-bold text-[13px] mt-4">Step 2: Upload Files for {paidPackage?.name}</p>
            <p className="text-[11px] text-gray-500">System will compress video maximally and set duration to {paidPackage?.duration}</p>
            {canUploadImages && (
              <div className="mt-2">
                <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagePick} />
                <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full border-2 border-dashed border-purple-400 bg-purple-50 rounded-xl p-4 text-[13px] font-bold text-purple-800">📷 Click to Select Static Pictures ({images.length}/{paidPackage?.maxImages}) — Pictures Only</button>
                {images.length > 0 && <p className="text-[11px] mt-1 text-green-700">✅ {images.length} pictures selected</p>}
              </div>
            )}
            {canUploadVideo && (
              <div className="mt-2">
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoPick} />
                <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full border-2 border-dashed border-green-500 bg-green-50 rounded-xl p-4 text-[13px] font-bold text-green-800">🎥 Click to Select Video — Max {paidPackage?.maxVideoSec} Sec ({paidPackage?.name}) — Will Compress Maximally</button>
                {videoFile && <p className="text-[11px] mt-1 text-green-700">✅ Video selected: {videoFile.name}</p>}
                {videoError && <p className="text-[11px] mt-1 text-red-600 font-bold">{videoError}</p>}
              </div>
            )}
            <button onClick={handlePublish} disabled={uploading} className="w-full bg-[#7C3AED] text-white h-[48px] rounded-full font-black mt-5 disabled:opacity-50">{uploading ? "Publishing..." : `Publish ${paidPackage?.name} Listing →`}</button>
            <button onClick={() => { localStorage.removeItem("paid_package"); setPaid(false); setPaidPackage(null); }} className="w-full text-center mt-3 text-[12px] text-blue-600 font-bold underline">Change Package / Pay for Another</button>
          </>
        )}
        <div className="mt-6 rounded-2xl border border-[#d8b4fe] bg-[#e9d5ff]/80 backdrop-blur-md p-4">
          <p className="font-black text-[16px] text-purple-900">📢 Want Advert for your Business?</p>
          <p className="text-[12px] text-purple-800 mt-1">Pick advert package, pay, payment verified → then you can send your picture + write-up. My office will prepare / scrutinise and post it.</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {ADVERT_PACKAGES.map((ad) => (
              <button key={ad.name} type="button" onClick={() => window.location.href = `/ceooffice9x7z2/ads?submit=1&package=${encodeURIComponent(ad.name)}&amount=${ad.price}`}
                className="text-left border-2 border-purple-300 bg-white/80 rounded-xl p-2.5">
                <span className="block font-black text-[13px]">{ad.name}</span>
                <span className="block font-extrabold text-[16px] mt-1">₦{ad.price.toLocaleString()}</span>
                <span className="block text-[11px] text-gray-600 mt-1">{ad.desc}</span>
                <span className="block text-[11px] font-bold text-[#7C3AED] mt-1">Tap to Pay →</span>
              </button>
            ))}
          </div>
          <Link href="/ceooffice9x7z2/ads?submit=1" className="block text-center mt-3 text-[12px] font-bold text-blue-600 underline">Request Advert → Pay → Send Material</Link>
        </div>
        <Link href="/agent-dashboard" className="block text-center mt-3 text-[12px] text-blue-600 font-bold underline">Go to Dashboard</Link>
      </div>
    </main>
  );
}
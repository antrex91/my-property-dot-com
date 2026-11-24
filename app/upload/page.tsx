"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PACKAGES = [
  { id: "free", name: "5 Day Free", price: 0, label: "FREE", desc: "Static • Sliding", sub: "5 Days", badge: "FREE" },
  { id: "static", name: "Static", price: 6500, label: "₦6,500", desc: "5 Sliding Pictures", sub: "1 Month — First 20 Users = 2 Months", badge: "POPULAR" },
  { id: "premium", name: "Premium Video", price: 12500, label: "₦12,500", desc: "60 Sec Video", sub: "2 Months", badge: "" },
  { id: "combo", name: "COMBO", price: 16000, label: "₦16,000", desc: "1 Min 20 Sec Video", sub: "2 Months 3 Weeks", badge: "BEST VALUE" },
];

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [step, setStep] = useState<"pay" | "upload" | "done">("pay");
  const [selectedPkg, setSelectedPkg] = useState("static");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [showCoverInfo, setShowCoverInfo] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const coverRef = useRef<any>(null);
  const imagesRef = useRef<any>(null);
  const videoRef = useRef<any>(null);

  const pkg = PACKAGES.find((p) => p.id === selectedPkg) || PACKAGES[1];
  const isVideoPkg = selectedPkg === "premium" || selectedPkg === "combo";
  const isFree = pkg.price === 0;

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      if (data?.user) {
        setEmail(data.user.email || "");
        setName((data.user.user_metadata as any)?.name || "");
      }
      setCheckingAuth(false);
    };
    check();
  }, []);

  if (checkingAuth) return <main className="min-h-screen bg-[#F5F0FF] flex items-center justify-center">Loading Upload Page... 💜</main>;

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[28px] max-w-[420px] w-full p-6 shadow-[0_20px_50px_rgba(167,139,250,0.25)] text-center">
          <p className="text-[40px]">🔐</p>
          <h1 className="font-black text-[22px] mt-2">Please Signup First</h1>
          <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">You need an account to post a property on MyPropertyDot. Signup is free and takes less than 1 minute.</p>
          <Link href="/signup" className="block w-full bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white h-[48px] leading-[48px] rounded-full text-[14px] font-black mt-5 shadow-lg">Signup Now →</Link>
          <Link href="/login" className="block w-full bg-white/70 backdrop-blur border border-purple-200 h-[48px] leading-[48px] rounded-full text-[14px] font-black mt-2">I Already Have Account — Login</Link>
          <Link href="/" className="inline-block text-[12px] font-bold underline mt-4">Back to Homepage</Link>
        </div>
      </main>
    );
  }

  const handlePay = async (e: any) => {
    e.preventDefault();
    if (!name || !phone || !email) { alert("Please fill Name, Phone and Email"); return; }
    if (isFree) { setStep("upload"); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setPaying(true);
    try {
      const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
      if (!(window as any).PaystackPop) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://js.paystack.co/v1/inline.js";
          s.onload = resolve; s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      const handler = (window as any).PaystackPop.setup({
        key, email, amount: pkg.price * 100, currency: "NGN",
        ref: `MPD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        metadata: { custom_fields: [{ display_name: "Name", variable_name: "name", value: name }, { display_name: "Phone", variable_name: "phone", value: phone }, { display_name: "Package", variable_name: "package", value: pkg.name }] },
        callback: function () { setPaying(false); setStep("upload"); window.scrollTo({ top: 0, behavior: "smooth" }); },
        onClose: function () { setPaying(false); alert("Payment cancelled. Try again."); },
      });
      handler.openIframe();
    } catch (err: any) {
      setPaying(false);
      alert("Paystack could not load. Check your internet and NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local");
    }
  };

  const onCoverChange = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const onImagesChange = (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    const all = [...images, ...files].slice(0, 5);
    setImages(all);
    setImagePreviews(all.map((f) => URL.createObjectURL(f)));
  };

  const onVideoChange = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
  };

  const uploadOne = async (file: File | Blob, path: string, contentType: string) => {
    const { error } = await supabase.storage.from("property-images").upload(path, file, { contentType, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("property-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePostProperty = async (e: any) => {
    e.preventDefault();
    if (!title || !price || !location || !state) { alert("Please fill Title, Price, Location and State"); return; }
    if (!coverFile) { alert("Please add a Cover Picture — this is what people see first"); return; }
    if (!isVideoPkg && images.length === 0) { alert("Please add at least 1 picture (up to 5)"); return; }
    if (isVideoPkg && !videoFile) { alert("Please add your video for this package"); return; }
    if (!description) { alert("Please add Description / Environment — this becomes Slide 6"); return; }
    setUploading(true);
    try {
      const uid = user.id;
      const stamp = Date.now();
      const coverUrl = await uploadOne(coverFile, `${uid}/${stamp}-cover.jpg`, "image/jpeg");
      let imageUrls: string[] = [];
      if (!isVideoPkg) {
        for (let i = 0; i < images.length; i++) {
          const url = await uploadOne(images[i], `${uid}/${stamp}-img-${i}.jpg`, "image/jpeg");
          imageUrls.push(url);
        }
      }
      let videoUrl = "";
      if (isVideoPkg && videoFile) videoUrl = await uploadOne(videoFile, `${uid}/${stamp}-video.mp4`, "video/mp4");
      const { error } = await supabase.from("properties").insert([{
        user_id: uid, agent_id: uid, agent_name: name, title, price: Number(price), location, city: location, state, description,
        cover_image_url: coverUrl, image_url: coverUrl, images: imageUrls, video_url: videoUrl,
        package: pkg.id, package_name: pkg.name, phone, whatsapp: phone,
      }]);
      if (error) throw error;
      setStep("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert("Error posting property: " + err.message + " — Have you created the property-images bucket + cover_image_url column in Supabase?");
    }
    setUploading(false);
  };

  if (step === "done") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[28px] max-w-[420px] w-full p-6 shadow-[0_20px_50px_rgba(167,139,250,0.25)] text-center">
          <p className="text-[48px]">🎉</p>
          <h1 className="font-black text-[22px] mt-2">Property Posted!</h1>
          <p className="text-[13px] text-gray-600 mt-2">Your Cover + {isVideoPkg ? "Video" : "5 Pictures"} + Description (Slide 6) are live.</p>
          <Link href="/agent-dashboard" className="block w-full bg-black text-white h-[48px] leading-[48px] rounded-full text-[14px] font-black mt-5">Go to My Dashboard →</Link>
          <Link href={`/my-office/${user.id}`} className="block w-full bg-white/70 backdrop-blur border border-purple-200 h-[48px] leading-[48px] rounded-full text-[14px] font-black mt-2">View My Office →</Link>
          <Link href="/" className="inline-block text-[12px] font-bold underline mt-4">Back to Homepage</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-[#EDE9FE] to-[#DDD6FE] pb-20 text-black">
      {/* TOP HEADER - LILAC GLASS */}
      <div className="bg-gradient-to-r from-[#D8B4FE] via-[#C4B5FD] to-[#A78BFA] text-white p-6 pb-8 rounded-b-[40px] shadow-lg">
        <div className="max-w-[1100px] mx-auto">
          <Link href="/" className="text-white/80 text-sm">← Back to Home</Link>
          <h1 className="font-black text-[24px] mt-3">Post Your Property 💜</h1>
          <p className="text-white/90 text-[13px]">Logged in as <b>{user.email}</b> • Choose package → Pay → Upload Cover + Pictures</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto p-4 -mt-2">
        {/* LOYALTY - GLASS */}
        <div className="bg-yellow-300/80 backdrop-blur-xl border border-yellow-400/60 rounded-[24px] p-4 text-center shadow-[0_10px_30px_rgba(250,204,21,0.35)]">
          <p className="font-black text-[14px] md:text-[16px]">🎁 LOYALTY REWARD: POST 10 IN 7 DAYS, GET 2 FREE - Ends 6th Jan 2027</p>
          <p className="text-[12px] mt-1 font-medium text-black/70">Pay for 10 listings WITHIN 7 DAYS, get FREE 1: 5 Static Sliding Pictures for 2 Weeks + FREE 2: 60 Sec Video for 1 Month. If you exceed 7 days, it will NOT count. 5 Day Free Package still active.</p>
        </div>

        <h2 className="font-black text-[20px] text-center mt-6">Choose Your Package</h2>
        <p className="text-[13px] text-gray-600 text-center">Tap a package to select it — it will be used in the form below</p>

        {/* PACKAGE CARDS - LILAC GLASS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {PACKAGES.map((p) => {
            const active = selectedPkg === p.id;
            const isCombo = p.id === "combo";
            return (
              <button key={p.id} onClick={() => { setSelectedPkg(p.id); setStep("pay"); }} className={`rounded-[24px] p-4 text-left relative overflow-hidden backdrop-blur-xl border-2 transition-all ${active ? "border-purple-500 shadow-[0_15px_35px_rgba(139,92,246,0.35)] scale-[1.02]" : "border-purple-200 shadow-sm"} ${isCombo ? "bg-black/90 text-white" : "bg-white/60"}`}>
                {p.badge && <span className="absolute top-2 right-2 bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded-full">{p.badge}</span>}
                <p className="font-black text-[15px]">{p.name}</p>
                <p className={`font-black text-[22px] mt-1 ${isCombo ? "text-yellow-400" : "text-purple-700"}`}>{p.label}</p>
                <p className={`text-[12px] mt-1 ${isCombo ? "text-gray-300" : "text-gray-600"}`}>{p.desc}</p>
                <p className={`text-[11px] mt-1 ${isCombo ? "text-gray-400" : "text-gray-500"}`}>{p.sub}</p>
                <p className="text-[11px] font-bold mt-2">{active ? "✅ Selected" : "Tap to select →"}</p>
              </button>
            );
          })}
        </div>
      </div>

      {step === "pay" && (
        <div className="max-w-[500px] mx-auto px-4 mt-2">
          <form onSubmit={handlePay} className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[28px] p-5 shadow-[0_20px_50px_rgba(167,139,250,0.25)]">
            <h2 className="font-black text-[18px]">Buy Package — {pkg.name} • {pkg.label}</h2>
            <p className="text-[12px] text-gray-600 mt-1">Logged in as <b>{user.email}</b></p>
            <div className="space-y-3 mt-4">
              <div><label className="text-[12px] font-bold">Your Name</label><input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" className="w-full mt-1 bg-white/80 border border-purple-100 h-[46px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" /></div>
              <div><label className="text-[12px] font-bold">Your Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. 0803..." className="w-full mt-1 bg-white/80 border border-purple-100 h-[46px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" /></div>
              <div><label className="text-[12px] font-bold">Your Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="Your email" className="w-full mt-1 bg-white/80 border border-purple-100 h-[46px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" /></div>
            </div>
            <div className="bg-purple-100/70 rounded-xl p-3 mt-4 flex justify-between text-[13px]"><span>Package: <b>{pkg.name}</b></span><span className="font-black text-purple-700">{pkg.label}</span></div>
            <button disabled={paying} className="w-full bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white h-[52px] rounded-full text-[14px] font-black mt-4 shadow-lg">{paying ? "Opening Paystack..." : isFree ? "Continue — FREE Package →" : `Pay ${pkg.label} with Paystack →`}</button>
            <p className="text-[11px] text-gray-500 text-center mt-2">After payment, the Upload Form will open on this same page.</p>
          </form>
        </div>
      )}

      {step === "upload" && (
        <div className="max-w-[600px] mx-auto px-4 mt-4">
          <div className="bg-green-100/80 backdrop-blur-xl border border-green-300 rounded-[24px] p-4 text-center"><p className="font-black text-[14px] text-green-800">✅ Payment Successful! Now post your property</p><p className="text-[12px] text-green-700 mt-1">Package: {pkg.name} • {pkg.label}</p></div>

          <form onSubmit={handlePostProperty} className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[28px] p-5 shadow-[0_20px_50px_rgba(167,139,250,0.25)] mt-4 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-black">🖼️ Cover Picture</label>
                <button type="button" onClick={() => setShowCoverInfo(true)} className="w-[22px] h-[22px] rounded-full bg-purple-600 text-white text-[12px] font-black flex items-center justify-center">?</button>
                <span className="text-[11px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">REQUIRED</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-1">This is what people see first — like YouTube thumbnail.</p>
              <button type="button" onClick={() => coverRef.current?.click()} className="w-full mt-2">
                {coverPreview ? (
                  <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[20px] bg-gray-100 border border-purple-200"><img src={coverPreview} className="w-full h-full object-cover" alt="" /><span className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-full">Tap to change Cover</span></div>
                ) : (
                  <div className="w-full aspect-[16/9] rounded-[20px] border-2 border-dashed border-purple-300 flex flex-col items-center justify-center bg-white/70 backdrop-blur"><p className="text-[28px]">🖼️</p><p className="font-bold text-[13px] mt-1">Tap to Add Cover Picture</p><p className="text-[11px] text-gray-500">System will auto-crop it to 16:9 — no need to crop yourself</p></div>
                )}
              </button>
              <input ref={coverRef} type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
            </div>

            {showCoverInfo && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCoverInfo(false)}>
                <div className="bg-white/90 backdrop-blur-xl border border-purple-200 rounded-[24px] max-w-[400px] w-full p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-black text-[16px]">🖼️ What is Cover Picture?</h3>
                  <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">Cover Picture is the <b>first picture</b> people see before they open your property — just like a <b>YouTube Thumbnail</b>.</p>
                  <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">Use your <b>best, brightest, most beautiful</b> picture — front view, clean, no blur. A good Cover makes people click.</p>
                  <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">It is <b>NOT</b> counted as one of your 5 pictures. It is separate. System will auto-crop it to the same 16:9 size for everyone.</p>
                  <button onClick={() => setShowCoverInfo(false)} className="w-full bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white h-[46px] rounded-full font-black text-[13px] mt-4">Got it ✅</button>
                </div>
              </div>
            )}

            <div><label className="text-[12px] font-bold">Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. 3 Bedroom Flat in Lekki" className="w-full mt-1 bg-white/80 border border-purple-100 h-[46px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[12px] font-bold">Price (₦)</label><input value={price} onChange={(e) => setPrice(e.target.value)} required type="number" placeholder="e.g. 1500000" className="w-full mt-1 bg-white/80 border border-purple-100 h-[46px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" /></div>
              <div><label className="text-[12px] font-bold">State</label><input value={state} onChange={(e) => setState(e.target.value)} required placeholder="e.g. Lagos" className="w-full mt-1 bg-white/80 border border-purple-100 h-[46px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" /></div>
            </div>
            <div><label className="text-[12px] font-bold">Location / Area</label><input value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="e.g. Lekki Phase 1" className="w-full mt-1 bg-white/80 border border-purple-100 h-[46px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" /></div>

            {!isVideoPkg ? (
              <div>
                <label className="text-[13px] font-black">📸 5 Pictures — Sliding (Static)</label>
                <p className="text-[11px] text-gray-600 mt-1">{images.length} / 5 selected. Cover is separate, not counted.</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imagePreviews.map((src, i) => (<div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-purple-200"><img src={src} className="w-full h-full object-cover" alt="" /><button type="button" onClick={() => { const nf = images.filter((_, j) => j !== i); setImages(nf); setImagePreviews(nf.map((f) => URL.createObjectURL(f))); }} className="absolute top-1 right-1 bg-black/70 text-white w-[22px] h-[22px] rounded-full text-[12px]">×</button></div>))}
                  {images.length < 5 && (<button type="button" onClick={() => imagesRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-purple-300 flex flex-col items-center justify-center text-[12px] font-bold bg-white/60">+ Add<br />Picture</button>)}
                </div>
                <input ref={imagesRef} type="file" accept="image/*" multiple onChange={onImagesChange} className="hidden" />
              </div>
            ) : (
              <div>
                <label className="text-[13px] font-black">🎥 Video — {pkg.name}</label>
                <p className="text-[11px] text-gray-600 mt-1">{selectedPkg === "premium" ? "60 Sec Video • 2 Months" : "1 Min 20 Sec Video • 2 Months 3 Weeks"}</p>
                <button type="button" onClick={() => videoRef.current?.click()} className="w-full mt-2">
                  {videoPreview ? (<video src={videoPreview} controls className="w-full aspect-[16/9] rounded-[20px] object-cover bg-black" />) : (<div className="w-full aspect-[16/9] rounded-[20px] border-2 border-dashed border-purple-300 flex flex-col items-center justify-center bg-white/70"><p className="text-[28px]">🎥</p><p className="font-bold text-[13px]">Tap to Add Video</p></div>)}
                </button>
                <input ref={videoRef} type="file" accept="video/*" onChange={onVideoChange} className="hidden" />
              </div>
            )}

            <div><label className="text-[12px] font-bold">Description / Environment — Becomes Slide 6</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe the property, environment, nearby schools, road, water, light..." className="w-full mt-1 bg-white/80 border border-purple-100 rounded-[20px] p-4 text-[13px] outline-none focus:border-purple-400 h-[110px]" /></div>

            <button disabled={uploading} className="w-full bg-black text-white h-[54px] rounded-full text-[15px] font-black shadow-lg">{uploading ? "Uploading Cover + Pictures... Please wait..." : "⬆️ POST MY PROPERTY →"}</button>
            <p className="text-[11px] text-gray-500 text-center">Cover + {isVideoPkg ? "Video" : "5 Pictures"} + Description (Slide 6) will show on Homepage, Dashboard & My Office.</p>
          </form>
        </div>
      )}
    </main>
  );
}
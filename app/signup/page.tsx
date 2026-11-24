"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

const makeCode = (name: string) => {
  const clean = name.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 4) || "AGENT";
  const num = Math.floor(100 + Math.random() * 900);
  return `${clean}${num}`;
};

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [ninCardFile, setNinCardFile] = useState<File | null>(null);
  const [ninCardPreview, setNinCardPreview] = useState("");
  const [holdingNinFile, setHoldingNinFile] = useState<File | null>(null);
  const [holdingNinPreview, setHoldingNinPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [myCode, setMyCode] = useState("");

  const ninCardRef = useRef<any>(null);
  const holdingRef = useRef<any>(null);
  const avatarRef = useRef<any>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setInviteCode(ref.toUpperCase());
  }, []);

  const onFile = (e: any, setFile: any, setPreview: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadOne = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSignup = async (e: any) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) { alert("Fill Name, Phone, Email, Password"); return; }
    if (ninNumber.trim().length !== 11) { alert("NIN must be 11 digits. Check your NIN card."); return; }
    if (!ninCardFile) { alert("Please upload a clear photo of your NIN card"); return; }
    if (!holdingNinFile) { alert("Please upload a photo of YOU holding your NIN — face + NIN must be clear"); return; }
    setLoading(true);
    try {
      const myReferralCode = makeCode(name);
      // 1. Check inviter
      let referredById = null;
      let referredByCode = inviteCode.trim().toUpperCase() || null;
      if (referredByCode) {
        const { data: inviter } = await supabase.from("agents").select("id, referral_code").eq("referral_code", referredByCode).single();
        if (!inviter) { alert("That Invite Code is wrong. Check it or leave blank."); setLoading(false); return; }
        referredById = inviter.id;
      }

      // 2. Create Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim(), phone: phone.trim() } } });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Could not create account. Try login if you already have an account.");

      const stamp = Date.now();
      // 3. Upload NIN files to Supabase Storage
      // Buckets: nin-documents (private) + avatars (public)
      const ninCardUrl = await uploadOne(ninCardFile, "nin-documents", `${userId}/${stamp}-nin-card.jpg`);
      const holdingNinUrl = await uploadOne(holdingNinFile, "nin-documents", `${userId}/${stamp}-holding-nin.jpg`);
      let avatarUrl = "";
      if (avatarFile) avatarUrl = await uploadOne(avatarFile, "avatars", `${userId}-${stamp}.jpg`);

      // 4. Save to agent_profiles — THIS IS WHERE CEO SEES NIN FOR VERIFICATION
      const { error: profileError } = await supabase.from("agent_profiles").insert([{
        id: userId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl,
        referral_code: myReferralCode,
        referred_by_code: referredByCode,
        referred_by_agent_id: referredById,
        nin_number: ninNumber.trim(),
        nin_last4: ninNumber.trim().slice(-4),
        nin_card_url: ninCardUrl,
        nin_holding_url: holdingNinUrl,
        nin_selfie_url: holdingNinUrl,
        verification_status: "pending",
        nin_verified: false,
        status: "pending",
      }]);
      if (profileError) throw profileError;

      // 5. Save to agents table too (for referral system)
      await supabase.from("agents").insert([{
        name: name.trim(), email: email.trim(), phone: phone.trim(), password: "supabase-auth",
        referral_code: myReferralCode, referred_by_code: referredByCode, referred_by_agent_id: referredById,
      }]);

      // 6. Save referral row if invited
      if (referredById) {
        await supabase.from("referrals").insert([{ referrer_id: referredById, referred_id: userId, level: 1 }]);
      }

      localStorage.setItem("agent_code", myReferralCode);
      setMyCode(myReferralCode);
    } catch (err: any) {
      alert("Signup failed: " + err.message);
    }
    setLoading(false);
  };

  if (myCode) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-[#EDE9FE] to-[#DDD6FE] p-4 flex justify-center">
        <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[28px] max-w-[480px] w-full p-6 text-center h-fit mt-8 shadow-[0_20px_50px_rgba(167,139,250,0.25)]">
          <p className="text-[50px]">🎉</p>
          <h1 className="font-black text-[22px]">Welcome, {name}!</h1>
          <p className="text-[13px] text-gray-600 mt-2">Your account is created. Your NIN is now <b>PENDING VERIFICATION</b> by MyPropertyDot.</p>
          <p className="text-[13px] text-gray-600 mt-1">Your Referral Code is:</p>
          <div className="bg-black text-white font-black text-[28px] tracking-widest py-3 rounded-[16px] mt-2">{myCode}</div>
          <div className="bg-yellow-100/80 border border-yellow-300 rounded-[20px] p-3 mt-4 text-left">
            <p className="font-black text-[13px]">⏳ What happens next?</p>
            <p className="text-[12px] text-gray-600 mt-1">1. CEO will compare your Face + NIN Card + Photo Holding NIN<br />2. If they match, you become ✅ VERIFIED AGENT<br />3. Until then, do NOT pay anyone until you see VERIFIED.</p>
          </div>
          <Link href="/agent-dashboard" className="block w-full bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white h-[48px] leading-[48px] rounded-full font-black mt-4 shadow-lg">Go to My Dashboard →</Link>
          <Link href="/upload" className="block w-full bg-black text-white h-[48px] leading-[48px] rounded-full font-black mt-2">Post Property →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-[#EDE9FE] to-[#DDD6FE] p-4 flex justify-center">
      <form onSubmit={handleSignup} className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[28px] max-w-[520px] w-full p-5 h-fit mt-4 mb-10 shadow-[0_20px_50px_rgba(167,139,250,0.25)]">
        <h1 className="font-black text-[24px] text-purple-700">Create Account 💜</h1>
        <p className="text-[12px] text-gray-600 mt-1">Signup + NIN Verification → Get Verified → Post Properties → Earn 10% / 5% / 3%</p>

        <label className="block text-[13px] font-bold mt-4">Full Name * <span className="text-gray-500 font-normal">— Must match NIN</span></label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Musa Ibrahim — as on NIN" className="w-full bg-white/80 border border-purple-200 rounded-xl p-3 mt-1 text-[13px] outline-none focus:border-purple-400" />

        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[13px] font-bold mt-3">Phone / WhatsApp *</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="070..." className="w-full bg-white/80 border border-purple-200 rounded-xl p-3 mt-1 text-[13px] outline-none focus:border-purple-400" /></div>
          <div><label className="block text-[13px] font-bold mt-3">Email *</label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" className="w-full bg-white/80 border border-purple-200 rounded-xl p-3 mt-1 text-[13px] outline-none focus:border-purple-400" /></div>
        </div>

        <label className="block text-[13px] font-bold mt-3">Password *</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose password (min 6)" className="w-full bg-white/80 border border-purple-200 rounded-xl p-3 mt-1 text-[13px] outline-none focus:border-purple-400" />

        <div className="bg-yellow-100/70 backdrop-blur border border-yellow-300 rounded-[20px] p-3 mt-4">
          <label className="block text-[13px] font-black">🎁 Who invited you? Enter their Code (Optional)</label>
          <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="e.g. CHI456 — Leave blank if nobody" className="w-full bg-white/80 border border-yellow-300 rounded-xl p-3 mt-1 text-[14px] font-black tracking-widest outline-none uppercase" />
        </div>

        {/* ===== NIN SECTION ===== */}
        <div className="bg-purple-100/70 border border-purple-300 rounded-[24px] p-4 mt-5">
          <h2 className="font-black text-[16px] text-purple-800">🪪 NIN Verification — Required</h2>
          <p className="text-[12px] text-gray-600 mt-1">We check your NIN to stop fraud. Your NIN is private — only CEO sees it.</p>

          <label className="block text-[13px] font-bold mt-3">NIN Number * (11 digits)</label>
          <input value={ninNumber} onChange={(e) => setNinNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))} placeholder="e.g. 12345678901" inputMode="numeric" className="w-full bg-white/90 border border-purple-300 rounded-xl p-3 mt-1 text-[14px] font-black tracking-widest outline-none" />
          <p className="text-[11px] text-gray-500 mt-1">{ninNumber.length} / 11 digits</p>

          {/* 1. NIN CARD */}
          <label className="block text-[13px] font-bold mt-3">1. Photo of NIN Card *</label>
          <p className="text-[11px] text-gray-600">Clear photo of front of NIN card. Name + number must be readable.</p>
          <button type="button" onClick={() => ninCardRef.current?.click()} className="w-full mt-2">
            {ninCardPreview ? <img src={ninCardPreview} className="w-full aspect-[16/10] object-cover rounded-[16px] border border-purple-300" alt="" /> : <div className="w-full aspect-[16/10] rounded-[16px] border-2 border-dashed border-purple-400 flex flex-col items-center justify-center bg-white/70"><p className="text-[28px]">🪪</p><p className="font-bold text-[13px]">Tap to Upload NIN Card</p></div>}
          </button>
          <input ref={ninCardRef} type="file" accept="image/*" onChange={(e) => onFile(e, setNinCardFile, setNinCardPreview)} className="hidden" />

          {/* 2. HOLDING NIN */}
          <label className="block text-[13px] font-bold mt-4">2. Photo of YOU Holding NIN * <span className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full ml-1">MOST IMPORTANT</span></label>
          <p className="text-[11px] text-gray-600">Hold your NIN next to your face. Your face + NIN must BOTH be clear. CEO compares this to your NIN card.</p>
          <button type="button" onClick={() => holdingRef.current?.click()} className="w-full mt-2">
            {holdingNinPreview ? <img src={holdingNinPreview} className="w-full aspect-[4/3] object-cover rounded-[16px] border border-purple-300" alt="" /> : <div className="w-full aspect-[4/3] rounded-[16px] border-2 border-dashed border-purple-400 flex flex-col items-center justify-center bg-white/70"><p className="text-[28px]">🤳</p><p className="font-bold text-[13px]">Tap to Upload Photo Holding NIN</p><p className="text-[11px] text-gray-500">Face + NIN together, no sunglasses, good light</p></div>}
          </button>
          <input ref={holdingRef} type="file" accept="image/*" onChange={(e) => onFile(e, setHoldingNinFile, setHoldingNinPreview)} className="hidden" />

          {/* 3. PROFILE PHOTO */}
          <label className="block text-[13px] font-bold mt-4">3. Profile Photo (for My Office) — Optional</label>
          <button type="button" onClick={() => avatarRef.current?.click()} className="w-full mt-2">
            {avatarPreview ? <img src={avatarPreview} className="w-[90px] h-[90px] object-cover rounded-full border-4 border-white shadow-lg mx-auto" alt="" /> : <div className="w-[90px] h-[90px] rounded-full bg-white/80 border border-purple-300 flex items-center justify-center text-[28px] mx-auto">💜</div>}
            <p className="text-[12px] font-bold mt-1 text-center">Tap to Add Profile Photo</p>
          </button>
          <input ref={avatarRef} type="file" accept="image/*" onChange={(e) => onFile(e, setAvatarFile, setAvatarPreview)} className="hidden" />
        </div>

        <button disabled={loading} className="w-full bg-black text-white h-[52px] rounded-full font-black mt-5 disabled:opacity-50 shadow-lg">{loading ? "Creating Account + Uploading NIN..." : "Create Account & Submit NIN →"}</button>
        <p className="text-[11px] text-gray-500 text-center mt-2">By signing up, you agree to NIN verification. Fake NIN = account blocked.</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/login" className="text-[12px] font-bold underline">Already have account? Login</Link>
          <Link href="/" className="text-[12px] font-bold underline">Homepage</Link>
        </div>
      </form>
    </main>
  );
}
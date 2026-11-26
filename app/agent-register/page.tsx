"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

const makeCode = (name: string) => {
  const clean = name.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 4) || "AGENT";
  const num = Math.floor(100 + Math.random() * 900);
  return `${clean}${num}`;
};

export default function AgentRegister() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [myCode, setMyCode] = useState("");
  const [myLink, setMyLink] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setInviteCode(ref.toUpperCase());
  }, []);

  const checkPasswords = (p1: string, p2: string) => {
    if (!p2) { setPasswordError(""); return; }
    if (p1 !== p2) setPasswordError("❌ Passwords don't match — check again");
    else setPasswordError("");
  };

  const register = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) { alert("Fill Name, Phone, Password"); return; }
    if (!confirmPassword.trim()) { alert("Please Confirm Your Password"); return; }
    if (password !== confirmPassword) { alert("❌ Passwords don't match. Please type same password in both boxes."); return; }
    setLoading(true);
    try {
      const myReferralCode = makeCode(name);
      let referredById = null;
      if (inviteCode.trim()) {
        const { data: inviter } = await supabase.from("agents").select("id, referral_code").eq("referral_code", inviteCode.trim().toUpperCase()).single();
        if (!inviter) { alert("That Invite Code is wrong. Check it or leave blank."); setLoading(false); return; }
        referredById = inviter.id;
      }
      const { data, error } = await supabase.from("agents").insert({ name: name.trim(), phone: phone.trim(), password, referral_code: myReferralCode, referred_by_code: inviteCode.trim().toUpperCase() || null, referred_by_agent_id: referredById }).select().single();
      if (error) throw error;
      setMyCode(myReferralCode);
      setMyLink(`${window.location.origin}/agent-register?ref=${myReferralCode}`);
      localStorage.setItem("agent_id", data.id);
      localStorage.setItem("agent_name", data.name);
      localStorage.setItem("agent_code", myReferralCode);
    } catch (e: any) { alert("Could not register: " + e.message); }
    setLoading(false);
  };

  if (myCode) return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#f3e8ff] via-[#e9d5ff] to-[#c4b5fd] p-4 flex justify-center">
      <div className="absolute -top-20 -left-20 w-[280px] h-[280px] bg-white/50 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-20 w-[300px] h-[300px] bg-[#a78bfa]/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[260px] h-[260px] bg-pink-200/50 rounded-full blur-3xl" />
      <div className="relative bg-white/60 backdrop-blur-2xl border border-white/70 rounded-[28px] max-w-[480px] w-full p-6 text-center h-fit mt-10 shadow-[0_20px_60px_rgba(124,58,237,0.25)]">
        <p className="text-[50px]">🎉</p><h1 className="font-black text-[22px]">Welcome, {name}!</h1>
        <p className="text-[13px] text-gray-600 mt-2">Your Invite Code is:</p>
        <div className="bg-black/90 backdrop-blur text-white font-black text-[28px] tracking-widest py-3 rounded-2xl mt-2 shadow-lg">{myCode}</div>
        <p className="text-[12px] mt-3 text-gray-600">Share this link to earn:</p>
        <p className="bg-white/70 backdrop-blur border border-white/70 p-3 rounded-xl text-[12px] break-all font-bold mt-1">{myLink}</p>
        <button onClick={() => { navigator.clipboard.writeText(myLink); alert("Link copied! Share on WhatsApp"); }} className="w-full bg-[#7C3AED] text-white h-[46px] rounded-full font-black mt-4 shadow-lg active:scale-[0.98]">Copy Invite Link</button>
        <Link href="/agent-dashboard" className="block mt-4 bg-green-600 text-white h-[46px] leading-[46px] rounded-full font-black shadow-lg">Go to My Dashboard →</Link>
      </div>
    </main>
  );

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#f3e8ff] via-[#e9d5ff] to-[#c4b5fd] p-4 flex justify-center">
      <div className="absolute -top-20 -left-20 w-[280px] h-[280px] bg-white/50 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-20 w-[300px] h-[300px] bg-[#a78bfa]/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[260px] h-[260px] bg-pink-200/50 rounded-full blur-3xl" />

      <div className="relative bg-white/60 backdrop-blur-2xl border border-white/70 rounded-[28px] max-w-[480px] w-full p-5 sm:p-6 h-fit mt-6 shadow-[0_20px_60px_rgba(124,58,237,0.25)]">
        <h1 className="font-black text-[22px] text-[#7C3AED] drop-shadow-sm">🧑‍💼 Agent Register</h1>
        <p className="text-[12px] text-gray-600 mt-1">Register → Get your code → Invite others → Earn 10% / 5% / 3% on every package they pay for.</p>

        <label className="block text-[13px] font-bold mt-4">Full Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Musa Ibrahim" className="w-full bg-white/70 backdrop-blur border-2 border-white/80 rounded-xl p-3 mt-1 text-[13px] outline-none focus:border-[#a78bfa] focus:bg-white/90 shadow-sm" />

        <label className="block text-[13px] font-bold mt-3">Phone / WhatsApp *</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="070..." className="w-full bg-white/70 backdrop-blur border-2 border-white/80 rounded-xl p-3 mt-1 text-[13px] outline-none focus:border-[#a78bfa] focus:bg-white/90 shadow-sm" />

        <label className="block text-[13px] font-bold mt-3">Password *</label>
        <input type="password" value={password} onChange={e => { setPassword(e.target.value); checkPasswords(e.target.value, confirmPassword); }} placeholder="Choose password" className="w-full bg-white/70 backdrop-blur border-2 border-white/80 rounded-xl p-3 mt-1 text-[13px] outline-none focus:border-[#a78bfa] focus:bg-white/90 shadow-sm" />

        <label className="block text-[13px] font-bold mt-3">Confirm Password *</label>
        <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); checkPasswords(password, e.target.value); }} placeholder="Type same password again" className={`w-full bg-white/70 backdrop-blur border-2 rounded-xl p-3 mt-1 text-[13px] outline-none focus:bg-white/90 shadow-sm ${passwordError ? "border-red-400" : passwordsMatch ? "border-green-400" : "border-white/80 focus:border-[#a78bfa]"}`} />
        {passwordError && <p className="text-[12px] font-bold text-red-600 mt-1">{passwordError}</p>}
        {passwordsMatch && <p className="text-[12px] font-bold text-green-700 mt-1">✅ Passwords match</p>}

        <div className="bg-yellow-100/70 backdrop-blur-xl border-2 border-yellow-200/80 rounded-2xl p-3 mt-4 shadow-sm">
          <label className="block text-[13px] font-black">🎁 Who invited you? Enter their Code (Optional)</label>
          <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="e.g. CHI456 - Leave blank if nobody" className="w-full bg-white/80 backdrop-blur border-2 border-yellow-300/80 rounded-xl p-3 mt-1 text-[14px] font-black tracking-widest outline-none uppercase focus:bg-white" />
        </div>

        <button onClick={register} disabled={loading} className="w-full bg-black text-white h-[48px] rounded-full font-black mt-5 disabled:opacity-50 shadow-lg active:scale-[0.98]">{loading ? "Creating..." : "Register & Get My Code →"}</button>
        <Link href="/agent-dashboard" className="block text-center mt-3 text-[12px] text-blue-700 font-bold underline">Already registered? Go to Dashboard</Link>
      </div>
    </main>
  );
}
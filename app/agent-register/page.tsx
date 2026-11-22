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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [myCode, setMyCode] = useState("");
  const [myLink, setMyLink] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setInviteCode(ref.toUpperCase());
  }, []);

  const register = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) { alert("Fill Name, Phone, Password"); return; }
    setLoading(true);
    try {
      const myReferralCode = makeCode(name);
      let referredById = null;
      if (inviteCode.trim()) {
        const { data: inviter } = await supabase.from("agents").select("id, referral_code").eq("referral_code", inviteCode.trim().toUpperCase()).single();
        if (!inviter) { alert("That Invite Code is wrong. Check it or leave blank."); setLoading(false); return; }
        referredById = inviter.id;
      }
      const { data, error } = await supabase.from("agents").insert({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, referral_code: myReferralCode, referred_by_code: inviteCode.trim().toUpperCase() || null, referred_by_agent_id: referredById }).select().single();
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
    <main className="min-h-screen bg-[#f3e8ff] p-4 flex justify-center">
      <div className="bg-white rounded-2xl max-w-[480px] w-full p-6 text-center h-fit mt-10 shadow">
        <p className="text-[50px]">🎉</p><h1 className="font-black text-[22px]">Welcome, {name}!</h1>
        <p className="text-[13px] text-gray-500 mt-2">Your Invite Code is:</p>
        <div className="bg-black text-white font-black text-[28px] tracking-widest py-3 rounded-xl mt-2">{myCode}</div>
        <p className="text-[12px] mt-3">Share this link to earn:</p>
        <p className="bg-gray-100 p-2 rounded-lg text-[12px] break-all font-bold mt-1">{myLink}</p>
        <button onClick={() => { navigator.clipboard.writeText(myLink); alert("Link copied! Share on WhatsApp"); }} className="w-full bg-[#7C3AED] text-white h-[46px] rounded-full font-black mt-4">Copy Invite Link</button>
        <Link href="/agent-dashboard" className="block mt-4 bg-green-600 text-white h-[46px] leading-[46px] rounded-full font-black">Go to My Dashboard →</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f3e8ff] p-4 flex justify-center">
      <div className="bg-white rounded-2xl max-w-[480px] w-full p-5 h-fit mt-6 shadow">
        <h1 className="font-black text-[22px] text-[#7C3AED]">🧑‍💼 Agent Register</h1>
        <p className="text-[12px] text-gray-500 mt-1">Register → Get your code → Invite others → Earn 10% / 5% / 3% on every package they pay for.</p>
        <label className="block text-[13px] font-bold mt-4">Full Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Musa Ibrahim" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
        <label className="block text-[13px] font-bold mt-3">Phone / WhatsApp *</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="070..." className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
        <label className="block text-[13px] font-bold mt-3">Email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
        <label className="block text-[13px] font-bold mt-3">Password *</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose password" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 mt-4">
          <label className="block text-[13px] font-black">🎁 Who invited you? Enter their Code (Optional)</label>
          <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="e.g. CHI456 - Leave blank if nobody" className="w-full border-2 border-yellow-300 rounded-xl p-3 mt-1 text-[14px] font-black tracking-widest outline-none uppercase" />
        </div>
        <button onClick={register} disabled={loading} className="w-full bg-black text-white h-[48px] rounded-full font-black mt-5 disabled:opacity-50">{loading ? "Creating..." : "Register & Get My Code →"}</button>
        <Link href="/agent-dashboard" className="block text-center mt-3 text-[12px] text-blue-600 font-bold underline">Already registered? Go to Dashboard</Link>
      </div>
    </main>
  );
}
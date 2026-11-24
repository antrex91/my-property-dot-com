"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function AgentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [stats, setStats] = useState({ totalProperties: 0, totalViews: 0, totalLikes: 0, level1: 0, level2: 0, level3: 0, earnings: 0 });
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
      if (data?.user) loadDashboard(data.user.id);
    };
    check();
  }, []);

  const loadDashboard = async (userId: string) => {
    try {
      const { data: props } = await supabase.from("properties").select("*").eq("user_id", userId).order("id", { ascending: false });
      if (props) {
        setMyProperties(props);
        const views = props.reduce((a: number, p: any) => a + (Number(p.views || 0)), 0);
        const likes = props.reduce((a: number, p: any) => a + (Number(p.likes_count || 0)), 0);
        setStats((prev) => ({ ...prev, totalProperties: props.length, totalViews: views, totalLikes: likes }));
      }
      const { data: refs } = await supabase.from("referrals").select("*").eq("referrer_id", userId);
      if (refs) {
        const l1 = refs.filter((r: any) => r.level === 1).length;
        const l2 = refs.filter((r: any) => r.level === 2).length;
        const l3 = refs.filter((r: any) => r.level === 3).length;
        const earnings = (l1 * 0) + (l2 * 0) + (l3 * 0);
        setStats((prev) => ({ ...prev, level1: l1, level2: l2, level3: l3, earnings }));
      }
      // ===== REFERRAL CODE - FROM agents TABLE, FALLBACK TO localStorage =====
      let code = "";
      try {
        // Try by email first (auth user email)
        const { data: authData } = await supabase.auth.getUser();
        const userEmail = authData?.user?.email || "";
        if (userEmail) {
          const { data: agentRow } = await supabase.from("agents").select("referral_code").eq("email", userEmail).single();
          if (agentRow?.referral_code) code = agentRow.referral_code;
        }
        // Try by phone from profile if still empty
        if (!code) {
          const { data: prof } = await supabase.from("agent_profiles").select("referral_code").eq("id", userId).single();
          if ((prof as any)?.referral_code) code = (prof as any).referral_code;
        }
      } catch {}
      if (!code && typeof window !== "undefined") {
        code = localStorage.getItem("agent_code") || "";
      }
      if (code) setReferralCode(code);
    } catch {}
  };

  const referralLink = referralCode ? `https://mypropertydot.com/signup?ref=${referralCode}` : `https://mypropertydot.com/signup?ref=${user?.id || ""}`;

  const copyCode = async () => {
    if (!referralCode) { alert("No referral code yet. Register in Agent Register first to get your code."); return; }
    await navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      setLoggingIn(false);
      return;
    }
    setUser(data.user);
    setLoggingIn(false);
    if (data.user) loadDashboard(data.user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMyProperties([]);
    setReferralCode("");
  };

  if (loading) return <main className="min-h-screen bg-[#F5F0FF] flex items-center justify-center">Loading Dashboard... 💜</main>;

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[28px] max-w-[420px] w-full p-6 shadow-[0_20px_50px_rgba(167,139,250,0.25)]">
          <div className="text-center">
            <h1 className="font-black text-[22px]">🔐 Agent Dashboard</h1>
            <p className="text-[13px] text-gray-600 mt-1">This is private. Only the owner of this office can enter.</p>
          </div>
          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <div>
              <label className="text-[12px] font-bold">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Your login email" className="w-full mt-1 bg-white/80 border border-purple-100 h-[42px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="text-[12px] font-bold">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Your password" className="w-full mt-1 bg-white/80 border border-purple-100 h-[42px] px-4 rounded-full text-[13px] outline-none focus:border-purple-400" />
            </div>
            {loginError && <p className="text-[12px] text-red-600 font-bold text-center">{loginError}</p>}
            <button disabled={loggingIn} className="w-full bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white h-[44px] rounded-full text-[13px] font-black shadow-lg">{loggingIn ? "Checking..." : "Login to Dashboard →"}</button>
          </form>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/login" className="text-[12px] font-bold underline">Login Page</Link>
            <Link href="/signup" className="text-[12px] font-bold underline">Create Account</Link>
            <Link href="/" className="text-[12px] font-bold underline">Homepage</Link>
          </div>
          <p className="text-[11px] text-gray-500 text-center mt-4">Forgot password? Use Login Page → Forgot Password</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-[#EDE9FE] to-[#DDD6FE] pb-10 text-black">
      <header className="bg-white/70 backdrop-blur-xl border-b border-purple-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-black text-[16px]">← mypropertydot.com</Link>
          <div className="flex items-center gap-2">
            <span className="text-[12px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold hidden sm:block">{user.email}</span>
            <button onClick={handleLogout} className="bg-black text-white h-[32px] px-4 rounded-full text-[12px] font-bold">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto p-4">
        <h1 className="font-black text-[22px]">Welcome back, Agent 👋</h1>
        <p className="text-[13px] text-gray-600">This is your private dashboard. Only you can see this.</p>

        {/* ===== REFERRAL CODE - ON DASHBOARD ===== */}
        <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[24px] p-4 mt-4 shadow-[0_15px_35px_rgba(167,139,250,0.25)]">
          <p className="text-[11px] tracking-[0.2em] text-purple-600 font-black">🔗 MY REFERRAL CODE — SHARE & EARN</p>
          {referralCode ? (
            <>
              <div className="flex items-center gap-2 mt-3">
                <div className="bg-black text-white font-black text-[26px] tracking-widest px-4 py-2 rounded-[16px] flex-1 text-center">{referralCode}</div>
                <button onClick={copyCode} className="bg-purple-600 text-white h-[48px] px-4 rounded-full text-[12px] font-black shrink-0">{copiedCode ? "Copied ✅" : "Copy Code"}</button>
              </div>
              <p className="text-[12px] text-gray-600 mt-3 break-all bg-white/80 border border-purple-100 rounded-xl p-2">{referralLink}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={copyLink} className="bg-yellow-400 h-[44px] rounded-full text-[12px] font-black">{copiedLink ? "Link Copied ✅" : "Copy My Referral Link 🔗"}</button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Join MyPropertyDot with my code ${referralCode}: ${referralLink}`)}`} target="_blank" className="bg-[#25D366] text-white h-[44px] leading-[44px] rounded-full text-[12px] font-black text-center">Share on WhatsApp 💬</a>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-gray-600 mt-2">You don't have a Referral Code yet. Get one in 10 seconds:</p>
              <Link href="/agent-register" className="block w-full bg-black text-white h-[46px] leading-[46px] rounded-full text-[13px] font-black text-center mt-3">Get My Referral Code →</Link>
            </>
          )}
          <p className="text-[11px] text-gray-500 mt-2">Tell people your CODE or send them your LINK. When they signup + pay, you earn 10% / 5% / 3%.</p>
        </div>

        <div className="bg-black text-white rounded-[24px] p-4 mt-4 overflow-hidden shadow-lg">
          <p className="text-[12px] text-yellow-400 font-black">💰 YOUR REFERRAL EARNINGS</p>
          <p className="font-black text-[26px] mt-1">₦{stats.earnings.toLocaleString()}</p>
          <p className="text-[12px] text-gray-300">Level 1: {stats.level1} agents • 10% &nbsp;|&nbsp; Level 2: {stats.level2} agents • 5% &nbsp;|&nbsp; Level 3: {stats.level3} agents • 3%</p>
          <p className="text-[11px] text-gray-400 mt-1">Paid Every Friday • Terms & Conditions Apply</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[20px] p-4 text-center shadow-sm"><p className="font-black text-[20px]">{stats.totalProperties}</p><p className="text-[11px] text-gray-600">My Properties</p></div>
          <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[20px] p-4 text-center shadow-sm"><p className="font-black text-[20px]">{stats.totalViews}</p><p className="text-[11px] text-gray-600">Total Views</p></div>
          <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[20px] p-4 text-center shadow-sm"><p className="font-black text-[20px]">{stats.totalLikes}</p><p className="text-[11px] text-gray-600">Total Likes</p></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Link href="/upload" className="bg-black text-white rounded-[20px] p-4 text-center font-black text-[13px] shadow-lg">+ Post Property</Link>
          <Link href={`/my-office/${user.id}`} className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[20px] p-4 text-center font-black text-[13px]">View My Office →</Link>
          <button onClick={copyLink} className="bg-yellow-400 rounded-[20px] p-4 text-center font-black text-[13px]">{copiedLink ? "Link Copied ✅" : "Copy My Referral Link 🔗"}</button>
          <Link href="/" className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[20px] p-4 text-center font-black text-[13px]">Homepage</Link>
        </div>

        <h2 className="font-black text-[16px] mt-6 mb-3">My Properties ({myProperties.length})</h2>
        {myProperties.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[20px] p-6 text-center text-[13px] text-gray-600">No properties yet. <Link href="/upload" className="font-bold text-purple-700 underline">Post your first property →</Link></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {myProperties.map((p: any) => (
              <div key={p.id} className="bg-white/60 backdrop-blur-xl border border-purple-200 rounded-[20px] overflow-hidden shadow-sm">
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                  <img src={p.cover_image_url || p.images?.[0] || p.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"} className="w-full h-full object-cover" alt="" />
                  {p.cover_image_url && (
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full">🖼️ COVER</span>
                  )}
                </div>
                <div className="p-3"><p className="text-[12px] font-bold line-clamp-2">{p.title}</p><p className="text-[11px] text-gray-600 mt-1">{p.location}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
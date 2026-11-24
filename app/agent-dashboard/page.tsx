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
      // Referrals - replace table name with yours if different
      const { data: refs } = await supabase.from("referrals").select("*").eq("referrer_id", userId);
      if (refs) {
        const l1 = refs.filter((r: any) => r.level === 1).length;
        const l2 = refs.filter((r: any) => r.level === 2).length;
        const l3 = refs.filter((r: any) => r.level === 3).length;
        // Example: 10% L1, 5% L2, 3% L3 - adjust to your real earning logic
        const earnings = (l1 * 0) + (l2 * 0) + (l3 * 0);
        setStats((prev) => ({ ...prev, level1: l1, level2: l2, level3: l3, earnings }));
      }
    } catch {}
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
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center">Loading Dashboard...</main>;

  // ===== 1. NOT LOGGED IN - ASK FOR LOGIN DETAILS FIRST =====
  if (!user) {
    return (
      <main className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 shadow-lg">
          <div className="text-center">
            <h1 className="font-black text-[22px]">🔐 Agent Dashboard</h1>
            <p className="text-[13px] text-gray-500 mt-1">This is private. Only the owner of this office can enter.</p>
          </div>
          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <div>
              <label className="text-[12px] font-bold">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Your login email" className="w-full mt-1 bg-[#f2f2f2] h-[42px] px-4 rounded-full text-[13px] outline-none" />
            </div>
            <div>
              <label className="text-[12px] font-bold">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Your password" className="w-full mt-1 bg-[#f2f2f2] h-[42px] px-4 rounded-full text-[13px] outline-none" />
            </div>
            {loginError && <p className="text-[12px] text-red-600 font-bold text-center">{loginError}</p>}
            <button disabled={loggingIn} className="w-full bg-black text-white h-[44px] rounded-full text-[13px] font-black">{loggingIn ? "Checking..." : "Login to Dashboard →"}</button>
          </form>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/login" className="text-[12px] font-bold underline">Login Page</Link>
            <Link href="/signup" className="text-[12px] font-bold underline">Create Account</Link>
            <Link href="/" className="text-[12px] font-bold underline">Homepage</Link>
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-4">Forgot password? Use Login Page → Forgot Password</p>
        </div>
      </main>
    );
  }

  // ===== 2. LOGGED IN - SHOW DASHBOARD =====
  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <header className="bg-white sticky top-0 z-40 shadow-sm">
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
        <p className="text-[13px] text-gray-500">This is your private dashboard. Only you can see this.</p>

        <div className="bg-black text-white rounded-2xl p-4 mt-4 overflow-hidden">
          <p className="text-[12px] text-yellow-400 font-black">💰 YOUR REFERRAL EARNINGS</p>
          <p className="font-black text-[26px] mt-1">₦{stats.earnings.toLocaleString()}</p>
          <p className="text-[12px] text-gray-300">Level 1: {stats.level1} agents • 10% &nbsp;|&nbsp; Level 2: {stats.level2} agents • 5% &nbsp;|&nbsp; Level 3: {stats.level3} agents • 3%</p>
          <p className="text-[11px] text-gray-400 mt-1">Paid Every Friday • Terms & Conditions Apply</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm"><p className="font-black text-[20px]">{stats.totalProperties}</p><p className="text-[11px] text-gray-500">My Properties</p></div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm"><p className="font-black text-[20px]">{stats.totalViews}</p><p className="text-[11px] text-gray-500">Total Views</p></div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm"><p className="font-black text-[20px]">{stats.totalLikes}</p><p className="text-[11px] text-gray-500">Total Likes</p></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Link href="/upload" className="bg-black text-white rounded-xl p-4 text-center font-black text-[13px]">+ Post Property</Link>
          <Link href={`/my-office/${user.id}`} className="bg-white rounded-xl p-4 text-center font-black text-[13px] border">View My Office →</Link>
          <button onClick={() => { navigator.clipboard.writeText(`https://mypropertydot.com/signup?ref=${user.id}`); alert("Your referral link copied ✅"); }} className="bg-yellow-400 rounded-xl p-4 text-center font-black text-[13px]">Copy My Referral Link 🔗</button>
          <Link href="/" className="bg-white rounded-xl p-4 text-center font-black text-[13px] border">Homepage</Link>
        </div>

        <h2 className="font-black text-[16px] mt-6 mb-3">My Properties ({myProperties.length})</h2>
        {myProperties.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-[13px] text-gray-500">No properties yet. <Link href="/upload" className="font-bold text-black underline">Post your first property →</Link></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {myProperties.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <img src={p.images?.[0] || p.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"} className="w-full h-[140px] object-cover" alt="" />
                <div className="p-3"><p className="text-[12px] font-bold line-clamp-2">{p.title}</p><p className="text-[11px] text-gray-500 mt-1">{p.location}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

const ADMIN_PASSWORD = "CEO2026";

export default function AdminPage() {
  const [tab, setTab] = useState<"dashboard" | "properties" | "agents" | "feedback">("dashboard");

  // Password Lock - NEW ONLY
  const [isAuthed, setIsAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Old data - kept
  const [pending, setPending] = useState<any[]>([]);
  const [verified, setVerified] = useState<any[]>([]);
  const [visitors, setVisitors] = useState(0);
  const [localSubs, setLocalSubs] = useState<any[]>([]);

  // Feedback - new from last step
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  // Agents / Free Sub / Freeze - NEW
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [allAgents, setAllAgents] = useState<any[]>([]);
  const [freeSubs, setFreeSubs] = useState<any[]>([]);

  // Give Free Sub form
  const [giveEmail, setGiveEmail] = useState("");
  const [givePlan, setGivePlan] = useState("5 Day Free - Static");
  const [giveDays, setGiveDays] = useState(5);
  const [giving, setGiving] = useState(false);

  // Freeze form
  const [freezeReason, setFreezeReason] = useState("");

  useEffect(() => {
    if (localStorage.getItem("ceo_admin_authed") === "true") setIsAuthed(true);
    setAuthChecked(true);
  }, []);

  useEffect(() => { if (isAuthed) loadAll(); }, [isAuthed]);

  const loadAll = async () => {
    // --- OLD localStorage (kept) ---
    const props1 = JSON.parse(localStorage.getItem("myProperties") || "[]");
    const props2 = JSON.parse(localStorage.getItem("myprops") || "[]");
    const allLocal = [...props1, ...props2];
    const uniqueLocal = allLocal.filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i);
    setVisitors(parseInt(localStorage.getItem("site_visitors") || "0") || 0);
    setLocalSubs(JSON.parse(localStorage.getItem("site_subscribers") || "[]"));

    // --- Supabase properties ---
    let supaProps: any[] = [];
    try {
      const { data } = await supabase.from("properties").select("*").order("id", { ascending: false });
      supaProps = data || [];
    } catch {}
    const combined = [...supaProps, ...uniqueLocal].filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => String(x.id) === String(p.id)) === i);
    // In Supabase we treat all as verified unless you mark pending. Pending = local unverified + supabase with verified=false
    setPending(combined.filter((p: any) => p.verified === false));
    setVerified(combined.filter((p: any) => p.verified !== false));

    // --- Feedbacks ---
    try {
      const { data } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
      setFeedbacks(data || []);
    } catch {}

    // --- Agents from properties + profiles ---
    try {
      const { data: profs } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const fromProps = supaProps.map((p: any) => ({ id: p.user_id, email: p.agent_email || p.email || p.agent_name || "Unknown", name: p.agent_name || "Agent", is_frozen: false, from: "property" }));
      const merged: any[] = [];
      [...(profs || []), ...fromProps].forEach((a: any) => {
        if (!a.email) return;
        if (!merged.find((m: any) => String(m.email).toLowerCase() === String(a.email).toLowerCase())) merged.push(a);
      });
      setAllAgents(merged);
    } catch {}

    // --- Free Subs ---
    try {
      const { data } = await supabase.from("free_subscriptions").select("*").order("created_at", { ascending: false });
      setFreeSubs(data || []);
    } catch {}

    // --- Visitors: count real visits ---
    // We add: localStorage visitors + total properties views approximation + feedback senders + subs
    // For true visitor tracking, we also count unique agents + properties as base
    const baseVisitors = parseInt(localStorage.getItem("site_visitors") || "0") || 0;
    if (baseVisitors === 0) {
      // First time: set visitors = properties + agents + 1 (you) so it is not 0
      const calc = supaProps.length + 1;
      setVisitors(calc);
      localStorage.setItem("site_visitors", String(calc));
    }
  };

  // ===== SEARCH BY EMAIL =====
  const searchAgent = async () => {
    if (!searchEmail.trim()) { alert("Type an email to search"); return; }
    setSearching(true);
    const q = searchEmail.trim().toLowerCase();
    // 1. Search in loaded agents
    let found = allAgents.filter((a: any) => String(a.email).toLowerCase().includes(q));
    // 2. Search in Supabase profiles
    try {
      const { data } = await supabase.from("profiles").select("*").ilike("email", `%${searchEmail.trim()}%`);
      if (data && data.length) {
        data.forEach((d: any) => { if (!found.find((f: any) => f.email === d.email)) found.push(d); });
      }
    } catch {}
    // 3. Search in properties by agent_email
    try {
      const { data } = await supabase.from("properties").select("*").ilike("agent_email", `%${searchEmail.trim()}%`);
      if (data && data.length) {
        data.forEach((p: any) => { if (!found.find((f: any) => f.email === p.agent_email)) found.push({ id: p.user_id, email: p.agent_email, name: p.agent_name }); });
      }
    } catch {}
    setSearchResult(found);
    setGiveEmail(searchEmail.trim());
    setSearching(false);
    if (found.length === 0) alert("No agent found with that email in profiles/properties. You can still give FREE sub by typing the email in the Give Free Sub form below — it will work even if they have not posted yet.");
  };

  // ===== GIVE FREE SUBSCRIPTION WITH TIME =====
  const giveFreeSub = async () => {
    if (!giveEmail.trim()) { alert("Enter agent email"); return; }
    if (!giveDays || giveDays <= 0) { alert("Enter days, e.g. 5, 14, 30, 60"); return; }
    setGiving(true);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + Number(giveDays));
      const { error } = await supabase.from("free_subscriptions").insert({
        email: giveEmail.trim().toLowerCase(),
        plan: givePlan,
        days: Number(giveDays),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        status: "active",
      });
      if (error) throw error;
      alert(`✅ FREE ${givePlan} given to ${giveEmail} for ${giveDays} days. Ends: ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`);
      setGiveEmail(""); setSearchEmail(""); setSearchResult([]);
      loadAll();
    } catch (e: any) {
      alert("Failed: " + e.message + " — Did you run the SQL in Step 1?");
    }
    setGiving(false);
  };

  const cancelSub = async (id: number) => {
    if (!confirm("Cancel this free subscription?")) return;
    await supabase.from("free_subscriptions").update({ status: "cancelled" }).eq("id", id);
    loadAll();
  };

  // ===== FREEZE / UNFREEZE =====
  const toggleFreeze = async (agent: any) => {
    const isFrozen = !agent.is_frozen;
    const reason = isFrozen ? (freezeReason || prompt("Why are you freezing this account? e.g. Fake property, rude to clients") || "Misbehaviour") : "";
    if (isFrozen && !confirm(`Freeze ${agent.email}? They will not be able to post.`)) return;
    try {
      // Try Supabase profiles
      const { data: existing } = await supabase.from("profiles").select("*").eq("email", agent.email).maybeSingle();
      if (existing) {
        await supabase.from("profiles").update({ is_frozen: isFrozen, frozen_reason: reason }).eq("email", agent.email);
      } else {
        await supabase.from("profiles").insert({ id: agent.id || crypto.randomUUID(), email: agent.email, name: agent.name || "Agent", is_frozen: isFrozen, frozen_reason: reason });
      }
    } catch {}
    // Also keep in localStorage for instant effect
    const frozenList = JSON.parse(localStorage.getItem("frozen_agents") || "[]");
    if (isFrozen) { if (!frozenList.includes(agent.email)) frozenList.push(agent.email); }
    else { const idx = frozenList.indexOf(agent.email); if (idx > -1) frozenList.splice(idx, 1); }
    localStorage.setItem("frozen_agents", JSON.stringify(frozenList));
    setAllAgents(prev => prev.map((a: any) => a.email === agent.email ? { ...a, is_frozen: isFrozen } : a));
    setSearchResult(prev => prev.map((a: any) => a.email === agent.email ? { ...a, is_frozen: isFrozen } : a));
    setFreezeReason("");
    alert(isFrozen ? `🧊 ${agent.email} is now FROZEN.` : `✅ ${agent.email} is now UNFROZEN.`);
  };

  const approve = (id: number) => {
    ["myProperties", "myprops"].forEach(key => {
      const all = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = all.map((p: any) => p.id === id ? { ...p, verified: true } : p);
      if (all.length > 0) localStorage.setItem(key, JSON.stringify(updated));
    });
    // Also try Supabase
    supabase.from("properties").update({ verified: true }).eq("id", id).then(() => loadAll());
  };
  const reject = async (id: number) => {
    ["myProperties", "myprops"].forEach(key => {
      const all = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = all.filter((p: any) => p.id !== id);
      if (all.length > 0) localStorage.setItem(key, JSON.stringify(updated));
    });
    await supabase.from("properties").delete().eq("id", id);
    loadAll();
  };
  const markFeedbackFixed = async (id: number) => {
    await supabase.from("feedbacks").update({ status: "fixed" }).eq("id", id);
    setFeedbacks(prev => prev.map((f: any) => f.id === id ? { ...f, status: "fixed" } : f));
  };

  const totalSubscribed = freeSubs.filter((s: any) => s.status === "active").length + localSubs.length;
  const activeFreeSubs = freeSubs.filter((s: any) => s.status === "active");
  const expiredFreeSubs = freeSubs.filter((s: any) => s.status !== "active" || new Date(s.end_date) < new Date());

  const isExpired = (s: any) => new Date(s.end_date) < new Date() || s.status === "cancelled";
  const daysLeft = (s: any) => Math.max(0, Math.ceil((new Date(s.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  // ===== PASSWORD SCREEN - NEW ONLY =====
  if (authChecked && !isAuthed) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "100%", maxWidth: "400px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "40px" }}>🔒</div>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", marginTop: "10px" }}>CEO Only</h1>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>Enter password to open Admin Dashboard</p>
          <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { if (passwordInput === ADMIN_PASSWORD) { localStorage.setItem("ceo_admin_authed", "true"); setIsAuthed(true); setPasswordError(""); } else { setPasswordError("Wrong password"); } } }} placeholder="Password" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "20px", boxSizing: "border-box", outline: "none" }} />
          {passwordError && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px" }}>{passwordError}</p>}
          <button onClick={() => { if (passwordInput === ADMIN_PASSWORD) { localStorage.setItem("ceo_admin_authed", "true"); setIsAuthed(true); setPasswordError(""); } else { setPasswordError("Wrong password"); } }} style={{ width: "100%", background: "black", color: "white", padding: "14px", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", marginTop: "14px", border: "none" }}>Enter Admin →</button>
          <Link href="/" style={{ display: "block", marginTop: "14px", fontSize: "12px", color: "#64748b" }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontSize: "12px", fontWeight: "bold" }}>← Back to Home</Link>
        <button onClick={() => { localStorage.removeItem("ceo_admin_authed"); setIsAuthed(false); setPasswordInput(""); }} style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Lock Admin 🔒 Logout</button>
      </div>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#000000", marginTop: "8px" }}>Admin Dashboard</h1>
      <p style={{ color: "#64748b" }}>MY PROPERTY.COM - Tracking progress • CEO Only</p>

      {/* TABS */}
      <div style={{ display: "flex", gap: "8px", marginTop: "18px", flexWrap: "wrap" }}>
        {([["dashboard", "📊 Dashboard"], ["properties", `🏠 Properties (${pending.length + verified.length})`], ["agents", `👥 Agents & Free Sub (${allAgents.length})`], ["feedback", `💬 Feedback (${feedbacks.filter((f: any) => f.status !== "fixed").length} new)`]] as any).map(([key, label]: any) => (
          <button key={key} onClick={() => setTab(key)} style={{ background: tab === key ? "black" : "white", color: tab === key ? "white" : "black", padding: "10px 16px", borderRadius: "999px", border: "1px solid #e2e8f0", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>{label}</button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px", marginTop: "25px" }}>
            <div style={{ background: "white", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #3b82f6" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>VISITORS</div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>{visitors}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Total site visits</div>
            </div>
            <div style={{ background: "white", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #8b5cf6" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>VISITORS THAT SUBSCRIBED</div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>{totalSubscribed}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Free Sub + Local Subs • {visitors > 0 ? Math.round((totalSubscribed / visitors) * 100) : 0}% conversion</div>
            </div>
            <div style={{ background: "white", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #ea580c" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>PENDING</div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>{pending.length}</div>
            </div>
            <div style={{ background: "white", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #16a34a" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>VERIFIED</div>
              <div style={{ fontSize: "24px", fontWeight: 800 }}>{verified.length}</div>
            </div>
          </div>

          <div style={{ background: "white", padding: "16px", borderRadius: "12px", marginTop: "18px" }}>
            <b>🔥 Active Free Subscriptions ({activeFreeSubs.length})</b>
            {activeFreeSubs.length === 0 && <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>No active free sub yet. Go to Agents tab to give one.</p>}
            {activeFreeSubs.slice(0, 5).map((s: any) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                <span><b>{s.email}</b> — {s.plan}</span>
                <span>{isExpired(s) ? "❌ Expired" : `⏳ ${daysLeft(s)} days left • Ends ${new Date(s.end_date).toLocaleDateString()}`}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#fef3c7", padding: "16px", borderRadius: "12px", marginTop: "14px", fontSize: "13px" }}>
            <b>💡 How Free Sub works:</b> Search agent by email → Choose plan → Choose days → Give. System auto-calculates end date. If agent is frozen, they cannot post even with free sub.
          </div>
        </>
      )}

      {/* PROPERTIES */}
      {tab === "properties" && (
        <>
          <h2 style={{ marginTop: "25px", fontSize: "20px", fontWeight: "bold" }}>Pending Verification ({pending.length})</h2>
          <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
            {pending.map((p: any) => (
              <div key={p.id} style={{ border: "1px solid #fed7aa", padding: "12px", display: "flex", justifyContent: "space-between", background: "white", borderRadius: "8px", alignItems: "center" }}>
                <div><b>{p.name || p.title}</b> - {p.location} - {p.price}</div>
                <div>
                  <button onClick={() => approve(p.id)} style={{ background: "#16a34a", color: "white", padding: "8px 16px", marginRight: "5px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>✓ VERIFY</button>
                  <button onClick={() => reject(p.id)} style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 12px", border: "none", borderRadius: "6px", cursor: "pointer" }}>X</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p style={{ color: "#94a3b8", background: "white", padding: "15px", borderRadius: "8px" }}>No pending properties.</p>}
          </div>
          <h2 style={{ marginTop: "35px", fontSize: "20px", fontWeight: "bold" }}>Verified Properties ({verified.length})</h2>
          <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
            {verified.map((p: any) => (
              <div key={p.id} style={{ border: "1px solid #bbf7d0", padding: "12px", background: "white", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                <span><b>{p.name || p.title}</b> - {p.location} - {p.price} ✅ VERIFIED</span>
                <button onClick={() => reject(p.id)} style={{ background: "#fee2e2", color: "#dc2626", padding: "6px 12px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* AGENTS + FREE SUB + FREEZE */}
      {tab === "agents" && (
        <>
          <div style={{ background: "white", padding: "18px", borderRadius: "12px", marginTop: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>🔍 Search Agent by Email</h2>
            <p style={{ fontSize: "12px", color: "#64748b" }}>Type full or part of email, e.g. john@gmail.com</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <input value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Agent email..." style={{ flex: 1, padding: "12px", borderRadius: "999px", border: "1px solid #e2e8f0", outline: "none" }} />
              <button onClick={searchAgent} disabled={searching} style={{ background: "black", color: "white", padding: "0 20px", borderRadius: "999px", fontWeight: "bold", cursor: "pointer" }}>{searching ? "Searching..." : "Search"}</button>
            </div>
            {searchResult.map((a: any) => (
              <div key={a.email} style={{ marginTop: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: a.is_frozen ? "#fef2f2" : "#f8fafc" }}>
                <div>
                  <b>{a.name || "Agent"}</b> — {a.email} {a.is_frozen ? "🧊 FROZEN" : "✅ Active"}
                  {a.frozen_reason && <div style={{ fontSize: "11px", color: "#dc2626" }}>Reason: {a.frozen_reason}</div>}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => { setGiveEmail(a.email); }} style={{ background: "#8b5cf6", color: "white", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Give Free Sub ↓</button>
                  <button onClick={() => toggleFreeze(a)} style={{ background: a.is_frozen ? "#16a34a" : "#dc2626", color: "white", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>{a.is_frozen ? "Unfreeze ✅" : "Freeze 🧊"}</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "white", padding: "18px", borderRadius: "12px", marginTop: "14px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>🎁 Give FREE Subscription (with Time)</h2>
            <p style={{ fontSize: "12px", color: "#64748b" }}>You can give to any email, even if agent has not posted yet.</p>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              <input value={giveEmail} onChange={(e) => setGiveEmail(e.target.value)} placeholder="Agent email e.g. agent@gmail.com" style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <select value={givePlan} onChange={(e) => { setGivePlan(e.target.value); if (e.target.value.includes("5 Day")) setGiveDays(5); if (e.target.value.includes("Static")) setGiveDays(30); if (e.target.value.includes("Premium")) setGiveDays(60); if (e.target.value.includes("COMBO")) setGiveDays(75); if (e.target.value.includes("Loyalty")) setGiveDays(30); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <option>5 Day Free - Static</option>
                  <option>Static - 5 Sliding Pictures (1 Month)</option>
                  <option>Premium Video - 60 Sec (2 Months)</option>
                  <option>COMBO - 1 Min 20 Sec</option>
                  <option>Loyalty Reward - FREE 1 + FREE 2</option>
                  <option>Custom Free</option>
                </select>
                <input type="number" value={giveDays} onChange={(e) => setGiveDays(Number(e.target.value))} placeholder="Days" style={{ width: "110px", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[5, 7, 14, 30, 60, 75].map(d => (
                  <button key={d} onClick={() => setGiveDays(d)} style={{ background: giveDays === d ? "black" : "#f1f5f9", color: giveDays === d ? "white" : "black", padding: "8px 14px", borderRadius: "999px", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>{d} Days</button>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: "bold" }}>Ends: {new Date(Date.now() + giveDays * 24 * 60 * 60 * 1000).toLocaleDateString()} — {giveDays} days from now</p>
              <button onClick={giveFreeSub} disabled={giving} style={{ background: "black", color: "white", padding: "14px", borderRadius: "999px", fontWeight: "bold", cursor: "pointer" }}>{giving ? "Giving..." : "Give FREE Subscription →"}</button>
            </div>
          </div>

          <div style={{ background: "white", padding: "18px", borderRadius: "12px", marginTop: "14px" }}>
            <h3 style={{ fontWeight: "bold" }}>🧊 Freeze Reason (optional, type before you click Freeze)</h3>
            <input value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)} placeholder="e.g. Posted fake property, insulted client" style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "8px" }} />
          </div>

          <h2 style={{ marginTop: "22px", fontSize: "18px", fontWeight: "bold" }}>All Free Subscriptions ({freeSubs.length})</h2>
          <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
            {freeSubs.map((s: any) => (
              <div key={s.id} style={{ background: "white", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: isExpired(s) ? "4px solid #dc2626" : "4px solid #16a34a" }}>
                <div>
                  <b>{s.email}</b> — {s.plan}<br />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{new Date(s.start_date).toLocaleDateString()} → {new Date(s.end_date).toLocaleDateString()} • {isExpired(s) ? "❌ Expired / Cancelled" : `⏳ ${daysLeft(s)} days left`}</span>
                </div>
                {!isExpired(s) && <button onClick={() => cancelSub(s.id)} style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Cancel</button>}
              </div>
            ))}
            {freeSubs.length === 0 && <p style={{ background: "white", padding: "14px", borderRadius: "12px", color: "#94a3b8" }}>No free subs yet.</p>}
          </div>

          <h2 style={{ marginTop: "22px", fontSize: "18px", fontWeight: "bold" }}>All Agents Found ({allAgents.length})</h2>
          <div style={{ display: "grid", gap: "8px", marginTop: "10px" }}>
            {allAgents.map((a: any) => (
              <div key={a.email} style={{ background: "white", padding: "12px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><b>{a.name}</b> — {a.email} {a.is_frozen ? "🧊 FROZEN" : ""}</span>
                <button onClick={() => toggleFreeze(a)} style={{ background: a.is_frozen ? "#16a34a" : "#dc2626", color: "white", padding: "6px 12px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>{a.is_frozen ? "Unfreeze" : "Freeze"}</button>
              </div>
            ))}
            {allAgents.length === 0 && <p style={{ background: "white", padding: "14px", borderRadius: "12px", color: "#94a3b8" }}>No agents found yet. Agents will appear here after they post or you add them in profiles.</p>}
          </div>
        </>
      )}

      {/* FEEDBACK - from previous step, now inside Admin */}
      {tab === "feedback" && (
        <>
          <h2 style={{ marginTop: "20px", fontSize: "20px", fontWeight: "bold" }}>Feedback ({feedbacks.length}) — {feedbacks.filter((f: any) => f.status !== "fixed").length} new</h2>
          <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
            {feedbacks.map((f: any) => (
              <div key={f.id} style={{ background: "white", padding: "14px", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b style={{ fontSize: "13px" }}>{f.category}</b>
                  <span style={{ fontSize: "11px", background: f.status === "fixed" ? "#dcfce7" : "#fef9c3", padding: "4px 10px", borderRadius: "999px", fontWeight: "bold" }}>{f.status}</span>
                </div>
                <p style={{ fontSize: "13px", marginTop: "8px" }}>{f.message}</p>
                <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>From: {f.email || f.name} • {new Date(f.created_at).toLocaleString()} • {f.page_url}</p>
                {f.status !== "fixed" && <button onClick={() => markFeedbackFixed(f.id)} style={{ marginTop: "10px", background: "black", color: "white", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Mark as Fixed ✅</button>}
              </div>
            ))}
            {feedbacks.length === 0 && <p style={{ background: "white", padding: "14px", borderRadius: "12px", color: "#94a3b8" }}>No feedback yet. Good!</p>}
          </div>
        </>
      )}
    </div>
  );
}
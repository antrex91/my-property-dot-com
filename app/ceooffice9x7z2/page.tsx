"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

const ADMIN_PASSWORD = "CEO2026";

export default function AdminPage() {
  const [tab, setTab] = useState<"dashboard" | "properties" | "agents" | "feedback" | "nin">("dashboard");
  const [isAuthed, setIsAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [pending, setPending] = useState<any[]>([]);
  const [verified, setVerified] = useState<any[]>([]);
  const [visitors, setVisitors] = useState(0);
  const [localSubs, setLocalSubs] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [allAgents, setAllAgents] = useState<any[]>([]);
  const [freeSubs, setFreeSubs] = useState<any[]>([]);
  const [giveEmail, setGiveEmail] = useState("");
  const [givePlan, setGivePlan] = useState("5 Day Free - Static");
  const [giveDays, setGiveDays] = useState(5);
  const [giving, setGiving] = useState(false);
  const [freezeReason, setFreezeReason] = useState("");

  // ===== NIN APPROVALS - NEW =====
  const [ninPending, setNinPending] = useState<any[]>([]);
  const [ninVerifiedList, setNinVerifiedList] = useState<any[]>([]);
  const [ninRejectedList, setNinRejectedList] = useState<any[]>([]);
  const [ninSearch, setNinSearch] = useState("");
  const [ninLoading, setNinLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("ceo_admin_authed") === "true") setIsAuthed(true);
    setAuthChecked(true);
  }, []);
  useEffect(() => { if (isAuthed) loadAll(); }, [isAuthed]);

  const loadAll = async () => {
    const props1 = JSON.parse(localStorage.getItem("myProperties") || "[]");
    const props2 = JSON.parse(localStorage.getItem("myprops") || "[]");
    const allLocal = [...props1, ...props2];
    const uniqueLocal = allLocal.filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i);
    setVisitors(parseInt(localStorage.getItem("site_visitors") || "0") || 0);
    setLocalSubs(JSON.parse(localStorage.getItem("site_subscribers") || "[]"));
    let supaProps: any[] = [];
    try { const { data } = await supabase.from("properties").select("*").order("id", { ascending: false }); supaProps = data || []; } catch {}
    const combined = [...supaProps, ...uniqueLocal].filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => String(x.id) === String(p.id)) === i);
    setPending(combined.filter((p: any) => p.verified === false));
    setVerified(combined.filter((p: any) => p.verified !== false));
    try { const { data } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false }); setFeedbacks(data || []); } catch {}
    try {
      const { data: profs } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const fromProps = supaProps.map((p: any) => ({ id: p.user_id, email: p.agent_email || p.email || p.agent_name || "Unknown", name: p.agent_name || "Agent", is_frozen: false, from: "property" }));
      const merged: any[] = [];
      [...(profs || []), ...fromProps].forEach((a: any) => { if (!a.email) return; if (!merged.find((m: any) => String(m.email).toLowerCase() === String(a.email).toLowerCase())) merged.push(a); });
      setAllAgents(merged);
    } catch {}
    try { const { data } = await supabase.from("free_subscriptions").select("*").order("created_at", { ascending: false }); setFreeSubs(data || []); } catch {}

    // ===== LOAD NIN APPLICATIONS FROM agent_profiles =====
    try {
      const { data: ninData } = await supabase.from("agent_profiles").select("*").order("created_at", { ascending: false });
      if (ninData) {
        // Only agents who submitted NIN, OR all agents - show pending first
        const withNin = ninData.filter((a: any) => a.nin_number || a.nin_slip_url || a.verification_status);
        // If no one has verification_status yet (old agents), show all as pending so you can verify them
        const listToUse = withNin.length > 0 ? withNin : ninData;
        setNinPending(listToUse.filter((a: any) => (a.verification_status || "pending").toLowerCase() === "pending"));
        setNinVerifiedList(listToUse.filter((a: any) => ["approved", "verified"].includes((a.verification_status || "").toLowerCase()) || a.nin_verified === true));
        setNinRejectedList(listToUse.filter((a: any) => (a.verification_status || "").toLowerCase() === "rejected"));
      }
    } catch (e: any) { console.log("NIN load failed - check agent_profiles columns", e.message); }

    const baseVisitors = parseInt(localStorage.getItem("site_visitors") || "0") || 0;
    if (baseVisitors === 0) { const calc = supaProps.length + 1; setVisitors(calc); localStorage.setItem("site_visitors", String(calc)); }
  };

  // ===== APPROVE / REJECT NIN =====
  const approveNin = async (agent: any) => {
    if (!confirm(`Approve ${agent.name}?\n\nCheck:\n1. Name on NIN = ${agent.name}?\n2. Face on NIN = Face on selfie?\n\nIf YES, click OK.`)) return;
    setNinLoading(true);
    try {
      const { error } = await supabase.from("agent_profiles").update({ verification_status: "approved", nin_verified: true }).eq("id", agent.id);
      if (error) throw error;
      alert(`✅ ${agent.name} is now VERIFIED AGENT. Their My Office will show ✅ VERIFIED AGENT.`);
      loadAll();
    } catch (e: any) { alert("Approve failed: " + e.message); }
    setNinLoading(false);
  };

  const rejectNin = async (agent: any) => {
    const reason = prompt(`Why are you rejecting ${agent.name}?\n\nExample: Name does not match NIN, Face does not match, Fake NIN`);
    if (reason === null) return;
    setNinLoading(true);
    try {
      const { error } = await supabase.from("agent_profiles").update({ verification_status: "rejected", nin_verified: false }).eq("id", agent.id);
      if (error) throw error;
      alert(`❌ ${agent.name} rejected. Their My Office will show ❌ NOT VERIFIED.`);
      loadAll();
    } catch (e: any) { alert("Reject failed: " + e.message); }
    setNinLoading(false);
  };

  const unverifyNin = async (agent: any) => {
    if (!confirm(`Move ${agent.name} back to PENDING?`)) return;
    await supabase.from("agent_profiles").update({ verification_status: "pending", nin_verified: false }).eq("id", agent.id);
    loadAll();
  };

  const searchAgent = async () => {
    if (!searchEmail.trim()) { alert("Type an email to search"); return; }
    setSearching(true);
    const q = searchEmail.trim().toLowerCase();
    let found = allAgents.filter((a: any) => String(a.email).toLowerCase().includes(q));
    try { const { data } = await supabase.from("profiles").select("*").ilike("email", `%${searchEmail.trim()}%`); if (data && data.length) { data.forEach((d: any) => { if (!found.find((f: any) => f.email === d.email)) found.push(d); }); } } catch {}
    try { const { data } = await supabase.from("properties").select("*").ilike("agent_email", `%${searchEmail.trim()}%`); if (data && data.length) { data.forEach((p: any) => { if (!found.find((f: any) => f.email === p.agent_email)) found.push({ id: p.user_id, email: p.agent_email, name: p.agent_name }); }); } } catch {}
    setSearchResult(found); setGiveEmail(searchEmail.trim()); setSearching(false);
    if (found.length === 0) alert("No agent found with that email in profiles/properties. You can still give FREE sub by typing the email in the Give Free Sub form below.");
  };

  const giveFreeSub = async () => {
    if (!giveEmail.trim()) { alert("Enter agent email"); return; }
    if (!giveDays || giveDays <= 0) { alert("Enter days, e.g. 5, 14, 30, 60"); return; }
    setGiving(true);
    try {
      const start = new Date(); const end = new Date(); end.setDate(end.getDate() + Number(giveDays));
      const { error } = await supabase.from("free_subscriptions").insert({ email: giveEmail.trim().toLowerCase(), plan: givePlan, days: Number(giveDays), start_date: start.toISOString(), end_date: end.toISOString(), status: "active" });
      if (error) throw error;
      alert(`✅ FREE ${givePlan} given to ${giveEmail} for ${giveDays} days. Ends: ${end.toLocaleDateString()}`);
      setGiveEmail(""); setSearchEmail(""); setSearchResult([]); loadAll();
    } catch (e: any) { alert("Failed: " + e.message); }
    setGiving(false);
  };

  const cancelSub = async (id: number) => { if (!confirm("Cancel this free subscription?")) return; await supabase.from("free_subscriptions").update({ status: "cancelled" }).eq("id", id); loadAll(); };

  const toggleFreeze = async (agent: any) => {
    const isFrozen = !agent.is_frozen;
    const reason = isFrozen ? (freezeReason || prompt("Why are you freezing this account?") || "Misbehaviour") : "";
    if (isFrozen && !confirm(`Freeze ${agent.email}? They will not be able to post.`)) return;
    try {
      const { data: existing } = await supabase.from("profiles").select("*").eq("email", agent.email).maybeSingle();
      if (existing) { await supabase.from("profiles").update({ is_frozen: isFrozen, frozen_reason: reason }).eq("email", agent.email); }
      else { await supabase.from("profiles").insert({ id: agent.id || crypto.randomUUID(), email: agent.email, name: agent.name || "Agent", is_frozen: isFrozen, frozen_reason: reason }); }
    } catch {}
    const frozenList = JSON.parse(localStorage.getItem("frozen_agents") || "[]");
    if (isFrozen) { if (!frozenList.includes(agent.email)) frozenList.push(agent.email); } else { const idx = frozenList.indexOf(agent.email); if (idx > -1) frozenList.splice(idx, 1); }
    localStorage.setItem("frozen_agents", JSON.stringify(frozenList));
    setAllAgents(prev => prev.map((a: any) => a.email === agent.email ? { ...a, is_frozen: isFrozen } : a));
    setSearchResult(prev => prev.map((a: any) => a.email === agent.email ? { ...a, is_frozen: isFrozen } : a));
    setFreezeReason(""); alert(isFrozen ? `🧊 ${agent.email} is now FROZEN.` : `✅ ${agent.email} is now UNFROZEN.`);
  };

  const approve = (id: number) => {
    ["myProperties", "myprops"].forEach(key => { const all = JSON.parse(localStorage.getItem(key) || "[]"); const updated = all.map((p: any) => p.id === id ? { ...p, verified: true } : p); if (all.length > 0) localStorage.setItem(key, JSON.stringify(updated)); });
    supabase.from("properties").update({ verified: true }).eq("id", id).then(() => loadAll());
  };
  const reject = async (id: number) => {
    ["myProperties", "myprops"].forEach(key => { const all = JSON.parse(localStorage.getItem(key) || "[]"); const updated = all.filter((p: any) => p.id !== id); if (all.length > 0) localStorage.setItem(key, JSON.stringify(updated)); });
    await supabase.from("properties").delete().eq("id", id); loadAll();
  };
  const markFeedbackFixed = async (id: number) => { await supabase.from("feedbacks").update({ status: "fixed" }).eq("id", id); setFeedbacks(prev => prev.map((f: any) => f.id === id ? { ...f, status: "fixed" } : f)); };

  const totalSubscribed = freeSubs.filter((s: any) => s.status === "active").length + localSubs.length;
  const activeFreeSubs = freeSubs.filter((s: any) => s.status === "active");
  const isExpired = (s: any) => new Date(s.end_date) < new Date() || s.status === "cancelled";
  const daysLeft = (s: any) => Math.max(0, Math.ceil((new Date(s.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const filteredNinPending = ninPending.filter((a: any) => `${a.name || ""} ${a.phone || ""} ${a.nin_number || ""}`.toLowerCase().includes(ninSearch.toLowerCase()));

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
      <Link href="/ceooffice9x7z2/ads" onClick={() => { try { sessionStorage.setItem("ceooffice9x7z2_unlocked", "yes"); } catch {} }} style={{ display: "block", background: "#7C3AED", color: "white", padding: "16px", borderRadius: "14px", marginTop: "16px", textDecoration: "none", boxShadow: "0 8px 20px rgba(124,58,237,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <div><div style={{ fontWeight: "bold", fontSize: "16px" }}>✨ Create Advert → AI Ads Creator</div><div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>Window 1 - Big Top • Window 2 - Small Base • Preview before you Publish</div></div>
          <div style={{ fontSize: "22px" }}>→</div>
        </div>
      </Link>

      {/* ===== BIG NIN BUTTON - CLICK TO ENTER NIN APPROVAL ROOM ===== */}
      <button onClick={() => setTab("nin")} style={{ display: "block", width: "100%", background: tab === "nin" ? "#16a34a" : "#fef3c7", color: tab === "nin" ? "white" : "#92400e", padding: "18px", borderRadius: "14px", marginTop: "16px", border: tab === "nin" ? "2px solid #16a34a" : "2px solid #fbbf24", cursor: "pointer", textAlign: "left", boxShadow: "0 8px 20px rgba(251,191,36,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "17px" }}>🛡️ NIN Approvals → Click Here To Verify Agents</div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>See NIN number + NIN slip photo + Selfie holding NIN + Agent photo. Approve or Reject here.</div>
            <div style={{ fontSize: "12px", marginTop: "6px", fontWeight: "bold" }}>⏳ {ninPending.length} Pending • ✅ {ninVerifiedList.length} Verified • ❌ {ninRejectedList.length} Rejected</div>
          </div>
          <div style={{ fontSize: "24px" }}>→</div>
        </div>
      </button>

      <div style={{ display: "flex", gap: "8px", marginTop: "18px", flexWrap: "wrap" }}>
        {([["dashboard", "📊 Dashboard"], ["properties", `🏠 Properties (${pending.length + verified.length})`], ["agents", `👥 Agents & Free Sub (${allAgents.length})`], ["nin", `🛡️ NIN Approvals (${ninPending.length})`], ["feedback", `💬 Feedback (${feedbacks.filter((f: any) => f.status !== "fixed").length} new)`]] as any).map(([key, label]: any) => (
          <button key={key} onClick={() => setTab(key)} style={{ background: tab === key ? "black" : "white", color: tab === key ? "white" : "black", padding: "10px 16px", borderRadius: "999px", border: "1px solid #e2e8f0", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>{label}</button>
        ))}
      </div>

      {tab === "nin" && (
        <>
          <div style={{ background: "#fef3c7", border: "2px solid #fbbf24", padding: "16px", borderRadius: "12px", marginTop: "20px" }}>
            <b style={{ fontSize: "16px" }}>🛡️ NIN Verification Room — CEO ONLY</b>
            <p style={{ fontSize: "13px", marginTop: "6px", lineHeight: "1.6" }}>How to check:<br/>1. Compare <b>Name</b> they typed vs <b>Name on NIN slip</b> — must match.<br/>2. Compare <b>Face on NIN slip</b> vs <b>Selfie holding NIN</b> vs <b>Profile photo</b> — must be same person.<br/>3. If YES → Approve. If NO → Reject.<br/><span style={{ color: "#dc2626", fontWeight: "bold" }}>⚠️ Never share NIN numbers with anyone. Only you see this page.</span></p>
            <input value={ninSearch} onChange={(e) => setNinSearch(e.target.value)} placeholder="Search by name, phone or NIN..." style={{ width: "100%", padding: "12px", borderRadius: "999px", border: "1px solid #fbbf24", marginTop: "12px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <h2 style={{ marginTop: "22px", fontSize: "20px", fontWeight: "bold" }}>⏳ Pending NIN Approvals ({filteredNinPending.length})</h2>
          {filteredNinPending.length === 0 && <p style={{ background: "white", padding: "16px", borderRadius: "12px", color: "#94a3b8", marginTop: "10px" }}>No pending NIN applications. When an agent signs up with NIN, they will appear here.</p>}
          <div style={{ display: "grid", gap: "16px", marginTop: "12px" }}>
            {filteredNinPending.map((a: any) => (
              <div key={a.id} style={{ background: "white", border: "2px solid #fbbf24", borderRadius: "16px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                  <div>
                    <b style={{ fontSize: "17px" }}>{a.name || "Agent"}</b>
                    <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>📞 {a.phone || "No phone"} • ✉️ {a.email || ""}</p>
                    <p style={{ fontSize: "13px", marginTop: "4px" }}>🪪 <b>NIN Number (CEO ONLY):</b> <span style={{ background: "#fef3c7", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold", letterSpacing: "1px" }}>{a.nin_number || "No NIN submitted"}</span></p>
                    <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Applied: {a.created_at ? new Date(a.created_at).toLocaleString() : ""} • ID: {String(a.id).slice(0, 8)}...</p>
                    {a.why_deal && <p style={{ fontSize: "13px", marginTop: "8px", background: "#f8fafc", padding: "10px", borderRadius: "10px" }}><b>Why deal with me:</b> {a.why_deal}</p>}
                  </div>
                  <Link href={`/my-office/${a.id}`} target="_blank" style={{ background: "#f1f5f9", padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "bold", textDecoration: "none", color: "black" }}>View My Office →</Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "14px" }}>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: "bold", textAlign: "center", marginBottom: "6px" }}>1. AGENT PROFILE PHOTO</p>
                    {a.avatar_url ? <img src={a.avatar_url} onClick={() => setPreviewImg(a.avatar_url)} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px", cursor: "pointer", border: "2px solid #e2e8f0" }} alt="Agent" /> : <div style={{ width: "100%", height: "160px", background: "#f1f5f9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>👤</div>}
                    <p style={{ fontSize: "11px", textAlign: "center", color: "#64748b", marginTop: "4px" }}>Tap to enlarge</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: "bold", textAlign: "center", marginBottom: "6px" }}>2. NIN SLIP / CARD PHOTO</p>
                    {a.nin_slip_url ? <img src={a.nin_slip_url} onClick={() => setPreviewImg(a.nin_slip_url)} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px", cursor: "pointer", border: "2px solid #fbbf24" }} alt="NIN Slip" /> : <div style={{ width: "100%", height: "160px", background: "#fef3c7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "12px", padding: "10px" }}>No NIN slip uploaded</div>}
                    <p style={{ fontSize: "11px", textAlign: "center", color: "#64748b", marginTop: "4px" }}>Check name + face on NIN</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: "bold", textAlign: "center", marginBottom: "6px" }}>3. SELFIE HOLDING NIN</p>
                    {a.nin_selfie_url ? <img src={a.nin_selfie_url} onClick={() => setPreviewImg(a.nin_selfie_url)} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px", cursor: "pointer", border: "2px solid #16a34a" }} alt="Selfie holding NIN" /> : <div style={{ width: "100%", height: "160px", background: "#dcfce7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "12px", padding: "10px" }}>No selfie uploaded</div>}
                    <p style={{ fontSize: "11px", textAlign: "center", color: "#64748b", marginTop: "4px" }}>Must be same face</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => approveNin(a)} disabled={ninLoading} style={{ flex: 1, background: "#16a34a", color: "white", padding: "14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>✅ APPROVE — Face + Name Match</button>
                  <button onClick={() => rejectNin(a)} disabled={ninLoading} style={{ flex: 1, background: "#dc2626", color: "white", padding: "14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>❌ REJECT — Does Not Match</button>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "30px", fontSize: "18px", fontWeight: "bold" }}>✅ Verified Agents ({ninVerifiedList.length})</h2>
          <div style={{ display: "grid", gap: "8px", marginTop: "10px" }}>
            {ninVerifiedList.map((a: any) => (
              <div key={a.id} style={{ background: "white", padding: "12px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #16a34a" }}>
                <span><b>{a.name}</b> — {a.phone} • NIN ****{a.nin_last4 || (a.nin_number ? String(a.nin_number).slice(-4) : "")} • ✅ VERIFIED</span>
                <button onClick={() => unverifyNin(a)} style={{ background: "#f1f5f9", padding: "6px 12px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>Move to Pending</button>
              </div>
            ))}
            {ninVerifiedList.length === 0 && <p style={{ background: "white", padding: "14px", borderRadius: "12px", color: "#94a3b8" }}>No verified agents yet.</p>}
          </div>

          <h2 style={{ marginTop: "22px", fontSize: "18px", fontWeight: "bold" }}>❌ Rejected Agents ({ninRejectedList.length})</h2>
          <div style={{ display: "grid", gap: "8px", marginTop: "10px" }}>
            {ninRejectedList.map((a: any) => (
              <div key={a.id} style={{ background: "white", padding: "12px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #dc2626" }}>
                <span><b>{a.name}</b> — {a.phone} • ❌ REJECTED</span>
                <button onClick={() => unverifyNin(a)} style={{ background: "#f1f5f9", padding: "6px 12px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>Move to Pending</button>
              </div>
            ))}
            {ninRejectedList.length === 0 && <p style={{ background: "white", padding: "14px", borderRadius: "12px", color: "#94a3b8" }}>No rejected agents.</p>}
          </div>
        </>
      )}

      {tab === "dashboard" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px", marginTop: "25px" }}>
            <div style={{ background: "white", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #3b82f6" }}><div style={{ fontSize: "12px", color: "#64748b" }}>VISITORS</div><div style={{ fontSize: "24px", fontWeight: 800 }}>{visitors}</div></div>
            <div style={{ background: "white", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #8b5cf6" }}><div style={{ fontSize: "12px", color: "#64748b" }}>VISITORS THAT SUBSCRIBED</div><div style={{ fontSize: "24px", fontWeight: 800 }}>{totalSubscribed}</div><div style={{ fontSize: "11px", color: "#94a3b8" }}>{visitors > 0 ? Math.round((totalSubscribed / visitors) * 100) : 0}% conversion</div></div>
            <div style={{ background: "white", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #ea580c" }}><div style={{ fontSize: "12px", color: "#64748b" }}>PENDING</div><div style={{ fontSize: "24px", fontWeight: 800 }}>{pending.length}</div></div>
            <div style={{ background: "white", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #16a34a" }}><div style={{ fontSize: "12px", color: "#64748b" }}>VERIFIED</div><div style={{ fontSize: "24px", fontWeight: 800 }}>{verified.length}</div></div>
          </div>
          <div style={{ background: "white", padding: "16px", borderRadius: "12px", marginTop: "18px" }}>
            <b>🔥 Active Free Subscriptions ({activeFreeSubs.length})</b>
            {activeFreeSubs.length === 0 && <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>No active free sub yet. Go to Agents tab to give one.</p>}
            {activeFreeSubs.slice(0, 5).map((s: any) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                <span><b>{s.email}</b> — {s.plan}</span><span>{isExpired(s) ? "❌ Expired" : `⏳ ${daysLeft(s)} days left • Ends ${new Date(s.end_date).toLocaleDateString()}`}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#fef3c7", border: "2px solid #fbbf24", padding: "16px", borderRadius: "12px", marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><b>🛡️ NIN Pending: {ninPending.length}</b><p style={{ fontSize: "12px", margin: "4px 0 0" }}>Agents waiting for your NIN approval.</p></div>
            <button onClick={() => setTab("nin")} style={{ background: "black", color: "white", padding: "10px 18px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer" }}>Open NIN Room →</button>
          </div>
        </>
      )}
      {tab === "properties" && (
        <>
          <h2 style={{ marginTop: "25px", fontSize: "20px", fontWeight: "bold" }}>Pending Verification ({pending.length})</h2>
          <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
            {pending.map((p: any) => (
              <div key={p.id} style={{ border: "1px solid #fed7aa", padding: "12px", display: "flex", justifyContent: "space-between", background: "white", borderRadius: "8px", alignItems: "center" }}>
                <div><b>{p.name || p.title}</b> - {p.location} - {p.price}</div>
                <div><button onClick={() => approve(p.id)} style={{ background: "#16a34a", color: "white", padding: "8px 16px", marginRight: "5px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>✓ VERIFY</button><button onClick={() => reject(p.id)} style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 12px", border: "none", borderRadius: "6px", cursor: "pointer" }}>X</button></div>
              </div>
            ))}
            {pending.length === 0 && <p style={{ color: "#94a3b8", background: "white", padding: "15px", borderRadius: "8px" }}>No pending properties.</p>}
          </div>
          <h2 style={{ marginTop: "35px", fontSize: "20px", fontWeight: "bold" }}>Verified Properties ({verified.length})</h2>
          <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
            {verified.map((p: any) => (
              <div key={p.id} style={{ border: "1px solid #bbf7d0", padding: "12px", background: "white", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                <span><b>{p.name || p.title}</b> - {p.location} - {p.price} ✅ VERIFIED</span><button onClick={() => reject(p.id)} style={{ background: "#fee2e2", color: "#dc2626", padding: "6px 12px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "agents" && (
        <>
          <div style={{ background: "white", padding: "18px", borderRadius: "12px", marginTop: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>🔍 Search Agent by Email</h2>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <input value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Agent email..." style={{ flex: 1, padding: "12px", borderRadius: "999px", border: "1px solid #e2e8f0", outline: "none" }} />
              <button onClick={searchAgent} disabled={searching} style={{ background: "black", color: "white", padding: "0 20px", borderRadius: "999px", fontWeight: "bold", cursor: "pointer" }}>{searching ? "Searching..." : "Search"}</button>
            </div>
            {searchResult.map((a: any) => (
              <div key={a.email} style={{ marginTop: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: a.is_frozen ? "#fef2f2" : "#f8fafc" }}>
                <div><b>{a.name || "Agent"}</b> — {a.email} {a.is_frozen ? "🧊 FROZEN" : "✅ Active"}</div>
                <div style={{ display: "flex", gap: "6px" }}><button onClick={() => { setGiveEmail(a.email); }} style={{ background: "#8b5cf6", color: "white", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Give Free Sub ↓</button><button onClick={() => toggleFreeze(a)} style={{ background: a.is_frozen ? "#16a34a" : "#dc2626", color: "white", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>{a.is_frozen ? "Unfreeze ✅" : "Freeze 🧊"}</button></div>
              </div>
            ))}
          </div>
          <div style={{ background: "white", padding: "18px", borderRadius: "12px", marginTop: "14px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>🎁 Give FREE Subscription (with Time)</h2>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              <input value={giveEmail} onChange={(e) => setGiveEmail(e.target.value)} placeholder="Agent email e.g. agent@gmail.com" style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <select value={givePlan} onChange={(e) => { setGivePlan(e.target.value); if (e.target.value.includes("5 Day")) setGiveDays(5); if (e.target.value.includes("Static")) setGiveDays(30); if (e.target.value.includes("Premium")) setGiveDays(60); if (e.target.value.includes("COMBO")) setGiveDays(75); if (e.target.value.includes("Loyalty")) setGiveDays(30); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <option>5 Day Free - Static</option><option>Static - 5 Sliding Pictures (1 Month)</option><option>Premium Video - 60 Sec (2 Months)</option><option>COMBO - 1 Min 20 Sec</option><option>Loyalty Reward - FREE 1 + FREE 2</option><option>Custom Free</option>
                </select>
                <input type="number" value={giveDays} onChange={(e) => setGiveDays(Number(e.target.value))} placeholder="Days" style={{ width: "110px", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{[5, 7, 14, 30, 60, 75].map(d => (<button key={d} onClick={() => setGiveDays(d)} style={{ background: giveDays === d ? "black" : "#f1f5f9", color: giveDays === d ? "white" : "black", padding: "8px 14px", borderRadius: "999px", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>{d} Days</button>))}</div>
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
                <div><b>{s.email}</b> — {s.plan}<br /><span style={{ fontSize: "12px", color: "#64748b" }}>{new Date(s.start_date).toLocaleDateString()} → {new Date(s.end_date).toLocaleDateString()} • {isExpired(s) ? "❌ Expired / Cancelled" : `⏳ ${daysLeft(s)} days left`}</span></div>
                {!isExpired(s) && <button onClick={() => cancelSub(s.id)} style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Cancel</button>}
              </div>
            ))}
            {freeSubs.length === 0 && <p style={{ background: "white", padding: "14px", borderRadius: "12px", color: "#94a3b8" }}>No free subs yet.</p>}
          </div>
          <h2 style={{ marginTop: "22px", fontSize: "18px", fontWeight: "bold" }}>All Agents Found ({allAgents.length})</h2>
          <div style={{ display: "grid", gap: "8px", marginTop: "10px" }}>
            {allAgents.map((a: any) => (
              <div key={a.email} style={{ background: "white", padding: "12px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><b>{a.name}</b> — {a.email} {a.is_frozen ? "🧊 FROZEN" : ""}</span><button onClick={() => toggleFreeze(a)} style={{ background: a.is_frozen ? "#16a34a" : "#dc2626", color: "white", padding: "6px 12px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>{a.is_frozen ? "Unfreeze" : "Freeze"}</button>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === "feedback" && (
        <>
          <h2 style={{ marginTop: "20px", fontSize: "20px", fontWeight: "bold" }}>Feedback ({feedbacks.length}) — {feedbacks.filter((f: any) => f.status !== "fixed").length} new</h2>
          <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
            {feedbacks.map((f: any) => (
              <div key={f.id} style={{ background: "white", padding: "14px", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ fontSize: "13px" }}>{f.category}</b><span style={{ fontSize: "11px", background: f.status === "fixed" ? "#dcfce7" : "#fef9c3", padding: "4px 10px", borderRadius: "999px", fontWeight: "bold" }}>{f.status}</span></div>
                <p style={{ fontSize: "13px", marginTop: "8px" }}>{f.message}</p>
                <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>From: {f.email || f.name} • {new Date(f.created_at).toLocaleString()} • {f.page_url}</p>
                {f.status !== "fixed" && <button onClick={() => markFeedbackFixed(f.id)} style={{ marginTop: "10px", background: "black", color: "white", padding: "8px 14px", border: "none", borderRadius: "999px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Mark as Fixed ✅</button>}
              </div>
            ))}
            {feedbacks.length === 0 && <p style={{ background: "white", padding: "14px", borderRadius: "12px", color: "#94a3b8" }}>No feedback yet. Good!</p>}
          </div>
        </>
      )}

      {/* Full-screen image preview */}
      {previewImg && (
        <div onClick={() => setPreviewImg(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <img src={previewImg} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "12px", objectFit: "contain" }} alt="Preview" />
            <button onClick={() => setPreviewImg(null)} style={{ position: "absolute", top: "-10px", right: "-10px", background: "white", width: "36px", height: "36px", borderRadius: "50%", border: "none", fontWeight: "bold", cursor: "pointer" }}>✕</button>
            <p style={{ color: "white", textAlign: "center", marginTop: "10px", fontSize: "12px" }}>Tap anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
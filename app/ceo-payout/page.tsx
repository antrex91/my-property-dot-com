"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CEOPayout() {
  const [comms, setComms] = useState<any[]>([]);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("commissions").select("*").order("created_at", { ascending: false });
    setComms(data || []);
    setLoading(false);
  };

  const pending = comms.filter(c => c.status !== "Paid");
  const totalPending = pending.reduce((s, c) => s + Number(c.amount || 0), 0);

  const filtered = comms.filter(c => {
    if (filter === "All") return true;
    if (filter === "Pending") return c.status !== "Paid";
    if (filter === "Paid") return c.status === "Paid";
    return true;
  });

  const markPaid = async (c: any) => {
    if (!confirm("Have you transferred N" + Number(c.amount || 0).toLocaleString() + " to " + c.earner_agent_name + "? Click OK only if YES.")) return;
    const { error } = await supabase.from("commissions").update({ status: "Paid" }).eq("id", c.id);
    if (error) { alert("Error: " + error.message); return; }
    try {
      const { data: agent } = await supabase.from("agents").select("*").eq("id", c.earner_agent_id).single();
      if (agent) {
        await supabase.from("agents").update({
          total_withdrawable: Math.max(0, Number(agent.total_withdrawable || 0) - Number(c.amount || 0)),
        }).eq("id", c.earner_agent_id);
      }
    } catch {}
    load();
  };

  const markAllPaid = async () => {
    if (!confirm("Mark all " + pending.length + " as Paid? Total N" + totalPending.toLocaleString() + " Only if you transferred to EVERYONE.")) return;
    const { error } = await supabase.from("commissions").update({ status: "Paid" }).neq("status", "Paid");
    if (error) { alert("Error: " + error.message); return; }
    try {
      const totals: any = {};
      pending.forEach((c: any) => {
        totals[c.earner_agent_id] = (totals[c.earner_agent_id] || 0) + Number(c.amount || 0);
      });
      for (const earnerId of Object.keys(totals)) {
        const { data: agent } = await supabase.from("agents").select("*").eq("id", earnerId).single();
        if (agent) {
          await supabase.from("agents").update({
            total_withdrawable: Math.max(0, Number(agent.total_withdrawable || 0) - totals[earnerId]),
          }).eq("id", earnerId);
        }
      }
    } catch {}
    alert("All marked as Paid!");
    load();
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center">Loading Payouts...</main>;

  return (
    <main className="min-h-screen bg-white p-4"><div className="max-w-[700px] mx-auto">
      <h1 className="font-black text-[22px]">CEO Payout - Friday Pay</h1>
      <p className="text-[11px] text-gray-500 mt-1">Paystack pays YOU. You transfer to agents via bank / Opay, then click Mark Paid here.</p>
      <div className="bg-black text-white rounded-2xl p-4 mt-3 flex justify-between"><div><p className="text-[12px] opacity-70">Total To Pay Now</p><p className="font-black text-[26px]">N{totalPending.toLocaleString()}</p><p className="text-[12px]">{pending.length} commissions pending</p></div><button onClick={markAllPaid} className="bg-green-500 text-white px-4 py-2 rounded-full font-black text-[13px] h-fit">Mark All As Paid</button></div>
      <div className="flex gap-2 mt-4">
        {["Pending", "Paid", "All"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 h-[32px] rounded-full text-[12px] font-bold ${filter === f ? "bg-black text-white" : "bg-[#f2f2f2]"}`}>{f}</button>
        ))}
        <button onClick={load} className="ml-auto bg-[#f2f2f2] px-4 h-[32px] rounded-full text-[12px] font-bold">Refresh</button>
      </div>
      <div className="mt-4">
        {filtered.length === 0 && <p className="text-center text-gray-400 text-[13px] py-10">No commissions in this filter yet.</p>}
        {filtered.map((c: any) => (
          <div key={c.id} className="border-b py-3 flex justify-between text-[12px] gap-3">
            <div className="flex-1">
              <b>{c.earner_agent_name}</b> earned from <b>{c.buyer_agent_name}</b><br />
              <span className="text-gray-500">{c.package_name} - Level {c.earner_level} - {c.percent}% - {new Date(c.created_at).toLocaleDateString()}</span><br />
              <span className="text-[11px] text-gray-400">Ref: {c.payment_ref || "-"} - Buyer: {c.buyer_agent_phone || "-"}</span>
            </div>
            <div className="text-right shrink-0">
              <b className="text-green-600">N{Number(c.amount).toLocaleString()}</b><br />
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
              {c.status !== "Paid" && <button onClick={() => markPaid(c)} className="block text-blue-600 underline mt-1 ml-auto">Mark Paid</button>}
            </div>
          </div>
        ))}
      </div>
    </div></main>
  );
}
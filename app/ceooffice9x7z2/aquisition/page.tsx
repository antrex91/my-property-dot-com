"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

// --- PUT SAME PASSWORD AS YOUR CEO OFFICE HERE ---
const ADMIN_PASSWORD = "YOUR_ADMIN_PASSWORD_HERE";

export default function AcquisitionInbox(){
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checking, setChecking] = useState(true);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(()=>{
    try{
      if(sessionStorage.getItem("ceoofice9x7z2_unlocked") === "yes"){
        setUnlocked(true);
        load();
      }
    }catch{}
    setChecking(false);
  },[]);

  const load = async () => {
    const { data } = await supabase.from("acquisition_inquiries").select("*").order("created_at", {ascending:false});
    if(data) setInquiries(data);
  };

  const tryUnlock = () => {
    if(passwordInput === ADMIN_PASSWORD){
      setUnlocked(true);
      try{ sessionStorage.setItem("ceoofice9x7z2_unlocked", "yes"); }catch{}
      load();
    } else setPasswordError("Wrong password");
  };

  const markRead = async (id:number) => {
    await supabase.from("acquisition_inquiries").update({status:"read"}).eq("id", id);
    load();
  };
  const markReplied = async (id:number) => {
    await supabase.from("acquisition_inquiries").update({status:"replied"}).eq("id", id);
    load();
  };
  const deleteOne = async (id:number) => {
    if(!confirm("Delete this message?")) return;
    await supabase.from("acquisition_inquiries").delete().eq("id", id);
    load();
  };

  if(checking) return <div className="min-h-screen flex items-center justify-center"><p className="font-bold">Loading...</p></div>;

  if(!unlocked){
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3e8ff] p-4">
        <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 text-center shadow">
          <p className="text-[40px]">🔒</p>
          <h1 className="font-black text-[20px] mt-2">CEO Only - Acquisition Inbox</h1>
          <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") tryUnlock();}} placeholder="Enter admin password" className="w-full bg-[#f2f2f2] rounded-xl p-3 mt-4 text-[14px] outline-none text-center" />
          {passwordError && <p className="text-red-600 text-[12px] font-bold mt-2">{passwordError}</p>}
          <button onClick={tryUnlock} className="w-full bg-black text-white h-[46px] rounded-full font-black text-[14px] mt-3">Unlock →</button>
          <Link href="/ceoofice9x7z2" className="block mt-3 text-[12px] text-blue-600 font-bold underline">Back to CEO Office</Link>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? inquiries : inquiries.filter((x:any)=> x.status === filter || (filter==="new" && x.status==="new"));
  const newCount = inquiries.filter((x:any)=> x.status==="new").length;

  return (
    <main className="min-h-screen bg-[#f3e8ff] p-3 md:p-6">
      <div className="max-w-[900px] mx-auto">
        <Link href="/ceoofice9x7z2" className="text-[12px] font-bold underline">← Back to CEO Office</Link>
        <h1 className="font-black text-[24px] md:text-[28px] mt-2">🤝 Acquisition / Partnership Inbox</h1>
        <p className="text-[13px] text-gray-600 mt-1">Only you see this. If Meta / Facebook / any investor sends a message from homepage, it appears here.</p>

        <div className="flex gap-2 mt-4 flex-wrap">
          <button onClick={()=>setFilter("all")} className={`px-4 h-[36px] rounded-full text-[12px] font-bold ${filter==="all" ? "bg-black text-white" : "bg-white"}`}>All ({inquiries.length})</button>
          <button onClick={()=>setFilter("new")} className={`px-4 h-[36px] rounded-full text-[12px] font-bold ${filter==="new" ? "bg-black text-white" : "bg-white"}`}>🆕 New ({newCount})</button>
          <button onClick={()=>setFilter("read")} className={`px-4 h-[36px] rounded-full text-[12px] font-bold ${filter==="read" ? "bg-black text-white" : "bg-white"}`}>Read</button>
          <button onClick={()=>setFilter("replied")} className={`px-4 h-[36px] rounded-full text-[12px] font-bold ${filter==="replied" ? "bg-black text-white" : "bg-white"}`}>Replied</button>
          <button onClick={load} className="px-4 h-[36px] rounded-full text-[12px] font-bold bg-white">↻ Refresh</button>
        </div>

        <div className="space-y-3 mt-4">
          {filtered.length===0 && <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-[13px]">No messages yet. When Facebook or any company sends, it will show here. Share your site link now.</div>}
          {filtered.map((inq:any)=>(
            <div key={inq.id} className="bg-white rounded-2xl p-4 shadow border-l-4" style={{borderLeftColor: inq.status==="new" ? "#DC2626" : inq.status==="replied" ? "#16a34a" : "#EAB308"}}>
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <p className="font-black text-[15px]">{inq.name} {inq.company ? `• ${inq.company}` : ""}</p>
                  <p className="text-[12px] text-gray-500">{inq.email} {inq.phone ? `• ${inq.phone}` : ""} • {new Date(inq.created_at).toLocaleString()}</p>
                </div>
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-[#f3e8ff]">{inq.type} {inq.status==="new" ? "• 🆕 NEW" : `• ${inq.status}`}</span>
              </div>
              {inq.offer && <p className="text-[13px] font-bold mt-2 bg-yellow-50 border border-yellow-200 rounded-xl p-2">💰 Offer / Budget: {inq.offer}</p>}
              <p className="text-[13px] mt-2 whitespace-pre-wrap">{inq.message}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <a href={`mailto:${inq.email}?subject=Re: ${inq.type} - MY PROPERTY.COM&body=Hello ${inq.name},%0D%0A%0D%0AThank you for your message about MY PROPERTY.COM.%0D%0A`} className="bg-black text-white px-4 h-[36px] rounded-full text-[12px] font-bold flex items-center">Reply by Email →</a>
                {inq.phone && <a href={`https://wa.me/${inq.phone.replace(/[^0-9]/g,"")}`} target="_blank" className="bg-green-600 text-white px-4 h-[36px] rounded-full text-[12px] font-bold flex items-center">WhatsApp →</a>}
                {inq.status!=="read" && <button onClick={()=>markRead(inq.id)} className="bg-[#f2f2f2] px-4 h-[36px] rounded-full text-[12px] font-bold">Mark Read</button>}
                {inq.status!=="replied" && <button onClick={()=>markReplied(inq.id)} className="bg-green-100 text-green-700 px-4 h-[36px] rounded-full text-[12px] font-bold">Mark Replied ✅</button>}
                <button onClick={()=>deleteOne(inq.id)} className="bg-red-100 text-red-600 px-4 h-[36px] rounded-full text-[12px] font-bold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
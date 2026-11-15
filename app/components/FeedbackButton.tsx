"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Upload not working");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const send = async () => {
    if (!message.trim()) { alert("Please write what happened"); return; }
    setSending(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const { error } = await supabase.from("feedbacks").insert({
        name: user?.email || "Guest",
        email: user?.email || "",
        user_id: user?.id || null,
        category,
        message: message.trim(),
        page_url: window.location.href,
        status: "new",
      });
      if (error) throw error;
      setDone(true);
      setMessage("");
      setTimeout(() => { setDone(false); setOpen(false); }, 2500);
    } catch (e: any) {
      alert("Could not send: " + e.message);
    }
    setSending(false);
  };

  return (
    <>
      {/* Floating button - bottom right, like YouTube Help */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[90] bg-black text-white px-4 h-[42px] rounded-full text-[12px] font-black shadow-lg hover:bg-[#7C3AED] transition"
      >
        💬 Report Issue / Feedback
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl max-w-[480px] w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="font-black text-[16px]">Report an Issue</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 bg-[#f2f2f2] rounded-full font-bold">✕</button>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">Tell us what is wrong. Only the admin will see this. We will fix it.</p>

            <label className="block text-[12px] font-bold mt-4">What is the problem?</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#f2f2f2] h-[44px] rounded-lg px-3 text-[13px] mt-1">
              <option>Upload not working</option>
              <option>Payment issue</option>
              <option>Picture not showing / not sliding</option>
              <option>Video not playing</option>
              <option>Login / Signup problem</option>
              <option>Fake / Stolen property report</option>
              <option>Other / Suggestion</option>
            </select>

            <label className="block text-[12px] font-bold mt-3">What happened?</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Example: I tried to upload 5 pictures, but it stopped at 2 and said failed..."
              className="w-full bg-[#f2f2f2] rounded-xl p-3 text-[13px] h-[120px] mt-1 outline-none"
            />

            {done ? (
              <p className="text-center text-green-600 font-bold text-[13px] mt-3">✅ Thank you! Your feedback has been sent to Admin.</p>
            ) : (
              <button onClick={send} disabled={sending} className="w-full bg-black text-white h-[46px] rounded-full font-black text-[13px] mt-4 disabled:opacity-50">
                {sending ? "Sending..." : "Send Feedback →"}
              </button>
            )}
            <p className="text-center text-[10px] text-gray-400 mt-2">Please do not share your password. Admin will never ask for it.</p>
          </div>
        </div>
      )}
    </>
  );
}
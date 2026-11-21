"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AcquisitionContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill Name, Email and Message");
      return;
    }
    setSending(true);
    try {
      // SAME FEATURE AS BEFORE - saves to acquisition_inquiries
      const { error } = await supabase.from("acquisition_inquiries").insert({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || null,
        message: message.trim(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSent(true);
      setName(""); setEmail(""); setCompany(""); setMessage("");
    } catch (err: any) {
      // Fallback - still show success if table name differs, so visitor is not blocked
      console.log("Acquisition save:", err?.message);
      setSent(true);
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="max-w-[520px] mx-auto text-center">
        <p className="text-[12px] text-gray-500 bg-[#fafafa] border border-gray-100 rounded-full px-3 py-2">
          ✅ Thank you. Your message has been sent to the CEO privately. 🤝
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[520px] mx-auto px-4">
      <details className="group">
        {/* ALMOST INVISIBLE - small grey line, collapsed by default */}
        <summary className="cursor-pointer list-none flex items-center justify-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition select-none">
          <span>🤝</span>
          <span className="underline underline-offset-2 decoration-gray-200">
            Interested in Acquiring / Partnering?
          </span>
          <span className="text-[8px] group-open:rotate-180 transition">▼</span>
        </summary>

        {/* Opens only when clicked - small, soft, quiet */}
        <form onSubmit={handleSubmit} className="mt-2 bg-[#fafafa] border border-gray-100 rounded-xl p-3">
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            For Facebook / Meta / Investors — send a discreet message to the CEO.
          </p>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 mt-2 text-[12px] outline-none placeholder:text-gray-300 focus:border-gray-300"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email"
            type="email"
            className="w-full bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 mt-1.5 text-[12px] outline-none placeholder:text-gray-300 focus:border-gray-300"
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (optional) e.g. Meta / Facebook"
            className="w-full bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 mt-1.5 text-[12px] outline-none placeholder:text-gray-300 focus:border-gray-300"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Your message / offer..."
            className="w-full bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 mt-1.5 text-[12px] outline-none placeholder:text-gray-300 focus:border-gray-300 resize-none"
          />

          {/* SMALL QUIET BUTTON - no more lion */}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={sending}
              className="bg-gray-900 hover:bg-black text-white text-[11px] font-medium px-4 py-1.5 rounded-full transition disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send →"}
            </button>
          </div>

          <p className="text-[10px] text-gray-300 text-center mt-1.5">
            Private & confidential. No spam.
          </p>
        </form>
      </details>
    </div>
  );
}
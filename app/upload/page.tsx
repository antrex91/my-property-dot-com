"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const PACKAGES = [
  { name: "Basic Listing", price: 5000 },
  { name: "Video Package", price: 10000 },
  { name: "Premium Boost", price: 20000 },
];

// Load Paystack script once
const loadPaystack = () => {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function UploadPage() {
  const [selected, setSelected] = useState(PACKAGES[1]);
  const [paying, setPaying] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [agentEmail, setAgentEmail] = useState("");

  useEffect(() => {
    setAgentName(localStorage.getItem("agent_name") || "");
    setAgentEmail(localStorage.getItem("agent_email") || "");
  }, []);

  const handlePay = async () => {
    const buyerId = localStorage.getItem("agent_id");
    if (!buyerId) { alert("Please register as Agent first"); window.location.href = "/agent-register"; return; }
    if (!agentPhone.trim()) { alert("Enter phone"); return; }
    if (!agentEmail.trim()) { alert("Enter email for receipt"); return; }

    setPaying(true);

    const loaded = await loadPaystack();
    if (!loaded) {
      alert("Paystack failed to load. Check internet and try again.");
      setPaying(false);
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      alert("Paystack Public Key missing in .env.local / Vercel");
      setPaying(false);
      return;
    }

    const reference = "MP" + Date.now() + Math.floor(Math.random() * 1000);

    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email: agentEmail.trim(),
      amount: selected.price * 100, // Paystack uses kobo
      currency: "NGN",
      ref: reference,
      metadata: {
        buyerId,
        buyerName: agentName || "Agent",
        buyerPhone: agentPhone,
        packageName: selected.name,
        packagePrice: selected.price,
      },
      callback: async function (response: any) {
        // Step 1: Paystack popup closed with success, now VERIFY on server
        // Server will check amount + replay + do 10% / 5% / 3% split
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              expectedAmount: selected.price,
              buyerId,
              buyerName: agentName || "Agent",
              buyerPhone: agentPhone,
              packageName: selected.name,
              packagePrice: selected.price,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyData.ok) {
            alert("Verification failed: " + (verifyData.error || "Try again"));
            setPaying(false);
            return;
          }

          alert(`✅ Payment Successful! ${selected.name} - ₦${selected.price.toLocaleString()}. Referral commissions shared!`);
          window.location.href = "/agent-dashboard";
        } catch (e: any) {
          alert("Verification error: " + e.message);
          setPaying(false);
        }
      },
      onClose: function () {
        // User closed Paystack without paying
        setPaying(false);
      },
    });

    handler.openIframe();
  };

  return (
    <main className="min-h-screen bg-[#f3e8ff] p-4 flex justify-center">
      <div className="bg-white rounded-2xl max-w-[480px] w-full p-5 h-fit mt-6 shadow">
        <h1 className="font-black text-[22px]">📦 Buy Package / Upload</h1>
        <p className="text-[12px] text-gray-500">Choose package. After payment, your inviters earn 10% / 5% / 3% automatically.</p>

        <label className="block text-[13px] font-bold mt-4">Your Name</label>
        <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Your full name" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />

        <label className="block text-[13px] font-bold mt-3">Your Phone</label>
        <input value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="070..." className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />

        <label className="block text-[13px] font-bold mt-3">Your Email (for Paystack receipt)</label>
        <input value={agentEmail} onChange={e => setAgentEmail(e.target.value)} placeholder="you@email.com" className="w-full border-2 border-[#d8b4fe] rounded-xl p-3 mt-1 text-[13px] outline-none" />

        <p className="font-bold text-[13px] mt-4">Select Package:</p>
        {PACKAGES.map(p => (
          <button key={p.name} onClick={() => setSelected(p)} className={`w-full text-left border-2 rounded-xl p-3 mt-2 flex justify-between ${selected.name === p.name ? "border-[#7C3AED] bg-purple-50" : "border-gray-200"}`}>
            <span><b>{p.name}</b><br /><span className="text-[11px] text-gray-500">Referral pays ₦{(p.price * 0.10).toLocaleString()} / ₦{(p.price * 0.05).toLocaleString()} / ₦{(p.price * 0.03).toLocaleString()}</span></span>
            <b>₦{p.price.toLocaleString()}</b>
          </button>
        ))}
        <button onClick={handlePay} disabled={paying} className="w-full bg-green-600 text-white h-[48px] rounded-full font-black mt-5 disabled:opacity-50">{paying ? "Processing..." : `Pay ₦${selected.price.toLocaleString()} →`}</button>
        <Link href="/agent-dashboard" className="block text-center mt-3 text-[12px] text-blue-600 font-bold underline">Go to Dashboard</Link>
      </div>
    </main>
  );
}
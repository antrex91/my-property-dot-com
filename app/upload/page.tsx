"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// Tell TypeScript that Paystack exists
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function UploadPage() {
  const router = useRouter();

  // 1. TYPE: Static or Video
  const [type, setType] = useState<"static" | "video">("static");

  // 2. PLAN: Which price user picked at top
  const [plan, setPlan] = useState("static-6500");

  // 3. FORM FIELDS
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("Flat");
  const [beds, setBeds] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // 4. WORD COUNT FOR DESCRIPTION
  const wordCount = useMemo(() => {
    return description.trim() === "" ? 0 : description.trim().split(/\s+/).length;
  }, [description]);

  // 5. PRICE LOGIC - This decides what to charge
  const getPlanInfo = () => {
    if (plan === "free") return { amount: 0, label: "FREE" };
    if (plan === "static-6500") return { amount: 6500, label: "₦6,500" };
    if (plan === "video-60") return { amount: 12500, label: "₦12,500" };
    if (plan === "video-80") return { amount: 16000, label: "₦16,000" };
    return { amount: 6500, label: "₦6,500" };
  };

  const planInfo = getPlanInfo();

  // 6. DESCRIPTION UNDER LOCATION - THIS IS THE FIX YOU ASKED FOR
  const getInfoText = () => {
    if (type === "static") {
      if (plan === "free") return "FREE • Static • Sliding • 5 Days";
      return "Static ₦6,500 • 5 Sliding Pictures • First 20 Users Per State = 2 Months";
    } else {
      if (plan === "video-60") return "Video ₦12,500 • 60 Sec Video • 2 Months";
      if (plan === "video-80") return "Video ₦16,000 • 1 Min 20 Sec Video • 2 Months 3 Weeks";
      return "Video • 1 Video • 60 Sec / 80 Sec Combo";
    }
  };

  // 7. HANDLE FILE SELECT
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // 8. HANDLE PAY + UPLOAD
  const handlePayAndUpload = async () => {
    // Validation
    if (!title) return alert("Please enter Title e.g. 4 Bedroom Duplex Wuse 2");
    if (!location) return alert("Please enter Location e.g. Wuse 2, Abuja");
    if (!price) return alert("Please enter Price");
    if (wordCount < 50) return alert(`Description needs at least 50 words. You have ${wordCount} words.`);
    if (files.length === 0) return alert("Please upload at least 1 picture / video");
    if (!email) return alert("Please enter your Email for payment receipt");

    setLoading(true);

    // If FREE plan, skip payment
    if (planInfo.amount === 0) {
      alert("FREE plan - Uploading directly...");
      setLoading(false);
      router.push("/");
      return;
    }

    // PAYSTACK POPUP
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: planInfo.amount * 100, // Paystack uses kobo
      currency: "NGN",
      ref: `PROP-${Date.now()}`,
      label: "mypropertydot.com Property Upload",
      callback: function (response: any) {
        // Payment successful, now verify on server
        verifyPayment(response.reference);
      },
      onClose: function () {
        setLoading(false);
        alert("Payment cancelled. You can try again.");
      },
    });
    handler.openIframe();
  };

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Payment confirmed ✅ Uploading your property...");
        router.push("/");
      } else {
        alert("Payment could not be verified. Please contact support.");
        setLoading(false);
      }
    } catch (err) {
      alert("Error verifying payment");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efff] py-6 px-4">
      <div className="max-w-[600px] mx-auto">

        {/* TOP PLANS - 4 BOXES */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => { setPlan("free"); setType("static"); }}
            className={`bg-white rounded-lg p-3 text-center border-2 ${plan === "free" ? "border-purple-500" : "border-gray-200"}`}
          >
            <div className="font-bold text-lg">FREE</div>
            <div className="text-[11px]">Static • Sliding • 5 Days</div>
          </button>

          <button
            onClick={() => { setPlan("static-6500"); setType("static"); }}
            className={`bg-white rounded-lg p-3 text-center border-2 ${plan === "static-6500" ? "border-green-500" : "border-gray-200"}`}
          >
            <div className="font-bold text-lg">₦6,500</div>
            <div className="text-[11px]">5 Sliding Pictures • 1 Month</div>
            <div className="text-[11px] text-green-600 font-bold mt-1">First 20 Users Per State = 2 Months</div>
          </button>

          <button
            onClick={() => { setPlan("video-60"); setType("video"); }}
            className={`bg-white rounded-lg p-3 text-center border-2 ${plan === "video-60" ? "border-purple-500" : "border-gray-200"}`}
          >
            <div className="font-bold text-lg">₦12,500</div>
            <div className="text-[11px]">60 Sec Video • 2 Months</div>
          </button>

          <button
            onClick={() => { setPlan("video-80"); setType("video"); }}
            className={`bg-black text-white rounded-lg p-3 text-center border-2 ${plan === "video-80" ? "border-purple-500" : "border-black"}`}
          >
            <div className="font-bold text-lg">₦16,000</div>
            <div className="text-[11px]">1 Min 20 Sec Video • 2 Months 3 Weeks</div>
          </button>
        </div>

        {/* STATIC / VIDEO TOGGLE */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setType("static")}
            className={`bg-white rounded-xl py-4 border-2 ${type === "static" ? "border-purple-500" : "border-gray-200"}`}
          >
            <div className="text-xl">📷</div>
            <div className="font-bold">Static Pictures</div>
            <div className="text-xs text-gray-500">Max 5 - Will Slide</div>
          </button>
          <button
            onClick={() => setType("video")}
            className={`bg-white rounded-xl py-4 border-2 ${type === "video" ? "border-purple-500" : "border-gray-200"}`}
          >
            <div className="text-xl">🎥</div>
            <div className="font-bold">Video</div>
            <div className="text-xs text-gray-500">1 Video - 60 Sec / 80 Sec Combo</div>
          </button>
        </div>

        {/* TITLE */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title e.g. 4 Bedroom Duplex Wuse 2"
          className="w-full bg-[#e9e6f5] rounded-full px-4 py-3 mb-3 outline-none"
        />

        {/* LOCATION + PRICE */}
        <div className="flex gap-3 mb-1">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location e.g. Wuse 2, Abuja"
            className="flex-1 bg-[#e9e6f5] rounded-full px-4 py-3 outline-none"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price ₦"
            type="number"
            className="w-[110px] bg-[#e9e6f5] rounded-full px-4 py-3 outline-none"
          />
        </div>

        {/* THIS LINE NOW CHANGES FOR STATIC / VIDEO - FIXED */}
        <p className="text-xs text-gray-500 mb-3 px-1">{getInfoText()}</p>

        {/* PROPERTY TYPE + BEDS */}
        <div className="flex gap-3 mb-4">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="flex-1 bg-[#e9e6f5] rounded-full px-4 py-3 outline-none"
          >
            <option>Flat</option>
            <option>Self-Contain</option>
            <option>1 Bedroom Flat</option>
            <option>2 Bedroom Flat</option>
            <option>3 Bedroom Flat</option>
            <option>Duplex</option>
            <option>Bungalow</option>
            <option>Land</option>
            <option>Shop</option>
            <option>Office</option>
          </select>
          <input
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            placeholder="Beds"
            type="number"
            className="w-[110px] bg-[#e9e6f5] rounded-full px-4 py-3 outline-none"
          />
        </div>

        {/* DESCRIPTION */}
        <label className="font-bold text-sm">Description of Property <span className="text-red-500">*</span> <span className="font-normal text-gray-500">— At least 50 words</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your property well — e.g. This is a newly built 4 bedroom duplex in Wuse 2, Abuja, close to the main road, with POP ceiling, fitted kitchen, all rooms ensuite, borehole, gatehouse, tarred road, 24hrs light, good security, close to school, market, hospital... Tell buyers why they should come and see it."
          rows={5}
          className="w-full bg-[#e9e6f5] rounded-2xl px-4 py-3 mt-1 outline-none"
        />
        <p className={`text-xs mt-1 ${wordCount >= 50 ? "text-green-600" : "text-red-500"}`}>
          {wordCount} / 50 words {wordCount >= 50 ? "✅ Good" : "— Keep writing"}
        </p>

        {/* EMAIL FOR PAYMENT */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email for payment receipt"
          type="email"
          className="w-full bg-[#e9e6f5] rounded-full px-4 py-3 mt-4 outline-none"
        />

        {/* UPLOAD FILES */}
        <div className="mt-4">
          <label className="font-bold text-sm">{type === "static" ? "Upload Pictures (Max 5)" : "Upload Video (Max 1)"}</label>
          <input
            type="file"
            multiple={type === "static"}
            accept={type === "static" ? "image/*" : "video/*"}
            onChange={handleFiles}
            className="w-full mt-2 bg-white rounded-xl p-3 border"
          />
          {files.length > 0 && <p className="text-xs text-green-600 mt-1">{files.length} file(s) selected: {files.map(f => f.name).join(", ")}</p>}
        </div>

        {/* PAY BUTTON - THIS IS WHERE PAYMENT HAPPENS */}
        <button
          onClick={handlePayAndUpload}
          disabled={loading}
          className="w-full bg-purple-600 text-white font-bold py-4 rounded-full mt-6 disabled:opacity-50"
        >
          {loading ? "Processing..." : planInfo.amount === 0 ? "Upload FREE Property" : `Pay ${planInfo.label} & Upload`}
        </button>

        <p className="text-center text-xs text-gray-500 mt-2">Secure payment by Paystack • You will get receipt by email</p>

      </div>
    </div>
  );
}
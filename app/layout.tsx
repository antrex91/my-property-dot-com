import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MyPropertyDotCom - Buy, Sell & Rent Properties in Nigeria",
  description: "Find houses, lands, shops and properties for sale and rent in Nigeria. Upload your property, become an agent and earn.",
  manifest: "/manifest.json",
  themeColor: "#7C3AED",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyPropertyDotCom",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#7C3AED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f3e8ff] antialiased overflow-x-hidden">

        {/* ============ MOBILE TOP BAR - WITH SIGNUP + LOGIN - MOBILE ONLY ============ */}
        {/* md:hidden = Show on Phone only, Desktop stays 100% same */}
        <div className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-3 py-2.5 flex items-center justify-between gap-2">
          <Link href="/" className="font-black text-[15px] text-[#7C3AED] leading-none">
            MyProperty<span className="text-black">DotCom</span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/agent-login"
              className="text-[12px] font-bold px-3 py-2 rounded-full border border-[#7C3AED] text-[#7C3AED] bg-white"
            >
              Log In
            </Link>
            <Link
              href="/agent-register"
              className="text-[12px] font-bold px-3.5 py-2 rounded-full bg-[#7C3AED] text-white shadow"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* PAGE CONTENT - Bottom padding on mobile only so Bottom Nav doesn't cover content */}
        <div className="pb-[76px] md:pb-0 min-h-screen">
          {children}
        </div>

        {/* ============ YOUTUBE-STYLE BOTTOM NAV - MOBILE ONLY ============ */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.10)] pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5 max-w-[520px] mx-auto">
            <Link href="/" className="flex flex-col items-center py-2 active:bg-purple-50">
              <span className="text-[22px] leading-none">🏠</span>
              <span className="text-[10px] font-bold mt-1">Home</span>
            </Link>
            <Link href="/upload" className="flex flex-col items-center py-2 active:bg-purple-50">
              <span className="text-[22px] leading-none">➕</span>
              <span className="text-[10px] font-bold mt-1">Upload</span>
            </Link>
            <Link href="/agent-register" className="flex flex-col items-center py-1 active:bg-purple-50">
              <span className="w-[42px] h-[42px] bg-[#7C3AED] text-white rounded-full flex items-center justify-center text-[22px] shadow-lg -mt-5 border-4 border-white">🧑‍💼</span>
              <span className="text-[10px] font-bold mt-0.5">Sign Up</span>
            </Link>
            <Link href="/agent-dashboard" className="flex flex-col items-center py-2 active:bg-purple-50">
              <span className="text-[22px] leading-none">📊</span>
              <span className="text-[10px] font-bold mt-1">Dashboard</span>
            </Link>
            <Link href="/agent-login" className="flex flex-col items-center py-2 active:bg-purple-50">
              <span className="text-[22px] leading-none">👤</span>
              <span className="text-[10px] font-bold mt-1">Log In</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
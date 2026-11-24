import "./globals.css";
import Script from "next/script";
import type { Metadata, Viewport } from "next";

export const metadata = {
  title: "mypropertydot.com - Two hands giving you any property",
  description: "Find and post properties in Nigeria - Static, Video, COMBO. 36 States + FCT",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden bg-white text-black antialiased">
        {children}

        {/* PAYSTACK - This loads the payment popup. Do not remove. */}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
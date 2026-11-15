import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "mypropertydot.com - Two hands giving you any property",
  description: "Find and post properties in Nigeria - Static, Video, COMBO. 36 States + FCT.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* PAYSTACK - This loads the payment popup. Do not remove. */}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
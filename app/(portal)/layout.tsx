import type { Metadata, Viewport } from "next";
import { Inter, Marcellus, Cormorant_Garamond } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const marcellus = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-marcellus", display: "swap" });
const cormorant = Cormorant_Garamond({ weight: ["400", "500"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-cormorant", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Bluedoor Building", template: "%s · Bluedoor Building" },
  description: "Estate management by Bluedoor Building.",
  icons: { icon: "/brand/logo.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#224b82",
};

export const dynamic = "force-dynamic";

/* The estate-management portal's own root layout: no site chrome, its own
   fonts, and the .estate-app scope on the body itself. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${marcellus.variable} ${cormorant.variable}`}>
      <body className="estate-app min-h-dvh antialiased">{children}</body>
    </html>
  );
}

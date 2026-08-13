import type { Metadata } from "next";
import { Cormorant_Garamond, Figtree, Marcellus } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const figtree = Figtree({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Bluedoor Building | Luxury Custom Home Builder | Palm Beach, FL",
    template: "%s | Bluedoor Building",
  },
  description:
    "Bluedoor Building is a luxury custom home builder in Palm Beach, Florida — new construction, historic renovation, and finely detailed interiors, led by Siobhan Zerilla.",
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
    images: [{ url: "/images/aerial-oceanfront.jpg" }],
  },
  icons: { icon: "/images/logo.png" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: site.legalName,
  url: site.url,
  logo: `${site.url}/images/logo.png`,
  image: `${site.url}/images/aerial-oceanfront.jpg`,
  slogan: "Homes of lasting beauty and distinction",
  founder: { "@type": "Person", name: site.principal.name },
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.geo.lat,
    longitude: site.geo.lng,
  },
  areaServed: site.areas.map((a) => ({ "@type": "Place", name: a })),
  sameAs: [site.instagram],
  knowsAbout: [
    "Luxury custom home construction",
    "Historic and landmark restoration",
    "High-end residential interiors",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${cormorant.variable} ${figtree.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

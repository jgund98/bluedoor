import type { Metadata } from "next";
import { Marcellus, Cormorant_Garamond, Italianno, Figtree } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const italianno = Italianno({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-italianno",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Bluedoor Building | Luxury Custom Home Builder — Palm Beach, Florida",
    template: "%s | Bluedoor Building",
  },
  description: site.bio,
  openGraph: {
    title: "Bluedoor Building | Luxury Custom Home Builder — Palm Beach",
    description: site.bio,
    url: site.url,
    siteName: site.name,
    type: "website",
    images: ["/images/hero-stairhall.jpg"],
  },
  icons: { icon: "/images/logo.png" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: site.name,
  legalName: site.legalName,
  description: site.bio,
  url: site.url,
  image: `${site.url}/images/hero-stairhall.jpg`,
  logo: `${site.url}/images/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
  areaServed: site.areas.map((a) => ({ "@type": "Place", name: a })),
  founder: { "@type": "Person", name: site.principal.name, jobTitle: "Principal" },
  sameAs: [site.instagram],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${cormorant.variable} ${italianno.variable} ${figtree.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

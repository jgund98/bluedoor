import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative bg-espresso text-bone">
      <div className="mx-auto max-w-[1520px] px-5 pb-10 pt-20 md:px-10 md:pt-28">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          <div>
            <img src="/images/logo.png" alt="Bluedoor Building" className="h-20 w-20" />
            <p className="serif-body mt-8 max-w-sm text-2xl italic leading-snug text-bone/90">
              Homes of lasting beauty and&nbsp;distinction.
            </p>
          </div>
          <div>
            <p className="label-wide mb-6 text-bone/50">Visit</p>
            <p className="text-[15px] leading-relaxed text-bone/80">
              {site.legalName}
              <br />
              {site.address.street}
              <br />
              {site.address.city}, {site.address.state}
            </p>
            <p className="serif-body mt-4 text-[17px] italic text-bone/60">
              Across the street from the Norton Museum of&nbsp;Art
            </p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="label mt-6 inline-block border-b border-bone/30 pb-1 text-bone/80 transition-colors hover:border-bone hover:text-bone"
            >
              {site.instagramHandle}
            </a>
          </div>
          <div>
            <p className="label-wide mb-6 text-bone/50">Explore</p>
            <nav className="flex flex-col gap-3">
              {[
                { href: "/portfolio", label: "Portfolio" },
                { href: "/process", label: "Process" },
                { href: "/culture", label: "Culture" },
                { href: "/media", label: "Publications" },
                { href: "/build-with-bluedoor", label: "Build with Bluedoor" },
                { href: "/portal", label: "Client Portal" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="w-fit text-[15px] text-bone/80 transition-colors hover:text-bone"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="rule-light mt-16" />
        <div className="mt-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <p className="text-xs text-bone/45">
            © {new Date().getFullYear()} {site.legalName} · Palm Beach, Florida
          </p>
          <a
            href="https://www.epicdevsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-bone/45 transition-colors hover:text-bone/80"
          >
            Site by Epic Dev Solutions
          </a>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { nav, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative bg-ink pb-12 pt-16 lg:pb-14 lg:pt-20">
      <div className="mx-auto max-w-[1560px] px-5 lg:px-12">
        <div className="hair-light h-px w-full" />

        <div className="grid grid-cols-1 gap-12 pt-12 lg:grid-cols-12 lg:gap-10 lg:pt-14">
          <div className="lg:col-span-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Bluedoor Building"
              className="w-[52px] rounded-full ring-1 ring-porcelain/20"
            />
            <p className="answer mt-6 text-[16px] leading-[1.55] text-porcelain/62">{site.bio}</p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="label mt-7 inline-block text-porcelain/50 transition-colors duration-500 hover:text-porcelain"
            >
              {site.instagramHandle}
            </a>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-14 lg:col-span-6 lg:col-start-7">
            <div>
              <span className="label text-porcelain/40">The Studio</span>
              <ul className="mt-6 space-y-3">
                {nav.full.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className="answer text-[17px] text-porcelain/72 transition-colors duration-500 hover:text-porcelain"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* utility, kept apart from the navigation */}
              <Link
                href={nav.clientLogin.href}
                className="label mt-8 inline-block text-porcelain/45 transition-colors duration-500 hover:text-porcelain"
              >
                {nav.clientLogin.label}
              </Link>
            </div>

            <div className="max-w-[240px]">
              <span className="label text-porcelain/40">The Office</span>
              <p className="answer mt-6 text-[17px] leading-[1.6] text-porcelain/72">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.state}
              </p>
              <p className="answer mt-4 text-[15px] leading-[1.6] text-porcelain/40">
                {site.address.note}.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-porcelain/10 pt-7 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <span className="label text-porcelain/35">
            © {new Date().getFullYear()} {site.legalName}
          </span>
          <span className="label text-porcelain/35">{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}

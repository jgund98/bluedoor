import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Client Portal",
  description:
    "The Bluedoor Building client portal — project updates, documents, and correspondence for current clients.",
  robots: { index: false },
};

export default function PortalPage() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center bg-navy px-5 text-center">
      <img
        src="/images/logo.png"
        alt="Bluedoor Building"
        className="h-24 w-24 rounded-full shadow-[0_0_0_1px_rgba(247,243,235,0.4),0_20px_60px_rgba(0,0,0,0.35)]"
      />
      <h1 className="display mt-10 text-4xl text-bone md:text-5xl">Client Portal</h1>
      <p className="serif-body mt-6 max-w-md text-xl italic leading-relaxed text-bone/85">
        Your project, at your fingertips — opening soon. Your project team will
        send a personal invitation when your portal is&nbsp;ready.
      </p>
      <Link
        href="/"
        className="label mt-12 inline-block border border-bone/60 px-8 py-4 text-bone transition-colors duration-500 hover:bg-bone hover:text-navy"
      >
        Return Home
      </Link>
    </section>
  );
}

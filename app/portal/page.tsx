import type { Metadata } from "next";
import { site } from "@/lib/site";
import Keycard from "@/components/portal/Keycard";

export const metadata: Metadata = {
  title: "Client Login",
  description: "The Bluedoor Building client portal — for clients with a project under construction.",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-navy px-5 py-24">
      {/* a wall of door panelling, barely lit */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(68%_54%_at_50%_44%,rgba(255,255,255,0.10)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute inset-0 grid grid-cols-2 gap-8 px-[6vw] py-[9vh] sm:grid-cols-4 lg:grid-cols-6 lg:gap-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-full rounded-[2px] border border-porcelain/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.22)]"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/45 via-transparent to-abyss/55" />
      </div>

      <Keycard studio={site.name} />
    </section>
  );
}

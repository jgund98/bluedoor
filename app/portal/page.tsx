import type { Metadata } from "next";
import PortalView from "@/components/portal/PortalView";

export const metadata: Metadata = {
  title: "Client Portal",
  description:
    "The Bluedoor Building client portal — project updates, documents, and correspondence for current clients. Access is by invitation.",
  robots: { index: false },
};

export default function PortalPage() {
  return <PortalView />;
}

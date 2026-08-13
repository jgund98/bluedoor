import type { Metadata } from "next";
import CultureView from "@/components/culture/CultureView";

export const metadata: Metadata = {
  title: "Culture — Siobhan Zerilla & the Bluedoor Studio",
  description:
    "Meet Siobhan Zerilla, principal of Bluedoor Building — from laborer to Palm Beach's builder to know — and the studio behind her.",
};

export default function CulturePage() {
  return <CultureView />;
}

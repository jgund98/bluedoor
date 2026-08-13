import type { Metadata } from "next";
import ProcessView from "@/components/process/ProcessView";

export const metadata: Metadata = {
  title: "The Process — How Bluedoor Builds in Palm Beach",
  description:
    "Vision, priorities, and budget — Bluedoor Building's transparent process for luxury custom homes in Palm Beach, from first watercolor to a guidebook at hand-off.",
};

export default function ProcessPage() {
  return <ProcessView />;
}

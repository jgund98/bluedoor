import type { Metadata } from "next";
import PortfolioView from "@/components/portfolio/PortfolioView";

export const metadata: Metadata = {
  title: "Portfolio — Luxury Homes in Palm Beach, FL",
  description:
    "Explore Bluedoor Building's portfolio of oceanfront estates, historic renovations, and finely detailed interiors across Palm Beach, Manalapan, and the Palm Beaches.",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}

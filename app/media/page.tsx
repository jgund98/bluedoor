import type { Metadata } from "next";
import MediaView from "@/components/media/MediaView";

export const metadata: Metadata = {
  title: "Publications — House Beautiful, Luxury Home Magazine & More",
  description:
    "Bluedoor Building's work featured in House Beautiful, Luxury Home Magazine, and Modern Luxury Palm Beach — press and publications from Palm Beach's builder to know.",
};

export default function MediaPage() {
  return <MediaView />;
}

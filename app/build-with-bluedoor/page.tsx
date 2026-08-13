import type { Metadata } from "next";
import BuildView from "@/components/build/BuildView";

export const metadata: Metadata = {
  title: "Build with Bluedoor — Begin the Conversation",
  description:
    "Begin your custom home with Bluedoor Building. Visit the studio at 501 Palm Street, West Palm Beach — across from the Norton Museum of Art — or submit an inquiry.",
};

export default function BuildPage() {
  return <BuildView />;
}

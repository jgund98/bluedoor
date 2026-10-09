"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";

export function CopyLink({ path, label }: { path: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={buttonClasses("outline", "md")}
      onClick={async () => {
        const url = `${window.location.origin}${path}`;
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          window.open(url, "_blank");
        }
      }}
      title="Copy the private link"
    >
      {done ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      {done ? "Copied" : label}
    </button>
  );
}

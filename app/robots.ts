import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // the estate-management portal and its private links are never indexed
      disallow: ["/portal/", "/login", "/today", "/approvals", "/requests", "/schedule", "/visits", "/estates", "/vendors", "/services", "/automations", "/outbox", "/settings", "/demo", "/v/", "/vendor/", "/r/", "/home/", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}

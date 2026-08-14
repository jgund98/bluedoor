import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/portfolio/", "/process/", "/culture/", "/media/", "/build-with-bluedoor/"];
  return routes.map((r) => ({
    url: `${site.url}${r}`,
    lastModified: new Date(),
    changeFrequency: r === "/" ? "monthly" : "yearly",
    priority: r === "/" ? 1 : 0.7,
  }));
}

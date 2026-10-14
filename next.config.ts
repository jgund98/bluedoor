import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**"],
  },
  // Speed pass 10-14: photos and films were served max-age=0, so every
  // page view re-asked the server for each one. A week in the browser, then
  // refreshed quietly in the background. Not immutable: a photo is sometimes
  // replaced under the same name.
  async headers() {
    const keep = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }];
    return [
      { source: "/images/:path*", headers: keep },
      { source: "/reels/:path*", headers: keep },
    ];
  },
};

export default nextConfig;

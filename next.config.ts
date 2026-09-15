import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    // Google Places photo bytes are proxied through /api/photos, so no remote
    // patterns are needed. Local photos under /public get optimised directly.
    formats: ["image/avif", "image/webp"],
    // iPad-first: 834/1024/1194/1366 are the sizes that actually matter here.
    deviceSizes: [640, 750, 834, 1024, 1194, 1366, 1920],
  },
};

export default config;

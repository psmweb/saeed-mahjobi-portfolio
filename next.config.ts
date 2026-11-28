import type { NextConfig } from "next";

const immutableCache = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
};

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/textures/:path*", headers: [immutableCache] },
      { source: "/images/:path*", headers: [immutableCache] },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/home/openclaw/.openclaw/workspace/app-food-picker",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;

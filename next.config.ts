import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it, Turbopack walks up and
  // finds a stray package-lock.json in the home directory and picks the wrong root.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Steam CDN hosts for the game's screenshots / capsule art used on the
    // landing page. Steam serves the same assets from several mirror hosts.
    remotePatterns: [
      { protocol: "https", hostname: "shared.akamai.steamstatic.com" },
      { protocol: "https", hostname: "shared.fastly.steamstatic.com" },
      { protocol: "https", hostname: "shared.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "cdn.akamai.steamstatic.com" },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it, Turbopack walks up and
  // finds a stray package-lock.json in the home directory and picks the wrong root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

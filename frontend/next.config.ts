import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    staticGenerationMaxConcurrency: 1,
  }
};

export default nextConfig;

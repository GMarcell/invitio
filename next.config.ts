import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photo uploads (gallery) exceed the 1MB default server-action limit.
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;

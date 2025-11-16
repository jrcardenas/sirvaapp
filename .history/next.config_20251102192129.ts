import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: [
      "localhost:3000",
      "127.0.0.1:3000",
      "192.168.0.17:3000" // ✅ tu IP real en la red local
    ]
  }
};

export default nextConfig;

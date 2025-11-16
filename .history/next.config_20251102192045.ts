import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "192.168.0.17:3000" // ✅ tu IP real en la red local
      ]
    }
  },

  // ✅ Permitir acceso externo en desarrollo
  output: "standalone"
};

export default nextConfig;

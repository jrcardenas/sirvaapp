import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "10.42.54.65:3000" // ✅ tu IP local (ajusta si cambia)
      ]
    }
  },

  // ✅ Permitir acceso externo al host en desarrollo
  output: "standalone"
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false, // ⬅️ Oculta el circulito "compiling..."
  },
};

export default nextConfig;

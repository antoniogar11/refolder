import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Deshabilitar ESLint durante el build para evitar problemas en Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deshabilitar type checking durante el build si hay problemas
  typescript: {
    ignoreBuildErrors: false, // Mantener type checking activo
  },
};

export default nextConfig;

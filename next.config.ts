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
  // Permitir acceso desde cualquier host (útil para desarrollo en red local)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

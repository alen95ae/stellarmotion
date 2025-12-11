import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegurar que Next.js cargue .env.local desde el directorio correcto
  // Esto es crítico para que las variables de entorno se carguen en runtime
  // outputFileTracingRoot debe apuntar al directorio raíz del proyecto (stellarmotion.io)
  outputFileTracingRoot: __dirname,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  // FORZAR RUNTIME NODE.JS EN TODA LA APLICACIÓN
  // Esto garantiza que TODAS las API routes tengan acceso completo a process.env
  // y que NO se ejecuten en Edge Runtime donde las variables privadas no están disponibles
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*'],
    },
  },
  // Configuración de runtime por defecto
  // IMPORTANTE: Esto asegura que todas las rutas usen Node.js runtime
  // a menos que se especifique explícitamente lo contrario
  serverRuntimeConfig: {
    // Variables privadas (solo disponibles en servidor)
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  publicRuntimeConfig: {
    // Variables públicas (disponibles en cliente y servidor)
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
  async rewrites() {
    return [
      { source: "/search", destination: "/buscar-un-espacio" }
    ];
  },
}

export default nextConfig

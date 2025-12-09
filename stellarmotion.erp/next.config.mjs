import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegurar que Next.js cargue .env.local desde el directorio del ERP
  // outputFileTracingRoot apunta al directorio padre para incluir dependencias compartidas
  outputFileTracingRoot: path.join(__dirname, '../'),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Forzar que todas las rutas API usen Node.js runtime (no edge)
  // Esto asegura que las variables de entorno se carguen correctamente
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig

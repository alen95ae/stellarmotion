import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // outputFileTracingRoot solo en producción (en dev hace la resolución de módulos muy pesada)
  ...(process.env.NODE_ENV === 'production' && {
    outputFileTracingRoot: path.join(__dirname, '../'),
  }),
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

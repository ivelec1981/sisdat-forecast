/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones para componentes
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
        port: '',
        pathname: '/ajax/libs/**',
      },
    ],
  },
  
  // Optimizaciones generales
  compress: true,
  poweredByHeader: false,
  
  // Headers de seguridad (opcional si no usas vercel.json)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
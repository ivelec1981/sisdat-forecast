/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA Configuration
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', 'framer-motion'],
  },
  
  // Configuración de imágenes optimizadas
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
        port: '',
        pathname: '/ajax/libs/**',
      },
    ],
    deviceSizes: [375, 390, 430, 768, 1024, 1366, 1512, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Optimizaciones generales
  compress: true,
  poweredByHeader: false,
  
  // Performance optimizations are enabled by default in Next.js 13+
  
  // Bundle analyzer (commented out for production)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
  
  // Headers de seguridad y PWA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://cdnjs.cloudflare.com",
              "connect-src 'self' https://api.arconel.gob.ec",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // HTTP Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // PWA headers
          {
            key: 'X-Apple-Web-App-Capable',
            value: 'yes',
          },
          {
            key: 'X-Apple-Web-App-Status-Bar-Style',
            value: 'default',
          },
          {
            key: 'X-Apple-Web-App-Title',
            value: 'SISDAT-forecast',
          },
        ],
      },
      // Service Worker headers
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
      // Manifest headers
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
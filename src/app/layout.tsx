import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SISDAT-forecast',
  description: 'Sistema de Proyección de Demanda Eléctrica del Ecuador',
  keywords: ['energia', 'prediccion', 'machine learning', 'arconel', 'regulacion', 'ecuador', 'demanda electrica'],
  authors: [{ name: 'ARCONEL - Agencia de Regulación y Control de Electricidad' }],
  manifest: '/manifest.json',
  themeColor: '#2E7CD6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SISDAT-forecast',
  },
  openGraph: {
    title: 'SISDAT-forecast',
    description: 'Sistema de Proyección de Demanda Eléctrica del Ecuador',
    type: 'website',
    siteName: 'SISDAT-forecast',
    locale: 'es_EC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SISDAT-forecast',
    description: 'Sistema de Proyección de Demanda Eléctrica del Ecuador',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SISDAT-forecast',
    'application-name': 'SISDAT-forecast',
    'msapplication-TileColor': '#FF9500',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#2E7CD6" />
        <meta name="theme-color" content="#2E7CD6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SISDAT-forecast" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
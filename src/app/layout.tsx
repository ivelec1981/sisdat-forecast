import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SISDAT Forecast - ARCONEL',
  description: 'Sistema de Predicción de Demanda Eléctrica - Agencia de Regulación y Control de Electricidad',
  keywords: ['energia', 'prediccion', 'machine learning', 'arconel', 'regulacion'],
  authors: [{ name: 'ARCONEL - Agencia de Regulación y Control de Electricidad' }],
  openGraph: {
    title: 'SISDAT Forecast - ARCONEL',
    description: 'Sistema de Predicción de Demanda Eléctrica',
    type: 'website',
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a2e',
}

export const metadata: Metadata = {
  title: 'Código Secreto - Juego de Espías',
  description: 'Juego de palabras y deducción para equipos. ¡Encuentra a los agentes secretos antes que el equipo rival!',
  keywords: ['código secreto', 'codenames', 'juego de mesa', 'espías', 'palabras', 'multijugador'],
  authors: [{ name: 'Código Secreto Online' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}

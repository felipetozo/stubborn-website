import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import '../globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-spaceGrotesk',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Admin — stubborn',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.variable} ${inter.variable}`} style={{ background: '#07090C', color: '#DDDBE1', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}

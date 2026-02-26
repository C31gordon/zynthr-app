import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Milliebot Command Center',
  description: 'Enterprise AI Agent Orchestration Platform — Powered by RKBAC™',
  keywords: ['AI', 'agents', 'enterprise', 'RKBAC', 'automation', 'property management'],
  authors: [{ name: 'Ardexa' }],
  openGraph: {
    title: 'Milliebot Command Center',
    description: 'Enterprise AI Agent Orchestration Platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='8' y='8' width='16' height='16' rx='2' transform='rotate(45 16 16)' fill='%233B82F6'/><circle cx='16' cy='16' r='4' fill='white'/></svg>" />
        <meta name="theme-color" content="#0a0e1a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Zynthr Command Center',
  description: 'Enterprise AI Agent Orchestration Platform — Powered by RKBAC™',
  keywords: ['AI', 'agents', 'enterprise', 'RKBAC', 'automation', 'property management'],
  authors: [{ name: 'Zynthr Inc.' }],
  openGraph: {
    title: 'Zynthr Command Center',
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='8' y='8' width='16' height='16' rx='2' transform='rotate(45 16 16)' fill='%23559CB5'/><circle cx='16' cy='16' r='4' fill='white'/></svg>" />
        <meta name="theme-color" content="#001825" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
// public deploy 1772171180

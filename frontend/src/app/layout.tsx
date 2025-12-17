import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Binary Options Trading Platform',
  description: 'Professional binary options trading platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: 'Satoshi, system-ui, arial' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StratisIO Enterprise | Intelligent Cloud Control',
  description: 'Advanced Multi-Cloud Orchestration & AIOps Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#020617] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  )
}

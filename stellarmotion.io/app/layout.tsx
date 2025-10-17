import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Stellar Motion | Vallas publicitarias en tu ciudad",
  description: "Stellar Motion | Vallas publicitarias en tu ciudad",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
        </Suspense>
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
        
      </body>
    </html>
  )
}

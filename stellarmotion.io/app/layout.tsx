import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"
import Header from "@/components/Header"

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
        <Analytics />
        
        {/* Google Maps Script */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'DEMO_KEY'}&libraries=marker`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}

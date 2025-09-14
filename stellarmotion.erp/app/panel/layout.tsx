'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header fijo que no interfiere con el logo del dashboard */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link href="/panel/partners" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors">
              Partners
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">Panel de Control</span>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal con padding superior para evitar solapamiento */}
      <main className="pt-6">
        {children}
      </main>
    </div>
  )
}

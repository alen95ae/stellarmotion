import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ComprasPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Módulo de Compras</h1>
          <p className="text-slate-600 mb-6">
            Control de compras, proveedores y gestión de inventario.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Compras Totales</h3>
              <p className="text-2xl font-bold text-green-600">$85,000</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Proveedores</h3>
              <p className="text-2xl font-bold text-blue-600">125</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Órdenes Pendientes</h3>
              <p className="text-2xl font-bold text-orange-600">23</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

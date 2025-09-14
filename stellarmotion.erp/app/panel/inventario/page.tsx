import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function InventarioPage() {
  return (
    <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Módulo de Inventario</h1>
          <p className="text-slate-600 mb-6">
            Control de stock, productos y gestión de almacén.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Valor Total</h3>
              <p className="text-2xl font-bold text-purple-600">$120,000</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Productos</h3>
              <p className="text-2xl font-bold text-blue-600">2,450</p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Stock Bajo</h3>
              <p className="text-2xl font-bold text-red-600">12</p>
            </div>
          </div>
        </div>
    </div>
  )
}

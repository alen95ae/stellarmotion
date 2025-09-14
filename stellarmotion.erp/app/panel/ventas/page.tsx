import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function VentasPage() {
  return (
    <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Módulo de Ventas</h1>
          <p className="text-slate-600 mb-6">
            Gestión completa de ventas, clientes y procesos comerciales.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Ventas Totales</h3>
              <p className="text-2xl font-bold text-blue-600">$150,000</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Clientes Activos</h3>
              <p className="text-2xl font-bold text-green-600">1,250</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Órdenes Pendientes</h3>
              <p className="text-2xl font-bold text-purple-600">45</p>
            </div>
          </div>
        </div>
    </div>
  )
}

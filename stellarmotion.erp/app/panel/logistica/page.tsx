import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LogisticaPage() {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Módulo de Logística</h1>
          <p className="text-slate-600 mb-6">
            Gestión de envíos, entregas y cadena de suministro.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-cyan-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-cyan-800 mb-2">Envíos Totales</h3>
              <p className="text-2xl font-bold text-cyan-600">$67,000</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">En Tránsito</h3>
              <p className="text-2xl font-bold text-blue-600">45</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Entregados</h3>
              <p className="text-2xl font-bold text-green-600">1,250</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

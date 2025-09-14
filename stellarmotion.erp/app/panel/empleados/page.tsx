import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EmpleadosPage() {
  return (
    <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Módulo de Empleados</h1>
          <p className="text-slate-600 mb-6">
            Gestión de personal, nóminas y recursos humanos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-pink-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-pink-800 mb-2">Total Empleados</h3>
              <p className="text-2xl font-bold text-pink-600">15</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Activos</h3>
              <p className="text-2xl font-bold text-blue-600">14</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Vacaciones</h3>
              <p className="text-2xl font-bold text-green-600">3</p>
            </div>
          </div>
        </div>
    </div>
  )
}

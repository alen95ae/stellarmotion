import Link from 'next/link'
import { ArrowLeft, Calendar, Plus, Eye } from 'lucide-react'

export default function CalendarioPage() {
  // Datos de ejemplo de anuncios
  const anuncios = [
    {
      id: 1,
      titulo: "Sala de Conferencias Premium",
      fecha: "2024-01-15",
      estado: "activo",
      reservas: 8,
      ingresos: 1200
    },
    {
      id: 2,
      titulo: "Espacio de Coworking",
      fecha: "2024-01-16",
      estado: "activo",
      reservas: 15,
      ingresos: 1800
    },
    {
      id: 3,
      titulo: "Oficina Privada",
      fecha: "2024-01-17",
      estado: "pendiente",
      reservas: 3,
      ingresos: 450
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Calendario de Anuncios</h1>
            <p className="text-slate-600">
              Gestiona y visualiza todos tus anuncios y reservas
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/panel/calendario/nuevo"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Anuncio
            </Link>
          </div>
        </div>
        
        {/* Resumen de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Anuncios Activos</h3>
            <p className="text-2xl font-bold text-blue-600">2</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Reservas Totales</h3>
            <p className="text-2xl font-bold text-green-600">26</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Ingresos del Mes</h3>
            <p className="text-2xl font-bold text-purple-600">$3,450</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Ocupación</h3>
            <p className="text-2xl font-bold text-orange-600">78%</p>
          </div>
        </div>

        {/* Lista de anuncios */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Tus Anuncios</h2>
          {anuncios.map((anuncio) => (
            <div key={anuncio.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{anuncio.titulo}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      anuncio.estado === 'activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {anuncio.estado === 'activo' ? 'Activo' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Publicado: {anuncio.fecha}</span>
                    </div>
                    <div>
                      <span className="font-medium">{anuncio.reservas}</span> reservas
                    </div>
                    <div>
                      <span className="font-medium">${anuncio.ingresos}</span> ingresos
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/panel/calendario/${anuncio.id}`}
                    className="inline-flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

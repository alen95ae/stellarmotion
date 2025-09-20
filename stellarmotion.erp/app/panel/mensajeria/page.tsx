import Link from 'next/link'
import { ArrowLeft, MessageSquare, Send, User, Clock, CheckCircle } from 'lucide-react'

export default function MensajeriaPage() {
  // Datos de ejemplo de conversaciones
  const conversaciones = [
    {
      id: 1,
      cliente: "María González",
      ultimoMensaje: "¿Está disponible para el viernes por la mañana?",
      timestamp: "2024-01-15 14:30",
      noLeidos: 2,
      estado: "activa"
    },
    {
      id: 2,
      cliente: "Carlos Rodríguez",
      ultimoMensaje: "Perfecto, confirmo la reserva para las 10:00",
      timestamp: "2024-01-15 12:15",
      noLeidos: 0,
      estado: "activa"
    },
    {
      id: 3,
      cliente: "Ana Martínez",
      ultimoMensaje: "Gracias por la información, me pondré en contacto pronto",
      timestamp: "2024-01-14 16:45",
      noLeidos: 0,
      estado: "cerrada"
    }
  ]

  const totalMensajes = conversaciones.reduce((sum, c) => sum + c.noLeidos, 0)
  const conversacionesActivas = conversaciones.filter(c => c.estado === 'activa').length

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Mensajería</h1>
            <p className="text-slate-600">
              Comunícate con tus clientes y gestiona consultas
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4 mr-2" />
              Nuevo Mensaje
            </button>
          </div>
        </div>
        
        {/* Resumen de mensajería */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Conversaciones Activas</h3>
            <p className="text-2xl font-bold text-blue-600">{conversacionesActivas}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Mensajes Sin Leer</h3>
            <p className="text-2xl font-bold text-orange-600">{totalMensajes}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Tiempo Respuesta</h3>
            <p className="text-2xl font-bold text-green-600">2.5h</p>
            <p className="text-sm text-green-600 mt-1">Promedio</p>
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Conversaciones</h2>
          {conversaciones.map((conversacion) => (
            <div key={conversacion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-slate-800">{conversacion.cliente}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        conversacion.estado === 'activa' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conversacion.estado === 'activa' ? 'Activa' : 'Cerrada'}
                      </span>
                      {conversacion.noLeidos > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {conversacion.noLeidos}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm mb-1">{conversacion.ultimoMensaje}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{conversacion.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/panel/mensajeria/${conversacion.id}`}
                    className="inline-flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Abrir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plantillas de respuesta rápida */}
        <div className="mt-8 bg-slate-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Respuestas Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="font-medium text-slate-800 mb-1">Disponibilidad</h3>
              <p className="text-sm text-slate-600">"Hola, gracias por tu interés. El espacio está disponible en las fechas que mencionas..."</p>
            </button>
            <button className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="font-medium text-slate-800 mb-1">Confirmación</h3>
              <p className="text-sm text-slate-600">"Perfecto, confirmo tu reserva. Te enviaré los detalles por email..."</p>
            </button>
            <button className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="font-medium text-slate-800 mb-1">Precios</h3>
              <p className="text-sm text-slate-600">"El precio por hora es de $X. Incluye acceso a todas las instalaciones..."</p>
            </button>
            <button className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="font-medium text-slate-800 mb-1">Cancelación</h3>
              <p className="text-sm text-slate-600">"Entiendo que necesitas cancelar. Nuestra política permite cancelaciones hasta 24h antes..."</p>
            </button>
          </div>
        </div>
    </div>
  )
}

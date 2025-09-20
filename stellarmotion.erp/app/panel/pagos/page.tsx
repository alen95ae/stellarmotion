import Link from 'next/link'
import { ArrowLeft, CreditCard, Download, Eye, TrendingUp } from 'lucide-react'

export default function PagosPage() {
  // Datos de ejemplo de pagos
  const pagos = [
    {
      id: 1,
      fecha: "2024-01-15",
      concepto: "Comisión por reservas - Enero",
      monto: 245.50,
      estado: "pagado",
      metodo: "Transferencia"
    },
    {
      id: 2,
      fecha: "2024-01-10",
      concepto: "Comisión por reservas - Diciembre",
      monto: 189.75,
      estado: "pagado",
      metodo: "Transferencia"
    },
    {
      id: 3,
      fecha: "2024-01-05",
      concepto: "Comisión por reservas - Noviembre",
      monto: 312.00,
      estado: "pendiente",
      metodo: "Transferencia"
    }
  ]

  const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
  const totalPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Pagos</h1>
            <p className="text-slate-600">
              Historial y estado de tus pagos y comisiones
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Descargar Reporte
            </button>
          </div>
        </div>
        
        {/* Resumen de pagos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Total Pagado</h3>
            <p className="text-2xl font-bold text-green-600">${totalPagado.toFixed(2)}</p>
            <p className="text-sm text-green-600 mt-1">Últimos 3 meses</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pendiente</h3>
            <p className="text-2xl font-bold text-yellow-600">${totalPendiente.toFixed(2)}</p>
            <p className="text-sm text-yellow-600 mt-1">Por procesar</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Próximo Pago</h3>
            <p className="text-2xl font-bold text-blue-600">$312.00</p>
            <p className="text-sm text-blue-600 mt-1">15 de febrero</p>
          </div>
        </div>

        {/* Información de cuenta */}
        <div className="bg-slate-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Información de Pago</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-slate-700 mb-2">Método de Pago</h3>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-600" />
                <span className="text-slate-600">Transferencia Bancaria</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-700 mb-2">Frecuencia de Pago</h3>
              <span className="text-slate-600">Mensual (día 15)</span>
            </div>
          </div>
        </div>

        {/* Historial de pagos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Historial de Pagos</h2>
          {pagos.map((pago) => (
            <div key={pago.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{pago.concepto}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pago.estado === 'pagado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pago.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Fecha:</span> {pago.fecha}
                    </div>
                    <div>
                      <span className="font-medium">Método:</span> {pago.metodo}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">${pago.monto.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </button>
                    {pago.estado === 'pagado' && (
                      <button className="inline-flex items-center px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4 mr-1" />
                        Recibo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

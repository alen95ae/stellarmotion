import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pagos - Panel de Control | StellarMotion',
  description: 'Gestión de pagos y cobros'
};

// Mock data
const facturas = [
  {
    id: '1',
    numero: 'FAC-2025-001',
    cliente: 'Coca Cola Bolivia',
    reserva: 'RES-2025-001',
    soporte: 'Valla Zona Sur - A001',
    monto: 8500,
    impuesto: 1105,
    total: 9605,
    fechaEmision: '2025-01-10',
    fechaVencimiento: '2025-02-10',
    fechaPago: null,
    estado: 'pendiente',
    notas: 'Factura por campaña enero-febrero'
  },
  {
    id: '2',
    numero: 'FAC-2025-002',
    cliente: 'Banco Nacional',
    reserva: 'RES-2025-002',
    soporte: 'Pantalla LED Centro - P005',
    monto: 12000,
    impuesto: 1560,
    total: 13560,
    fechaEmision: '2025-01-15',
    fechaVencimiento: '2025-02-15',
    fechaPago: '2025-01-18',
    estado: 'pagada',
    notas: 'Pago recibido por transferencia bancaria'
  },
  {
    id: '3',
    numero: 'FAC-2025-003',
    cliente: 'Supermercados Ketal',
    reserva: 'RES-2025-003',
    soporte: 'MUPI Avenida Arce - M012',
    monto: 4500,
    impuesto: 585,
    total: 5085,
    fechaEmision: '2025-01-08',
    fechaVencimiento: '2025-02-08',
    fechaPago: null,
    estado: 'enviada',
    notas: 'Factura enviada por email'
  },
  {
    id: '4',
    numero: 'FAC-2024-045',
    cliente: 'Cervecería Nacional',
    reserva: 'RES-2024-045',
    soporte: 'Valla Carretera Norte - V008',
    monto: 6500,
    impuesto: 845,
    total: 7345,
    fechaEmision: '2024-12-01',
    fechaVencimiento: '2024-12-31',
    fechaPago: null,
    estado: 'vencida',
    notas: 'Factura vencida - contactar al brand'
  },
  {
    id: '5',
    numero: 'FAC-2025-004',
    cliente: 'Telecom Bolivia',
    reserva: 'RES-2025-005',
    soporte: 'Totem Centro Comercial - T003',
    monto: 3200,
    impuesto: 416,
    total: 3616,
    fechaEmision: '2025-01-20',
    fechaVencimiento: '2025-02-20',
    fechaPago: null,
    estado: 'cancelada',
    notas: 'Factura cancelada por reserva cancelada'
  }
];

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  enviada: 'bg-blue-100 text-blue-800',
  pagada: 'bg-green-100 text-green-800',
  vencida: 'bg-red-100 text-red-800',
  cancelada: 'bg-gray-100 text-gray-800'
};

const estadoIcons = {
  pendiente: Clock,
  enviada: Send,
  pagada: CheckCircle,
  vencida: AlertTriangle,
  cancelada: XCircle
};

export default function FacturacionPage() {
  const totalFacturas = facturas.length;
  const facturasPendientes = facturas.filter(f => f.estado === 'pendiente' || f.estado === 'enviada').length;
  const facturasVencidas = facturas.filter(f => f.estado === 'vencida').length;
  const ingresosPagados = facturas
    .filter(f => f.estado === 'pagada')
    .reduce((sum, f) => sum + f.total, 0);
  const ingresosPendientes = facturas
    .filter(f => f.estado === 'pendiente' || f.estado === 'enviada')
    .reduce((sum, f) => sum + f.total, 0);

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Facturación</h1>
          <p className="mt-0.5 text-xs text-gray-600 leading-tight">
            Gestiona facturas, cobros y estados de pago
          </p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 py-1 px-2 h-8">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nueva Factura
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold">{totalFacturas}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold">{facturasPendientes}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Por cobrar
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold text-red-600">{facturasVencidas}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
            <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold text-green-600">Bs. {ingresosPagados.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Pagos recibidos
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold text-yellow-600">Bs. {ingresosPendientes.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Pendientes de pago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-2">
        <CardContent className="p-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número o brand..."
                className="pl-8 pr-3 py-1.5 h-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 py-1 px-2">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filtros
            </Button>
            <select className="px-2 py-1.5 h-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="enviada">Enviada</option>
              <option value="pagada">Pagada</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <input
              type="month"
              className="px-2 py-1.5 h-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              defaultValue="2025-01"
            />
          </div>
        </CardContent>
      </Card>

      {/* Facturas Table */}
      <Card className="p-2">
        <CardHeader className="px-2 pb-1">
          <CardTitle className="text-sm font-semibold">Lista de Facturas</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Soporte
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facturas.map((factura) => {
                  const IconComponent = estadoIcons[factura.estado as keyof typeof estadoIcons];
                  const isVencida = factura.estado === 'vencida';
                  return (
                    <tr key={factura.id} className={`hover:bg-gray-50 ${isVencida ? 'bg-red-50' : ''}`}>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                        {factura.numero}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{factura.cliente}</div>
                        <div className="text-[11px] text-gray-500 leading-tight">{factura.reserva}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {factura.soporte}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Bs. {factura.monto.toLocaleString()}</div>
                        <div className="text-[11px] text-gray-500 leading-tight">IVA: Bs. {factura.impuesto.toLocaleString()}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-bold text-gray-900">
                        Bs. {factura.total.toLocaleString()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(factura.fechaVencimiento).toLocaleDateString('es-ES')}
                        </div>
                        {factura.fechaPago && (
                          <div className="text-[11px] text-green-600 leading-tight">
                            Pagado: {new Date(factura.fechaPago).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <Badge className={`inline-flex items-center text-[10px] ${estadoColors[factura.estado as keyof typeof estadoColors]}`}>
                          <IconComponent className="w-2.5 h-2.5 mr-0.5" />
                          {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" title="Ver factura" className="h-7 w-7 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" title="Editar factura" className="h-7 w-7 p-0">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" title="Descargar PDF" className="h-7 w-7 p-0">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          {(factura.estado === 'pendiente' || factura.estado === 'vencida') && (
                            <Button variant="outline" size="sm" title="Enviar factura" className="text-blue-600 h-7 w-7 p-0">
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

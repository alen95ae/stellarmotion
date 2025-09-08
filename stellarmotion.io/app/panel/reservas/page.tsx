import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reservas - Panel de Control | StellarMotion',
  description: 'Gestión de reservas de espacios publicitarios'
};

// Mock data
const reservas = [
  {
    id: '1',
    numero: 'RES-2025-001',
    cliente: 'Coca Cola Bolivia',
    soporte: 'Valla Zona Sur - A001',
    fechaInicio: '2025-01-10',
    fechaFin: '2025-02-10',
    monto: 8500,
    estado: 'confirmada',
    createdAt: '2025-01-05'
  },
  {
    id: '2',
    numero: 'RES-2025-002',
    cliente: 'Banco Nacional',
    soporte: 'Pantalla LED Centro - P005',
    fechaInicio: '2025-01-15',
    fechaFin: '2025-03-15',
    monto: 12000,
    estado: 'pendiente',
    createdAt: '2025-01-06'
  },
  {
    id: '3',
    numero: 'RES-2025-003',
    cliente: 'Supermercados Ketal',
    soporte: 'MUPI Avenida Arce - M012',
    fechaInicio: '2025-01-08',
    fechaFin: '2025-04-08',
    monto: 4500,
    estado: 'activa',
    createdAt: '2025-01-03'
  },
  {
    id: '4',
    numero: 'RES-2025-004',
    cliente: 'Cervecería Nacional',
    soporte: 'Valla Carretera Norte - V008',
    fechaInicio: '2024-12-01',
    fechaFin: '2024-12-31',
    monto: 6500,
    estado: 'completada',
    createdAt: '2024-11-25'
  },
  {
    id: '5',
    numero: 'RES-2025-005',
    cliente: 'Telecom Bolivia',
    soporte: 'Totem Centro Comercial - T003',
    fechaInicio: '2025-01-20',
    fechaFin: '2025-02-20',
    monto: 3200,
    estado: 'cancelada',
    createdAt: '2025-01-07'
  }
];

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  activa: 'bg-green-100 text-green-800',
  completada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800'
};

const estadoIcons = {
  pendiente: Clock,
  confirmada: CheckCircle,
  activa: CheckCircle,
  completada: CheckCircle,
  cancelada: XCircle
};

export default function ReservasPage() {
  const totalReservas = reservas.length;
  const reservasActivas = reservas.filter(r => r.estado === 'activa').length;
  const ingresosTotales = reservas
    .filter(r => r.estado !== 'cancelada')
    .reduce((sum, r) => sum + r.monto, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="mt-2 text-gray-600">
            Gestiona las reservas de tus espacios publicitarios
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReservas}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservasActivas}</div>
            <p className="text-xs text-muted-foreground">
              En curso actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {ingresosTotales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Reservas confirmadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o número..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="activa">Activa</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reservas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservas.map((reserva) => {
                  const IconComponent = estadoIcons[reserva.estado as keyof typeof estadoIcons];
                  return (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reserva.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.soporte}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reserva.fechaInicio).toLocaleDateString('es-ES')} - {new Date(reserva.fechaFin).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Bs. {reserva.monto.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`inline-flex items-center ${estadoColors[reserva.estado as keyof typeof estadoColors]}`}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </Button>
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

      {/* Calendar View Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Vista de Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Vista de Calendario</h3>
              <p className="text-sm">
                Aquí se mostrará un calendario interactivo con las reservas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

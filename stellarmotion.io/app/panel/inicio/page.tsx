import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Monitor,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  Map as MapIcon
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Inicio - Panel de Control | StellarMotion',
  description: 'Dashboard principal con métricas y KPIs'
};

// Mock data - en producción vendría de la base de datos
const stats = {
  totalSoportes: 24,
  disponibles: 8,
  ocupados: 14,
  reservados: 2,
  ingresosMes: 45600,
  reservasVencen: 3,
  ocupacionMensual: [
    { mes: 'Ene', ocupacion: 65 },
    { mes: 'Feb', ocupacion: 78 },
    { mes: 'Mar', ocupacion: 85 },
    { mes: 'Abr', ocupacion: 72 },
    { mes: 'May', ocupacion: 90 },
    { mes: 'Jun', ocupacion: 88 },
  ]
};

const proximasReservas = [
  {
    id: 1,
    cliente: 'Coca Cola Bolivia',
    soporte: 'Valla Zona Sur - A001',
    fechaVence: '2025-01-15',
    estado: 'confirmada'
  },
  {
    id: 2,
    cliente: 'Banco Nacional',
    soporte: 'Pantalla LED Centro - P005',
    fechaVence: '2025-01-18',
    estado: 'pendiente'
  },
  {
    id: 3,
    cliente: 'Supermercados Ketal',
    soporte: 'MUPI Avenida Arce - M012',
    fechaVence: '2025-01-20',
    estado: 'confirmada'
  }
];

const soportesPorEstado = [
  { estado: 'Disponible', cantidad: 8, color: 'bg-green-500' },
  { estado: 'Ocupado', cantidad: 14, color: 'bg-blue-500' },
  { estado: 'Reservado', cantidad: 2, color: 'bg-yellow-500' },
];

export default function InicioPage() {
  const ocupacionPromedio = Math.round(
    stats.ocupacionMensual.reduce((acc, curr) => acc + curr.ocupacion, 0) / stats.ocupacionMensual.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="mt-2 text-gray-600">
          Resumen general de tus espacios publicitarios
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Soportes</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSoportes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.disponibles} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {stats.ingresosMes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ocupacionPromedio}%</div>
            <p className="text-xs text-muted-foreground">
              Promedio mensual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reservasVencen}</div>
            <p className="text-xs text-muted-foreground">
              En los próximos 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ocupación Mensual */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ocupación Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.ocupacionMensual.map((item) => (
                <div key={item.mes} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium">{item.mes}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${item.ocupacion}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-right">{item.ocupacion}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Soportes por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {soportesPorEstado.map((item) => (
                <div key={item.estado} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.estado}</span>
                  </div>
                  <span className="text-sm font-bold">{item.cantidad}</span>
                </div>
              ))}
            </div>
            
            {/* Mini mapa placeholder */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500 text-sm">
                <MapIcon className="w-8 h-8 mx-auto mb-2" />
                Mapa interactivo
                <br />
                <span className="text-xs">Ver ubicaciones en el mapa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Reservas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Próximas Reservas a Vencer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proximasReservas.map((reserva) => (
              <div key={reserva.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{reserva.cliente}</div>
                  <div className="text-sm text-gray-600">{reserva.soporte}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Vence: {new Date(reserva.fechaVence).toLocaleDateString('es-ES')}
                  </div>
                  <Badge 
                    variant={reserva.estado === 'confirmada' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {reserva.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

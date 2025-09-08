import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Users,
  DollarSign,
  Calendar,
  Monitor,
  Target
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Métricas - Panel de Control | StellarMotion',
  description: 'Análisis y métricas de rendimiento'
};

// Mock data para las gráficas
const ingresosPorMes = [
  { mes: 'Jul', ingresos: 32000, ocupacion: 65 },
  { mes: 'Ago', ingresos: 38500, ocupacion: 72 },
  { mes: 'Sep', ingresos: 42000, ocupacion: 78 },
  { mes: 'Oct', ingresos: 35600, ocupacion: 68 },
  { mes: 'Nov', ingresos: 48200, ocupacion: 85 },
  { mes: 'Dic', ingresos: 51000, ocupacion: 90 },
  { mes: 'Ene', ingresos: 45600, ocupacion: 82 }
];

const ocupacionPorTipo = [
  { tipo: 'Vallas', ocupadas: 8, total: 12, porcentaje: 67 },
  { tipo: 'Pantallas LED', ocupadas: 4, total: 6, porcentaje: 67 },
  { tipo: 'MUPIs', ocupadas: 3, total: 4, porcentaje: 75 },
  { tipo: 'Totems', ocupadas: 1, total: 2, porcentaje: 50 }
];

const rankingClientes = [
  { cliente: 'Coca Cola Bolivia', gasto: 25000, reservas: 3, porcentaje: 35 },
  { cliente: 'Banco Nacional', gasto: 18500, reservas: 2, porcentaje: 26 },
  { cliente: 'Supermercados Ketal', gasto: 12300, reservas: 2, porcentaje: 17 },
  { cliente: 'Cervecería Nacional', gasto: 8900, reservas: 1, porcentaje: 12 },
  { cliente: 'Telecom Bolivia', gasto: 5200, reservas: 1, porcentaje: 7 }
];

const metricas = {
  ingresosTotales: 69900,
  crecimientoMensual: 12,
  ocupacionPromedio: 75,
  clientesActivos: 5,
  reservasActivas: 4,
  ingresoPromedioCliente: 13980
};

export default function MetricasPage() {
  const maxIngresos = Math.max(...ingresosPorMes.map(item => item.ingresos));
  const maxOcupacion = Math.max(...ingresosPorMes.map(item => item.ocupacion));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Métricas y Análisis</h1>
        <p className="mt-2 text-gray-600">
          Análisis detallado del rendimiento de tus espacios publicitarios
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {metricas.ingresosTotales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +{metricas.crecimientoMensual}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupación Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.ocupacionPromedio}%</div>
            <p className="text-xs text-muted-foreground">
              De todos los soportes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.clientesActivos}</div>
            <p className="text-xs text-muted-foreground">
              Con reservas vigentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingreso Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {metricas.ingresoPromedioCliente.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Por cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ingresos por Mes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Ingresos por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ingresosPorMes.map((item) => (
                <div key={item.mes} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.mes}</span>
                    <span className="text-sm font-bold">Bs. {item.ingresos.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.ingresos / maxIngresos) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ocupación por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Ocupación por Tipo de Soporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ocupacionPorTipo.map((item) => (
                <div key={item.tipo} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{item.tipo}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{item.ocupadas}/{item.total}</span>
                      <Badge variant="secondary" className="ml-2">
                        {item.porcentaje}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.porcentaje >= 80 ? 'bg-green-500' :
                        item.porcentaje >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Ranking de Clientes por Gasto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankingClientes.map((cliente, index) => (
              <div key={cliente.cliente} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{cliente.cliente}</div>
                  <div className="text-sm text-gray-500">
                    {cliente.reservas} reserva{cliente.reservas !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-bold text-gray-900">
                    Bs. {cliente.gasto.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cliente.porcentaje}% del total
                  </div>
                </div>
                <div className="flex-shrink-0 w-24">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cliente.porcentaje * 2.86}%` }} // Escalar para que el 35% ocupe más espacio visual
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias y Proyecciones */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Tendencia de Ocupación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ingresosPorMes.slice(-4).map((item) => (
                <div key={item.mes} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.mes}</span>
                    <span className="text-sm font-bold">{item.ocupacion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.ocupacion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Resumen del Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-blue-900">Mejor mes</div>
                  <div className="text-xs text-blue-600">Diciembre 2024</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-900">Bs. 51,000</div>
                  <div className="text-xs text-blue-600">90% ocupación</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-green-900">Crecimiento promedio</div>
                  <div className="text-xs text-green-600">Últimos 6 meses</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-900">+8.5%</div>
                  <div className="text-xs text-green-600">Mensual</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-yellow-900">Proyección</div>
                  <div className="text-xs text-yellow-600">Febrero 2025</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-900">Bs. 48,200</div>
                  <div className="text-xs text-yellow-600">Estimado</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

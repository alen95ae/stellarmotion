import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Zap,
  Ruler,
  Users,
  Upload
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Soportes - Panel de Control | StellarMotion',
  description: 'Gestión de espacios publicitarios y soportes'
};

// Mock data - en producción vendría de la base de datos
const soportes = [
  {
    id: '1',
    codigo: 'VZS-A001',
    titulo: 'Valla Zona Sur - A001',
    tipo: 'Valla',
    ciudad: 'La Paz',
    direccion: 'Av. Arce esq. Rosendo Gutiérrez',
    dimensiones: '10×4 m',
    precioMensual: 8500,
    impresionesdiarias: 44000,
    iluminacion: true,
    estado: 'ocupado',
    cliente: 'Coca Cola Bolivia',
    fechaVence: '2025-02-10',
    categoria: 'vallas',
    createdAt: '2024-06-15'
  },
  {
    id: '2',
    codigo: 'PLC-P005',
    titulo: 'Pantalla LED Centro - P005',
    tipo: 'Pantalla LED',
    ciudad: 'La Paz',
    direccion: 'Plaza San Francisco',
    dimensiones: '8×6 m',
    precioMensual: 12000,
    impresionesdiarias: 65000,
    iluminacion: true,
    estado: 'ocupado',
    cliente: 'Banco Nacional',
    fechaVence: '2025-03-15',
    categoria: 'pantallas',
    createdAt: '2024-03-22'
  },
  {
    id: '3',
    codigo: 'MAA-M012',
    titulo: 'MUPI Avenida Arce - M012',
    tipo: 'MUPI',
    ciudad: 'La Paz',
    direccion: 'Av. Arce altura Plaza Isabel La Católica',
    dimensiones: '1.2×1.8 m',
    precioMensual: 4500,
    impresionesdiarias: 28000,
    iluminacion: true,
    estado: 'ocupado',
    cliente: 'Supermercados Ketal',
    fechaVence: '2025-04-08',
    categoria: 'mupis',
    createdAt: '2024-08-10'
  },
  {
    id: '4',
    codigo: 'VCN-V008',
    titulo: 'Valla Carretera Norte - V008',
    tipo: 'Valla',
    ciudad: 'La Paz',
    direccion: 'Carretera La Paz - El Alto Km 5',
    dimensiones: '15×5 m',
    precioMensual: 11000,
    impresionesdiarias: 75000,
    iluminacion: true,
    estado: 'disponible',
    cliente: null,
    fechaVence: null,
    categoria: 'vallas',
    createdAt: '2024-01-18'
  },
  {
    id: '5',
    codigo: 'TCC-T003',
    titulo: 'Totem Centro Comercial - T003',
    tipo: 'Totem',
    ciudad: 'Santa Cruz',
    direccion: 'Mall Ventura, Planta Baja',
    dimensiones: '2×4 m',
    precioMensual: 6500,
    impresionesdiarias: 35000,
    iluminacion: false,
    estado: 'mantenimiento',
    cliente: null,
    fechaVence: null,
    categoria: 'totems',
    createdAt: '2024-09-05'
  },
  {
    id: '6',
    codigo: 'PAS-P006',
    titulo: 'Pantalla Autopista Sur - P006',
    tipo: 'Pantalla LED',
    ciudad: 'La Paz',
    direccion: 'Autopista Sur, altura Calacoto',
    dimensiones: '12×8 m',
    precioMensual: 18000,
    impresionesdiarias: 95000,
    iluminacion: true,
    estado: 'reservado',
    cliente: 'Cervecería Nacional',
    fechaVence: '2025-01-25',
    categoria: 'pantallas',
    createdAt: '2024-05-12'
  }
];

const estadoColors = {
  disponible: 'bg-green-100 text-green-800',
  ocupado: 'bg-blue-100 text-blue-800',
  reservado: 'bg-yellow-100 text-yellow-800',
  mantenimiento: 'bg-red-100 text-red-800'
};

const estadoLabels = {
  disponible: 'Disponible',
  ocupado: 'Ocupado',
  reservado: 'Reservado',
  mantenimiento: 'Mantenimiento'
};

export default function SoportesPage() {
  const totalSoportes = soportes.length;
  const soportesDisponibles = soportes.filter(s => s.estado === 'disponible').length;
  const soportesOcupados = soportes.filter(s => s.estado === 'ocupado').length;
  const ingresosMensuales = soportes
    .filter(s => s.estado === 'ocupado' || s.estado === 'reservado')
    .reduce((sum, s) => sum + s.precioMensual, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Soportes</h1>
          <p className="mt-2 text-gray-600">
            Administra todos tus espacios publicitarios
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Importar masivamente
          </Button>
          <Button className="bg-[#D7514C] hover:bg-[#c23d3b] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Soporte
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Soportes</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSoportes}</div>
            <p className="text-xs text-muted-foreground">
              Espacios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{soportesDisponibles}</div>
            <p className="text-xs text-muted-foreground">
              Listos para alquilar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupados</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{soportesOcupados}</div>
            <p className="text-xs text-muted-foreground">
              Con campañas activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {ingresosMensuales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              De soportes activos
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
                placeholder="Buscar por código o ubicación..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="ocupado">Ocupado</option>
              <option value="reservado">Reservado</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todos los tipos</option>
              <option value="vallas">Vallas</option>
              <option value="pantallas">Pantallas LED</option>
              <option value="mupis">MUPIs</option>
              <option value="totems">Totems</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Soportes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Soportes Publicitarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especificaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio/Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {soportes.map((soporte) => (
                  <tr key={soporte.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{soporte.codigo}</div>
                      <div className="text-sm text-gray-500">{soporte.tipo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{soporte.titulo}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Ruler className="w-3 h-3 mr-1" />
                        {soporte.dimensiones}
                        {soporte.iluminacion && (
                          <>
                            <Zap className="w-3 h-3 ml-2 mr-1" />
                            Iluminado
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-3 h-3 mr-1" />
                        {soporte.ciudad}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {soporte.direccion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-3 h-3 mr-1" />
                        {soporte.impresionesdiarias.toLocaleString()} imp/día
                      </div>
                      <div className="text-sm text-gray-500">
                        Impresiones diarias
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Bs. {soporte.precioMensual.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={estadoColors[soporte.estado as keyof typeof estadoColors]}>
                        {estadoLabels[soporte.estado as keyof typeof estadoLabels]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {soporte.cliente ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{soporte.cliente}</div>
                          {soporte.fechaVence && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Vence: {new Date(soporte.fechaVence).toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" title="Ver detalles">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" title="Editar soporte">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" title="Eliminar" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

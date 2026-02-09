import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  Calendar
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Brands - Panel de Control | StellarMotion',
  description: 'Gestión de brands y contactos'
};

// Mock data
const clientes = [
  {
    id: '1',
    nombre: 'Coca Cola Bolivia',
    email: 'contacto@cocacola.bo',
    telefono: '+591 2 2345678',
    empresa: 'The Coca-Cola Company',
    direccion: 'Av. Arce 2612, La Paz',
    nit: '1023456789012',
    alquileresActivos: 2,
    totalGastado: 25000,
    ultimaReserva: '2025-01-10',
    estado: 'activo',
    createdAt: '2024-06-15'
  },
  {
    id: '2',
    nombre: 'María González',
    email: 'maria.gonzalez@banconacional.bo',
    telefono: '+591 2 2876543',
    empresa: 'Banco Nacional de Bolivia',
    direccion: 'Calle Comercio 1456, La Paz',
    nit: '2034567890123',
    alquileresActivos: 1,
    totalGastado: 18500,
    ultimaReserva: '2025-01-15',
    estado: 'activo',
    createdAt: '2024-03-22'
  },
  {
    id: '3',
    nombre: 'Carlos Mendoza',
    email: 'cmendoza@ketal.bo',
    telefono: '+591 2 2654321',
    empresa: 'Supermercados Ketal',
    direccion: 'Av. 6 de Agosto 2055, La Paz',
    nit: '3045678901234',
    alquileresActivos: 1,
    totalGastado: 12300,
    ultimaReserva: '2025-01-08',
    estado: 'activo',
    createdAt: '2024-08-10'
  },
  {
    id: '4',
    nombre: 'Ana Rodríguez',
    email: 'ana.rodriguez@cerveceria.bo',
    telefono: '+591 2 2987654',
    empresa: 'Cervecería Nacional',
    direccion: 'Zona Industrial, El Alto',
    nit: '4056789012345',
    alquileresActivos: 0,
    totalGastado: 8900,
    ultimaReserva: '2024-12-01',
    estado: 'inactivo',
    createdAt: '2024-01-18'
  },
  {
    id: '5',
    nombre: 'Roberto Silva',
    email: 'rsilva@telecom.bo',
    telefono: '+591 2 2123456',
    empresa: 'Telecom Bolivia',
    direccion: 'Av. Ballivián 1234, La Paz',
    nit: '5067890123456',
    alquileresActivos: 0,
    totalGastado: 5200,
    ultimaReserva: '2025-01-20',
    estado: 'activo',
    createdAt: '2024-09-05'
  }
];

export default function ClientesPage() {
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.estado === 'activo').length;
  const alquileresActivos = clientes.reduce((sum, c) => sum + c.alquileresActivos, 0);
  const ingresosTotales = clientes.reduce((sum, c) => sum + c.totalGastado, 0);

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Clientes</h1>
          <p className="mt-0.5 text-xs text-gray-600 leading-tight">
            Gestiona tu base de datos de clientes y contactos
          </p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 py-1 px-2 h-8">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-4">
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold">{totalClientes}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {clientesActivos} activos
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold">{clientesActivos}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Con alquileres recientes
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Alquileres Activos</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold">{alquileresActivos}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              En curso
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 py-1.5">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Building className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-2">
            <div className="text-base font-bold">Bs. {ingresosTotales.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Facturación acumulada
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
                placeholder="Buscar por nombre, empresa o email..."
                className="pl-8 pr-3 py-1.5 h-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 py-1 px-2">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filtros
            </Button>
            <select className="px-2 py-1.5 h-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Brands Table */}
      <Card className="p-2">
        <CardHeader className="px-2 pb-1">
          <CardTitle className="text-sm font-semibold">Lista de Brands</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Alquileres Activos
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Total Gastado
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Última Reserva
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
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.nombre}
                      </div>
                      <div className="text-[11px] text-gray-500 leading-tight">
                        NIT: {cliente.nit}
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-3 h-3 mr-1" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center text-[11px] text-gray-500 leading-tight">
                        <Phone className="w-2.5 h-2.5 mr-1" />
                        {cliente.telefono}
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.empresa}</div>
                      <div className="text-[11px] text-gray-500 max-w-xs truncate leading-tight">
                        {cliente.direccion}
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-center">
                      <Badge variant={cliente.alquileresActivos > 0 ? 'default' : 'secondary'} className="text-[10px]">
                        {cliente.alquileresActivos}
                      </Badge>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                      Bs. {cliente.totalGastado.toLocaleString()}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {new Date(cliente.ultimaReserva).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <Badge 
                        variant={cliente.estado === 'activo' ? 'default' : 'secondary'}
                        className={`text-[10px] ${cliente.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 h-7 w-7 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
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

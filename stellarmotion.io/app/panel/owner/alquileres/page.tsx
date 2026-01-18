'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  XCircle,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlquilerWithRelations } from '@/types/alquileres';

// Funciones para manejar estados (similar a gestión de soportes)
const getStatusColor = (status: string) => {
  const statusColors = {
    'pendiente': 'bg-yellow-100',
    'reservada': 'bg-blue-100',
    'activa': 'bg-green-100',
    'completada': 'bg-gray-400',
    'cancelada': 'bg-red-100'
  };
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-400';
};

const getStatusLabel = (status: string) => {
  const statusLabels = {
    'pendiente': 'Pendiente',
    'reservada': 'Reservada',
    'activa': 'Activa',
    'completada': 'Completada',
    'cancelada': 'Cancelada'
  };
  return statusLabels[status as keyof typeof statusLabels] || status;
};

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  reservada: 'bg-blue-100 text-blue-800',
  activa: 'bg-green-100 text-green-800',
  completada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800'
};

const estadoIcons = {
  pendiente: Clock,
  reservada: CheckCircle,
  activa: CheckCircle,
  completada: CheckCircle,
  cancelada: XCircle
};

export default function AlquileresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [alquileres, setAlquileres] = useState<AlquilerWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar alquileres desde la API
  useEffect(() => {
    const fetchAlquileres = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/alquileres', {
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.details || 'Error al cargar alquileres');
        }

        const data = await response.json();

        if (data.success && data.alquileres) {
          // DEBUG OBLIGATORIO
          if (data.alquileres.length > 0) {
            console.log('🧪 SOPORTE FRONTEND:', data.alquileres[0].soporte);
          }
          setAlquileres(data.alquileres);
        } else {
          setAlquileres([]);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar alquileres');
        setAlquileres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlquileres();
  }, []);

  const totalAlquileres = alquileres.length;
  const alquileresActivos = alquileres.filter(r => r.estado === 'activa').length;
  const ingresosTotales = alquileres
    .filter(r => r.estado !== 'cancelada')
    .reduce((sum, r) => sum + r.precio_total, 0);
  
  // Filtrar alquileres
  const filteredAlquileres = alquileres.filter(alquiler => {
    const usuarioNombre = alquiler.usuario?.nombre || '';
    const soporteCodigo = alquiler.soporte?.codigo_cliente || alquiler.soporte?.codigo_interno || '';
    const matchesSearch = searchTerm === '' || 
      alquiler.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soporteCodigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || alquiler.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alquileres</h1>
          <p className="mt-1 text-gray-600">
            Gestiona los alquileres de tus espacios publicitarios
          </p>
        </div>
        <Button className="bg-[#e94446] hover:bg-[#d63a3a]">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Alquiler
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alquileres</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlquileres}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alquileres Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alquileresActivos}</div>
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
              Alquileres confirmados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por usuario o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los estados" className="truncate">
                {filterStatus === 'all' ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <Filter className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate">Todos los estados</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(filterStatus)}`}></span>
                    <span className="truncate">{getStatusLabel(filterStatus)}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span>Todos los estados</span>
                </div>
              </SelectItem>
              <SelectItem value="pendiente">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('pendiente')}`}></span>
                  <span>{getStatusLabel('pendiente')}</span>
                </span>
              </SelectItem>
              <SelectItem value="reservada">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('reservada')}`}></span>
                  <span>{getStatusLabel('reservada')}</span>
                </span>
              </SelectItem>
              <SelectItem value="activa">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('activa')}`}></span>
                  <span>{getStatusLabel('activa')}</span>
                </span>
              </SelectItem>
              <SelectItem value="completada">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('completada')}`}></span>
                  <span>{getStatusLabel('completada')}</span>
                </span>
              </SelectItem>
              <SelectItem value="cancelada">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('cancelada')}`}></span>
                  <span>{getStatusLabel('cancelada')}</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alquileres Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alquileres</CardTitle>
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
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                        <span className="text-gray-500">Cargando alquileres...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : filteredAlquileres.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <span className="text-gray-500">No se encontraron alquileres</span>
                    </td>
                  </tr>
                ) : (
                  filteredAlquileres.map((alquiler) => {
                    const IconComponent = estadoIcons[alquiler.estado as keyof typeof estadoIcons];
                    return (
                      <tr key={alquiler.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {alquiler.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {alquiler.usuario?.nombre || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {alquiler.soporte?.codigo_cliente ?? alquiler.soporte?.codigo_interno ?? 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(alquiler.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(alquiler.fecha_fin).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Bs. {alquiler.precio_total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`inline-flex items-center ${estadoColors[alquiler.estado as keyof typeof estadoColors]}`}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {getStatusLabel(alquiler.estado)}
                          </Badge>
                        </td>
                        <td className="pl-2 pr-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
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
                Aquí se mostrará un calendario interactivo con los alquileres
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

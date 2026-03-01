'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
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
    <div className="space-y-4 -mt-10">
      {/* Título */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Alquileres</h1>
          <p className="mt-0.5 text-xs text-gray-600 leading-tight">
            Gestiona los alquileres de tus espacios publicitarios
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-2 bg-[#e94446] hover:bg-[#d63a3a] h-9 px-3">
          <Plus className="h-4 w-4" />
          Nuevo Alquiler
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center">
        <div className="relative w-full sm:w-[280px] min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por usuario o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 min-w-[10rem] w-auto [&_[data-slot=select-value]]:line-clamp-none">
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

      {/* Alquileres Table */}
      <Card className="p-4">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="text-sm font-semibold">Lista de Alquileres</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="[&_tr]:border-b [&_tr]:border-gray-200 dark:[&_tr]:border-gray-800">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    Número
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    Usuario
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    Soporte
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    Período
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    Meses
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    Precio
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    Estado
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center">
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                        Cargando alquileres...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : filteredAlquileres.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No se encontraron alquileres
                    </td>
                  </tr>
                ) : (
                  filteredAlquileres.map((alquiler) => {
                    const IconComponent = estadoIcons[alquiler.estado as keyof typeof estadoIcons];
                    return (
                      <tr key={alquiler.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {alquiler.numero}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {alquiler.usuario?.nombre || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {alquiler.soporte?.codigo_cliente ?? alquiler.soporte?.codigo_interno ?? 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(alquiler.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(alquiler.fecha_fin).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {alquiler.meses || Math.ceil((new Date(alquiler.fecha_fin).getTime() - new Date(alquiler.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))} mes{(alquiler.meses || Math.ceil((new Date(alquiler.fecha_fin).getTime() - new Date(alquiler.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))) !== 1 ? 'es' : ''}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          Bs. {alquiler.precio_total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${estadoColors[alquiler.estado as keyof typeof estadoColors]}`}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {getStatusLabel(alquiler.estado)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-1 justify-center">
                            <Button variant="outline" size="sm" title="Ver" className="h-7 w-7 p-0">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" title="Editar" className="h-7 w-7 p-0">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 h-7 w-7 p-0" title="Eliminar">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
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

    </div>
  );
}

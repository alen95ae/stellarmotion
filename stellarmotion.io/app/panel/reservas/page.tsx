'use client';

import { useState } from 'react';
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
  XCircle
} from 'lucide-react';

// Funciones para manejar estados (similar a gestión de soportes)
const getStatusColor = (status: string) => {
  const statusColors = {
    'pendiente': 'bg-yellow-100',
    'confirmada': 'bg-blue-100',
    'activa': 'bg-green-100',
    'completada': 'bg-gray-400',
    'cancelada': 'bg-red-100'
  };
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-400';
};

const getStatusLabel = (status: string) => {
  const statusLabels = {
    'pendiente': 'Pendiente',
    'confirmada': 'Confirmada',
    'activa': 'Activa',
    'completada': 'Completada',
    'cancelada': 'Cancelada'
  };
  return statusLabels[status as keyof typeof statusLabels] || status;
};

// Mock data
const alquileres = [
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

export default function AlquileresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const totalAlquileres = alquileres.length;
  const alquileresActivos = alquileres.filter(r => r.estado === 'activa').length;
  const ingresosTotales = alquileres
    .filter(r => r.estado !== 'cancelada')
    .reduce((sum, r) => sum + r.monto, 0);
  
  // Filtrar alquileres
  const filteredAlquileres = alquileres.filter(alquiler => {
    const matchesSearch = searchTerm === '' || 
      alquiler.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alquiler.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || alquiler.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex justify-between items-center mb-0.5">
        <div>
          <h1 className="text-lg font-bold text-gray-900 mb-0.5">Alquileres</h1>
          <p className="text-xs text-gray-600 leading-tight mb-0">
            Gestiona los alquileres de tus espacios publicitarios
          </p>
        </div>
        <Button size="sm" className="bg-[#e94446] hover:bg-[#d63a3a] py-1 px-2 h-8">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nuevo Alquiler
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-0.5">
        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 px-2 py-1">
            <CardTitle className="text-sm font-medium">Total Alquileres</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-1">
            <div className="text-base font-bold">{totalAlquileres}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 px-2 py-1">
            <CardTitle className="text-sm font-medium">Alquileres Activos</CardTitle>
            <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-1">
            <div className="text-base font-bold">{alquileresActivos}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              En curso actualmente
            </p>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 px-2 py-1">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-2 py-1">
            <div className="text-base font-bold">Bs. {ingresosTotales.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Alquileres confirmados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-1.5 mb-2">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
          <Input
            placeholder="Buscar por brand o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex gap-1.5">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px] h-8">
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
              <SelectItem value="confirmada">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('confirmada')}`}></span>
                  <span>{getStatusLabel('confirmada')}</span>
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
      <Card className="p-2">
        <CardHeader className="px-2 pb-1">
          <CardTitle className="text-sm font-semibold">Lista de Alquileres</CardTitle>
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
                    Brand
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Soporte
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Precio
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
                {filteredAlquileres.map((alquiler) => {
                  const IconComponent = estadoIcons[alquiler.estado as keyof typeof estadoIcons];
                  return (
                    <tr key={alquiler.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                        {alquiler.numero}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {alquiler.cliente}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {alquiler.soporte}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {new Date(alquiler.fechaInicio).toLocaleDateString('es-ES')} - {new Date(alquiler.fechaFin).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                        Bs. {alquiler.monto.toLocaleString()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <Badge className={`inline-flex items-center text-[10px] ${estadoColors[alquiler.estado as keyof typeof estadoColors]}`}>
                          <IconComponent className="w-2.5 h-2.5 mr-0.5" />
                          {alquiler.estado.charAt(0).toUpperCase() + alquiler.estado.slice(1)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View Placeholder */}
      <Card className="p-2">
        <CardHeader className="px-2 pb-1">
          <CardTitle className="text-sm font-semibold">Vista de Calendario</CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-2">
          <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <h3 className="text-sm font-medium mb-1">Vista de Calendario</h3>
              <p className="text-xs">
                Aquí se mostrará un calendario interactivo con los alquileres
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

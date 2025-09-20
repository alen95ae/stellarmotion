'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit,
  Trash2,
  Eye, 
  MapPin,
  Euro, 
  Calendar,
  Monitor,
  Search,
  Filter,
  MoreHorizontal,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Support {
  id: string;
  code?: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  dimensions: string;
  dailyImpressions: number;
  type: string;
  lighting: boolean;
  tags: string[];
  images: string[];
  shortDescription: string;
  description: string;
  featured: boolean;
  latitude: number | null;
  longitude: number | null;
  pricePerMonth: number;
  printingCost: number;
  rating: number;
  reviewsCount: number;
  categoryId: string | null;
  status: string;
  available: boolean;
  address: string;
  createdAt: string;
  updatedAt: string;
  ownerName?: string | null;
}

export default function SoportesPage() {
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; support: Support | null }>({
    open: false,
    support: null
  });

  // ID del partner - en producción esto vendría de la sesión autenticada
  // Por ahora usamos el ID del partner creado en el seed
  const partnerId = 'cmfskhuda0004sj2w46q3g7rc'; // ID del partner "Publicidad Vial Imagen SRL"

  useEffect(() => {
    fetchSupports();
  }, []);

  const fetchSupports = async () => {
    try {
      setLoading(true);
      const partnerResponse = await fetch(`/api/soportes?partnerId=${partnerId}`);
      if (!partnerResponse.ok) {
        throw new Error(`Failed partner fetch: ${partnerResponse.status}`);
      }

      let data: Support[] = await partnerResponse.json();

      // Si no hay soportes asociados al partner, traer todos para mostrarlos
      if (!Array.isArray(data) || data.length === 0) {
        const generalResponse = await fetch('/api/soportes');
        if (generalResponse.ok) {
          const generalData = await generalResponse.json();
          if (Array.isArray(generalData) && generalData.length) {
            data = generalData;
          }
        }
      }

      // Sanitizar estructura para evitar valores inesperados en la UI
      const normalizedSupports = (Array.isArray(data) ? data : []).map((support: any) => {
        const images = Array.isArray(support.images)
          ? support.images
          : typeof support.images === 'string' && support.images.trim()
            ? [support.images.trim()]
            : [];

        const tags = Array.isArray(support.tags)
          ? support.tags
          : typeof support.tags === 'string'
            ? support.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
            : [];

        return {
          ...support,
          images,
          tags,
          latitude: typeof support.latitude === 'number' ? support.latitude : null,
          longitude: typeof support.longitude === 'number' ? support.longitude : null,
        } as Support;
      });

      setSupports(normalizedSupports);
    } catch (error) {
      console.error('Error fetching supports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (support: Support) => {
    try {
      const response = await fetch(`/api/soportes/${support.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSupports(supports.filter(s => s.id !== support.id));
        setDeleteDialog({ open: false, support: null });
      }
    } catch (error) {
      console.error('Error deleting support:', error);
    }
  };

  const filteredSupports = supports.filter(support => {
    const matchesSearch = support.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         support.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (support.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || support.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DISPONIBLE': { label: 'Disponible', className: 'bg-green-100 text-green-800 border-green-200' },
      'RESERVADO': { label: 'Reservado', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'OCUPADO': { label: 'Ocupado', className: 'bg-red-100 text-red-800 border-red-200' },
      'MANTENIMIENTO': { label: 'Mantenimiento', className: 'bg-black text-white border-black' },
      'INACTIVO': { label: 'Inactivo', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Soportes</h1>
            <p className="mt-2 text-gray-600">
              Administra todos tus espacios publicitarios
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Soportes</h1>
          <p className="mt-2 text-gray-600">
            Administra todos tus espacios publicitarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Link href="/publicar-espacio">
            <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4" />
              Nuevo Soporte
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Soportes</p>
                <p className="text-2xl font-semibold text-gray-900">{supports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Disponibles</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supports.filter(s => s.status === 'DISPONIBLE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ingresos Potenciales</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPrice(supports.reduce((sum, s) => sum + (s.pricePerMonth || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Este Mes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supports.filter(s => {
                    const created = new Date(s.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar soportes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
              />
            </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="RESERVADO">Reservado</option>
            <option value="OCUPADO">Ocupado</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
      </div>

      {/* Supports Table */}
      {filteredSupports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay soportes</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'No se encontraron soportes con los filtros aplicados.'
                : 'Comienza creando tu primer soporte publicitario.'
              }
            </p>
            <Link href="/publicar-espacio">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Soporte
              </Button>
            </Link>
        </CardContent>
      </Card>
      ) : (
      <Card>
        <CardHeader>
            <CardTitle>Lista de Soportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dimensiones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio/mes
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
                  {filteredSupports.map((support) => (
                    <tr key={support.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                              <Monitor className="h-5 w-5 text-red-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {support.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {support.shortDescription || 'Sin descripción'}
                            </div>
                            {support.featured && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Destacado
                              </Badge>
                            )}
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {support.code || 'N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{support.city}</div>
                            <div className="text-sm text-gray-500">{support.country}</div>
                      </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{support.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{support.dimensions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatPrice(support.pricePerMonth || 0)}
                        </div>
                        {support.printingCost && (
                          <div className="text-xs text-gray-500">
                            +{formatPrice(support.printingCost)} impresión
                          </div>
                      )}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(support.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                        </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/product/${support.slug}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Público
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/panel/soportes/${support.id}/editar`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ open: true, support })}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, support: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar soporte?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el soporte "{deleteDialog.support?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, support: null })}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteDialog.support && handleDelete(deleteDialog.support)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

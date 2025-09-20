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
  MoreHorizontal
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
  slug: string;
  title: string;
  city: string;
  country: string;
  dimensions: string;
  dailyImpressions: number;
  type: string;
  lighting: boolean;
  tags: string;
  images: string;
  shortDescription: string;
  description: string;
  featured: boolean;
  lat: number;
  lng: number;
  pricePerMonth: number;
  printingCost: number;
  rating: number;
  reviewsCount: number;
  categoryId: string;
  status: string;
  available: boolean;
  address: string;
  createdAt: string;
  updatedAt: string;
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
      const response = await fetch(`/api/soportes?partnerId=${partnerId}`);
      const data = await response.json();
      setSupports(data);
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
                         support.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || support.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DISPONIBLE': { label: 'Disponible', variant: 'default' as const },
      'OCUPADO': { label: 'Ocupado', variant: 'secondary' as const },
      'MANTENIMIENTO': { label: 'Mantenimiento', variant: 'destructive' as const },
      'INACTIVO': { label: 'Inactivo', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        <Link href="/publicar-espacio">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Soporte
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-red-600" />
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
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
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
              <Euro className="h-8 w-8 text-red-600" />
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
              <Calendar className="h-8 w-8 text-red-600" />
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
            <option value="OCUPADO">Ocupado</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
      </div>

      {/* Supports Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupports.map((support) => (
            <Card key={support.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{support.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-500">{support.city}</span>
                    </div>
                      </div>
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
                      </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estado</span>
                    {getStatusBadge(support.status)}
                      </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Dimensiones</span>
                    <span className="text-sm font-medium">{support.dimensions}</span>
                      </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Precio/mes</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatPrice(support.pricePerMonth || 0)}
                    </span>
                      </div>
                  
                  {support.shortDescription && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {support.shortDescription}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-400">
                      Creado: {new Date(support.createdAt).toLocaleDateString()}
                    </span>
                    {support.featured && (
                      <Badge variant="secondary" className="text-xs">
                        Destacado
                      </Badge>
                          )}
                        </div>
          </div>
        </CardContent>
      </Card>
          ))}
        </div>
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
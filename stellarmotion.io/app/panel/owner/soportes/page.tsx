'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Upload,
  FileSpreadsheet,
  Crown,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import BulkActions from '@/components/BulkActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const ERP_ASSET_BASE = process.env.NEXT_PUBLIC_ERP_ASSET_URL || process.env.NEXT_PUBLIC_ERP_API_URL || '';

const makeAbsoluteUrl = (value?: string | null) => {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  if (!ERP_ASSET_BASE) return value;
  const base = ERP_ASSET_BASE.replace(/\/$/, '');
  const path = value.startsWith('/') ? value : `/${value}`;
  return `${base}${path}`;
};

export default function SoportesPage() {
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  
  console.log('🚀 Componente SoportesPage inicializado - loading:', loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; support: Support | null }>({
    open: false,
    support: null
  });

  // ID del owner - en producción esto vendría de la sesión autenticada
  // Por ahora usamos el ID del owner creado en el seed
  const usuarioId = 'cmfskhuda0004sj2w46q3g7rc'; // ID del usuario "Publicidad Vial Imagen SRL"

  useEffect(() => {
    fetchSupports();
  }, []);

  const fetchSupports = async () => {
    try {
      console.log('🔄 Iniciando fetchSupports...');
      setLoading(true);
      
      console.log('📡 Haciendo petición a usuario API...');
      const usuarioResponse = await fetch(`/api/soportes?usuarioId=${usuarioId}`);
      console.log('📡 Respuesta usuario:', usuarioResponse.status, usuarioResponse.ok);
      
      if (!usuarioResponse.ok) {
        throw new Error(`Failed usuario fetch: ${usuarioResponse.status}`);
      }
      
      const usuarioData = await usuarioResponse.json();
      console.log('📊 Datos del usuario:', usuarioData);
      let data: Support[] = usuarioData.soportes || usuarioData || [];
      console.log('📋 Datos extraídos:', data.length, 'soportes');

      // Si no hay soportes asociados al owner, traer todos para mostrarlos
      if (!Array.isArray(data) || data.length === 0) {
        console.log('🔄 No hay soportes del owner, buscando todos...');
        const generalResponse = await fetch('/api/soportes');
        if (generalResponse.ok) {
          const generalData = await generalResponse.json();
          console.log('📊 Datos generales:', generalData);
          data = generalData.soportes || generalData || [];
          console.log('📋 Datos generales extraídos:', data.length, 'soportes');
        }
      }

      // Sanitizar estructura para evitar valores inesperados en la UI
      const normalizedSupports = (Array.isArray(data) ? data : []).map((support: any) => {
        const rawImages = Array.isArray(support.images)
          ? support.images
          : typeof support.images === 'string' && support.images.trim()
            ? [support.images.trim()]
            : [];

        const images = rawImages
          .map((img: string) => makeAbsoluteUrl(img) || img)
          .filter((img) => !!img);

        if (images.length === 0 && support.imageUrl) {
          const fallback = makeAbsoluteUrl(support.imageUrl) || support.imageUrl;
          if (fallback) {
            images.push(fallback);
          }
        }

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

      console.log('✅ Soportes normalizados:', normalizedSupports.length);
      setSupports(normalizedSupports);
      console.log('✅ Estado actualizado, loading = false');
    } catch (error) {
      console.error('❌ Error fetching supports:', error);
    } finally {
      setLoading(false);
      console.log('🏁 fetchSupports completado, loading = false');
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

  const handleExportPDF = async () => {
    try {
      const selectedIds = Object.keys(selected).filter(id => selected[id]);
      if (selectedIds.length === 0) {
        const url = `/api/soportes/export/pdf`;
        window.open(url, '_blank');
      } else {
        const url = `/api/soportes/export/pdf?ids=${selectedIds.join(',')}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  // Funciones para selección múltiple
  const filteredSupports = supports.filter(support => {
    const matchesSearch = support.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         support.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (support.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || support.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const ids = filteredSupports.map(s => s.id);
  const allSelected = ids.length > 0 && ids.every(id => selected[id]);
  const someSelected = ids.some(id => selected[id]);
  
  const toggleAll = (checked: boolean) => {
    if (checked) {
      const newSelected: Record<string, boolean> = {};
      ids.forEach(id => { newSelected[id] = true; });
      setSelected(newSelected);
    } else {
      setSelected({});
    }
  };

  const getSelectedIds = () => Object.keys(selected).filter(id => selected[id]);

  // Función para cambio de estado masivo
  async function bulkStatusChange(newStatus: string) {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    if (!confirm(`¿Cambiar estado de ${ids.length} soportes a ${getStatusLabel(newStatus)}?`)) return;
    
    try {
      const response = await fetch('/api/soportes/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status: newStatus })
      });
      
      if (response.ok) {
        await fetchSupports();
        setSelected({});
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  // Función para eliminación masiva
  async function bulkDelete() {
    const ids = getSelectedIds();
    if (ids.length === 0) return;
    if (!confirm(`¿Eliminar ${ids.length} soportes?`)) return;
    
    try {
      const response = await fetch('/api/soportes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      
      if (response.ok) {
        await fetchSupports();
        setSelected({});
      }
    } catch (error) {
      console.error('Error deleting supports:', error);
    }
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      'DISPONIBLE': 'Disponible',
      'RESERVADO': 'Reservado',
      'OCUPADO': 'Ocupado',
      'MANTENIMIENTO': 'Mantenimiento',
      'INACTIVO': 'Inactivo'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
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
      'MANTENIMIENTO': { label: 'Mantenimiento', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      'INACTIVO': { label: 'Inactivo', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'DISPONIBLE': 'bg-green-100', // Mismo tono claro del recuadro bg-green-100
      'RESERVADO': 'bg-yellow-100', // Mismo tono claro del recuadro bg-yellow-100
      'OCUPADO': 'bg-red-100', // Mismo tono claro del recuadro bg-red-100
      'MANTENIMIENTO': 'bg-gray-400', // Intercambiado con INACTIVO
      'INACTIVO': 'bg-gray-500' // Intercambiado con MANTENIMIENTO
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      'DISPONIBLE': 'Disponible',
      'RESERVADO': 'Reservado',
      'OCUPADO': 'Ocupado',
      'MANTENIMIENTO': 'Mantenimiento',
      'INACTIVO': 'Inactivo'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const formatPrice = (price: number) => {
    if (!price || price === 0) return '0.00 $';
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price).replace('USD', '$').replace(/\s/g, '');
  };

  console.log('🔍 Estado actual - loading:', loading, 'supports:', supports.length);
  
  if (loading) {
    console.log('⏳ Mostrando estado de carga...');
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Soportes</h1>
            <p className="mt-1 text-gray-600">
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Soportes</h1>
          <p className="mt-1 text-gray-600">
            Administra todos tus espacios publicitarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2 relative">
            <div className="absolute -top-2 -left-2 z-10">
              <Crown className="h-4 w-4 text-purple-600 fill-purple-600" />
            </div>
            <FileSpreadsheet className="h-4 w-4" />
            Importar
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={Object.keys(selected).filter(id => selected[id]).length === 0 && filteredSupports.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Catálogo PDF
          </Button>
          <Link href="/publicar-espacio">
            <Button className="flex items-center gap-2 bg-[#e94446] hover:bg-[#d63a3a]">
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
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar soportes..."
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
              <SelectItem value="DISPONIBLE">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('DISPONIBLE')}`}></span>
                  <span>{getStatusLabel('DISPONIBLE')}</span>
                </span>
              </SelectItem>
              <SelectItem value="RESERVADO">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('RESERVADO')}`}></span>
                  <span>{getStatusLabel('RESERVADO')}</span>
                </span>
              </SelectItem>
              <SelectItem value="OCUPADO">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('OCUPADO')}`}></span>
                  <span>{getStatusLabel('OCUPADO')}</span>
                </span>
              </SelectItem>
              <SelectItem value="MANTENIMIENTO">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('MANTENIMIENTO')}`}></span>
                  <span>{getStatusLabel('MANTENIMIENTO')}</span>
                </span>
              </SelectItem>
              <SelectItem value="INACTIVO">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor('INACTIVO')}`}></span>
                  <span>{getStatusLabel('INACTIVO')}</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
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
          {/* Barra de acciones masivas */}
          <BulkActions
            selectedCount={Object.keys(selected).filter(id => selected[id]).length}
            onBulkDelete={bulkDelete}
            onBulkStatusChange={bulkStatusChange}
          />
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                    <Checkbox
                      checked={allSelected ? true : (someSelected ? 'indeterminate' : false)}
                      onCheckedChange={(v) => toggleAll(Boolean(v))}
                      aria-label="Seleccionar todo"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                  <th className="pl-2 pr-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredSupports.map((support) => (
                    <tr key={support.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap w-10">
                      <Checkbox
                        checked={!!selected[support.id]}
                        onCheckedChange={(v) =>
                          setSelected(prev => ({ ...prev, [support.id]: Boolean(v) }))
                        }
                        aria-label={`Seleccionar ${support.code || support.id}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {support.images && support.images.length > 0 && support.images[0] ? (
                              <div className="h-10 w-10 rounded-lg overflow-hidden relative">
                                <Image
                                  src={support.images[0]}
                                  alt={support.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <Monitor className="h-5 w-5 text-red-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {support.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {support.shortDescription || 'Sin descripción'}
                          </div>
                            {support.featured && (
                              <Badge className="text-xs mt-1 bg-purple-100 text-purple-800 border-purple-200">
                                Destacado
                              </Badge>
                            )}
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {support.code || 'N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">{support.city}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{support.country}</div>
                      </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{support.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{support.dimensions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatPrice(support.pricePerMonth || 0)}
                        </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(support.status)}
                      </td>
                      <td className="pl-2 pr-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          {support.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/product/${support.slug && !support.slug.startsWith('support-') ? support.slug : support.id}`, '_blank')}
                              title="Ver"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/panel/soportes/${support.id}/editar`}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, support })}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
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

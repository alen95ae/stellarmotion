'use client'

import { useState, useEffect, useMemo } from 'react';
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
  X,
  ArrowUpDown
} from 'lucide-react';
import { normalizeText } from '@/lib/utils';
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
import { Switch } from '@/components/ui/switch';

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
const STORAGE_KEY = 'stellarmotion_soportes_filtros';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('');
  const [sortColumn, setSortColumn] = useState<'code' | 'title' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; support: Support | null }>({
    open: false,
    support: null
  });

  const usuarioId = 'cmfskhuda0004sj2w46q3g7rc';

  const uniqueCities = useMemo(() => {
    const cities = [...new Set(supports.map(s => s.city).filter(Boolean))] as string[];
    return cities.sort((a, b) => a.localeCompare(b));
  }, [supports]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const f = JSON.parse(saved);
        setSearchTerm(f.q ?? '');
        setSearchQuery(f.q ?? '');
        setFilterStatus(f.filterStatus ?? 'all');
        setFilterCity(f.filterCity ?? '');
        setSortColumn(f.sortColumn ?? null);
        setSortDirection(f.sortDirection ?? 'asc');
      }
    } catch {
      // ignore
    }
    setFiltersLoaded(true);
  }, []);

  useEffect(() => {
    if (!filtersLoaded) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      q: searchQuery,
      filterStatus,
      filterCity,
      sortColumn,
      sortDirection
    }));
  }, [searchQuery, filterStatus, filterCity, sortColumn, sortDirection, filtersLoaded]);

  useEffect(() => {
    if (!filtersLoaded) return;
    const t = setTimeout(() => setSearchQuery(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm, filtersLoaded]);

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
    const selectedIds = Object.keys(selected).filter(id => selected[id]);
    const idsToExport = selectedIds.length > 0
      ? selectedIds
      : sortedFilteredSupports.map(s => s.id);

    if (idsToExport.length === 0) return;

    const params = new URLSearchParams({ ids: idsToExport.join(',') });
    if (filterStatus === 'DISPONIBLE') params.set('disponibilidad', 'disponibles');
    if (filterStatus === 'OCUPADO') params.set('disponibilidad', 'ocupados');
    if (filterCity.trim()) params.set('ciudad', filterCity.trim());
    if (idsToExport.length === 1) {
      const one = sortedFilteredSupports.find(s => s.id === idsToExport[0]) || supports.find(s => s.id === idsToExport[0]);
      if (one?.title) params.set('soporte', encodeURIComponent(one.title));
    }

    try {
      const response = await fetch(`/api/soportes/export/pdf?${params.toString()}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al generar el PDF');

      let fileName = `Catalogo Soportes - ${new Date().toISOString().split('T')[0]}.pdf`;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/i);
        if (match?.[1]) {
          fileName = match[1];
          if (fileName.includes("UTF-8''")) fileName = decodeURIComponent(fileName.split("UTF-8''")[1]);
          fileName = fileName.trim().replace(/[_\s]+$/, '');
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const limpiarTodosFiltros = () => {
    setSearchTerm('');
    setSearchQuery('');
    setFilterStatus('all');
    setFilterCity('');
    setSortColumn(null);
    setSortDirection('asc');
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const eliminarFiltro = (tipo: 'busqueda' | 'estado' | 'ciudad' | 'orden') => {
    switch (tipo) {
      case 'busqueda':
        setSearchTerm('');
        setSearchQuery('');
        break;
      case 'estado':
        setFilterStatus('all');
        break;
      case 'ciudad':
        setFilterCity('');
        break;
      case 'orden':
        setSortColumn(null);
        setSortDirection('asc');
        break;
    }
  };

  const handleSort = (column: 'code' | 'title') => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredSupports = supports.filter(support => {
    const matchesSearch = !searchQuery.trim() || (() => {
      const q = normalizeText(searchQuery);
      return normalizeText(support.title || '').includes(q) ||
             normalizeText(support.city || '').includes(q) ||
             normalizeText(support.code || '').includes(q) ||
             normalizeText(support.type || '').includes(q);
    })();
    const matchesStatus = filterStatus === 'all' || support.status === filterStatus;
    const matchesCity = !filterCity.trim() || support.city === filterCity;
    return matchesSearch && matchesStatus && matchesCity;
  });

  const sortedFilteredSupports = [...filteredSupports].sort((a, b) => {
    if (!sortColumn) return 0;
    if (sortColumn === 'code') {
      const parseCode = (code: string) => {
        const parts = (code || '').split('-');
        const numberPart = parts[0] ? parseInt(parts[0], 10) : 0;
        const letterPart = parts[1] ? parts[1].toLowerCase() : '';
        return { number: isNaN(numberPart) ? 0 : numberPart, letters: letterPart };
      };
      const aP = parseCode(a.code || '');
      const bP = parseCode(b.code || '');
      if (aP.number !== bP.number) {
        return sortDirection === 'asc' ? aP.number - bP.number : bP.number - aP.number;
      }
      if (aP.letters < bP.letters) return sortDirection === 'asc' ? -1 : 1;
      if (aP.letters > bP.letters) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
    const aVal = (a.title || '').toLowerCase();
    const bVal = (b.title || '').toLowerCase();
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const ids = sortedFilteredSupports.map(s => s.id);
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

  const handleToggleDestacado = async (supportId: string, checked: boolean) => {
    try {
      const response = await fetch(`/api/soportes/${supportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: checked }),
      });
      if (response.ok) {
        setSupports(prev => prev.map(s => s.id === supportId ? { ...s, featured: checked } : s));
      }
    } catch (error) {
      console.error('Error toggling destacado:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'DISPONIBLE': { label: 'Disponible', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
      'RESERVADO': { label: 'Reservado', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
      'OCUPADO': { label: 'Ocupado', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
      'MANTENIMIENTO': { label: 'Mantenimiento', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
      'INACTIVO': { label: 'Inactivo', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
    return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${config.className}`}>{config.label}</span>;
  };

  const formatDimensions = (dimensions: string) => {
    if (!dimensions) return 'N/A';
    return dimensions.replace(/\s*m\s*/gi, ' ').trim() || dimensions;
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
      <div className="space-y-1.5 -mt-10">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gestión de Soportes</h1>
            <p className="mt-0.5 text-xs text-gray-600 leading-tight">
              Administra todos tus espacios publicitarios
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse p-2">
              <CardHeader className="px-2 py-1.5">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="px-2 py-2">
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 -mt-10">
      {/* Título */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Gestión de Soportes</h1>
        <p className="mt-0.5 text-xs text-gray-600 leading-tight">
          Administra todos tus espacios publicitarios
        </p>
      </div>

      {/* Fila única: filtros a la izquierda, Importar y Nuevo soporte a la derecha (misma altura) */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center min-w-0 flex-1">
          <div className="relative w-full sm:w-[280px] min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar código, título, ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSearchQuery(searchTerm); }}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 min-w-[10rem] w-auto [&_[data-slot=select-value]]:line-clamp-none">
              <SelectValue placeholder="Disponibilidad">
                {filterStatus === 'all' ? (
                  <span className="text-muted-foreground">Disponibilidad</span>
                ) : (
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(filterStatus)}`} />
                    {getStatusLabel(filterStatus)}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="text-muted-foreground">Disponibilidad</span>
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
          <Select value={filterCity || 'all'} onValueChange={(v) => setFilterCity(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-9 min-w-[7rem] w-auto [&_[data-slot=select-value]]:line-clamp-none">
              <SelectValue placeholder="Ciudad">
                {filterCity ? (
                  <span className="whitespace-nowrap">{filterCity}</span>
                ) : (
                  <span className="text-muted-foreground">Ciudad</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="text-muted-foreground">Ciudad</span>
              </SelectItem>
              {uniqueCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="flex items-center gap-2 h-9 px-3 relative">
            <div className="absolute -top-0.5 -left-0.5 z-10">
              <Crown className="h-3 w-3 text-purple-600 fill-purple-600" />
            </div>
            <FileSpreadsheet className="h-4 w-4" />
            Importar
          </Button>
          <Link href="/publicar-espacio">
            <Button size="sm" className="flex items-center gap-2 bg-[#e94446] hover:bg-[#d63a3a] h-9 px-3">
              <Plus className="h-4 w-4" />
              Nuevo Soporte
            </Button>
          </Link>
        </div>
      </div>

      {/* Chips de filtros activos */}
      {(searchQuery || filterStatus !== 'all' || filterCity || sortColumn) && (
        <div className="flex flex-wrap gap-2 items-center pb-3 border-b border-gray-200 dark:border-gray-800">
          {searchQuery && (
            <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 rounded-full px-3 py-1.5 text-sm">
              <span className="font-medium text-blue-800 dark:text-blue-200">Búsqueda:</span>
              <span className="text-gray-700 dark:text-gray-300">{searchQuery}</span>
              <button type="button" onClick={() => eliminarFiltro('busqueda')} className="ml-1 hover:text-red-500 transition-colors" aria-label="Quitar búsqueda">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filterStatus !== 'all' && (
            <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-900/60 rounded-full px-3 py-1.5 text-sm">
              <span className="font-medium text-green-800 dark:text-green-200">Estado:</span>
              <span className="text-gray-700 dark:text-gray-300">{getStatusLabel(filterStatus)}</span>
              <button type="button" onClick={() => eliminarFiltro('estado')} className="ml-1 hover:text-red-500 transition-colors" aria-label="Quitar estado">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filterCity && (
            <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/60 rounded-full px-3 py-1.5 text-sm">
              <span className="font-medium text-purple-800 dark:text-purple-200">Ciudad:</span>
              <span className="text-gray-700 dark:text-gray-300">{filterCity}</span>
              <button type="button" onClick={() => eliminarFiltro('ciudad')} className="ml-1 hover:text-red-500 transition-colors" aria-label="Quitar ciudad">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {sortColumn && (
            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded-full px-3 py-1.5 text-sm">
              <span className="font-medium text-amber-800 dark:text-amber-200">Orden:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {sortColumn === 'code' ? 'Código interno' : 'Título'} ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
              </span>
              <button type="button" onClick={() => eliminarFiltro('orden')} className="ml-1 hover:text-red-500 transition-colors" aria-label="Quitar orden">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button type="button" onClick={limpiarTodosFiltros} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Supports Table */}
      {sortedFilteredSupports.length === 0 ? (
        <Card className="p-4">
          <CardContent className="p-4 text-center">
            <Monitor className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No hay soportes</h3>
            <p className="text-xs text-gray-500 mb-2">
              {searchTerm || filterStatus !== 'all' || filterCity
                ? 'No se encontraron soportes con los filtros aplicados.'
                : 'Comienza creando tu primer soporte publicitario.'
              }
            </p>
            <Link href="/publicar-espacio">
              <Button size="sm" className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Crear Primer Soporte
              </Button>
            </Link>
        </CardContent>
      </Card>
      ) : (
      <Card className="p-4">
        <CardHeader className="px-0 pb-3">
            <CardTitle className="text-sm font-semibold">Lista de Soportes</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {/* Barra de acciones masivas */}
          <BulkActions
            selectedCount={Object.keys(selected).filter(id => selected[id]).length}
            onBulkDelete={bulkDelete}
            onBulkStatusChange={bulkStatusChange}
            onExportPDF={handleExportPDF}
          />
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="[&_tr]:border-b [&_tr]:border-gray-200 dark:[&_tr]:border-gray-800">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground w-10 [&:has([role=checkbox])]:pr-0">
                    <Checkbox
                      checked={allSelected ? true : (someSelected ? 'indeterminate' : false)}
                      onCheckedChange={(v) => toggleAll(Boolean(v))}
                      aria-label="Seleccionar todo"
                    />
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    <div className="flex justify-center items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSort('code')}
                        className="hover:opacity-80 transition-opacity"
                      >
                        Código
                        <ArrowUpDown className="h-3 w-3 opacity-60 inline-block ml-0.5 align-middle" />
                      </button>
                      {sortColumn === 'code' && (
                        <span className="text-xs font-normal text-muted-foreground">({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>
                      )}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    Destacado
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    <div className="flex justify-center items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSort('title')}
                        className="hover:opacity-80 transition-opacity"
                      >
                        Soporte
                        <ArrowUpDown className="h-3 w-3 opacity-60 inline-block ml-0.5 align-middle" />
                      </button>
                      {sortColumn === 'title' && (
                        <span className="text-xs font-normal text-muted-foreground">({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>
                      )}
                    </div>
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    Tipo
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    Ubicación
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    Dimensiones (m)
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    Precio/mes
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    Estado
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                  {sortedFilteredSupports.map((support) => (
                    <tr key={support.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 whitespace-nowrap w-10">
                      <Checkbox
                        checked={!!selected[support.id]}
                        onCheckedChange={(v) =>
                          setSelected(prev => ({ ...prev, [support.id]: Boolean(v) }))
                        }
                        aria-label={`Seleccionar ${support.code || support.id}`}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {support.code || 'N/A'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center">
                        <Switch
                          checked={!!support.featured}
                          onCheckedChange={(checked) => handleToggleDestacado(support.id, checked)}
                          className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-gray-300 hover:data-[state=checked]:bg-purple-600 data-[state=unchecked]:hover:bg-gray-400 transition-colors"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            {support.images && support.images.length > 0 && support.images[0] ? (
                              <div className="h-8 w-8 rounded overflow-hidden relative">
                                <Image
                                  src={support.images[0]}
                                  alt={support.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                                <Monitor className="h-4 w-4 text-red-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {support.title}
                            </div>
                          </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center rounded-md border-0 px-2 py-0.5 text-xs font-medium bg-[hsl(210,40%,96%)] text-[hsl(222,84%,5%)] dark:bg-[hsl(217,33%,18%)] dark:text-[hsl(210,40%,98%)]">
                          {support.type || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1" />
                          <div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">{support.city}</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{support.country}</div>
                          </div>
                        </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex justify-center text-sm text-gray-900 dark:text-gray-100">{formatDimensions(support.dimensions)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex justify-center text-sm font-medium text-green-600 dark:text-green-400">
                          {formatPrice(support.pricePerMonth || 0)}
                        </div>
                    </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex justify-center">{getStatusBadge(support.status)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex gap-1 justify-center">
                          {support.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/product/${support.slug && !support.slug.startsWith('support-') ? support.slug : support.id}`, '_blank')}
                              title="Ver"
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/panel/soportes/${support.id}/editar`}
                            title="Editar"
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, support })}
                            className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                            title="Eliminar"
                          >
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

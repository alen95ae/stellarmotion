'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, CheckCircle, XCircle, X } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, Delete02Icon } from '@hugeicons/core-free-icons';
import { SolicitudWithRelations } from '@/types/solicitudes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const estadoLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
};

const estadoClasses: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  aceptada: 'bg-green-100 text-green-800',
  rechazada: 'bg-red-100 text-red-800',
};

const formatPrecio = (n: number | null | undefined) => {
  if (n == null || isNaN(n)) return '-';
  return `$${Number(n).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const STORAGE_KEY = 'stellarmotion_owner_solicitudes_filtros';
const getEstadoLabel = (estado: string) => estadoLabels[estado] ?? estado;

export default function OwnerSolicitudesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; solicitud: SolicitudWithRelations | null }>({
    open: false,
    solicitud: null,
  });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const f = JSON.parse(saved);
        setSearchTerm(f.q ?? '');
        setSearchQuery(f.q ?? '');
        setFilterEstado(f.filterEstado ?? 'all');
      }
    } catch {
      // ignore
    }
    setFiltersLoaded(true);
  }, []);

  useEffect(() => {
    if (!filtersLoaded) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ q: searchQuery, filterEstado }));
  }, [searchQuery, filterEstado, filtersLoaded]);

  useEffect(() => {
    if (!filtersLoaded) return;
    const t = setTimeout(() => setSearchQuery(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm, filtersLoaded]);

  const eliminarFiltro = (tipo: 'busqueda' | 'estado') => {
    if (tipo === 'busqueda') {
      setSearchTerm('');
      setSearchQuery('');
    } else {
      setFilterEstado('all');
    }
  };

  const limpiarTodosFiltros = () => {
    setSearchTerm('');
    setSearchQuery('');
    setFilterEstado('all');
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/solicitudes', { credentials: 'include' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.details || 'Error al cargar solicitudes');
      }
      const data = await response.json();
      setSolicitudes(data.solicitudes ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleAceptarRechazar = async (solicitudId: string, accion: 'aceptar' | 'rechazar') => {
    setActingId(solicitudId);
    try {
      const res = await fetch(`/api/solicitudes/${solicitudId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al procesar');
      await fetchSolicitudes();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (solicitud: SolicitudWithRelations) => {
    try {
      const res = await fetch(`/api/solicitudes/${solicitud.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      await fetchSolicitudes();
      setDeleteDialog({ open: false, solicitud: null });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const filtered = solicitudes.filter((s) => {
    const matchSearch =
      !searchQuery ||
      (s.numero && s.numero.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.soporte?.titulo && s.soporte.titulo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.usuario?.nombre && s.usuario.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchEstado = filterEstado === 'all' || s.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="space-y-4 -mt-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Solicitudes</h1>
        <p className="mt-0.5 text-xs text-gray-600 leading-tight">
          Solicitudes de cotización sobre tus soportes. Acepta o rechaza para continuar el flujo.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center min-w-0 flex-1">
          <div className="relative w-full sm:w-[280px] min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar código, soporte, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSearchQuery(searchTerm); }}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="h-9 min-w-[10rem] w-auto [&_[data-slot=select-value]]:line-clamp-none">
              <SelectValue placeholder="Estado">
                {filterEstado === 'all' ? (
                  <span className="text-muted-foreground">Estado</span>
                ) : (
                  <span className="whitespace-nowrap">{getEstadoLabel(filterEstado)}</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="text-muted-foreground">Estado</span>
              </SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="aceptada">Aceptada</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(searchQuery || filterEstado !== 'all') && (
        <div className="flex flex-wrap gap-2 items-center pb-3 border-b border-gray-200 dark:border-gray-800">
          {searchQuery && (
            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full px-3 py-1.5 text-sm">
              <span className="font-medium text-red-800 dark:text-red-200">Búsqueda:</span>
              <span className="text-red-700 dark:text-red-300">{searchQuery}</span>
              <button type="button" onClick={() => eliminarFiltro('busqueda')} className="ml-1 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label="Quitar búsqueda">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filterEstado !== 'all' && (
            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full px-3 py-1.5 text-sm">
              <span className="font-medium text-red-800 dark:text-red-200">Estado:</span>
              <span className="text-red-700 dark:text-red-300">{getEstadoLabel(filterEstado)}</span>
              <button type="button" onClick={() => eliminarFiltro('estado')} className="ml-1 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label="Quitar estado">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button type="button" onClick={limpiarTodosFiltros} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
            Limpiar todo
          </button>
        </div>
      )}

      <Card className="p-4">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="text-sm font-semibold">Lista de Solicitudes</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No hay solicitudes con los filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="[&_tr]:border-b [&_tr]:border-gray-200 dark:[&_tr]:border-gray-800">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                      Código
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">
                      Soporte
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                      Fechas
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-medium whitespace-nowrap text-foreground">
                      Total est.
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
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {s.numero ?? s.id.slice(0, 8)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md border-0 px-2 py-0.5 text-xs font-medium bg-[hsl(210,40%,96%)] text-[hsl(222,84%,5%)] dark:bg-[hsl(217,33%,18%)] dark:text-[hsl(210,40%,98%)]">
                          {s.soporte?.codigo_cliente ?? s.soporte?.codigo_interno ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {s.fecha_inicio}
                        {s.fecha_fin ? ` → ${s.fecha_fin}` : s.meses ? ` (${s.meses} mes${s.meses !== 1 ? 'es' : ''})` : ''}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-green-600 dark:text-green-400">
                        {formatPrecio(s.total_estimado)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <Badge className={estadoClasses[s.estado] ?? 'bg-gray-100 text-gray-800'}>
                          {estadoLabels[s.estado] ?? s.estado}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/panel/owner/solicitudes/${s.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ver solicitud"
                              className="h-8 w-8 rounded-lg p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
                            >
                              <HugeiconsIcon icon={ViewIcon} size={18} />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, solicitud: s })}
                            title="Eliminar"
                            className="h-8 w-8 rounded-lg p-0 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={18} />
                          </Button>
                          {s.estado === 'pendiente' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 gap-1 h-7"
                                disabled={actingId === s.id}
                                onClick={() => handleAceptarRechazar(s.id, 'aceptar')}
                              >
                                {actingId === s.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                Aceptar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1 h-7"
                                disabled={actingId === s.id}
                                onClick={() => handleAceptarRechazar(s.id, 'rechazar')}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, solicitud: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar solicitud?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará la solicitud {deleteDialog.solicitud?.numero ?? deleteDialog.solicitud?.id?.slice(0, 8)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, solicitud: null })}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.solicitud && handleDelete(deleteDialog.solicitud)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

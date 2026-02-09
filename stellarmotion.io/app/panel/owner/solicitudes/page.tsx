'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { SolicitudWithRelations } from '@/types/solicitudes';

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

export default function OwnerSolicitudesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [solicitudes, setSolicitudes] = useState<SolicitudWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

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

  const filtered = solicitudes.filter((s) => {
    const matchSearch =
      !searchTerm ||
      (s.numero && s.numero.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.soporte?.titulo && s.soporte.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.usuario?.nombre && s.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchEstado = filterEstado === 'all' || s.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente').length;

  return (
    <div className="space-y-4 -mt-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Solicitudes</h1>
        <p className="mt-0.5 text-xs text-gray-600 leading-tight">
          Solicitudes de cotización sobre tus soportes. Acepta o rechaza para continuar el flujo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-2">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="text-xl font-bold">{solicitudes.length}</div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="text-xl font-bold">{pendientes}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-2">
        <div className="flex flex-wrap gap-3 items-center p-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por número, soporte o brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-1" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="aceptada">Aceptada</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-2">
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-sm font-semibold">Solicitudes entrantes</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
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
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Número</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Soporte</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Fechas</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Total est.</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Estado</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 font-mono text-xs">{s.numero ?? s.id.slice(0, 8)}</td>
                      <td className="px-3 py-2">
                        {s.soporte?.titulo ?? s.soporte?.codigo_interno ?? '-'}
                      </td>
                      <td className="px-3 py-2">
                        {s.fecha_inicio}
                        {s.fecha_fin ? ` → ${s.fecha_fin}` : s.meses ? ` (${s.meses} mes${s.meses !== 1 ? 'es' : ''})` : ''}
                      </td>
                      <td className="px-3 py-2">{formatPrecio(s.total_estimado)}</td>
                      <td className="px-3 py-2">
                        <Badge className={estadoClasses[s.estado] ?? 'bg-gray-100 text-gray-800'}>
                          {estadoLabels[s.estado] ?? s.estado}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/panel/owner/solicitudes/${s.id}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              Ver
                            </Button>
                          </Link>
                          {s.estado === 'pendiente' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 gap-1"
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
                                className="gap-1"
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
    </div>
  );
}

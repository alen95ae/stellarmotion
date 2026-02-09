'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
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

export default function OwnerSolicitudDetallePage() {
  const params = useParams();
  const id = params?.id as string;
  const [solicitud, setSolicitud] = useState<SolicitudWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const fetchOne = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/solicitudes/${id}`, { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al cargar la solicitud');
      }
      const data = await res.json();
      setSolicitud(data.solicitud ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
      setSolicitud(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
  }, [id]);

  const handleAceptarRechazar = async (accion: 'aceptar' | 'rechazar') => {
    setActing(true);
    try {
      const res = await fetch(`/api/solicitudes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al procesar');
      await fetchOne();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }
  if (error || !solicitud) {
    return (
      <div className="space-y-4">
        <Link href="/panel/owner/solicitudes">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Volver a Solicitudes
          </Button>
        </Link>
        <p className="text-red-600">{error ?? 'Solicitud no encontrada'}</p>
      </div>
    );
  }

  const s = solicitud;
  const servicios = s.servicios_adicionales && typeof s.servicios_adicionales === 'object' && !Array.isArray(s.servicios_adicionales)
    ? Object.keys(s.servicios_adicionales as Record<string, unknown>)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href="/panel/owner/solicitudes">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Volver a Solicitudes
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge className={estadoClasses[s.estado] ?? 'bg-gray-100 text-gray-800'}>
            {estadoLabels[s.estado] ?? s.estado}
          </Badge>
          {s.estado === 'pendiente' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 gap-1"
                disabled={acting}
                onClick={() => handleAceptarRechazar('aceptar')}
              >
                {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1"
                disabled={acting}
                onClick={() => handleAceptarRechazar('rechazar')}
              >
                <XCircle className="w-4 h-4" />
                Rechazar
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Solicitud {s.numero ?? s.id.slice(0, 8)}
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Soporte: {s.soporte?.titulo ?? s.soporte?.codigo_interno ?? '-'}
        </p>
        {s.usuario && (
          <p className="text-sm text-gray-600">
            Brand: {s.usuario.nombre || s.usuario.empresa || s.usuario.email}
          </p>
        )}
      </div>

      <Card className="p-4">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm font-semibold">Resumen</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-600">Fecha inicio</span>
            <span className="font-medium">{s.fecha_inicio}</span>
            {s.fecha_fin && (
              <>
                <span className="text-gray-600">Fecha fin</span>
                <span className="font-medium">{s.fecha_fin}</span>
              </>
            )}
            <span className="text-gray-600">Meses</span>
            <span className="font-medium">{s.meses}</span>
          </div>
          {servicios.length > 0 && (
            <div>
              <span className="text-gray-600 block mb-1">Servicios adicionales</span>
              <span className="font-medium">{servicios.join(', ')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm font-semibold">Desglose económico</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2 text-sm">
          {s.precio_mes_snapshot != null && (
            <div className="flex justify-between">
              <span className="text-gray-600">Precio/mes snapshot</span>
              <span>{formatPrecio(s.precio_mes_snapshot)}</span>
            </div>
          )}
          {s.subtotal != null && (
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrecio(s.subtotal)}</span>
            </div>
          )}
          {s.comision_plataforma != null && (
            <div className="flex justify-between">
              <span className="text-gray-600">Comisión plataforma</span>
              <span>{formatPrecio(s.comision_plataforma)}</span>
            </div>
          )}
          {s.total_estimado != null && (
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total estimado</span>
              <span>{formatPrecio(s.total_estimado)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {s.brand_message && (
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-semibold">Mensaje del brand</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.brand_message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

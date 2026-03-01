'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Search } from 'lucide-react';
import {
  BrandKpiCards,
  BrandSolicitudesTable,
  ActividadRecienteTimeline,
  type ActividadItem,
  type SolicitudRow,
} from '@/components/dashboard';

interface SolicitudApi {
  id: string;
  numero?: string | null;
  estado: string;
  fecha_inicio?: string;
  created_at?: string;
  soporte?: { titulo?: string | null; codigo_cliente?: string | null; codigo_interno?: string | null } | null;
}

interface DashboardData {
  solicitudes: SolicitudApi[];
  total: number;
  pendientes: number;
  aceptadas: number;
  rechazadas: number;
}

function useBrandDashboardData(userId: string | undefined) {
  const [data, setData] = useState<DashboardData>({
    solicitudes: [],
    total: 0,
    pendientes: 0,
    aceptadas: 0,
    rechazadas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/solicitudes', { credentials: 'include' });
        if (cancelled) return;

        const json = res.ok ? await res.json() : { solicitudes: [] };
        const solicitudes: SolicitudApi[] = json.solicitudes || [];

        const pendientes = solicitudes.filter((s) => (s.estado || '').toLowerCase() === 'pendiente').length;
        const aceptadas = solicitudes.filter((s) => (s.estado || '').toLowerCase() === 'aceptada').length;
        const rechazadas = solicitudes.filter((s) => (s.estado || '').toLowerCase() === 'rechazada').length;

        setData({
          solicitudes,
          total: solicitudes.length,
          pendientes,
          aceptadas,
          rechazadas,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [userId]);

  return { ...data, loading, error };
}

function toSolicitudRows(solicitudes: SolicitudApi[]): SolicitudRow[] {
  return solicitudes.map((s) => ({
    id: s.id,
    numero: s.numero,
    soporteNombre: s.soporte?.titulo ?? s.soporte?.codigo_cliente ?? s.soporte?.codigo_interno ?? null,
    estado: s.estado,
    fechaInicio: s.fecha_inicio ?? s.created_at ?? null,
  }));
}

function toActividadItems(solicitudes: SolicitudApi[]): ActividadItem[] {
  return solicitudes.slice(0, 10).map((s) => ({
    id: s.id,
    tipo: 'solicitud' as const,
    titulo: `Solicitud ${s.numero || s.id.slice(0, 8)}`,
    descripcion: s.soporte?.titulo ?? s.soporte?.codigo_cliente ?? undefined,
    fecha: s.fecha_inicio || s.created_at || new Date().toISOString(),
    href: `/panel/cliente/solicitudes/${s.id}`,
    destacado: (s.estado || '').toLowerCase() === 'pendiente',
  }));
}

export default function ClienteInicioPage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const { solicitudes, total, pendientes, aceptadas, rechazadas, loading: dataLoading, error } = useBrandDashboardData(userId);

  const loading = authLoading || dataLoading;
  const userName = user?.name || user?.email?.split('@')[0] || 'Brand';
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
    []
  );

  const tableRows = useMemo(() => toSolicitudRows(solicitudes), [solicitudes]);
  const actividadItems = useMemo(() => toActividadItems(solicitudes), [solicitudes]);

  return (
    <div className="space-y-6 -mt-2">
      {/* Header - mismo estilo que owner */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Hola, {userName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {todayLabel} · Resumen de tus solicitudes y anuncios
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {/* Sección KPI cards */}
      <section aria-labelledby="brand-kpi-heading">
        <h2 id="brand-kpi-heading" className="sr-only">
          Indicadores principales
        </h2>
        <BrandKpiCards
          solicitudesEnviadas={total}
          solicitudesPendientes={pendientes}
          solicitudesAceptadas={aceptadas}
          anunciosActivos={null}
          loading={loading}
        />
      </section>

      {/* CTA - mismo estilo que owner */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 rounded-lg bg-[#e94446] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#d63a3a] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 active:scale-[0.98]"
          aria-label="Buscar espacios publicitarios"
        >
          <Search className="w-[18px] h-[18px]" aria-hidden="true" />
          Buscar espacios
        </Link>
        {!loading && pendientes > 0 && (
          <Link
            href="/panel/cliente/solicitudes"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] focus-visible:ring-offset-2 rounded-lg"
            aria-label="Ver solicitudes en espera"
          >
            Ver {pendientes} en espera
          </Link>
        )}
      </div>

      {/* Sección inferior: 2 columnas - mismo layout que owner */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-labelledby="brand-bottom-heading">
        <h2 id="brand-bottom-heading" className="sr-only">
          Solicitudes y actividad
        </h2>
        <div className="min-w-0">
          <BrandSolicitudesTable solicitudes={tableRows} loading={loading} maxRows={8} />
        </div>
        <div className="min-w-0">
          <ActividadRecienteTimeline items={actividadItems} loading={loading} />
        </div>
      </section>
    </div>
  );
}

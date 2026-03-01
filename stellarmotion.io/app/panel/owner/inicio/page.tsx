'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';
import {
  OwnerDashboardMap,
  DashboardKpiCards,
  RendimientoPorSoporteTable,
  ActividadRecienteTimeline,
  type SoporteMapItem,
  type SoporteRendimiento,
  type ActividadItem,
} from '@/components/dashboard';

// --- Types (compatibles con API) ---
interface SoporteApi {
  id: string;
  title?: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  pricePerMonth?: number | null;
  [key: string]: unknown;
}

interface SolicitudApi {
  id: string;
  estado: string;
  fecha_inicio?: string;
  created_at?: string;
  soporte?: { codigo_cliente?: string | null; codigo_interno?: string | null } | null;
  numero?: string | null;
}

interface DashboardData {
  soportes: SoporteApi[];
  solicitudes: SolicitudApi[];
  totalSupports: number;
  availableSupports: number;
  occupiedSupports: number;
  pendingSolicitudes: number;
  monthlyRevenue: number;
}

// --- Data fetching ---
function useDashboardData(userId: string | undefined) {
  const [data, setData] = useState<DashboardData>({
    soportes: [],
    solicitudes: [],
    totalSupports: 0,
    availableSupports: 0,
    occupiedSupports: 0,
    pendingSolicitudes: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [soportesRes, solicitudesRes] = await Promise.all([
          fetch(`/api/soportes?usuarioId=${userId}`, { credentials: 'include' }),
          fetch('/api/solicitudes', { credentials: 'include' }),
        ]);

        if (cancelled) return;

        const soportesData = soportesRes.ok ? await soportesRes.json() : { soportes: [] };
        const solicitudesData = solicitudesRes.ok ? await solicitudesRes.json() : { solicitudes: [] };

        const soportes: SoporteApi[] = soportesData.soportes || [];
        const solicitudes: SolicitudApi[] = solicitudesData.solicitudes || [];

        const totalSupports = soportes.length;
        const availableSupports = soportes.filter((s) => (s.status || '').toUpperCase() === 'DISPONIBLE').length;
        const occupiedSupports = soportes.filter((s) => ['OCUPADO', 'RESERVADO'].includes((s.status || '').toUpperCase())).length;
        const pendingSolicitudes = solicitudes.filter((s) => (s.estado || '').toLowerCase() === 'pendiente').length;
        const monthlyRevenue = soportes.reduce((sum, s) => sum + (Number(s.pricePerMonth) || 0), 0);

        setData({
          soportes,
          solicitudes,
          totalSupports,
          availableSupports,
          occupiedSupports,
          pendingSolicitudes,
          monthlyRevenue,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [userId]);

  return { ...data, loading, error };
}

// --- Mapeo a componentes ---
function toMapItems(soportes: SoporteApi[]): SoporteMapItem[] {
  return soportes.map((s) => ({
    id: s.id,
    title: s.title,
    city: s.city,
    lat: s.lat ?? s.latitude ?? null,
    lng: s.lng ?? s.longitude ?? null,
    status: s.status,
    pricePerMonth: s.pricePerMonth != null ? Number(s.pricePerMonth) : null,
    nextAvailability: null,
  }));
}

function toRendimientoItems(soportes: SoporteApi[]): SoporteRendimiento[] {
  return soportes.map((s) => ({
    id: s.id,
    title: s.title,
    city: s.city,
    lat: s.lat ?? s.latitude ?? null,
    lng: s.lng ?? s.longitude ?? null,
    status: s.status,
    pricePerMonth: s.pricePerMonth != null ? Number(s.pricePerMonth) : null,
    nextAvailability: null,
    ocupacionAnualPercent: undefined,
  }));
}

function toActividadItems(solicitudes: SolicitudApi[]): ActividadItem[] {
  return solicitudes.slice(0, 10).map((s) => ({
    id: s.id,
    tipo: 'solicitud' as const,
    titulo: `Solicitud ${s.numero || s.id.slice(0, 8)}`,
    descripcion: s.soporte?.codigo_cliente || s.soporte?.codigo_interno || undefined,
    fecha: s.fecha_inicio || s.created_at || new Date().toISOString(),
    href: `/panel/owner/solicitudes/${s.id}`,
    destacado: (s.estado || '').toLowerCase() === 'pendiente',
  }));
}

// --- Mini tendencia ingresos (placeholder: últimos 7 valores simulados hasta tener API) ---
function useIngresosTrendData(monthlyRevenue: number, _soportesCount: number): number[] {
  return useMemo(() => {
    if (monthlyRevenue <= 0) return [];
    const base = monthlyRevenue / 7;
    return Array.from({ length: 7 }, (_, i) => Math.round(base * (0.7 + 0.3 * (i / 6)) + (Math.random() - 0.5) * base * 0.2));
  }, [monthlyRevenue]);
}

export default function OwnerInicioPage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const {
    soportes,
    solicitudes,
    totalSupports,
    occupiedSupports,
    pendingSolicitudes,
    monthlyRevenue,
    loading: dataLoading,
    error,
  } = useDashboardData(userId);

  const loading = authLoading || dataLoading;
  const userName = user?.name || user?.email?.split('@')[0] || 'Owner';
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
    []
  );

  const mapItems = useMemo(() => toMapItems(soportes), [soportes]);
  const rendimientoItems = useMemo(() => toRendimientoItems(soportes), [soportes]);
  const actividadItems = useMemo(() => toActividadItems(solicitudes), [solicitudes]);
  const ocupacionPercent = totalSupports > 0 ? Math.round((occupiedSupports / totalSupports) * 100) : 0;
  const ingresosTrendData = useIngresosTrendData(monthlyRevenue, totalSupports);

  return (
    <div className="space-y-6 -mt-2">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Hola, {userName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {todayLabel} · Resumen de tu red de soportes
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {/* Sección superior: Mapa (60% ancho visual = bloque destacado) */}
      <OwnerDashboardMap
        soportes={mapItems}
        activosCount={occupiedSupports}
        ocupacionPercent={ocupacionPercent}
        ingresosMes={monthlyRevenue}
        solicitudesNuevas={pendingSolicitudes}
        className="w-full"
      />

      {/* Sección media: 3 tarjetas KPI */}
      <section aria-labelledby="kpi-section-heading">
        <h2 id="kpi-section-heading" className="sr-only">
          Indicadores principales
        </h2>
        <DashboardKpiCards
          ingresosMes={monthlyRevenue}
          ingresosVariacion={undefined}
          ingresosTrendData={ingresosTrendData}
          ocupados={occupiedSupports}
          totalSoportes={totalSupports}
          solicitudesPendientes={pendingSolicitudes}
          loading={loading}
        />
      </section>

      {/* CTA rápido */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/publicar-espacio"
          className="inline-flex items-center gap-2 rounded-lg bg-[#e94446] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#d63a3a] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 active:scale-[0.98]"
          aria-label="Publicar un nuevo soporte"
        >
          <Plus className="w-[18px] h-[18px]" aria-hidden="true" />
          Nuevo soporte
        </Link>
        {!loading && pendingSolicitudes > 0 && (
          <Link
            href="/panel/owner/solicitudes"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] focus-visible:ring-offset-2 rounded-lg"
            aria-label="Ver solicitudes pendientes"
          >
            Revisar {pendingSolicitudes} solicitud{pendingSolicitudes !== 1 ? 'es' : ''}
          </Link>
        )}
      </div>

      {/* Sección inferior: 2 columnas */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-labelledby="bottom-section-heading">
        <h2 id="bottom-section-heading" className="sr-only">
          Rendimiento y actividad
        </h2>
        <div className="min-w-0">
          <RendimientoPorSoporteTable soportes={rendimientoItems} loading={loading} maxRows={8} />
        </div>
        <div className="min-w-0">
          <ActividadRecienteTimeline items={actividadItems} loading={loading} />
        </div>
      </section>
    </div>
  );
}

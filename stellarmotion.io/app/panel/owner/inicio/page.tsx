'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  MapPin,
  ChevronRight,
  Crown,
  Monitor,
  FileText,
  CalendarDays,
  CalendarRange,
  Wrench,
  User,
  MessageCircle,
  Megaphone,
  Banknote,
  Printer,
  ChartArea,
  Settings,
  Plus,
} from 'lucide-react';

// --- Types ---
interface DashboardStats {
  totalSupports: number;
  availableSupports: number;
  occupiedSupports: number;
  pendingSolicitudes: number;
  monthlyRevenue: number;
  // Placeholder para variación cuando exista API de histórico
  revenueTrend?: number;
}

interface SolicitudItem {
  id: string;
  numero?: string | null;
  estado: string;
  soporte?: { codigo_cliente?: string | null; codigo_interno?: string | null } | null;
  fecha_inicio?: string;
}

// --- Data fetching ---
function useDashboardStats(userId: string | undefined) {
  const [stats, setStats] = useState<DashboardStats>({
    totalSupports: 0,
    availableSupports: 0,
    occupiedSupports: 0,
    pendingSolicitudes: 0,
    monthlyRevenue: 0,
  });
  const [recentSolicitudes, setRecentSolicitudes] = useState<SolicitudItem[]>([]);
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

        const soportes = soportesData.soportes || [];
        const solicitudes: SolicitudItem[] = solicitudesData.solicitudes || [];

        const totalSupports = soportes.length;
        const availableSupports = soportes.filter((s: { status?: string }) => s.status === 'DISPONIBLE').length;
        const occupiedSupports = soportes.filter((s: { status?: string }) => s.status === 'OCUPADO' || s.status === 'RESERVADO').length;
        const pendingSolicitudes = solicitudes.filter((s: { estado: string }) => s.estado === 'pendiente').length;
        const monthlyRevenue = soportes.reduce((sum: number, s: { pricePerMonth?: number }) => sum + (s.pricePerMonth || 0), 0);

        setStats({
          totalSupports,
          availableSupports,
          occupiedSupports,
          pendingSolicitudes,
          monthlyRevenue,
        });

        setRecentSolicitudes(solicitudes.slice(0, 5));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [userId]);

  return { stats, recentSolicitudes, loading, error };
}

// --- Format helpers ---
function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(str: string | undefined) {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return str;
  }
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  vista: 'Vista',
};

// --- Module grid config (same icons as sidebar, routes /panel/owner/*) ---
const MODULES_OPERATIVO = [
  { name: 'Soportes', href: '/panel/owner/soportes', description: 'Gestiona tu inventario de soportes', icon: Monitor },
  { name: 'Solicitudes', href: '/panel/owner/solicitudes', description: 'Cotizaciones y solicitudes entrantes', icon: FileText },
  { name: 'Alquileres', href: '/panel/owner/alquileres', description: 'Contratos y alquileres activos', icon: CalendarDays },
  { name: 'Planificación', href: '/panel/owner/planificacion', description: 'Calendario y ocupación', icon: CalendarRange, crown: true },
  { name: 'Mantenimiento', href: '/panel/owner/mantenimiento', description: 'Estado y mantenimiento', icon: Wrench, crown: true },
  { name: 'Mapa', href: '/panel/owner/mapa', description: 'Ubicación de tus soportes', icon: MapPin, iconSize: 22 },
];

const MODULES_COMERCIAL = [
  { name: 'Clientes', href: '/panel/owner/clientes', description: 'Brands y contactos', icon: User, crown: true },
  { name: 'Mensajería', href: '/panel/owner/mensajeria', description: 'Conversaciones con brands', icon: MessageCircle },
  { name: 'Marketing', href: '/panel/owner/marketing', description: 'Campañas y promoción', icon: Megaphone },
];

const MODULES_FINANZAS = [
  { name: 'Facturación', href: '/panel/owner/pagos', description: 'Ingresos y cobros', icon: CircleDollarSign },
  { name: 'Impresiones', href: '/panel/owner/impresiones', description: 'Producción e impresión', icon: Printer, crown: true },
  { name: 'Métricas', href: '/panel/owner/metricas', description: 'Rendimiento y análisis', icon: BarChart2, crown: true },
];

const MODULES_CUENTA = [
  { name: 'Ajustes', href: '/panel/owner/ajustes', description: 'Perfil y configuración', icon: Settings },
];

// --- KPI Skeleton ---
function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
      </div>
    </div>
  );
}

// --- KPI Card ---
function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  accent = 'red',
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
  accent?: 'red' | 'green' | 'amber';
}) {
  const accentClasses = {
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50',
    green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
  };
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm hover:shadow transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums truncate">{value}</p>
          {sub != null && sub !== '' && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400" aria-hidden="true">{sub}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${accentClasses[accent]}`} aria-hidden="true">
          <Icon className="h-[22px] w-[22px] shrink-0" />
        </div>
      </div>
    </div>
  );
}

// --- Module link card ---
function ModuleCard({
  name,
  href,
  description,
  icon: Icon,
  iconSize = 24,
  badge,
  crown = false,
}: {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSize?: number;
  badge?: string | number;
  crown?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group flex items-start gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-red-200 dark:hover:border-red-900/50 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
      aria-label={`Ir a ${name}: ${description}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50">
        <Icon className="shrink-0" style={{ width: iconSize, height: iconSize }} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {name}
          </h3>
          {crown && (
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 text-purple-700 dark:text-purple-300" title="Pro">
              <Crown className="h-3 w-3 fill-current" aria-hidden="true" />
            </span>
          )}
          {badge != null && (
            <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" aria-hidden="true" />
    </Link>
  );
}

export default function OwnerInicioPage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const { stats, recentSolicitudes, loading: dataLoading, error } = useDashboardStats(userId);

  const loading = authLoading || dataLoading;
  const userName = user?.name || user?.email?.split('@')[0] || 'Owner';
  const todayLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  }, []);

  return (
    <div className="space-y-8 -mt-6">
      {/* Hero */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Hola, {userName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {todayLabel} · Resumen de tu red de soportes
        </p>
      </header>

      {/* KPIs */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Indicadores principales
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => <KpiSkeleton key={i} />)}
            </>
          ) : (
            <>
              <KpiCard
                label="Soportes totales"
                value={stats.totalSupports}
                icon={Monitor}
                sub={stats.availableSupports !== stats.totalSupports ? `${stats.availableSupports} disponibles` : undefined}
              />
              <KpiCard
                label="Disponibles / Ocupados"
                value={`${stats.availableSupports} / ${stats.occupiedSupports}`}
                icon={CalendarDays}
                accent="green"
              />
              <KpiCard
                label="Solicitudes pendientes"
                value={stats.pendingSolicitudes}
                icon={FileText}
                accent="amber"
              />
              <KpiCard
                label="Ingresos potenciales (mes)"
                value={formatCurrency(stats.monthlyRevenue)}
                icon={Banknote}
                sub={stats.revenueTrend != null ? `${stats.revenueTrend > 0 ? '+' : ''}${stats.revenueTrend}% vs anterior` : undefined}
              />
            </>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap items-center gap-3">
        <Link
          href="/publicar-espacio"
          className="inline-flex items-center gap-2 rounded-lg bg-[#e94446] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#d63a3a] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 active:scale-[0.98]"
          aria-label="Publicar un nuevo soporte"
        >
          <Plus className="w-[18px] h-[18px]" aria-hidden="true" />
          Nuevo soporte
        </Link>
        <Link
          href="/panel/owner/solicitudes"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#e94446]/40 dark:hover:border-[#e94446]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 active:scale-[0.98]"
          aria-label="Ver solicitudes pendientes"
        >
          <FileText className="w-[18px] h-[18px]" aria-hidden="true" />
          Ver solicitudes pendientes
          {!loading && stats.pendingSolicitudes > 0 && (
            <span className="inline-flex items-center rounded-full bg-[#e94446] px-2 py-0.5 text-xs font-medium text-white">
              {stats.pendingSolicitudes}
            </span>
          )}
        </Link>
      </section>

      {/* Grid: Accesos rápidos */}
      <section className="space-y-6" aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
          Accesos rápidos
        </h2>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Operativo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES_OPERATIVO.map((m) => (
              <ModuleCard
                key={m.name}
                name={m.name}
                href={m.href}
                description={m.description}
                icon={m.icon}
                iconSize={'iconSize' in m ? m.iconSize : 24}
                badge={m.name === 'Solicitudes' && !loading && stats.pendingSolicitudes > 0 ? stats.pendingSolicitudes : undefined}
                crown={'crown' in m ? m.crown : false}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Comercial</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES_COMERCIAL.map((m) => (
              <ModuleCard key={m.name} name={m.name} href={m.href} description={m.description} icon={m.icon} iconSize={'iconSize' in m ? m.iconSize : 24} crown={'crown' in m ? m.crown : false} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Finanzas y análisis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES_FINANZAS.map((m) => (
              <ModuleCard key={m.name} name={m.name} href={m.href} description={m.description} icon={m.icon} iconSize={'iconSize' in m ? m.iconSize : 24} crown={'crown' in m ? m.crown : false} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Cuenta</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES_CUENTA.map((m) => (
              <ModuleCard key={m.name} name={m.name} href={m.href} description={m.description} icon={m.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* Actividad reciente */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm overflow-hidden" aria-labelledby="activity-heading">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 id="activity-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad reciente
          </h2>
          <Link
            href="/panel/owner/solicitudes"
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded"
          >
            Ver todo
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {loading ? (
            <div className="px-5 py-8 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" aria-hidden="true" />
            </div>
          ) : recentSolicitudes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay solicitudes recientes</p>
              <Link
                href="/panel/owner/solicitudes"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
              >
                Ir a Solicitudes
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            recentSolicitudes.map((s) => (
              <Link
                key={s.id}
                href={`/panel/owner/solicitudes/${s.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {s.numero || s.id.slice(0, 8)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 mx-2">·</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {s.soporte?.codigo_cliente || s.soporte?.codigo_interno || 'Soporte'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(s.fecha_inicio)}</span>
                  <span className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {ESTADO_LABELS[s.estado] ?? s.estado}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

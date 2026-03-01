'use client';

import Link from 'next/link';
import { Euro, Percent, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DashboardKpiCardsProps {
  /** Total ingresos del mes (€) */
  ingresosMes: number;
  /** Variación % vs mes anterior (ej: 12.5 o -3.2) */
  ingresosVariacion?: number | null;
  /** Datos para mini gráfico de tendencia (ej: últimos 7 días) */
  ingresosTrendData?: number[];
  /** Ocupados (activos) */
  ocupados: number;
  /** Total soportes */
  totalSoportes: number;
  /** Solicitudes pendientes */
  solicitudesPendientes: number;
  /** Ocupación en el último mes (0-100). Si no se pasa, se usan datos inventados. */
  ocupacionUltimoMes?: number | null;
  /** Tendencia para la tarjeta "Ocupación último mes" (ej. últimos 7 días). Opcional. */
  ocupacionUltimoMesTrend?: number[];
  loading?: boolean;
}

function formatEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function MiniTrendChart({ data }: { data: number[] }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8 mt-2" aria-hidden="true">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 min-w-[4px] rounded-t bg-[#e94446]/30 dark:bg-[#e94446]/40 transition-all duration-300 hover:bg-[#e94446]/50"
          style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
          title={formatEur(v)}
        />
      ))}
    </div>
  );
}

/** Mini gráfico de línea (valores 0-100) para tarjeta roja */
function MiniLineChartWhite({ data }: { data: number[] }) {
  if (!data?.length) return null;
  const w = 80;
  const h = 32;
  const pad = 4;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden="true">
      <polyline
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-full max-w-[120px] bg-gray-200 dark:bg-gray-700 rounded mt-3" />
        </div>
        <div className="h-11 w-11 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
      </div>
    </div>
  );
}

const ICON_BOX_RED = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e94446]/10 dark:bg-[#e94446]/20 text-[#e94446] border border-[#e94446]/20 dark:border-[#e94446]/30';

export default function DashboardKpiCards({
  ingresosMes,
  ingresosVariacion,
  ingresosTrendData,
  ocupados,
  totalSoportes,
  solicitudesPendientes,
  ocupacionUltimoMes = null,
  ocupacionUltimoMesTrend,
  loading = false,
}: DashboardKpiCardsProps) {
  const ocupacionPercent = totalSoportes > 0 ? Math.round((ocupados / totalSoportes) * 100) : 0;
  /** Ocupación último mes: dato real o inventado para la tarjeta roja */
  const ocupacionUltimoMesValue = ocupacionUltimoMes ?? 78;
  const ocupacionUltimoMesTrendData = ocupacionUltimoMesTrend ?? [62, 65, 70, 68, 72, 75, 78];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Ingresos del mes */}
      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
        role="article"
        aria-label="Ingresos del mes"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos del mes</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{formatEur(ingresosMes)}</p>
            {ingresosVariacion != null && (
              <p
                className={`mt-0.5 text-xs font-medium ${ingresosVariacion >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {ingresosVariacion >= 0 ? '+' : ''}{ingresosVariacion}% vs mes anterior
              </p>
            )}
            <MiniTrendChart data={ingresosTrendData ?? []} />
          </div>
          <div className={ICON_BOX_RED}>
            <Euro className="h-[22px] w-[22px]" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 2. Solicitudes pendientes (icono mismo estilo que ingresos) */}
      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 flex flex-col"
        role="article"
        aria-label="Solicitudes pendientes"
      >
        <div className="flex items-start justify-between gap-3 flex-1">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Solicitudes pendientes</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{solicitudesPendientes}</p>
          </div>
          <div className={ICON_BOX_RED}>
            <FileText className="h-[22px] w-[22px]" aria-hidden="true" />
          </div>
        </div>
        <Link href="/panel/owner/solicitudes" className="mt-4 block">
          <Button variant="brand" size="sm" className="w-full rounded-lg">
            Revisar solicitudes
          </Button>
        </Link>
      </div>

      {/* 3. Ocupación global (icono % mismo estilo que Euro) */}
      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
        role="article"
        aria-label="Ocupación global"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ocupación global</p>
            <p className="mt-1 text-2xl font-bold text-[#e94446] tabular-nums">{ocupacionPercent}%</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {ocupados} ocupados / {totalSoportes} total
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[#e94446] transition-all duration-500 ease-out"
                style={{ width: `${ocupacionPercent}%` }}
              />
            </div>
          </div>
          <div className={ICON_BOX_RED}>
            <Percent className="h-[22px] w-[22px]" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 4. Ocupación en el último mes (tarjeta roja, datos inventados por defecto) */}
      <div
        className="rounded-xl bg-[#e94446] p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col text-white"
        role="article"
        aria-label="Ocupación en el último mes"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-white/90">Ocupación en el último mes</p>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
            <Percent className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-bold tabular-nums">{ocupacionUltimoMesValue}</span>
            <span className="text-lg font-semibold text-white/90">%</span>
          </div>
          <MiniLineChartWhite data={ocupacionUltimoMesTrendData} />
        </div>
        <p className="mt-3 text-xs text-white/80">Tendencia semanal de ocupación</p>
      </div>
    </div>
  );
}

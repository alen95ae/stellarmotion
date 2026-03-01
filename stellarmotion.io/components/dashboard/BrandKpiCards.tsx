'use client';

import Link from 'next/link';
import { FileText, Clock, CheckCircle, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BrandKpiCardsProps {
  solicitudesEnviadas: number;
  solicitudesPendientes: number;
  solicitudesAceptadas: number;
  /** Anuncios o contratos activos (opcional, mostrar — si no hay dato) */
  anunciosActivos?: number | null;
  loading?: boolean;
}

const ICON_BOX = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e94446]/10 dark:bg-[#e94446]/20 text-[#e94446] border border-[#e94446]/20 dark:border-[#e94446]/30';

function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-11 w-11 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
      </div>
    </div>
  );
}

export default function BrandKpiCards({
  solicitudesEnviadas,
  solicitudesPendientes,
  solicitudesAceptadas,
  anunciosActivos = null,
  loading = false,
}: BrandKpiCardsProps) {
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
      {/* 1. Solicitudes enviadas */}
      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
        role="article"
        aria-label="Solicitudes enviadas"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Solicitudes enviadas</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{solicitudesEnviadas}</p>
          </div>
          <div className={ICON_BOX}>
            <FileText className="h-[22px] w-[22px]" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 2. En espera */}
      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 flex flex-col"
        role="article"
        aria-label="Solicitudes en espera"
      >
        <div className="flex items-start justify-between gap-3 flex-1">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En espera</p>
            <p className="mt-1 text-2xl font-bold text-[#e94446] tabular-nums">{solicitudesPendientes}</p>
          </div>
          <div className={ICON_BOX}>
            <Clock className="h-[22px] w-[22px]" aria-hidden="true" />
          </div>
        </div>
        <Link href="/panel/cliente/solicitudes" className="mt-4 block">
          <Button variant="brand" size="sm" className="w-full rounded-lg">
            Ver solicitudes
          </Button>
        </Link>
      </div>

      {/* 3. Aceptadas */}
      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
        role="article"
        aria-label="Solicitudes aceptadas"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aceptadas</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{solicitudesAceptadas}</p>
          </div>
          <div className={ICON_BOX}>
            <CheckCircle className="h-[22px] w-[22px]" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* 4. Anuncios activos */}
      <div
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
        role="article"
        aria-label="Anuncios activos"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Anuncios activos</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {anunciosActivos != null ? anunciosActivos : '—'}
            </p>
          </div>
          <div className={ICON_BOX}>
            <Megaphone className="h-[22px] w-[22px]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

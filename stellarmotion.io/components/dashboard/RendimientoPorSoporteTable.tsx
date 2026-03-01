'use client';

import Link from 'next/link';
import type { SoporteMapItem } from './OwnerDashboardMap';

export interface SoporteRendimiento extends SoporteMapItem {
  /** % ocupación anual (0-100), opcional */
  ocupacionAnualPercent?: number | null;
}

interface RendimientoPorSoporteTableProps {
  soportes: SoporteRendimiento[];
  loading?: boolean;
  /** Máximo filas visibles antes de scroll (ej: 5) */
  maxRows?: number;
}

const STATUS_LABEL: Record<string, string> = {
  OCUPADO: 'Ocupado',
  RESERVADO: 'Reservado',
  DISPONIBLE: 'Disponible',
  MANTENIMIENTO: 'Mantenimiento',
};

function formatEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function RendimientoPorSoporteTable({
  soportes,
  loading = false,
  maxRows = 8,
}: RendimientoPorSoporteTableProps) {
  const displayList = soportes.slice(0, maxRows);
  const hasMore = soportes.length > maxRows;

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Rendimiento por soporte</h3>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (soportes.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Rendimiento por soporte</h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Aún no tienes soportes publicados</p>
          <Link
            href="/publicar-espacio"
            className="mt-2 inline-flex text-sm font-medium text-[#e94446] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] focus-visible:ring-offset-2 rounded"
          >
            Publicar primer soporte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Rendimiento por soporte</h3>
        {hasMore && (
          <Link
            href="/panel/owner/soportes"
            className="text-sm font-medium text-[#e94446] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] rounded"
          >
            Ver todos
          </Link>
        )}
      </div>
      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="w-full text-sm" role="table" aria-label="Rendimiento por soporte">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Soporte</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Ciudad</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Precio</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Estado</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Ocupación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayList.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <td className="py-2.5 px-4">
                  <Link
                    href={`/panel/owner/soportes/${s.id}/editar`}
                    className="font-medium text-gray-900 dark:text-white hover:text-[#e94446] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] rounded"
                  >
                    {s.title || s.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300">{s.city || '—'}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-gray-900 dark:text-white">
                  {s.pricePerMonth != null ? formatEur(s.pricePerMonth) : '—'}
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={`
                      inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium
                      ${s.status === 'OCUPADO' || s.status === 'RESERVADO' ? 'bg-[#e94446]/10 dark:bg-[#e94446]/20 text-[#e94446]' : ''}
                      ${s.status === 'DISPONIBLE' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : ''}
                      ${s.status === 'MANTENIMIENTO' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    {STATUS_LABEL[s.status ?? ''] ?? s.status ?? '—'}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-gray-600 dark:text-gray-400">
                  {s.ocupacionAnualPercent != null ? `${s.ocupacionAnualPercent}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

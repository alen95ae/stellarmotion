'use client';

import { Euro, Eye, Monitor, TrendingUp } from 'lucide-react';
import type { CampaignsSummary } from '@/types/campaigns';

const ICON_BOX =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e94446]/10 dark:bg-[#e94446]/20 text-[#e94446] border border-[#e94446]/20 dark:border-[#e94446]/30';

function formatEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function formatNumber(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toLocaleString('es-ES');
}

interface CampaignKPIsProps {
  summary: CampaignsSummary | null;
  loading?: boolean;
}

export default function CampaignKPIs({ summary, loading }: CampaignKPIsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 animate-pulse"
          >
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const items = [
    {
      label: 'Gasto activo',
      value: formatEur(summary.activeSpend),
      sub: `de ${formatEur(summary.totalBudget)} presupuesto`,
      icon: Euro,
    },
    {
      label: 'Impresiones generadas',
      value: formatNumber(summary.impressions),
      sub: 'estimadas',
      icon: Eye,
    },
    {
      label: 'Soportes activos',
      value: summary.activeSoportes,
      sub: 'pantallas/vallas en uso',
      icon: Monitor,
    },
    {
      label: 'CPM promedio',
      value: formatEur(summary.averageCpm),
      sub: 'coste por mil',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, sub, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
          role="article"
          aria-label={label}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
              {sub && (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
              )}
            </div>
            <div className={ICON_BOX}>
              <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

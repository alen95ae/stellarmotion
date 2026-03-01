'use client';

import { Activity } from 'lucide-react';

interface BrandLiveStatusCardProps {
  solicitudesEnviadas: number;
  pendientes: number;
  aceptadas: number;
  rechazadas: number;
  className?: string;
}

export default function BrandLiveStatusCard({
  solicitudesEnviadas,
  pendientes,
  aceptadas,
  rechazadas,
  className = '',
}: BrandLiveStatusCardProps) {
  return (
    <section className={className} aria-labelledby="brand-status-heading">
      <h2 id="brand-status-heading" className="sr-only">
        Resumen de solicitudes
      </h2>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
            <Activity className="h-4 w-4 text-[#e94446]" aria-hidden="true" />
            Resumen
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enviadas</dt>
              <dd className="mt-1 text-xl font-bold tabular-nums text-gray-900 dark:text-white">{solicitudesEnviadas}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">En espera</dt>
              <dd className="mt-1 text-xl font-bold tabular-nums text-[#e94446]">{pendientes}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aceptadas</dt>
              <dd className="mt-1 text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{aceptadas}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rechazadas</dt>
              <dd className="mt-1 text-xl font-bold tabular-nums text-gray-600 dark:text-gray-400">{rechazadas}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

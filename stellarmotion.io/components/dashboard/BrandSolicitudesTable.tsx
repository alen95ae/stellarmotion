'use client';

import Link from 'next/link';

export interface SolicitudRow {
  id: string;
  numero?: string | null;
  soporteNombre?: string | null;
  estado: string;
  fechaInicio?: string | null;
}

interface BrandSolicitudesTableProps {
  solicitudes: SolicitudRow[];
  loading?: boolean;
  maxRows?: number;
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  vista: 'Vista',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
};

const ESTADO_CLASS: Record<string, string> = {
  pendiente: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  vista: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  aceptada: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  rechazada: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

function formatFecha(str: string | undefined | null) {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return str;
  }
}

export default function BrandSolicitudesTable({
  solicitudes,
  loading = false,
  maxRows = 8,
}: BrandSolicitudesTableProps) {
  const displayList = solicitudes.slice(0, maxRows);
  const hasMore = solicitudes.length > maxRows;

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Mis solicitudes</h3>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (solicitudes.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Mis solicitudes</h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Aún no has enviado solicitudes</p>
          <Link
            href="/marketplace"
            className="mt-2 inline-flex text-sm font-medium text-[#e94446] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] focus-visible:ring-offset-2 rounded"
          >
            Explorar espacios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Mis solicitudes</h3>
        {hasMore && (
          <Link
            href="/panel/cliente/solicitudes"
            className="text-sm font-medium text-[#e94446] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] rounded"
          >
            Ver todas
          </Link>
        )}
      </div>
      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="w-full text-sm" role="table" aria-label="Mis solicitudes">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Solicitud</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Soporte</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayList.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <td className="py-2.5 px-4">
                  <Link
                    href={`/panel/cliente/solicitudes/${s.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-[#e94446] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] rounded"
                  >
                    {s.numero || s.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300">{s.soporteNombre || '—'}</td>
                <td className="py-2.5 px-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${ESTADO_CLASS[s.estado?.toLowerCase()] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  >
                    {ESTADO_LABEL[s.estado?.toLowerCase()] ?? s.estado ?? '—'}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-gray-600 dark:text-gray-400">{formatFecha(s.fechaInicio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

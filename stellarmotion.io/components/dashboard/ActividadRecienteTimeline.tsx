'use client';

import Link from 'next/link';
import { FileText, CalendarCheck, Banknote, MessageCircle, ChevronRight } from 'lucide-react';

export type ActividadTipo = 'solicitud' | 'alquiler_confirmado' | 'pago_recibido' | 'mensaje';

export interface ActividadItem {
  id: string;
  tipo: ActividadTipo;
  titulo: string;
  descripcion?: string;
  fecha: string;
  href?: string;
  /** Para destacar (ej: sin leer) */
  destacado?: boolean;
}

interface ActividadRecienteTimelineProps {
  items: ActividadItem[];
  loading?: boolean;
}

const ICONS: Record<ActividadTipo, React.ComponentType<{ className?: string }>> = {
  solicitud: FileText,
  alquiler_confirmado: CalendarCheck,
  pago_recibido: Banknote,
  mensaje: MessageCircle,
};

const TIPO_LABEL: Record<ActividadTipo, string> = {
  solicitud: 'Nueva solicitud',
  alquiler_confirmado: 'Alquiler confirmado',
  pago_recibido: 'Pago recibido',
  mensaje: 'Mensaje nuevo',
};

function formatFecha(str: string) {
  try {
    const d = new Date(str);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  } catch {
    return str;
  }
}

export default function ActividadRecienteTimeline({ items, loading = false }: ActividadRecienteTimelineProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Actividad reciente</h3>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Actividad reciente</h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay actividad reciente</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Solicitudes, alquileres y mensajes aparecerán aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Actividad reciente</h3>
        <Link
          href="/panel/owner/solicitudes"
          className="text-sm font-medium text-[#e94446] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94446] rounded"
        >
          Ver todo
        </Link>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[320px] overflow-y-auto" role="list">
        {items.map((item, index) => {
          const Icon = ICONS[item.tipo];
          const content = (
            <>
              <div
                className={`
                  flex h-9 w-9 shrink-0 items-center justify-center rounded-full border
                  ${item.tipo === 'solicitud' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' : ''}
                  ${item.tipo === 'alquiler_confirmado' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' : ''}
                  ${item.tipo === 'pago_recibido' ? 'bg-[#e94446]/10 dark:bg-[#e94446]/20 text-[#e94446] border-[#e94446]/20 dark:border-[#e94446]/30' : ''}
                  ${item.tipo === 'mensaje' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50' : ''}
                `}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${item.destacado ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {item.titulo}
                </p>
                {item.descripcion && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.descripcion}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatFecha(item.fecha)}</p>
              </div>
              {item.href && (
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              )}
            </>
          );
          return (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e94446]"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

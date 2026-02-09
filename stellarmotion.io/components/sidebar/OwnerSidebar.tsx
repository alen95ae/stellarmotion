'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home02Icon,
  FileAudioIcon,
  Calendar03Icon,
  Calendar02Icon,
  UserIcon,
  Money01Icon,
  MarketingIcon,
  PrinterIcon,
  WaterfallDown01Icon,
  Message01Icon,
  Settings02Icon,
  ToolsIcon,
  ComputerIcon,
} from '@hugeicons/core-free-icons';
import { ChevronLeft, ChevronRight, Crown } from 'lucide-react';

const ICON_SIZE = 24;

function InicioIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Home02Icon} size={ICON_SIZE} className={className} />;
}
function SoportesIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={ComputerIcon} size={ICON_SIZE} className={className} />;
}
function SolicitudesMenuIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={FileAudioIcon} size={ICON_SIZE} className={className} />;
}
function AlquileresIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Calendar03Icon} size={ICON_SIZE} className={className} />;
}
function PlanificacionIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Calendar02Icon} size={ICON_SIZE} className={className} />;
}
function ClientesIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={UserIcon} size={ICON_SIZE} className={className} />;
}
function FacturacionIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Money01Icon} size={ICON_SIZE} className={className} />;
}
function MarketingNavIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={MarketingIcon} size={ICON_SIZE} className={className} />;
}
function ImpresionesIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={PrinterIcon} size={ICON_SIZE} className={className} />;
}
function MetricasIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={WaterfallDown01Icon} size={ICON_SIZE} className={className} />;
}
function MantenimientoIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={ToolsIcon} size={ICON_SIZE} className={className} />;
}
function MensajeriaIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Message01Icon} size={ICON_SIZE} className={className} />;
}
function AjustesIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Settings02Icon} size={ICON_SIZE} className={className} />;
}

const navigation = [
  { name: 'Inicio', href: '/panel/owner/inicio', icon: InicioIcon },
  { name: 'Soportes', href: '/panel/owner/soportes', icon: SoportesIcon },
  { name: 'Solicitudes', href: '/panel/owner/solicitudes', icon: SolicitudesMenuIcon },
  { name: 'Alquileres', href: '/panel/owner/alquileres', icon: AlquileresIcon },
  { name: 'Planificación', href: '/panel/owner/planificacion', icon: PlanificacionIcon, crown: true },
  { name: 'Clientes', href: '/panel/owner/clientes', icon: ClientesIcon, crown: true },
  { name: 'Facturación', href: '/panel/owner/pagos', icon: FacturacionIcon },
  { name: 'Marketing', href: '/panel/owner/marketing', icon: MarketingNavIcon },
  { name: 'Impresiones', href: '/panel/owner/impresiones', icon: ImpresionesIcon, crown: true },
  { name: 'Métricas', href: '/panel/owner/metricas', icon: MetricasIcon, crown: true },
  { name: 'Mantenimiento', href: '/panel/owner/mantenimiento', icon: MantenimientoIcon, crown: true },
  { name: 'Mensajería', href: '/panel/owner/mensajeria', icon: MensajeriaIcon },
  { name: 'Ajustes', href: '/panel/owner/ajustes', icon: AjustesIcon },
];

interface OwnerSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function OwnerSidebar(props: OwnerSidebarProps = {}) {
  const { isCollapsed: externalCollapsed, onToggle } = props;
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };
  const scheduleClosePopover = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => setHoveredItem(null), 120);
  };
  const openPopover = (name: string) => {
    clearHoverTimeout();
    setHoveredItem(name);
  };

  useEffect(() => () => clearHoverTimeout(), []);

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const linkBase =
    'flex items-center rounded-lg px-3 py-2 text-base font-medium text-gray-600 transition-colors ' +
    'hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500';

  const popoverClass =
    'absolute left-full top-1/2 -translate-y-1/2 ml-1 min-w-[140px] py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg z-50 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white';

  return (
    <aside className={`fixed top-16 left-0 bottom-0 z-30 bg-white dark:bg-gray-950 shadow-xl border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <nav className="mt-3 px-2">
        <div className="space-y-1">
          <div className={`flex items-center mb-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <h3 className="px-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Dashboard
              </h3>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isCollapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          <div className="space-y-1.5" onMouseLeave={isCollapsed ? scheduleClosePopover : undefined}>
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={isCollapsed ? () => openPopover(item.name) : undefined}
                onMouseLeave={isCollapsed ? scheduleClosePopover : undefined}
              >
                <Link
                  href={item.href}
                  className={`${linkBase} ${isCollapsed ? 'justify-center' : ''} relative`}
                  {...(!isCollapsed ? {} : { 'aria-label': item.name })}
                >
                  {isCollapsed && 'crown' in item && item.crown && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center w-4 pl-1">
                      <Crown className="h-3 w-3 text-purple-600 fill-purple-600" aria-hidden />
                    </div>
                  )}
                  <item.icon className={isCollapsed ? 'h-6 w-6 shrink-0' : 'h-6 w-6 shrink-0 mr-3'} />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      {'crown' in item && item.crown && (
                        <span className="ml-1.5 shrink-0 flex items-center" aria-hidden>
                          <Crown className="h-3 w-3 text-purple-600 fill-purple-600" />
                        </span>
                      )}
                    </>
                  )}
                </Link>
                {isCollapsed && hoveredItem === item.name && (
                  <div
                    className={popoverClass}
                    onMouseEnter={clearHoverTimeout}
                    onMouseLeave={scheduleClosePopover}
                    role="tooltip"
                  >
                    {item.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}


'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Megaphone,
  ChartLine,
  Banknote,
  MessageCircle,
  Settings,
} from 'lucide-react';

const iconClass = "h-6 w-6 shrink-0";

function SolicitudesMenuIcon({ className }: { className?: string }) {
  return <FileText className={className ?? iconClass} />;
}
function InicioIcon({ className }: { className?: string }) {
  return <Home className={className ?? iconClass} />;
}
function MisAnunciosIcon({ className }: { className?: string }) {
  return <Megaphone className={className ?? iconClass} />;
}
function MetricasAnunciosIcon({ className }: { className?: string }) {
  return <ChartLine className={className ?? iconClass} />;
}
function PagosIcon({ className }: { className?: string }) {
  return <Banknote className={className ?? iconClass} />;
}
function MensajeriaIcon({ className }: { className?: string }) {
  return <MessageCircle className={className ?? iconClass} />;
}
function AjustesIcon({ className }: { className?: string }) {
  return <Settings className={className ?? iconClass} />;
}

const navigation = [
  { name: 'Inicio', href: '/panel/cliente/inicio', icon: InicioIcon },
  { name: 'Solicitudes', href: '/panel/cliente/solicitudes', icon: SolicitudesMenuIcon },
  { name: 'Mis Anuncios', href: '/panel/cliente/anuncios', icon: MisAnunciosIcon },
  { name: 'Métricas Anuncios', href: '/panel/cliente/anuncios/metricas', icon: MetricasAnunciosIcon },
  { name: 'Pagos', href: '/panel/cliente/facturacion', icon: PagosIcon },
  { name: 'Mensajería', href: '/panel/mensajeria', icon: MensajeriaIcon },
  { name: 'Ajustes', href: '/panel/ajustes', icon: AjustesIcon },
];

interface ClienteSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function ClienteSidebar(props: ClienteSidebarProps = {}) {
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
    <div className={`fixed top-16 left-0 bottom-0 z-40 bg-white dark:bg-gray-950 shadow-lg transition-all duration-300 ${
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
                  prefetch={false}
                  href={item.href}
                  className={`${linkBase} ${isCollapsed ? 'justify-center' : ''}`}
                  {...(!isCollapsed ? {} : { 'aria-label': item.name })}
                >
                  <item.icon className={isCollapsed ? 'h-6 w-6 shrink-0' : 'h-6 w-6 shrink-0 mr-3'} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
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
    </div>
  );
}


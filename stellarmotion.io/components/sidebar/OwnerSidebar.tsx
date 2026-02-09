'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  CalendarRange,
  CalendarDays, 
  Users, 
  FileText, 
  TrendingUp, 
  Wrench, 
  MessageSquare, 
  Settings,
  Home,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  CreditCard,
  Printer
} from 'lucide-react';

const dashboardNavigation = [
  { name: 'Inicio', href: '/panel/owner/inicio', icon: Home },
  { name: 'Soportes', href: '/panel/owner/soportes', icon: Monitor },
  { name: 'Solicitudes', href: '/panel/owner/solicitudes', icon: FileText },
  { name: 'Alquileres', href: '/panel/owner/alquileres', icon: CalendarDays },
  { name: 'Planificación', href: '/panel/owner/planificacion', icon: CalendarRange },
  { name: 'Brands', href: '/panel/owner/clientes', icon: Users },
  { name: 'Pagos', href: '/panel/owner/pagos', icon: CreditCard },
  { name: 'Marketing', href: '/panel/owner/marketing', icon: Megaphone },
  { name: 'Impresiones', href: '/panel/owner/impresiones', icon: Printer },
  { name: 'Métricas', href: '/panel/owner/metricas', icon: TrendingUp },
  { name: 'Mantenimiento', href: '/panel/owner/mantenimiento', icon: Wrench },
  { name: 'Mensajería', href: '/panel/owner/mensajeria', icon: MessageSquare },
  { name: 'Ajustes', href: '/panel/owner/ajustes', icon: Settings },
];

interface OwnerSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function OwnerSidebar(props: OwnerSidebarProps = {}) {
  const { isCollapsed: externalCollapsed, onToggle } = props;
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  return (
    <aside className={`fixed top-16 left-0 bottom-0 z-30 bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <nav className="mt-3 px-2">
        <div className="space-y-4">
          {/* Dashboard Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              {!isCollapsed && (
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dashboard
                </h3>
              )}
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                title={isCollapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            <div className="space-y-0.5">
              {dashboardNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-2'}`} />
                  {!isCollapsed && item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}


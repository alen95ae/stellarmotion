'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  FileText,
  TrendingUp,
  MessageSquare,
  Settings,
  Home,
  Megaphone,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FileAudioIcon } from '@hugeicons/core-free-icons';

function SolicitudesMenuIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={FileAudioIcon} size={20} className={className} />;
}

const dashboardNavigation = [
  { name: 'Inicio', href: '/panel/cliente/inicio', icon: Home },
  { name: 'Solicitudes', href: '/panel/cliente/solicitudes', icon: SolicitudesMenuIcon },
  { name: 'Mis Anuncios', href: '/panel/cliente/anuncios', icon: Megaphone },
  { name: 'Métricas Anuncios', href: '/panel/cliente/anuncios/metricas', icon: BarChart3 },
  { name: 'Facturación', href: '/panel/cliente/facturacion', icon: FileText },
];

const otherNavigation = [
  { name: 'Mensajería', href: '/panel/mensajeria', icon: MessageSquare },
  { name: 'Ajustes', href: '/panel/ajustes', icon: Settings },
];

interface ClienteSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function ClienteSidebar(props: ClienteSidebarProps = {}) {
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
    <div className={`fixed top-16 left-0 bottom-0 z-40 bg-white shadow-lg transition-all duration-300 ${
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

          {/* Other Section */}
          <div>
            {!isCollapsed && (
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Otros
              </h3>
            )}
            <div className="space-y-0.5">
              {otherNavigation.map((item) => (
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
    </div>
  );
}


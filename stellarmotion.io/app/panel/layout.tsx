'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  FileText, 
  TrendingUp, 
  Wrench, 
  Map as MapIcon, 
  MessageSquare, 
  Settings,
  Home,
  Monitor,
  Megaphone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const dashboardNavigation = [
  { name: 'Inicio', href: '/panel/inicio', icon: Home },
  { name: 'Soportes', href: '/panel/soportes', icon: Monitor },
  { name: 'Reservas', href: '/panel/reservas', icon: Calendar },
  { name: 'Clientes', href: '/panel/clientes', icon: Users },
  { name: 'Facturación', href: '/panel/facturacion', icon: FileText },
  { name: 'Métricas', href: '/panel/metricas', icon: TrendingUp },
  { name: 'Mapa', href: '/panel/mapa', icon: MapIcon },
  { name: 'Mantenimiento', href: '/panel/mantenimiento', icon: Wrench },
];

const adsNavigation = [
  { name: 'Anuncios', href: '/panel/anuncios', icon: Megaphone },
  { name: 'Métricas Anuncios', href: '/panel/anuncios/metricas', icon: BarChart3 },
];

const otherNavigation = [
  { name: 'Mensajería', href: '/panel/mensajeria', icon: MessageSquare },
  { name: 'Ajustes', href: '/panel/ajustes', icon: Settings },
];

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - se detiene justo antes del header (top-16 = 64px = altura del header) */}
      <div className={`fixed top-16 left-0 bottom-0 z-40 bg-white shadow-lg transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <nav className="mt-6 px-3">
          <div className="space-y-6">
            {/* Dashboard Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
              <div className="space-y-1">
                {dashboardNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Anuncios Section */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Anuncios
                </h3>
              )}
              <div className="space-y-1">
                {adsNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Other Section */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Otros
                </h3>
              )}
              <div className="space-y-1">
                {otherNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content - ajustado para el header y sidebar */}
      <div className={`pt-16 transition-all duration-300 ${
        isCollapsed ? 'pl-16' : 'pl-64'
      }`}>
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

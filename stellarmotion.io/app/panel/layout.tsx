import { Metadata } from 'next';
import Link from 'next/link';
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
  Megaphone
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Panel de Control | StellarMotion',
  description: 'Dashboard para propietarios de espacios publicitarios'
};

const navigation = [
  { name: 'Inicio', href: '/panel/inicio', icon: Home },
  { name: 'Soportes', href: '/panel/soportes', icon: Monitor },
  { name: 'Reservas', href: '/panel/reservas', icon: Calendar },
  { name: 'Clientes', href: '/panel/clientes', icon: Users },
  { name: 'Facturación', href: '/panel/facturacion', icon: FileText },
  { name: 'Métricas', href: '/panel/metricas', icon: TrendingUp },
  { name: 'Mantenimiento', href: '/panel/mantenimiento', icon: Wrench },
  { name: 'Mapa', href: '/panel/mapa', icon: MapIcon },
  { name: 'Mensajería', href: '/panel/mensajeria', icon: MessageSquare },
  { name: 'Ajustes', href: '/panel/ajustes', icon: Settings },
];

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - se detiene justo antes del header (top-16 = 64px = altura del header) */}
      <div className="fixed top-16 left-0 bottom-0 z-40 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-gray-900">
            StellarMotion
          </Link>
        </div>
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content - ajustado para el header y sidebar */}
      <div className="pl-64 pt-16">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

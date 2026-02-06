'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
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
  Plus
} from 'lucide-react';

const dashboardCards = [
  {
    title: 'Soportes',
    description: 'Gestiona tus soportes publicitarios',
    href: '/panel/soportes',
    icon: Monitor,
    color: 'bg-red-100'
  },
  {
    title: 'Alquileres',
    description: 'Ve y gestiona los alquileres activos',
    href: '/panel/alquileres',
    icon: Calendar,
    color: 'bg-red-100'
  },
  {
    title: 'Clientes',
    description: 'Administra tu base de clientes',
    href: '/panel/clientes',
    icon: Users,
    color: 'bg-red-100'
  },
  {
    title: 'Pagos',
    description: 'Controla tus ingresos y pagos',
    href: '/panel/owner/pagos',
    icon: FileText,
    color: 'bg-red-100'
  },
  {
    title: 'Métricas',
    description: 'Analiza el rendimiento de tus soportes',
    href: '/panel/metricas',
    icon: TrendingUp,
    color: 'bg-red-100'
  },
  {
    title: 'Mapa',
    description: 'Visualiza tus soportes en el mapa',
    href: '/panel/mapa',
    icon: MapIcon,
    color: 'bg-red-100'
  }
];

const quickActions = [
  {
    title: 'Nuevo Soporte',
    description: 'Publicar un nuevo espacio publicitario',
    href: '/publicar-espacio',
    icon: Plus,
    color: 'bg-red-100'
  },
  {
    title: 'Ver Anuncios',
    description: 'Gestionar anuncios existentes',
    href: '/panel/anuncios',
    icon: Megaphone,
    color: 'bg-red-100'
  },
  {
    title: 'Mensajería',
    description: 'Comunicación con clientes',
    href: '/panel/mensajeria',
    icon: MessageSquare,
    color: 'bg-red-100'
  },
  {
    title: 'Ajustes',
    description: 'Configuración del perfil',
    href: '/panel/ajustes',
    icon: Settings,
    color: 'bg-red-100'
  }
];

interface DashboardStats {
  totalSupports: number;
  activeReservations: number;
  totalClients: number;
  monthlyRevenue: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSupports: 0,
    activeReservations: 0,
    totalClients: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardStats();
    }
  }, [user, authLoading]);

  const fetchDashboardStats = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Obtener soportes del usuario actual
      const supportsResponse = await fetch(`/api/soportes?userId=${user.id}`);
      const supportsData = supportsResponse.ok ? await supportsResponse.json() : { soportes: [] };
      const supports = supportsData.soportes || [];
      
      // Calcular estadísticas
      const totalSupports = supports.length;
      const availableSupports = supports.filter((s: any) => s.status === 'DISPONIBLE').length;
      const monthlyRevenue = supports.reduce((sum: number, support: any) => 
        sum + (support.pricePerMonth || 0), 0
      );

      setStats({
        totalSupports,
        activeReservations: availableSupports, // Usar soportes disponibles como proxy
        totalClients: Math.floor(totalSupports * 0.8), // Estimación
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-xs text-gray-600 leading-tight">
          Bienvenido a tu panel de control. Gestiona tus soportes publicitarios y anuncios.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Gestión de Soportes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {dashboardCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded bg-white p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className={`flex h-7 w-7 items-center justify-center rounded ${card.color}`}>
                  <card.icon className="h-3.5 w-3.5 text-red-600" />
                </div>
                <div className="ml-2">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-tight">{card.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative overflow-hidden rounded bg-white p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className={`flex h-7 w-7 items-center justify-center rounded ${action.color}`}>
                  <action.icon className="h-3.5 w-3.5 text-red-600" />
                </div>
                <div className="ml-2">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-tight">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="flex items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
              <Monitor className="h-3.5 w-3.5 text-red-600" />
            </div>
            <div className="ml-2">
              <p className="text-[11px] font-medium text-gray-500">Soportes Totales</p>
              <p className="text-base font-semibold text-gray-900">
                {loading ? '...' : stats.totalSupports}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="flex items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
              <Calendar className="h-3.5 w-3.5 text-red-600" />
            </div>
            <div className="ml-2">
              <p className="text-[11px] font-medium text-gray-500">Soportes Disponibles</p>
              <p className="text-base font-semibold text-gray-900">
                {loading ? '...' : stats.activeReservations}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="flex items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
              <Users className="h-3.5 w-3.5 text-red-600" />
            </div>
            <div className="ml-2">
              <p className="text-[11px] font-medium text-gray-500">Clientes Estimados</p>
              <p className="text-base font-semibold text-gray-900">
                {loading ? '...' : stats.totalClients}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="flex items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
              <TrendingUp className="h-3.5 w-3.5 text-red-600" />
            </div>
            <div className="ml-2">
              <p className="text-[11px] font-medium text-gray-500">Ingresos Potenciales</p>
              <p className="text-base font-semibold text-gray-900">
                {loading ? '...' : formatPrice(stats.monthlyRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase-browser';
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
    title: 'Reservas',
    description: 'Ve y gestiona las reservas activas',
    href: '/panel/reservas',
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
    title: 'Facturación',
    description: 'Controla tus ingresos y facturas',
    href: '/panel/facturacion',
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
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalSupports: 0,
    activeReservations: 0,
    totalClients: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  // Obtener el ownerId del usuario autenticado
  useEffect(() => {
    const getOwnerId = async () => {
      if (!user) return;
      
      try {
        // Buscar el owner en la tabla owners usando el user_id
        const { data: ownerData, error } = await supabase
          .from('owners')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (ownerData) {
          setOwnerId(ownerData.id);
        } else {
          console.warn('No se encontró owner para el usuario:', user.id);
        }
      } catch (error) {
        console.error('Error obteniendo ownerId:', error);
      }
    };

    if (user && !authLoading) {
      getOwnerId();
    }
  }, [user, authLoading, supabase]);

  useEffect(() => {
    if (ownerId) {
      fetchDashboardStats();
    }
  }, [ownerId]);

  const fetchDashboardStats = async () => {
    if (!ownerId) return;
    
    try {
      setLoading(true);
      
      // Obtener soportes del owner actual
      const supportsResponse = await fetch(`/api/soportes?ownerId=${ownerId}`);
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Bienvenido a tu panel de control. Gestiona tus soportes publicitarios y anuncios.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Soportes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative overflow-hidden rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <Monitor className="h-4 w-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Soportes Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalSupports}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <Calendar className="h-4 w-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Soportes Disponibles</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.activeReservations}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <Users className="h-4 w-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Clientes Estimados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalClients}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <TrendingUp className="h-4 w-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Ingresos Potenciales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : formatPrice(stats.monthlyRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'

import { BubbleMenu } from '@/components/dashboard/BubbleMenu'
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  Building2, 
  CreditCard,
  BarChart3,
  Monitor,
  Calendar,
  Truck
} from 'lucide-react'

export default function DashboardPage() {
  // Datos de los módulos del ERP con sus métricas
  const erpModules = [
    {
      id: 'ventas',
      name: 'Ventas',
      icon: ShoppingCart,
      value: 150000,
      route: '/panel/ventas',
      metrics: {
        total: 150000,
        growth: 12.5,
        description: 'Gestión de ventas y clientes'
      }
    },
    {
      id: 'compras',
      name: 'Compras',
      icon: Package,
      value: 85000,
      route: '/panel/compras',
      metrics: {
        total: 85000,
        growth: 8.2,
        description: 'Control de compras y proveedores'
      }
    },
    {
      id: 'inventario',
      name: 'Inventario',
      icon: BarChart3,
      value: 120000,
      route: '/panel/inventario',
      metrics: {
        total: 120000,
        growth: -2.1,
        description: 'Control de stock y productos'
      }
    },
    {
      id: 'facturacion',
      name: 'Facturación',
      icon: FileText,
      value: 200000,
      route: '/panel/facturacion',
      metrics: {
        total: 200000,
        growth: 15.8,
        description: 'Emisión de facturas y documentos'
      }
    },
    {
      id: 'empleados',
      name: 'Empleados',
      icon: Users,
      value: 15,
      route: '/panel/empleados',
      metrics: {
        total: 15,
        growth: 5.0,
        description: 'Gestión de personal y nóminas'
      }
    },
    {
      id: 'partners',
      name: 'Partners',
      icon: Building2,
      value: 45,
      route: '/panel/partners',
      metrics: {
        total: 45,
        growth: 3.2,
        description: 'Gestión de partners asociados'
      }
    },
    {
      id: 'contactos',
      name: 'Contactos',
      icon: Users,
      value: 320,
      route: '/panel/contactos',
      metrics: {
        total: 320,
        growth: 7.5,
        description: 'Base de datos de contactos'
      }
    },
    {
      id: 'soportes',
      name: 'Soportes',
      icon: Monitor,
      value: 89,
      route: '/panel/soportes',
      metrics: {
        total: 89,
        growth: -1.2,
        description: 'Tickets de soporte técnico'
      }
    },
    {
      id: 'reservas',
      name: 'Reservas',
      icon: Calendar,
      value: 156,
      route: '/panel/reservas',
      metrics: {
        total: 156,
        growth: 22.1,
        description: 'Sistema de reservas y citas'
      }
    },
    {
      id: 'logistica',
      name: 'Logística',
      icon: Truck,
      value: 67000,
      route: '/panel/logistica',
      metrics: {
        total: 67000,
        growth: 9.8,
        description: 'Gestión de envíos y entregas'
      }
    }
  ]

  return (
    <div className="min-h-screen">
      <BubbleMenu data={erpModules} />
    </div>
  )
}

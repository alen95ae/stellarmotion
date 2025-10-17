'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Home,
  TrendingUp,
  MapPin,
  Truck,
  Users,
  UserCheck,
  FolderKanban,
  Handshake,
  Scale,
  Beaker,
  Receipt,
  MessageCircle,
  Globe,
  Settings,
  BarChart3,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowRight,
  Menu,
  X,
  Bell,
  Search,
  ShoppingCart,
  Monitor,
  Package,
  FileText,
  CreditCard,
  Heart,
  Shield,
  Terminal,
  Filter,
  FlaskConical,
  Globe2,
  HeartHandshake,
  Rabbit,
  Rat
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

// Datos de ejemplo para los gráficos (acumulativos)
const revenueData = [
  { month: 'Ene', revenue: 45000, expenses: 28000 },
  { month: 'Feb', revenue: 97000, expenses: 60000 },
  { month: 'Mar', revenue: 145000, expenses: 89000 },
  { month: 'Abr', revenue: 206000, expenses: 124000 },
  { month: 'May', revenue: 261000, expenses: 155000 },
  { month: 'Jun', revenue: 328000, expenses: 193000 }
]

const moduleData = [
  { name: 'Ventas', value: 35, color: '#e94446' },
  { name: 'Compras', value: 25, color: '#3B82F6' },
  { name: 'Inventario', value: 20, color: '#10B981' },
  { name: 'Otros', value: 20, color: '#F59E0B' }
]

const activityData = [
  { time: '09:00', activity: 'Nueva venta registrada', type: 'sale' },
  { time: '10:30', activity: 'Stock actualizado', type: 'inventory' },
  { time: '11:15', activity: 'Factura emitida', type: 'invoice' },
  { time: '14:20', activity: 'Nuevo cliente agregado', type: 'customer' },
  { time: '16:45', activity: 'Reserva confirmada', type: 'reservation' }
]

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeModule, setActiveModule] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  const erpModules = [
    { id: 'dashboard', name: 'Panel principal', icon: Home, active: true },
    { id: 'ventas', name: 'Ventas', icon: HeartHandshake },
    { id: 'metricas', name: 'Métricas', icon: TrendingUp },
    { id: 'soportes', name: 'Soportes', icon: Monitor },
    { id: 'logistica', name: 'Logística', icon: Globe2 },
    { id: 'partners', name: 'Partners', icon: Rabbit },
    { id: 'clientes', name: 'Clientes', icon: Rat },
    { id: 'proyectos', name: 'Proyectos', icon: Terminal },
    { id: 'crm', name: 'CRM', icon: Filter },
    { id: 'legal', name: 'Legal', icon: Scale },
    { id: 'iyd', name: 'I+D', icon: FlaskConical },
    { id: 'facturacion', name: 'Facturación', icon: Receipt },
    { id: 'atencion', name: 'Atención al cliente', icon: MessageCircle },
    { id: 'sitio', name: 'Sitio web', icon: Globe },
    { id: 'ajustes', name: 'Ajustes', icon: Settings }
  ]

  const metrics = [
    {
      title: 'Ingresos Totales',
      value: '$245,680',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-red-500'
    },
    {
      title: 'Ventas del Mes',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-red-500'
    },
    {
      title: 'Clientes Activos',
      value: '2,847',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-red-500'
    },
    {
      title: 'Tickets Abiertos',
      value: '23',
      change: '-5.1%',
      trend: 'down',
      icon: Monitor,
      color: 'text-red-500'
    }
  ]

  const sidebarVariants = {
    collapsed: { width: 80 },
    expanded: { width: 280 }
  }

  const contentVariants = {
    collapsed: { marginLeft: 0 },
    expanded: { marginLeft: 0 }
  }

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId)
    
    // Navegación a módulos específicos
    switch (moduleId) {
      case 'soportes':
        router.push('/panel/soportes')
        break
      case 'clientes':
        router.push('/panel/clientes')
        break
      case 'partners':
        router.push('/panel/partners')
        break
      // Agregar más casos según sea necesario
      default:
        // Para el dashboard y otros módulos que no tienen página específica
        break
    }
  }

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Sidebar */}
      <motion.aside
        className={`sticky top-0 self-start border-r z-50 transition-colors duration-300 ${
          darkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}
        style={{ minHeight: '100vh' }}
        variants={sidebarVariants}
        animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="px-4 pb-4">
          {/* Logo */}
          <div className="flex items-center justify-start -mb-8 -mt-8">
            <div className="w-96 h-32 flex items-center justify-start">
              {sidebarCollapsed ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 390.69 315.92" className="text-[#e94446]">
                    <path fill="currentColor" d="M178.29,204.62h16.54c.56,6.81,1.08,13.12,1.48,17.91L231.87,190h-167V178.12c19.76-5.93,40.18-9.65,57.63-17.81,32.91-15.39,49.38-41.18,55.25-71.91,2-10.48,1.93-10.49,16.95-8.45v81.88c-6.62-2.83-13.59-3.92-15.67-7.18-2.59-4.07-1.15-9.93-1.27-12l-35.5,31.46H309.2V187c-16.93,4.28-34.14,6.75-49.29,12.82-37.35,15-56.62,41.67-63.36,75.21-1,5.16.07,10.92-9.9,10.6-10.44-.33-8.25-6.48-8.29-11.43C178.2,251.35,178.29,228.47,178.29,204.62Z"/>
                    <path fill="currentColor" d="M178.29,204.62h16.54c.56,6.81,1.08,13.12,1.48,17.91L231.87,190h-167V178.12c19.76-5.93,40.18-9.65,57.63-17.81,32.91-15.39,49.38-41.18,55.25-71.91,2-10.48,1.93-10.49,16.95-8.45v81.88c-6.62-2.83-13.59-3.92-15.67-7.18-2.59-4.07-1.15-9.93-1.27-12l-35.5,31.46H309.2V187c-16.93,4.28-34.14,6.75-49.29,12.82-37.35,15-56.62,41.67-63.36,75.21-1,5.16.07,10.92-9.9,10.6-10.44-.33-8.25-6.48-8.29-11.43C178.2,251.35,178.29,228.47,178.29,204.62Z"/>
                    <path fill="currentColor" d="M238.67,117.8a5.59,5.59,0,0,1-5.77-.06c-3.5-2.48-3.87-7.6-.65-10.12C239.46,102,246.73,96.36,254,90.73q17-13.19,34-26.34c.76-.59,1.32-1.84,2.74-1.26s1.19,1.88,1.22,2.95c.06,2.3.33,4.35,4,4.86,1.43.2,1.86,1.28.66,2.22l-.9.71L240.4,116.76A3.75,3.75,0,0,1,238.67,117.8Z"/>
                    <path fill="currentColor" d="M258,136c.34-1.2,1.45-1.87,2.43-2.63q29.31-22.77,58.64-45.53c3.68-2.86,7.38-2.9,10.43-.19,2.69,2.38,3,5.28.81,7.64a13.88,13.88,0,0,1-1.73,1.48l-58.41,45.36a6.89,6.89,0,0,1-3.31,1.83c-.86-1.87.91-2.59,2-3.47,6.48-5.16,13-10.23,19.64-15.29,3.05-2.33,6.17-4.44,5.53-8.75-.23-1.57.68-3.23.54-4.94a32.87,32.87,0,0,1-.68,5.7c-.19.73-.25,1.64-1.48,1.69a2.37,2.37,0,0,1-2.22-1.4c-1.63-2.6-2.22-2.75-4.6-.93-7.73,5.92-15.34,12-23.1,17.85C261.32,135.29,260.33,136.86,258,136Z"/>
                    <path fill="currentColor" d="M258,136q14-10.87,28.11-21.72c1-.78,1.86-2.31,3.53-1.7,1.86.68,1.78,2.41,1.9,3.87.05.51.23,1,.54,2.33a8.29,8.29,0,0,0,.4-6.88c-1.08-2.62,1-3.43,2.6-4.47,1.23-.78,1.3.38,1.39,1.07a15.72,15.72,0,0,1-.84,7.43c-.23.66-1,1.38-.41,2,2.54,2.74.06,3.89-1.7,5.26q-13.32,10.4-26.66,20.76c-2.82,1.17-5.41.31-7.52-1.58S256.36,138.24,258,136Z"/>
                    <path fill="currentColor" d="M238.67,117.8,297,72.49c-3.06-1.07-4.17.52-6.16,1.41-.25-3.59-.48-6.84-.71-10.08-1.18-.19-1.63.5-2.19.94q-27.3,21.17-54.55,42.35c-2.48,1.93-2.72,8.15-.5,10.63-4.92-2.45-5.86-6.36-2.05-9.39,6.48-5.16,13.09-10.22,19.65-15.32L306,50a25.49,25.49,0,0,1,2.79-2,7.77,7.77,0,0,1,8.84,1.17c2.27,2.07,2.62,5.16.72,7.27a18,18,0,0,1-2.39,2Q279.16,87,242.35,115.51A9.62,9.62,0,0,1,238.67,117.8Z"/>
                  </svg>
                </div>
              ) : (
                <motion.div
                  animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
                  transition={{ delay: sidebarCollapsed ? 0 : 0.2 }}
                >
                  <Image 
                    src="/stellarmotion-logo.svg" 
                    alt="StellarMotion ERP" 
                    width={200} 
                    height={60}
                    className="object-contain"
                    style={{ background: 'transparent' }}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* User Info */}
          <motion.div 
            className={`flex items-center space-x-3 py-2 border-b ${
              darkMode ? 'border-slate-700' : 'border-gray-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-slate-700' : 'bg-gray-200'
            }`}>
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <motion.div 
              className="flex-1 min-w-0"
              animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
              transition={{ delay: sidebarCollapsed ? 0 : 0.2 }}
            >
              <p className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Admin User</p>
              <p className={`text-xs ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>admin@stellarmotion.com</p>
            </motion.div>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-1 pt-2">
            {erpModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={activeModule === module.id ? 'default' : 'ghost'}
                  className={`w-full justify-start h-12 ${
                    activeModule === module.id 
                      ? 'bg-[#e94446] hover:bg-[#e94446] text-white' 
                      : darkMode 
                        ? 'hover:bg-[#e94446] hover:text-white text-white' 
                        : 'hover:bg-[#e94446] hover:text-white text-gray-900'
                  }`}
                  onClick={() => handleModuleClick(module.id)}
                >
                  <module.icon className="w-5 h-5 mr-3" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {module.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-6 -right-3 ${
            darkMode 
              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        className="flex-1 transition-all duration-300 ease-in-out"
        variants={contentVariants}
        animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Dashboard</h1>
              <p className={`${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>Bienvenido al panel de control de StellarMotion</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <Input 
                  placeholder="Buscar..." 
                  className={`pl-10 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <Button variant="ghost" size="sm" className={darkMode ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}>
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={darkMode ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}
                onClick={() => setDarkMode(!darkMode)}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`transition-colors ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm mb-1 ${
                          darkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>{metric.title}</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{metric.value}</p>
                        <div className="flex items-center mt-2">
                          {metric.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                          )}
                          <span className={`text-sm ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {metric.change}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        darkMode ? 'bg-slate-700' : 'bg-gray-100'
                      } ${metric.color}`}>
                        <metric.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className={`transition-colors ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>Ingresos vs Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="1" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stackId="1" 
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Module Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className={`transition-colors ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>Distribución por Módulos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={moduleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {moduleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Feed & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className={`transition-colors ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Activity className="w-5 h-5 mr-2" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityData.map((activity, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-slate-700 hover:bg-slate-600' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-[#e94446] rounded-full"></div>
                        <div className="flex-1">
                          <p className={`text-sm ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{activity.activity}</p>
                          <p className={`text-xs ${
                            darkMode ? 'text-slate-400' : 'text-gray-600'
                          }`}>{activity.time}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className={`transition-colors ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-[#e94446] hover:bg-[#D7514C] text-white">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Nueva Venta
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button variant="outline" className={`w-full justify-start ${
                    darkMode 
                      ? 'border-slate-600 hover:bg-slate-700 text-white' 
                      : 'border-gray-300 hover:bg-gray-100 text-gray-900'
                  }`}>
                    <Package className="w-4 h-4 mr-2" />
                    Registrar Compra
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button variant="outline" className={`w-full justify-start ${
                    darkMode 
                      ? 'border-slate-600 hover:bg-slate-700 text-white' 
                      : 'border-gray-300 hover:bg-gray-100 text-gray-900'
                  }`}>
                    <Users className="w-4 h-4 mr-2" />
                    Agregar Cliente
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button variant="outline" className={`w-full justify-start ${
                    darkMode 
                      ? 'border-slate-600 hover:bg-slate-700 text-white' 
                      : 'border-gray-300 hover:bg-gray-100 text-gray-900'
                  }`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Emitir Factura
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  )
}
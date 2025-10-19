"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const sidebarVariants = {
  expanded: { width: 280 },
  collapsed: { width: 80 }
}

const contentVariants = {
  expanded: { marginLeft: 280 },
  collapsed: { marginLeft: 80 }
}

interface SidebarProps {
  children: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [isUserToggle, setIsUserToggle] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Lógica de estado del sidebar basada en la ruta
  useEffect(() => {
    if (pathname === '/dashboard') {
      // Panel principal: siempre abierto
      setSidebarCollapsed(false)
    } else {
      // Cualquier otra página: siempre cerrado
      setSidebarCollapsed(true)
    }
    // Resetear el flag de toggle del usuario
    setIsUserToggle(false)
  }, [pathname])

  // Función para manejar el toggle manual del usuario
  const handleToggle = () => {
    setIsUserToggle(true)
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const erpModules = [
    { id: 'dashboard', name: 'Panel principal', icon: Home, path: '/dashboard' },
    { id: 'ventas', name: 'Ventas', icon: HeartHandshake, path: '/panel/ventas' },
    { id: 'metricas', name: 'Métricas', icon: TrendingUp, path: '/panel/metricas' },
    { id: 'soportes', name: 'Soportes', icon: Monitor, path: '/panel/soportes' },
    { id: 'logistica', name: 'Logística', icon: Globe2, path: '/panel/logistica' },
    { id: 'partners', name: 'Partners', icon: Rabbit, path: '/panel/partners' },
    { id: 'clientes', name: 'Clientes', icon: Rat, path: '/panel/clientes' },
    { id: 'proyectos', name: 'Proyectos', icon: Terminal, path: '/panel/proyectos' },
    { id: 'crm', name: 'CRM', icon: Filter, path: '/panel/crm' },
    { id: 'legal', name: 'Legal', icon: Scale, path: '/panel/legal' },
    { id: 'iyd', name: 'I+D', icon: FlaskConical, path: '/panel/iyd' },
    { id: 'facturacion', name: 'Facturación', icon: Receipt, path: '/panel/facturacion' },
    { id: 'atencion', name: 'Atención al cliente', icon: MessageCircle, path: '/panel/atencion' },
    { id: 'sitio', name: 'Sitio web', icon: Globe, path: '/panel/sitio' },
    { id: 'ajustes', name: 'Ajustes', icon: Settings, path: '/panel/ajustes' }
  ]

  const handleModuleClick = (module: any) => {
    if (module.path) {
      router.push(module.path)
    }
  }

  // Determinar el módulo activo basado en la ruta actual
  const getActiveModule = () => {
    if (pathname === '/dashboard') return 'dashboard'
    if (pathname.startsWith('/panel/soportes')) return 'soportes'
    if (pathname.startsWith('/panel/clientes')) return 'clientes'
    if (pathname.startsWith('/panel/ventas')) return 'ventas'
    if (pathname.startsWith('/panel/metricas')) return 'metricas'
    if (pathname.startsWith('/panel/logistica')) return 'logistica'
    if (pathname.startsWith('/panel/partners')) return 'partners'
    if (pathname.startsWith('/panel/proyectos')) return 'proyectos'
    if (pathname.startsWith('/panel/crm')) return 'crm'
    if (pathname.startsWith('/panel/legal')) return 'legal'
    if (pathname.startsWith('/panel/iyd')) return 'iyd'
    if (pathname.startsWith('/panel/facturacion')) return 'facturacion'
    if (pathname.startsWith('/panel/atencion')) return 'atencion'
    if (pathname.startsWith('/panel/sitio')) return 'sitio'
    if (pathname.startsWith('/panel/ajustes')) return 'ajustes'
    return 'dashboard'
  }

  const activeModule = getActiveModule()

  return (
    <div className="flex min-h-screen">
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
        transition={isUserToggle ? { duration: 0.3, ease: 'easeInOut' } : { duration: 0 }}
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
                  onClick={() => handleModuleClick(module)}
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
          onClick={handleToggle}
        >
          {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}

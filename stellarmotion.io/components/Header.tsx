"use client"
import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, User, LogOut, LayoutDashboard, Menu, Store } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Store01Icon, DashboardSquare03Icon, Megaphone03Icon, ComputerDollarIcon } from "@hugeicons/core-free-icons"
// Removed Supabase Auth - using JWT-based auth
import { getRoleFromPayload } from "@/lib/auth/role"

function MarketplaceNavIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Store01Icon} size={20} className={className} />
}
function PanelOwnersNavIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={DashboardSquare03Icon} size={20} className={className} />
}
function PanelBrandsNavIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Megaphone03Icon} size={20} className={className} />
}
function InvertirSoportesNavIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={ComputerDollarIcon} size={20} className={className} />
}

const PRODUCTOS_ITEMS = [
  { href: "/marketplace", icon: MarketplaceNavIcon, title: "Marketplace publicitario", description: "Compra y venta de soportes OOH y DOOH" },
  { href: "/panel/owner/inicio", icon: PanelOwnersNavIcon, title: "Panel para Owners", description: "Gestión de soportes, ingresos y reservas" },
  { href: "/panel/cliente/inicio", icon: PanelBrandsNavIcon, title: "Panel para Brands", description: "Compra, seguimiento y control de campañas" },
] as const

const SOLUCIONES_ITEMS = [
  { href: "/instalacion-de-soportes", icon: InvertirSoportesNavIcon, title: "Invertir en soportes", description: "Convertimos muros y terrenos en activos publicitarios rentables" },
] as const

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [openMega, setOpenMega] = useState<"productos" | "soluciones" | null>(null)
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ownerData, setOwnerData] = useState<any>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  type DashboardView = "owner" | "cliente"
  const DASHBOARD_VIEW_KEY = "st_dashboard_view"
  const [dashboardView, setDashboardView] = useState<DashboardView>("cliente")
  
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    const abortController = new AbortController();
    const { signal } = abortController;

    // Timeout de seguridad: si loading tarda más de 2 segundos, forzar false
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Header: Timeout de seguridad - forzando loading = false');
        setLoading(false);
      }
    }, 2000);

    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include', signal });
        
        if (!isMounted) return;

        if (!response.ok) {
          setUser(null);
          setOwnerData(null);
        } else {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            setOwnerData(null);
          } else {
            setUser(null);
            setOwnerData(null);
          }
        }
      } catch (error: unknown) {
        // No tratar como error: petición cancelada (navegación/unmount) o fallo de red transitorio
        if (error instanceof Error && error.name === 'AbortError') return;
        if (isMounted) {
          setUser(null);
          setOwnerData(null);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    loadUser();

    // Recargar usuario cuando cambia la ruta (para detectar login/logout)
    const intervalId = setInterval(() => {
      if (isMounted) {
        loadUser();
      }
    }, 5000); // Verificar cada 5 segundos

    return () => {
      isMounted = false;
      abortController.abort();
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [pathname]) // Recargar cuando cambia la ruta

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    
    // Actualizar el estado inmediatamente para que el UI se actualice
    setUser(null)
    setOwnerData(null)
    setLoading(false)
    
    try {
      // Cerrar sesión llamando al endpoint de logout
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
    
    // Redirigir a home
    router.push('/')
  }

  // Si el usuario es owner, mostrar RAZON SOCIAL + TIPO EMPRESA
  // Si no, mostrar nombre normal
  const userName = useMemo(() => {
    // Verificar si hay datos de owner y si tiene empresa o tipo_empresa
    if (ownerData && (ownerData.empresa || ownerData.tipo_empresa)) {
      const empresa = (ownerData.empresa || '').trim()
      const tipoEmpresa = (ownerData.tipo_empresa || '').trim()
      
      // Si tiene ambos, mostrar "EMPRESA TIPO_EMPRESA"
      if (empresa && tipoEmpresa) {
        return `${empresa} ${tipoEmpresa}`
      }
      
      // Si solo tiene empresa, mostrar empresa
      if (empresa) {
        return empresa
      }
      
      // Si solo tiene tipo_empresa, mostrar tipo_empresa (caso raro)
      if (tipoEmpresa) {
        return tipoEmpresa
      }
    }
    
    // Fallback al nombre normal
    return user?.name || user?.nombre || user?.email?.split('@')[0] || 'Usuario'
  }, [ownerData, user])

  // Iniciales para el avatar (máx. 2 letras, mayúsculas)
  const userInitials = useMemo(() => {
    const name = userName.trim()
    if (!name) return 'U'
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }, [userName])
  
  // Obtener el rol del usuario usando el helper centralizado
  const userRole = user ? getRoleFromPayload(user.role) : undefined

  // Persistir preferencia de vista Owner/Cliente para todos los usuarios
  useEffect(() => {
    if (!user) return
    try {
      const saved = window.localStorage.getItem(DASHBOARD_VIEW_KEY)
      if (saved === "owner" || saved === "cliente") {
        setDashboardView(saved)
        return
      }

      // Default: si el rol es admin/owner/seller, empezar en Owner; si no, Cliente
      const defaultView: DashboardView =
        userRole && ["admin", "owner", "seller"].includes(userRole) ? "owner" : "cliente"
      setDashboardView(defaultView)
      window.localStorage.setItem(DASHBOARD_VIEW_KEY, defaultView)
    } catch {
      // ignore (private mode, etc.)
    }
  }, [user, userRole])
  
  // Log para debug
  useEffect(() => {
    if (user) {
      console.log('👤 User data:', {
        email: user.email,
        role: userRole,
        rawRole: user.role,
        name: user.name || user.nombre
      })
    }
  }, [user, userRole])
  
  const goToDashboard = (view: DashboardView) => {
    setDashboardView(view)
    try {
      window.localStorage.setItem(DASHBOARD_VIEW_KEY, view)
    } catch {
      // ignore
    }
    setIsUserMenuOpen(false)
    router.push(view === "owner" ? "/panel/owner/inicio" : "/panel/cliente/inicio")
  }

  const clearMegaTimeout = () => {
    if (megaTimeoutRef.current) {
      clearTimeout(megaTimeoutRef.current)
      megaTimeoutRef.current = null
    }
  }
  const scheduleCloseMega = () => {
    clearMegaTimeout()
    megaTimeoutRef.current = setTimeout(() => setOpenMega(null), 120)
  }
  const openMegaImmediate = (key: "productos" | "soluciones") => {
    clearMegaTimeout()
    setOpenMega(key)
  }

  useEffect(() => () => clearMegaTimeout(), [])

  const navItemBase =
    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
  const navItemHover =
    "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
  const navItemActive = "text-[#D7514C] bg-gray-100 dark:bg-gray-800"
  const megaPanelClass =
    "absolute left-0 top-full pt-0 mt-0 w-[min(90vw,420px)] rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg z-50"

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 w-full m-0 p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full m-0">
        <div className="flex items-center justify-between h-16 w-full m-0">
          {/* Logo + Productos, Soluciones, Precios a la izquierda */}
          <div className="flex items-center gap-6 lg:gap-8 shrink-0">
            <Link href="/" aria-label="Inicio" className="flex items-center shrink-0">
            <svg className="w-40 h-8" viewBox="0 0 934.1 167.24">
              <text className="text-[#282828] text-[109.26px] font-semibold" transform="translate(126.63 102.45) scale(1.02 1)">StellarMotion</text>
              <path className="fill-[#e94446]" d="M54.91,103.2H61.5c.22,3.23.42,6.23.58,8.51L76.24,96.26H9.76V90.6c7.87-2.82,16-4.58,23-8.46C45.8,74.82,52.36,62.56,54.7,48c.79-5,.77-5,6.74-4V82.86C58.81,81.51,56,81,55.2,79.44c-1-1.93-.45-4.71-.5-5.69l-14.13,15H107v6.13c-6.74,2-13.59,3.21-19.62,6.1-14.87,7.11-22.54,19.8-25.22,35.74-.41,2.46,0,5.19-3.94,5-4.16-.16-3.29-3.08-3.3-5.43C54.88,125.41,54.91,114.53,54.91,103.2Z" transform="translate(-9.76 -26.65)"/>
              <path className="fill-[#e94446]" d="M79.57,60.28a1.94,1.94,0,0,1-2.29,0A3.38,3.38,0,0,1,77,55.44c2.87-2.69,5.76-5.36,8.64-8q6.77-6.27,13.53-12.52c.3-.28.52-.88,1.09-.6s.47.89.48,1.4c0,1.1.13,2.07,1.59,2.31.56.1.74.61.26,1.06l-.36.34-22,20.38A1.58,1.58,0,0,1,79.57,60.28Z" transform="translate(-9.76 -26.65)"/>
              <path className="fill-[#e94446]" d="M87.27,68.91a2.62,2.62,0,0,1,1-1.25Q99.9,56.83,111.58,46c1.46-1.36,2.93-1.38,4.15-.1a2.65,2.65,0,0,1,.32,3.64,5.7,5.7,0,0,1-.69.7Q103.75,61,92.11,71.82a2.62,2.62,0,0,1-1.31.87c-.35-.89.36-1.23.8-1.65,2.58-2.45,5.19-4.86,7.82-7.26,1.21-1.11,2.45-2.12,2.2-4.16-.09-.75.27-1.54.21-2.35a17.4,17.4,0,0,1-.27,2.71c-.07.34-.1.78-.59.8s-.68-.28-.88-.67c-.65-1.23-.88-1.30-1.83-.44-3.08,2.82-6.11,5.68-9.2,8.49C88.59,68.59,88.19,69.33,87.27,68.91Z" transform="translate(-9.76 -26.65)"/>
              <path className="fill-[#e94446]" d="M87.27,68.91q5.6-5.18,11.19-10.33c.4-.37.74-1.09,1.4-.8s.71,1.14.76,1.83c0,.25.09.49.21,1.11a4.57,4.57,0,0,0,.16-3.27c-.43-1.24.4-1.63,1-2.12.49-.37.51.18.55.50a8.93,8.93,0,0,1-.33,3.54c-.09.31-.4.65-.17,1,1,1.31,0,1.85-.67,2.5L90.8,72.69a2.42,2.42,0,0,1-3-.75A2.38,2.38,0,0,1,87.27,68.91Z" transform="translate(-9.76 -26.65)"/>
              <path className="fill-[#e94446]" d="M79.57,60.28l23.22-21.54c-1.21-.51-1.66.25-2.45.67l-.28-4.79c-.47-.09-.65.24-.87.45Q88.32,45.12,77.48,55.19c-1,.92-1.09,3.88-.2,5.06-2-1.17-2.34-3-.82-4.46,2.58-2.46,5.21-4.86,7.82-7.29L106.36,28a8.48,8.48,0,0,1,1.11-1,2.84,2.84,0,0,1,3.8,4a7.83,7.83,0,0,1-1,1L81,59.18A3.8,3.8,0,0,1,79.57,60.28Z" transform="translate(-9.76 -26.65)"/>
              <text className="text-[#282828] text-[52.25px] font-bold" style={{ fontFamily: 'Helvetica' }} transform="translate(872.46 58.2) scale(1.18 1)">™</text>
            </svg>
          </Link>

          {/* Navigation - desktop: Productos, Soluciones, Precios + mega-menus */}
          <nav
            className="hidden md:flex items-center gap-0.5"
            onMouseLeave={scheduleCloseMega}
          >
            <div className="relative flex items-center">
              <div
                className="relative"
                onMouseEnter={() => openMegaImmediate("productos")}
              >
                <button
                  type="button"
                  className={`${navItemBase} ${openMega === "productos" || pathname === "/marketplace" ? navItemActive : navItemHover}`}
                  aria-expanded={openMega === "productos"}
                  aria-haspopup="true"
                >
                  Productos
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openMega === "productos" ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {openMega === "productos" && (
                  <div className={megaPanelClass} onMouseEnter={clearMegaTimeout}>
                    <div className="p-3 grid gap-0">
                      {PRODUCTOS_ITEMS.map((item) => (
                        <Link
                          key={item.href + item.title}
                          href={item.href}
                          className="flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/80"
                        >
                          <item.icon className="w-5 h-5 shrink-0 text-[#e94446] mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="relative flex items-center">
              <div
                className="relative"
                onMouseEnter={() => openMegaImmediate("soluciones")}
              >
                <button
                  type="button"
                  className={`${navItemBase} ${openMega === "soluciones" || pathname === "/instalacion-de-soportes" ? navItemActive : navItemHover}`}
                  aria-expanded={openMega === "soluciones"}
                  aria-haspopup="true"
                >
                  Soluciones
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openMega === "soluciones" ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {openMega === "soluciones" && (
                  <div className={megaPanelClass} onMouseEnter={clearMegaTimeout}>
                    <div className="p-3 grid gap-0">
                      {SOLUCIONES_ITEMS.map((item) => (
                        <Link
                          key={item.href + item.title}
                          href={item.href}
                          className="flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/80"
                        >
                          <item.icon className="w-5 h-5 shrink-0 text-[#e94446] mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/precios"
              className={`${navItemBase} ${pathname === "/precios" ? navItemActive : navItemHover}`}
            >
              Precios
            </Link>
          </nav>
          </div>

          {/* Navigation - mobile (hamburger + sheet) */}
          <div className="md:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-1 pt-4">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">Productos</div>
                  {PRODUCTOS_ITEMS.map((item) => (
                    <Link key={item.title} href={item.href} className="px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileNavOpen(false)}>
                      <span className="font-medium">{item.title}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{item.description}</span>
                    </Link>
                  ))}
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2 mt-2">Soluciones</div>
                  {SOLUCIONES_ITEMS.map((item) => (
                    <Link key={item.title} href={item.href} className="px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileNavOpen(false)}>
                      <span className="font-medium">{item.title}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{item.description}</span>
                    </Link>
                  ))}
                  <Link href="/precios" className="px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileNavOpen(false)}>Precios</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative z-50" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#e94446]/30"
                  aria-label="Menú de usuario"
                >
                  <Avatar className="h-8 w-8 shrink-0 ring-1 ring-gray-200 dark:ring-gray-700">
                    <AvatarImage src={user?.avatar_url || user?.image_url || user?.picture} alt={userName} />
                    <AvatarFallback className="bg-[#e94446] text-white text-xs font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[#e94446] font-medium max-w-[35ch] truncate hidden sm:inline" title={userName}>{userName}</span>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-950 rounded-md shadow-lg py-1 z-[60] border border-gray-200 dark:border-gray-800">
                    {/* Selector de vista (Owner / Cliente) - disponible para todos los usuarios */}
                    <div className="px-4 py-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Vista del dashboard</div>
                      <div className="w-full rounded-full border border-[#e94446] p-1 flex">
                        <button
                          type="button"
                          onClick={() => goToDashboard("owner")}
                          className={`flex-1 text-sm font-medium rounded-full py-1.5 transition-colors ${
                            dashboardView === "owner"
                              ? "bg-[#e94446] text-white"
                              : "bg-white dark:bg-gray-900 text-[#e94446] hover:bg-[#e94446]/5"
                          }`}
                        >
                          Owner
                        </button>
                        <button
                          type="button"
                          onClick={() => goToDashboard("cliente")}
                          className={`flex-1 text-sm font-medium rounded-full py-1.5 transition-colors ${
                            dashboardView === "cliente"
                              ? "bg-[#e94446] text-white"
                              : "bg-white dark:bg-gray-900 text-[#e94446] hover:bg-[#e94446]/5"
                          }`}
                        >
                          Cliente
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 my-1" />
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Mi cuenta
                    </Link>
                    <Link
                      href={dashboardView === "owner" ? "/panel/owner/inicio" : "/panel/cliente/inicio"}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-3" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {!user && !loading && (
              <div className="flex items-center gap-2">
                <Link
                  href="/contact"
                  className="hidden sm:inline-flex px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Contacto
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Acceder
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 rounded-full border-2 border-[#e94446] bg-[#e94446] text-white font-medium hover:bg-[#d63a3a] transition-colors flex items-center gap-1.5 text-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
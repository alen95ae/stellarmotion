"use client"
import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, User, Heart, Settings, LogOut, BarChart3, Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { logout } from "@/app/account/actions"

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ownerData, setOwnerData] = useState<any>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  
  // Crear cliente una sola vez usando useMemo
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Timeout de seguridad: si loading tarda más de 2 segundos, forzar false
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Header: Timeout de seguridad - forzando loading = false');
        setLoading(false);
      }
    }, 2000);

    const loadSessionAndOwner = async () => {
      try {
        console.log('🔍 Header: Obteniendo sesión...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('❌ Header: Error getting session:', error);
          setUser(null);
          setOwnerData(null);
        } else if (session?.user) {
          console.log('✅ Header: Usuario obtenido:', session.user.email || 'null');
          setUser(session.user);
          
          // Cargar datos del owner si existe
          try {
            const { data: owner, error: ownerError } = await supabase
              .from('owners')
              .select('empresa, tipo_empresa')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (!isMounted) return;
            
            if (ownerError) {
              console.error('❌ Header: Error loading owner data:', ownerError);
              setOwnerData(null);
            } else {
              console.log('✅ Header: Owner data loaded:', owner);
              console.log('📋 Header: Owner empresa:', owner?.empresa, 'tipo_empresa:', owner?.tipo_empresa);
              setOwnerData(owner);
            }
          } catch (err) {
            console.error('❌ Header: Error en consulta owner:', err);
            setOwnerData(null);
          }
        } else {
          console.log('ℹ️ Header: No hay sesión activa');
          setUser(null);
          setOwnerData(null);
        }
      } catch (error) {
        console.error('❌ Header: Error getting session:', error);
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

    loadSessionAndOwner();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Header: Auth state changed:', event, session?.user?.email || 'null');
      
      if (!isMounted) return;

      setUser(session?.user ?? null);
      
      // Si hay usuario, obtener datos del owner
      if (session?.user) {
        try {
          const { data: owner, error: ownerError } = await supabase
            .from('owners')
            .select('empresa, tipo_empresa')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (!isMounted) return;
          
          if (ownerError) {
            console.error('❌ Header: Error loading owner data (auth change):', ownerError);
            setOwnerData(null);
          } else {
            console.log('✅ Header: Owner data loaded (auth change):', owner);
            console.log('📋 Header: Owner empresa:', owner?.empresa, 'tipo_empresa:', owner?.tipo_empresa);
            setOwnerData(owner);
          }
        } catch (err) {
          console.error('❌ Header: Error en consulta owner (auth change):', err);
          setOwnerData(null);
        }
      } else {
        setOwnerData(null);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase])

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
    setLoading(false)
    
    // Cerrar sesión en el cliente - esto disparará onAuthStateChange
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error al cerrar sesión:', error)
      // Si hay error, restaurar el estado (aunque no debería pasar)
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
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
    return user?.user_metadata?.nombre_contacto || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'
  }, [ownerData, user])
  
  // Intentar obtener el rol de diferentes lugares
  const getUserRole = () => {
    if (!user) return undefined
    
    // Intentar desde user_metadata.role
    if (user.user_metadata?.role) {
      return user.user_metadata.role
    }
    
    // Intentar desde user_metadata.rol (sin 'e')
    if (user.user_metadata?.rol) {
      return user.user_metadata.rol
    }
    
    // Intentar desde app_metadata
    if (user.app_metadata?.role) {
      return user.app_metadata.role
    }
    
    return undefined
  }
  
  // Obtener el rol del usuario para determinar la ruta del dashboard
  const userRole = getUserRole()
  
  // Log para debug
  useEffect(() => {
    if (user) {
      console.log('👤 User data:', {
        email: user.email,
        role: userRole,
        metadata: user.user_metadata,
        rawMetadata: JSON.stringify(user.user_metadata, null, 2)
      })
    }
  }, [user, userRole])
  
  const getDashboardPath = () => {
    const path = (() => {
      switch (userRole) {
        case 'admin':
          return '/panel/inicio'
        case 'owner':
          return '/panel/inicio' // Dashboard completo con sidebar
        case 'seller':
          return '/panel/inicio' // Usar panel para seller también
        case 'client':
          return '/' // Home para client
        default:
          return '/panel/inicio' // Por defecto, panel de inicio
      }
    })()
    console.log('🔍 Dashboard path:', path, 'for role:', userRole || 'undefined')
    return path
  }
  
  const dashboardPath = getDashboardPath()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 w-full m-0 p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full m-0">
        <div className="flex items-center justify-between h-16 w-full m-0">
          {/* Logo */}
          <Link href="/" aria-label="Inicio" className="flex items-center">
            <svg className="w-40 h-8" viewBox="0 0 934.1 167.24">
              <text className="text-[#282828] text-[109.26px] font-semibold font-['Poppins']" transform="translate(126.63 102.45) scale(1.02 1)">StellarMotion</text>
              <path className="fill-[#e94446]" d="M54.91,103.2H61.5c.22,3.23.42,6.23.58,8.51L76.24,96.26H9.76V90.6c7.87-2.82,16-4.58,23-8.46C45.8,74.82,52.36,62.56,54.7,48c.79-5,.77-5,6.74-4V82.86C58.81,81.51,56,81,55.2,79.44c-1-1.93-.45-4.71-.5-5.69l-14.13,15H107v6.13c-6.74,2-13.59,3.21-19.62,6.1-14.87,7.11-22.54,19.8-25.22,35.74-.41,2.46,0,5.19-3.94,5-4.16-.16-3.29-3.08-3.3-5.43C54.88,125.41,54.91,114.53,54.91,103.2Z" transform="translate(-9.76 -26.65)"/>
              <path className="fill-[#e94446]" d="M79.57,60.28a1.94,1.94,0,0,1-2.29,0A3.38,3.38,0,0,1,77,55.44c2.87-2.69,5.76-5.36,8.64-8q6.77-6.27,13.53-12.52c.3-.28.52-.88,1.09-.6s.47.89.48,1.4c0,1.1.13,2.07,1.59,2.31.56.1.74.61.26,1.06l-.36.34-22,20.38A1.58,1.58,0,0,1,79.57,60.28Z" transform="translate(-9.76 -26.65)"/>
              <path className="fill-[#e94446]" d="M87.27,68.91a2.62,2.62,0,0,1,1-1.25Q99.9,56.83,111.58,46c1.46-1.36,2.93-1.38,4.15-.1a2.65,2.65,0,0,1,.32,3.64,5.7,5.7,0,0,1-.69.7Q103.75,61,92.11,71.82a2.62,2.62,0,0,1-1.31.87c-.35-.89.36-1.23.8-1.65,2.58-2.45,5.19-4.86,7.82-7.26,1.21-1.11,2.45-2.12,2.2-4.16-.09-.75.27-1.54.21-2.35a17.4,17.4,0,0,1-.27,2.71c-.07.34-.1.78-.59.8s-.68-.28-.88-.67c-.65-1.23-.88-1.30-1.83-.44-3.08,2.82-6.11,5.68-9.2,8.49C88.59,68.59,88.19,69.33,87.27,68.91Z" transform="translate(-9.76 -26.65)"/>
              <path className="fill-[#e94446]" d="M87.27,68.91q5.6-5.18,11.19-10.33c.4-.37.74-1.09,1.4-.8s.71,1.14.76,1.83c0,.25.09.49.21,1.11a4.57,4.57,0,0,0,.16-3.27c-.43-1.24.4-1.63,1-2.12.49-.37.51.18.55.50a8.93,8.93,0,0,1-.33,3.54c-.09.31-.4.65-.17,1,1,1.31,0,1.85-.67,2.5L90.8,72.69a2.42,2.42,0,0,1-3-.75A2.38,2.38,0,0,1,87.27,68.91Z" transform="translate(-9.76 -26.65)"/>
              <path className="fill-[#e94446]" d="M79.57,60.28l23.22-21.54c-1.21-.51-1.66.25-2.45.67l-.28-4.79c-.47-.09-.65.24-.87.45Q88.32,45.12,77.48,55.19c-1,.92-1.09,3.88-.2,5.06-2-1.17-2.34-3-.82-4.46,2.58-2.46,5.21-4.86,7.82-7.29L106.36,28a8.48,8.48,0,0,1,1.11-1,2.84,2.84,0,0,1,3.8,4a7.83,7.83,0,0,1-1,1L81,59.18A3.8,3.8,0,0,1,79.57,60.28Z" transform="translate(-9.76 -26.65)"/>
              <text className="text-[#282828] text-[52.25px] font-bold font-['Helvetica']" transform="translate(872.46 58.2) scale(1.18 1)">™</text>
            </svg>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/buscar-un-espacio" 
              className={`hover:text-gray-900 transition-colors ${
                pathname === '/buscar-un-espacio' ? 'text-[#D7514C] font-medium' : 'text-gray-600'
              }`}
            >
              Buscar un espacio
            </Link>
            <Link 
              href="/publicar-espacio" 
              className={`hover:text-gray-900 transition-colors ${
                pathname === '/publicar-espacio' ? 'text-[#D7514C] font-medium' : 'text-gray-600'
              }`}
            >
              Publicar mi espacio
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative z-50" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  aria-label="Menú de usuario"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[#e94446] font-medium">{userName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[60] border border-gray-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('✅ Dashboard clicked!')
                        console.log('📍 Dashboard path:', dashboardPath)
                        console.log('👤 User role:', userRole)
                        setIsUserMenuOpen(false)
                        setTimeout(() => {
                          router.push(dashboardPath)
                        }, 100)
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left cursor-pointer"
                      role="menuitem"
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      Dashboard
                    </button>
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Mi cuenta
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  href="/login"
                  className="px-4 py-1.5 rounded-full border border-gray-300 bg-white text-black font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/owners/registrarse"
                  className="px-4 py-1.5 rounded-full border-2 border-[#e94446] bg-white text-[#e94446] font-medium hover:bg-[#e94446]/5 transition-colors flex items-center gap-1.5 text-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
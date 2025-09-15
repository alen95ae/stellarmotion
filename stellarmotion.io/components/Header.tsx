"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Search, User, Calendar, Heart, Settings, LogOut, BarChart3, Megaphone } from "lucide-react"

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                aria-label="Menú de usuario"
              >
                <User className="w-5 h-5" />
                <span className="text-red-500">alen95ae</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 border border-gray-200">
                  <Link
                    href="/panel/inicio"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Dashboard
                  </Link>
                  <Link
                    href="/panel/anuncios"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Megaphone className="w-4 h-4 mr-3" />
                    Anuncios
                  </Link>
                  <Link
                    href="/mi-cuenta"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Mi cuenta
                  </Link>
                  <Link
                    href="/favoritos"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Heart className="w-4 h-4 mr-3" />
                    Favoritos
                  </Link>
                  <Link
                    href="/calendar"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    Calendar
                  </Link>
                  <Link
                    href="/bookings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    Bookings
                  </Link>
                  <Link
                    href="/ajustes"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Ajustes
                  </Link>
                  <Link
                    href="/logout"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Desconectar
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/stellarads"
              className="hover:opacity-90 transition-opacity"
            >
              <svg className="h-8" viewBox="0 0 863.66 238.5">
                <defs>
                  <style>{`.cls-1,.cls-3{fill:#fff;}.cls-2{fill:#e94446;}.cls-3{font-size:109.26px;font-family:Poppins-SemiBold, Poppins;font-weight:600;}`}</style>
                </defs>
                <rect className="cls-2" width="863.66" height="238.5" rx="80.4"/>
                <text className="cls-3" transform="translate(196.35 158.59) scale(1.02 1)">StellarAds</text>
                <path className="cls-1" d="M114.87,132.69h6.58c.22,3.24.43,6.24.59,8.52l14.15-15.45H69.72V120.1c7.87-2.82,16-4.59,22.94-8.47,13.1-7.31,19.66-19.57,22-34.18.8-5,.77-5,6.75-4v38.92c-2.64-1.35-5.41-1.87-6.24-3.42-1-1.93-.46-4.72-.51-5.7l-14.12,15H167v6.13c-6.74,2-13.59,3.21-19.62,6.09-14.86,7.12-22.53,19.81-25.22,35.75-.41,2.45,0,5.19-3.94,5-4.15-.16-3.28-3.08-3.3-5.43C114.83,154.9,114.87,144,114.87,132.69Z"/>
                <path className="cls-1" d="M138.9,91.43a2,2,0,0,1-2.3,0,3.4,3.4,0,0,1-.26-4.81q4.32-4,8.65-8,6.75-6.27,13.52-12.52c.3-.28.53-.88,1.09-.6s.48.89.49,1.4c0,1.1.13,2.07,1.59,2.31.56.1.74.61.26,1.06l-.36.33-22,20.39A1.64,1.64,0,0,1,138.9,91.43Z"/>
                <path className="cls-1" d="M146.6,100.06a2.54,2.54,0,0,1,1-1.25L170.9,77.17c1.47-1.36,2.94-1.38,4.16-.1a2.65,2.65,0,0,1,.32,3.64,5.7,5.7,0,0,1-.69.7L151.44,103a2.67,2.67,0,0,1-1.31.87c-.35-.89.36-1.23.8-1.65,2.58-2.45,5.19-4.86,7.81-7.26,1.22-1.11,2.46-2.12,2.21-4.16-.1-.75.27-1.54.21-2.35a17.4,17.4,0,0,1-.27,2.71c-.07.34-.1.78-.59.8s-.68-.28-.88-.67c-.65-1.23-.88-1.3-1.83-.44-3.08,2.82-6.11,5.68-9.2,8.49C147.92,99.74,147.52,100.48,146.6,100.06Z"/>
                <path className="cls-1" d="M146.6,100.06q5.58-5.18,11.19-10.33c.4-.37.74-1.1,1.4-.81s.71,1.15.76,1.84c0,.25.09.49.21,1.11a4.63,4.63,0,0,0,.16-3.27c-.43-1.24.4-1.63,1-2.12.49-.37.51.18.55.5a8.76,8.76,0,0,1-.34,3.54c-.09.31-.39.65-.16,1,1,1.31,0,1.85-.68,2.5q-5.29,4.95-10.6,9.87a2.42,2.42,0,0,1-3-.75A2.38,2.38,0,0,1,146.6,100.06Z"/>
                <path className="cls-1" d="M138.9,91.43l23.22-21.54c-1.22-.51-1.66.25-2.45.67l-.28-4.79c-.48-.09-.65.24-.88.45L136.8,86.34c-1,.92-1.08,3.88-.2,5.06-2-1.17-2.33-3-.81-4.47,2.58-2.45,5.21-4.85,7.82-7.28l22.07-20.46a9.18,9.18,0,0,1,1.11-1,2.85,2.85,0,0,1,3.81,4,7.83,7.83,0,0,1-.95,1Q155,76.76,140.36,90.33A3.7,3.7,0,0,1,138.9,91.43Z"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
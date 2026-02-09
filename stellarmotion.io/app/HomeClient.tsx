'use client';

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Heart, Eye, Ruler, Building, Globe, Lightbulb, Calendar, Monitor, DollarSign, Megaphone, Home, TvMinimal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import SearchBarGooglePlaces from "@/components/SearchBarGooglePlaces"
import { CATEGORIES } from "@/lib/categories"
import CategoryIcon from "@/components/CategoryIcon"
import PlatformAnalyticsSection from "@/components/PlatformAnalyticsSection"
import OccupationTimelineSection from "@/components/OccupationTimelineSection"
// Los productos destacados se cargarán dinámicamente desde la API

export default function HomeClient() {
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  // Mostrar SIEMPRE las 8 categorías originales del carrusel
  const categoryList = CATEGORIES
  const [featuredSoportes, setFeaturedSoportes] = useState<any[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Cargar soportes destacados desde la API
  useEffect(() => {
    const fetchFeaturedSoportes = async () => {
      try {
        setLoadingFeatured(true)
        // Buscar soportes destacados
        const response = await fetch('/api/soportes?limit=6')
        if (response.ok) {
          const data = await response.json()
          // Filtrar soportes destacados o tomar los primeros disponibles
          const soportes = data.soportes || []
          const destacados = soportes.filter((s: any) => s.destacado || s.featured)
          setFeaturedSoportes(destacados.length > 0 ? destacados.slice(0, 6) : soportes.slice(0, 6))
        }
      } catch (error) {
        console.error('Error fetching featured soportes:', error)
      } finally {
        setLoadingFeatured(false)
      }
    }

    fetchFeaturedSoportes()
  }, [])

  // Categories are now loaded using the useCategories hook

  // Función para obtener el estado de disponibilidad
  const getAvailabilityStatus = (status: string, available?: boolean) => {
    // Normalizar el estado a minúsculas
    const normalizedStatus = (status || '').toLowerCase().trim();
    
    // Evaluar el estado directamente, sin depender de 'available'
    switch (normalizedStatus) {
      case 'disponible':
        return {
          text: 'Disponible',
          className: 'bg-green-500 text-white'
        };
      case 'reservado':
        return {
          text: 'Reservado',
          className: 'bg-yellow-500 text-white'
        };
      case 'ocupado':
        return {
          text: 'Ocupado',
          className: 'bg-red-500 text-white'
        };
      case 'mantenimiento':
        return {
          text: 'Mantenimiento',
          className: 'bg-orange-500 text-white'
        };
      default:
        // Si no hay estado o no coincide, usar 'available' como fallback
        if (available === false) {
          return {
            text: 'No disponible',
            className: 'bg-gray-500 text-white'
          };
        }
        return {
          text: status || 'Disponible',
          className: 'bg-gray-500 text-white'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Main Content */}
      <main className="w-full">
        {/* Hero superior - ocupa toda la primera pantalla */}
        <section className="relative min-h-[100vh] min-h-[100dvh] flex flex-col justify-center overflow-hidden border-b border-gray-200 dark:border-gray-800">
          {/* Cuadrícula sutil tipo ejemplo (líneas finas gris claro) */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
            aria-hidden
          />
          {/* Dark mode: grid más suave */}
          <div
            className="absolute inset-0 z-0 dark:block hidden"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
            aria-hidden
          />
          {/* Gradiente rojizo muy sutil (#e94446) */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 0%, rgba(233, 68, 70, 0.06) 0%, transparent 55%),
                radial-gradient(ellipse 60% 40% at 80% 60%, rgba(233, 68, 70, 0.03) 0%, transparent 50%)
              `,
            }}
            aria-hidden
          />
          {/* Transición suave al contenido inferior */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/70 via-transparent to-gray-50 dark:from-gray-950/80 dark:via-transparent dark:to-gray-950" aria-hidden />
          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                La infraestructura del marketplace publicitario físico
              </h1>
              <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 sm:mt-6 sm:text-xl lg:text-2xl max-w-2xl">
                Conectamos espacios, propietarios y anunciantes en una única plataforma para publicidad exterior (OOH y DOOH).
              </p>
              <div className="mt-8 flex flex-wrap gap-4 sm:mt-10">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center rounded-full h-11 px-8 text-sm font-medium bg-[#e94446] text-white hover:bg-[#d63a3a] transition-all duration-150 active:scale-[0.98]"
                >
                  Explorar marketplace
                </Link>
                <Link
                  href="/instalacion-de-soportes"
                  className="inline-flex items-center justify-center rounded-full h-11 px-8 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Monetizar mi espacio
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contenido existente de la home */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Categorías</h2>
              <p className="text-gray-600">Explora las categorías mas populares.</p>
            </div>
          </div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCarousel("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Categorías anteriores"
              aria-controls="categories-carousel"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Categories Carousel */}
            <div
              ref={carouselRef}
              id="categories-carousel"
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {(
                categoryList.map((category) => (
                  <div
                    key={category.slug}
                    className="flex-shrink-0 snap-start w-24 text-center group cursor-pointer"
                    onClick={() => router.push(`/buscar-un-espacio?category=${category.slug}`)}
                  >
                    <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-white shadow-sm group-hover:shadow-md transition-shadow border border-gray-100">
                      <CategoryIcon type={category.iconKey} className="w-12 h-12" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{category.label}</span>
                  </div>
                ))
              )}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCarousel("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Siguientes categorías"
              aria-controls="categories-carousel"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Buscador debajo de los iconos de categorías */}
          <div className="mt-10">
            <SearchBarGooglePlaces />
          </div>
        </section>

        {/* Featured Spaces Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Espacios destacados</h2>
              <p className="text-gray-600">Consulta nuestros soportes publicitarios más valorados y con mayor alcance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {loadingFeatured ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-[150px] bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : featuredSoportes.length === 0 ? (
              // No featured soportes message
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No hay soportes destacados disponibles en este momento.</p>
              </div>
            ) : (
              featuredSoportes.map((soporte) => {
                const status = getAvailabilityStatus(soporte.status || soporte.estado, soporte.available);
                // Usar siempre el ID del soporte, no el slug
                const soporteId = soporte.id;
                const handleClick = () => {
                  if (soporteId && soporteId !== 'null') {
                    console.log('🔗 Navegando a soporte con ID:', soporteId);
                    router.push(`/product/${soporteId}`);
                  } else {
                    console.warn('⚠️ ID de soporte inválido:', soporteId, soporte);
                  }
                };

                return (
                  <div
                    key={soporte.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative cursor-pointer" onClick={handleClick}>
                      <img
                        src={(Array.isArray(soporte.images) ? soporte.images[0] : soporte.images) || '/placeholder.svg'}
                        alt={soporte.title || soporte.nombre}
                        className="w-full h-[150px] object-cover"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {(() => {
                          const estadoRaw = soporte.status || soporte.estado;
                          // Debug: ver qué valores están llegando
                          if (process.env.NODE_ENV === 'development') {
                            console.log('🔍 Estado del soporte:', {
                              id: soporte.id,
                              status: estadoRaw,
                              estado: soporte.estado,
                              available: soporte.available
                            });
                          }
                          const status = getAvailabilityStatus(estadoRaw, soporte.available);
                          return (
                            <span className={`${status.className} text-xs font-medium px-2 py-1 rounded-full`}>
                              {status.text}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg line-clamp-2">{soporte.title || soporte.nombre}</h3>
                      
                      {/* Características con iconos - 2 columnas */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {/* Tipo */}
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                            <Building className="w-2.5 h-2.5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 truncate">Tipo</p>
                            <p className="text-xs font-medium text-gray-900 truncate">{soporte.type || soporte.tipo}</p>
                          </div>
                        </div>
                        
                        {/* Iluminación */}
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className={`w-2.5 h-2.5 ${(soporte.lighting || soporte.iluminacion) ? 'text-yellow-500' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 truncate">Iluminación</p>
                            <p className="text-xs font-medium text-gray-900 truncate">{(soporte.lighting || soporte.iluminacion) ? 'Sí' : 'No'}</p>
                          </div>
                        </div>
                        
                        {/* Medidas */}
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                            <Ruler className="w-2.5 h-2.5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 truncate">Medidas</p>
                            <p className="text-xs font-medium text-gray-900 truncate">{soporte.dimensions || soporte.dimensiones || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Ciudad */}
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-2.5 h-2.5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 truncate">Ciudad</p>
                            <p className="text-xs font-medium text-gray-900 truncate">{soporte.city || soporte.ciudad || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-[#e94446]">${(soporte.pricePerMonth || soporte.precio || 0).toLocaleString()}</span>
                          <span className="text-gray-600 text-xs"> / mes</span>
                        </div>
                        <button
                          onClick={handleClick}
                          className="flex items-center px-3 py-1.5 rounded-lg text-sm bg-[#e94446] text-white font-medium hover:bg-[#D7514C] transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Popular Cities Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Explora ciudades populares</h2>
              <p className="text-gray-600">Descubre soportes publicitarios en las principales ciudades</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Nueva York */}
            <div
              className="relative h-64 rounded-2xl overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-300 shadow-lg"
              onClick={() => router.push('/buscar-un-espacio?q=Nueva York&lat=40.7128&lng=-74.0060&loc=Nueva York, Estados Unidos&locationType=locality')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
                <img
                  src="/new_york_billboards.jpg"
                  alt="Nueva York"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Nueva York</h3>
                <p className="text-white/90 text-sm">Estados Unidos</p>
              </div>
            </div>

            {/* Los Ángeles */}
            <div
              className="relative h-64 rounded-2xl overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-300 shadow-lg"
              onClick={() => router.push('/buscar-un-espacio?q=Los Angeles&lat=34.0522&lng=-118.2437&loc=Los Angeles, Estados Unidos&locationType=locality')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500">
                <img
                  src="/los-angeles-billboars.jpg"
                  alt="Los Ángeles"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Los Ángeles</h3>
                <p className="text-white/90 text-sm">Estados Unidos</p>
              </div>
            </div>

            {/* Miami */}
            <div
              className="relative h-64 rounded-2xl overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-300 shadow-lg"
              onClick={() => router.push('/buscar-un-espacio?q=Miami&lat=25.7617&lng=-80.1918&loc=Miami, Estados Unidos&locationType=locality')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-red-500">
                <img
                  src="/miami-billboards.png"
                  alt="Miami"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Miami</h3>
                <p className="text-white/90 text-sm">Estados Unidos</p>
              </div>
            </div>

            {/* Madrid */}
            <div
              className="relative h-64 rounded-2xl overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-300 shadow-lg"
              onClick={() => router.push('/buscar-un-espacio?q=Madrid&lat=40.4168&lng=-3.7038&loc=Madrid, España&locationType=locality')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600">
                <img
                  src="/madrid_billboards.png"
                  alt="Madrid"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Madrid</h3>
                <p className="text-white/90 text-sm">España</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Cómo funciona</h2>
              <p className="text-gray-600">Descubre cómo StellarMotion simplifica la publicidad exterior</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Encuentra rápido */}
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Encuentra rápido</h3>
              <p className="text-gray-600 leading-relaxed">
                Localiza soportes publicitarios en tu zona con búsquedas inteligentes
              </p>
            </div>

            {/* Reserva fácil */}
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Alquiler fácil</h3>
              <p className="text-gray-600 leading-relaxed">
                Gestiona tus alquileres de soportes de forma sencilla y rápida
              </p>
            </div>

            {/* Gana dinero */}
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gana dinero</h3>
              <p className="text-gray-600 leading-relaxed">
                Publica tus soportes y genera ingresos extra
              </p>
            </div>
          </div>
        </section>

        <PlatformAnalyticsSection />

        <OccupationTimelineSection />

        {/* Blog Section */}
        <section className="mb-16 mt-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Visita nuestro blog</h2>
              <p className="text-gray-600">Descubre las últimas tendencias y consejos sobre publicidad exterior</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Blog Post 1 */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src="/placeholder.svg"
                    alt="Blog post"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">15 Enero 2024</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">5 min lectura</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  Cómo elegir el mejor soporte publicitario para tu campaña
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  Descubre los factores clave a considerar al seleccionar soportes publicitarios que maximicen el impacto de tu marca y alcancen a tu audiencia objetivo.
                </p>
                <button className="text-[#e94446] font-medium text-sm hover:underline">
                  Leer más →
                </button>
              </div>
            </article>

            {/* Blog Post 2 */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src="/placeholder.svg"
                    alt="Blog post"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">10 Enero 2024</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">4 min lectura</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  Tendencias en publicidad exterior para 2024
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  Explora las últimas innovaciones y tendencias que están transformando el mundo de la publicidad exterior, desde pantallas digitales hasta integración con tecnología móvil.
                </p>
                <button className="text-[#e94446] font-medium text-sm hover:underline">
                  Leer más →
                </button>
              </div>
            </article>

            {/* Blog Post 3 */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src="/placeholder.svg"
                    alt="Blog post"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">5 Enero 2024</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">6 min lectura</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  Maximiza el ROI de tu inversión en publicidad outdoor
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  Aprende estrategias efectivas para medir y mejorar el retorno de inversión de tus campañas de publicidad exterior, optimizando ubicaciones y formatos.
                </p>
                <button className="text-[#e94446] font-medium text-sm hover:underline">
                  Leer más →
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16 mt-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Contrata publicidad exterior */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#e94446]/10 rounded-2xl flex items-center justify-center mb-6">
                <Megaphone className="w-10 h-10 text-[#e94446]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Contrata publicidad exterior</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-base max-w-md">
                Encuentra los mejores espacios publicitarios para tu marca. Contratar publicidad outdoor nunca fue tan sencillo y efectivo.
              </p>
              <button
                onClick={() => router.push('/buscar-un-espacio')}
                className="px-6 py-3 bg-[#e94446] hover:bg-[#d63a3a] text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Buscar soportes
              </button>
            </div>

            {/* Conviértete en Owner */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#e94446]/10 rounded-2xl flex items-center justify-center mb-6">
                <TvMinimal className="w-10 h-10 text-[#e94446]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Conviértete en Owner</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-base max-w-md">
                Gana dinero con tu terreno o espacio. Arrienda publicidad y maximiza el valor de tus propiedades con nuestra plataforma.
              </p>
              <button
                onClick={async () => {
                  // Verificar si hay sesión
                  try {
                    const sessionRes = await fetch('/api/auth/session');
                    if (sessionRes.ok) {
                      const sessionData = await sessionRes.json();
                      if (sessionData.success) {
                        router.push('/owner/paso-2');
                        return;
                      }
                    }
                  } catch (err) {
                    // Si hay error, redirigir a registro
                  }
                  // Si no hay sesión, llevar a registro (sign up)
                  router.push('/auth/register');
                }}
                className="px-6 py-3 bg-[#e94446] hover:bg-[#d63a3a] text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Registro Owner
              </button>
            </div>
          </div>
        </section>
        </div>
      </main>
    </div>
  )
}

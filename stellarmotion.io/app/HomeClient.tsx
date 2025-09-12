'use client';

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Heart, Eye, Ruler, Building, Globe, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PartnersSection } from "@/components/PartnersSection"
import SearchBar from "@/components/SearchBar"
import { useCategories } from "@/hooks/useCategories"
import { CATEGORIES } from "@/lib/categories"
import CategoryIcon from "@/components/CategoryIcon"
// Los productos destacados se cargarán dinámicamente desde la API

export default function HomeClient() {
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { categories, loading, error: categoriesError } = useCategories()
  const [featuredSpaces, setFeaturedSpaces] = useState<any[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const featuredCarouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const scrollFeaturedCarousel = (direction: "left" | "right") => {
    if (featuredCarouselRef.current) {
      const scrollAmount = featuredCarouselRef.current.clientWidth * 0.8
      featuredCarouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Cargar productos destacados desde la API
  useEffect(() => {
    const fetchFeaturedSpaces = async () => {
      try {
        setLoadingFeatured(true)
        const response = await fetch('/api/products?featured=true&limit=6')
        if (response.ok) {
          const data = await response.json()
          setFeaturedSpaces(data)
        } else {
          // Si no hay productos destacados, tomar los primeros 6 disponibles
          const responseAll = await fetch('/api/products?limit=6')
          if (responseAll.ok) {
            const dataAll = await responseAll.json()
            setFeaturedSpaces(dataAll)
          }
        }
      } catch (error) {
        console.error('Error fetching featured spaces:', error)
      } finally {
        setLoadingFeatured(false)
      }
    }

    fetchFeaturedSpaces()
  }, [])

  // Categories are now loaded using the useCategories hook

  // Función para obtener el estado de disponibilidad
  const getAvailabilityStatus = (status: string, available: boolean) => {
    if (!available) {
      return {
        text: 'No disponible',
        className: 'bg-gray-500 text-white'
      };
    }

    switch (status?.toUpperCase()) {
      case 'DISPONIBLE':
        return {
          text: 'Disponible',
          className: 'bg-green-500 text-white'
        };
      case 'RESERVADO':
        return {
          text: 'Reservado',
          className: 'bg-yellow-500 text-white'
        };
      case 'OCUPADO':
        return {
          text: 'Ocupado',
          className: 'bg-red-500 text-white'
        };
      default:
        return {
          text: 'Disponible',
          className: 'bg-green-500 text-white'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-2">
        {/* Search Section */}
        <div className="mb-16">
          <SearchBar />
        </div>

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
              {loading ? (
                // Loading skeleton
                [...Array(8)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 snap-start w-24 text-center">
                    <div className="w-20 h-20 mx-auto mb-3 bg-gray-200 rounded-2xl animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))
              ) : (
                categories.map((category) => (
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
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reserva fácil</h3>
              <p className="text-gray-600 leading-relaxed">
                Gestiona tus reservas de soportes de forma sencilla y rápida
              </p>
            </div>

            {/* Gana dinero */}
            <div className="text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
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

        {/* Featured Spaces Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Espacios destacados</h2>
              <p className="text-gray-600">Consulta nuestros soportes publicitarios más valorados y con mayor alcance.</p>
            </div>
          </div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollFeaturedCarousel("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Espacios anteriores"
              aria-controls="featured-carousel"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Featured Spaces Carousel */}
            <div 
              ref={featuredCarouselRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {loadingFeatured ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 snap-start w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : featuredSpaces.length === 0 ? (
                // No featured spaces message
                <div className="flex-shrink-0 w-full text-center py-12">
                  <p className="text-gray-500">No hay espacios destacados disponibles en este momento.</p>
                </div>
              ) : (
                featuredSpaces.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 snap-start w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/product/${product.slug}`}
                >
                  <div className="relative">
                    <img
                      src={(Array.isArray(product.images) ? product.images[0] : undefined) || '/placeholder.svg?height=200&width=300'}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.featured && (
                        <span className="bg-[#e94446] text-white text-xs font-medium px-2 py-1 rounded-full">
                          Destacado
                        </span>
                      )}
                      {(() => {
                        const status = getAvailabilityStatus(product.status, product.available);
                        return (
                          <span className={`${status.className} text-xs font-medium px-2 py-1 rounded-full`}>
                            {status.text}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      <span className="text-yellow-400">★</span>
                      <span>{product.rating}</span>
                      <span>({product.reviewsCount})</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{product.title}</h3>
                    
                    {/* Características con iconos */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Tipo */}
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Building className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 truncate">Tipo</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{product.type}</p>
                        </div>
                      </div>
                      
                      {/* Iluminación */}
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Lightbulb className={`w-4 h-4 ${product.lighting ? 'text-yellow-500' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 truncate">Iluminación</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{product.lighting ? 'Sí' : 'No'}</p>
                        </div>
                      </div>
                      
                      {/* Medidas */}
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Ruler className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 truncate">Medidas</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{product.dimensions}</p>
                        </div>
                      </div>
                      
                      {/* Ciudad */}
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 truncate">Ciudad</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{product.city}</p>
                        </div>
                      </div>
                    </div>
                  
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-[#e94446]">${product.pricePerMonth || product.priceMonth || 0}</span>
                        <span className="text-gray-600 text-sm"> / mes</span>
                      </div>
                      <div className="px-4 py-2 rounded-lg text-sm bg-[#e94446] text-white font-medium">
                        Ver detalles
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollFeaturedCarousel("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Siguientes espacios"
              aria-controls="featured-carousel"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </section>

        {/* Partners Section */}
        <PartnersSection />
      </main>
    </div>
  )
}

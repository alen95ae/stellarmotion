'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { RedSlider } from "@/components/ui/red-slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuerySync } from '@/hooks/useQuerySync';
import { useCategories } from '@/hooks/useCategories';
import { useSoportes, Soporte } from '@/hooks/useSoportes';
import SearchBarGooglePlaces from '@/components/SearchBarGooglePlaces';
import { Ruler, MapPin, Eye, EyeOff, Building, Lightbulb, Printer, Car, SlidersHorizontal, Heart, ChevronRight, ChevronLeft, Maximize2, ChevronsLeft, ChevronsRight } from 'lucide-react';
import MapViewerGoogleMaps from '@/components/MapViewerGoogleMaps';
import { CATEGORIES } from '@/lib/categories';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const setQuery = useQuerySync(pathname || '/marketplace');
  const { categories, loading: categoriesLoading } = useCategories();
  
  // Get all search parameters first
  const category = searchParams.get('category') || '';
  const priceMin = searchParams.get('priceMin') || '0';
  const priceMax = searchParams.get('priceMax') || '5000';
  const search = searchParams.get('q') || '';
  const searchLat = searchParams.get('lat');
  const searchLng = searchParams.get('lng');
  const searchLocationText = searchParams.get('loc') || searchParams.get('location');
  const locationType = searchParams.get('locationType');
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [lighting, setLighting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [centerZone, setCenterZone] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; label?: string; types?: string[] } | null>(null);
  // Ciclo mapa: split (50/50) → Expandir → full → Ocultar → hidden (solo productos) → Mostrar → split
  type MapViewState = 'split' | 'full' | 'hidden';
  const [mapViewState, setMapViewState] = useState<MapViewState>('split');
  const showMapSplit = mapViewState === 'split';
  const showMapFull = mapViewState === 'full';
  const showMap = showMapSplit || showMapFull;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapConfig, setMapConfig] = useState({
    lat: 40.4637,
    lng: -3.7492,
    zoom: 6
  });

  // Function to get zoom level based on Google Places type
  const getZoomFromGooglePlaceType = (placeType: string | null): number => {
    if (!placeType) return 12; // Default zoom for cities
    
    switch (placeType) {
      case 'country':
        return 6; // Countries - very wide view
      case 'administrative_area_level_1':
        return 8; // States/regions - wide view
      case 'locality':
        return 12; // Cities - Madrid, Barcelona, New York
      case 'sublocality':
        return 13; // Neighborhoods/districts
      case 'postal_town':
        return 14; // Small towns - Zamora
      case 'route':
      case 'street_address':
        return 16; // Streets - very close view
      default:
        return 12; // Default for cities
    }
  };

  // Update map configuration when search parameters change
  useEffect(() => {
    if (searchLat && searchLng) {
      const lat = parseFloat(searchLat);
      const lng = parseFloat(searchLng);
      const zoom = getZoomFromGooglePlaceType(locationType);
      
      setMapConfig({
        lat,
        lng,
        zoom
      });
    } else {
      // Reset to default configuration
      setMapConfig({
        lat: 40.4637,
        lng: -3.7492,
        zoom: 6
      });
    }
  }, [searchLat, searchLng, locationType]);


  // Fichas: paginación 50 por página
  const { soportes, loading: soportesLoading, error: soportesError, pagination } = useSoportes({
    search: search || undefined,
    categoria: category || undefined,
    page: currentPage,
    limit: 50
  });

  // Mapa: todos los soportes (mismos filtros, sin paginar)
  const { soportes: soportesForMap } = useSoportes({
    search: search || undefined,
    categoria: category || undefined,
    limit: 5000
  });

  // Effect to handle search location from URL parameters
  useEffect(() => {
    if (searchLat && searchLng) {
      const lat = parseFloat(searchLat);
      const lng = parseFloat(searchLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSearchLocation({
          lat,
          lng,
          label: searchLocationText || 'Ubicación de búsqueda',
          types: locationType ? [locationType] : undefined
        });
      }
    }
  }, [searchLat, searchLng, searchLocationText, locationType]);

  // Effect to handle search location from SearchBar
  useEffect(() => {
    const handleLocationSelected = (event: CustomEvent) => {
      const location = event.detail;
      setSearchLocation({
        lat: location.lat,
        lng: location.lng,
        label: location.label,
        types: location.types
      });
    };

    const handleStorageChange = () => {
      const storedLocation = sessionStorage.getItem('selectedLocation');
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation);
          setSearchLocation({
            lat: location.lat,
            lng: location.lng,
            label: location.label,
            types: location.types
          });
          // Clear the stored location after using it
          sessionStorage.removeItem('selectedLocation');
        } catch (error) {
          // Error parsing stored location
        }
      }
    };

    // Check for stored location on mount
    handleStorageChange();

    // Listen for custom event (immediate update)
    window.addEventListener('locationSelected', handleLocationSelected as EventListener);
    
    // Listen for storage changes (fallback)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case the same tab updates storage
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('locationSelected', handleLocationSelected as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // IconKey para el mapa: mismo que la sección categorías de la home (CATEGORIES[].iconKey)
  const getIconKeyForSoporte = (s: { categoria?: string; category?: string; type?: string; tipo?: string }) => {
    const slug = (s.categoria ?? s.category ?? '').toLowerCase().trim();
    const cat = CATEGORIES.find(c => c.slug === slug);
    if (cat) return cat.iconKey;
    const tipo = (s.type ?? s.tipo ?? '').toLowerCase();
    if (tipo.includes('valla')) return 'valla';
    if (tipo.includes('pantalla') || tipo.includes('led')) return 'led';
    if (tipo.includes('mural')) return 'mural';
    if (tipo.includes('mupi')) return 'mupi';
    if (tipo.includes('parada') || tipo.includes('bus')) return 'parada';
    if (tipo.includes('display')) return 'display';
    if (tipo.includes('letrero')) return 'letrero';
    if (tipo.includes('cartelera')) return 'cartelera';
    return 'valla';
  };

  // Convertir TODOS los soportes a puntos del mapa (mapa muestra todo; fichas van paginadas)
  const mapPoints = soportesForMap
    .filter(soporte => {
      const lat = (soporte as any).latitude ?? (soporte as any).latitud;
      const lng = (soporte as any).longitude ?? (soporte as any).longitud;
      return lat != null && lng != null && lat !== 0 && lng !== 0;
    })
    .map(soporte => ({
      id: soporte.id,
      lat: soporte.latitude,
      lng: soporte.longitude,
      title: soporte.title,
      description: `${soporte.type} - ${soporte.dimensions} - $${soporte.pricePerMonth.toLocaleString()}/mes`,
      type: getIconKeyForSoporte(soporte)
    }));

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  const handlePriceCommit = (values: number[]) => {
    setQuery({ priceMin: values[0], priceMax: values[1] });
  };

  const handleCategoryClick = (slug: string) => {
    setQuery({ category: slug === category ? null : slug, page: 1 });
  };

  return (
    <div className="bg-white">
      {/* Search Bar Header - Fixed at top */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Compact Search Bar */}
            <div className="flex-1 max-w-4xl">
              <SearchBarGooglePlaces />
            </div>
            
            {/* Filters Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Categorías</h3>
                    {categoriesLoading ? (
                      <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                    ) : (
                      <Select value={category || "all"} onValueChange={(value) => handleCategoryClick(value === "all" ? "" : value)}>
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.slug} value={cat.slug}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Rango de precio</h3>
                    <div className="px-2">
                      <div className="mb-4">
                        <RedSlider
                          value={priceRange}
                          onValueChange={handlePriceChange}
                          onValueCommit={handlePriceCommit}
                          min={0}
                          max={5000}
                          step={10}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter Icons */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros adicionales</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setLighting(!lighting)}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          lighting 
                            ? 'border-[#e94446] bg-[#e94446]/10 text-[#e94446]' 
                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                        }`}
                        title="Iluminación"
                      >
                        <Lightbulb className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => setPrinting(!printing)}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          printing 
                            ? 'border-[#e94446] bg-[#e94446]/10 text-[#e94446]' 
                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                        }`}
                        title="Incluye impresión"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => setCenterZone(!centerZone)}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          centerZone 
                            ? 'border-[#e94446] bg-[#e94446]/10 text-[#e94446]' 
                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                        }`}
                        title="Zona centro"
                      >
                        <Building className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => setMobile(!mobile)}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          mobile 
                            ? 'border-[#e94446] bg-[#e94446]/10 text-[#e94446]' 
                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                        }`}
                        title="Móvil"
                      >
                        <Car className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setQuery({ category: null, q: null, priceMin: null, priceMax: null, city: null, page: 1 });
                      setLighting(false);
                      setPrinting(false);
                      setCenterZone(false);
                      setMobile(false);
                      setPriceRange([0, 5000]);
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Map toggle: a la derecha de Filtros */}
            <button
              onClick={() => {
                if (mapViewState === 'split') setMapViewState('full');
                else if (mapViewState === 'full') setMapViewState('hidden');
                else setMapViewState('split');
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
              aria-label={mapViewState === 'split' ? 'Expandir mapa' : mapViewState === 'full' ? 'Ocultar mapa' : 'Mostrar mapa'}
            >
              {mapViewState === 'split' && (
                <>
                  <Maximize2 className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Expandir mapa</span>
                </>
              )}
              {mapViewState === 'full' && (
                <>
                  <EyeOff className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Ocultar mapa</span>
                </>
              )}
              {mapViewState === 'hidden' && (
                <>
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Mostrar mapa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split / Full map / Hidden map. Altura = viewport menos nav (top-16) y barra búsqueda para que el mapa quepa entero con logo Google */}
      <div className="flex h-[calc(100vh-12rem)] min-h-0 max-w-[1920px] mx-auto relative">
        {/* Left Side - Soportes Grid (oculto en modo mapa expandido) */}
        <div className={`${showMapFull ? 'hidden' : showMapSplit ? 'w-1/2' : 'w-full'} overflow-y-auto ${showMapSplit ? 'lg:pr-0' : ''}`}>
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {soportesLoading ? 'Cargando...' : soportesError ? 'Error al cargar soportes' : pagination?.total != null
                    ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} de ${pagination.total} soportes`
                    : `${soportes.length} soportes encontrados`}
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 hidden sm:inline">Ordenar:</span>
                  <Select defaultValue="featured">
                    <SelectTrigger className="w-[140px] sm:w-[180px] bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="featured">Destacados</SelectItem>
                      <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                      <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                      <SelectItem value="rating">Mejor valorados</SelectItem>
                      <SelectItem value="newest">Más recientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Soportes Grid */}
            <div className={`grid gap-6 ${showMapSplit ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {soportesLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
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
            ) : soportesError ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-600">Error al cargar los soportes: {soportesError}</p>
              </div>
            ) : soportes.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No se encontraron soportes disponibles</p>
              </div>
            ) : (
              soportes.map((soporte) => {
                const handleCardClick = () => {
                  window.location.href = `/product/${soporte.id}`;
                };

                const getStatusConfig = (status: string) => {
                  const normalizedStatus = status?.toLowerCase() || '';
                  switch (normalizedStatus) {
                    case 'disponible':
                      return { label: 'Disponible', className: 'bg-blue-500 text-white' };
                    case 'reservado':
                      return { label: 'Reservado', className: 'bg-yellow-500 text-white' };
                    case 'ocupado':
                      return { label: 'Ocupado', className: 'bg-red-500 text-white' };
                    case 'mantenimiento':
                      return { label: 'Mantenimiento', className: 'bg-orange-500 text-white' };
                    default:
                      return { label: status || 'Desconocido', className: 'bg-gray-500 text-white' };
                  }
                };

                const statusConfig = getStatusConfig(soporte.status);
                const images = soporte.images?.filter(img => img?.trim()) || [];
                const hasMultipleImages = images.length > 1;

                return (
                  <SoporteCard
                    key={soporte.id}
                    soporte={soporte}
                    statusConfig={statusConfig}
                    images={images}
                    hasMultipleImages={hasMultipleImages}
                    onClick={handleCardClick}
                  />
                );
              })
            )}
            </div>

            {/* Paginación: 50 por página */}
            {!soportesLoading && !soportesError && pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setQuery({ page: 1 })}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Primera página"
                >
                  <ChevronsLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setQuery({ page: pagination.page - 1 })}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setQuery({ page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setQuery({ page: pagination.totalPages })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Última página"
                >
                  <ChevronsRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Map (mitad cuando split, toda la página cuando full) - min-h-0 para que el mapa ocupe todo el hueco sin scroll */}
        {showMap ? (
          <div className={`hidden lg:flex border-l border-gray-200 bg-white flex-col min-h-0 ${showMapFull ? 'w-full flex-1 min-w-0' : 'w-1/2 min-w-0'}`}>
            <div className={`flex-1 min-h-0 relative overflow-hidden ${showMapFull ? 'rounded-none' : 'rounded-xl m-4 mt-0 mb-0'}`}>
              <MapViewerGoogleMaps 
                points={mapPoints}
                height="100%"
                lat={showMapFull ? 40.4637 : mapConfig.lat}
                lng={showMapFull ? -3.7492 : mapConfig.lng}
                zoom={showMapFull ? 5 : mapConfig.zoom}
                style="streets"
                showControls={true}
                enableClustering={true}
                searchLocation={searchLocation}
                onMarkerClick={(point) => {
                  if (!showMapFull) {
                    const element = document.querySelector(`[data-soporte-id="${point.id}"]`);
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                onMapClick={() => {}}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMapViewState('split')}
            className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white border-l border-t border-b border-gray-200 rounded-l-lg shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Mostrar mapa"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}

// Soporte Card Component
function SoporteCard({ 
  soporte, 
  statusConfig, 
  images, 
  hasMultipleImages, 
  onClick 
}: { 
  soporte: Soporte; 
  statusConfig: { label: string; className: string }; 
  images: string[]; 
  hasMultipleImages: boolean; 
  onClick: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div
      data-soporte-id={soporte.id}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative rounded-xl overflow-hidden bg-white">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={images[imageIndex] || '/placeholder.svg'}
            alt={soporte.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === imageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement favorite functionality
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-md hover:scale-110"
          >
            <Heart className="w-4 h-4 text-gray-700" />
          </button>
        </div>
        
        {/* Card Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 text-base line-clamp-1 group-hover:text-[#e94446] transition-colors">
            {soporte.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
            {soporte.city || soporte.address}
          </p>
          
          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              <span className="line-clamp-1">{soporte.type}</span>
            </span>
            {soporte.lighting && (
              <span className="flex items-center gap-1">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
              </span>
            )}
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <span className="text-lg font-semibold text-gray-900">
                ${soporte.pricePerMonth.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600"> / mes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

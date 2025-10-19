'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RedSlider } from "@/components/ui/red-slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuerySync } from '@/hooks/useQuerySync';
import { useCategories } from '@/hooks/useCategories';
import { useSoportes, Soporte } from '@/hooks/useSoportes';
import SearchBarGooglePlaces from '@/components/SearchBarGooglePlaces';
import { Ruler, MapPin, Eye, EyeOff, Building } from 'lucide-react';
import MapViewerGoogleMaps from '@/components/MapViewerGoogleMaps';
import Link from 'next/link';
import Image from 'next/image';

export default function BuscarEspacioPage() {
  const searchParams = useSearchParams();
  const setQuery = useQuerySync();
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
  
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; label?: string; types?: string[] } | null>(null);
  const [showMap, setShowMap] = useState(true);
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


  // Cargar soportes reales desde el ERP
  const { soportes, loading: soportesLoading, error: soportesError } = useSoportes({
    search: search || undefined,
    categoria: category || undefined,
    // Removido el filtro de estado para mostrar todos los soportes
    limit: 50
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

  // Convertir soportes reales a puntos del mapa para Google Maps
  const mapPoints = soportes
    .filter(soporte => soporte.latitude !== null && soporte.longitude !== null && soporte.latitude !== 0 && soporte.longitude !== 0)
    .map(soporte => ({
      id: soporte.id,
      lat: soporte.latitude,
      lng: soporte.longitude,
      title: soporte.title,
      description: `${soporte.type} - ${soporte.dimensions} - $${soporte.pricePerMonth.toLocaleString()}/mes`,
      type: soporte.type.toLowerCase().includes('valla') ? 'billboard' : 'building'
    }));

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  const handlePriceCommit = (values: number[]) => {
    setQuery({ priceMin: values[0], priceMax: values[1] });
  };

  const handleCategoryClick = (slug: string) => {
    setQuery({ category: slug === category ? null : slug });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buscar un espacio</h1>
          <p className="text-gray-600">Encuentra el soporte publicitario perfecto para tu campaña</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBarGooglePlaces />
        </div>

        {/* Filters and Map Section - Side by side */}
        <div className={`flex gap-6 mb-8 ${!showMap ? 'hidden' : ''}`}>
          {/* Filters Sidebar - 1/4 width */}
          <div className="w-1/4 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[500px]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
              
              {/* Categories - Dropdown */}
              <div className="mb-6">
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
              <div className="mb-6">
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


              {/* Clear Filters */}
              <button
                onClick={() => {
                  setQuery({ category: null, q: null, priceMin: null, priceMax: null, city: null });
                  setPriceRange([0, 5000]);
                }}
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Map Section - 3/4 width */}
          <div className="w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[500px]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicaciones en el mapa</h2>
              <div className="h-[440px]">
                <MapViewerGoogleMaps 
                  points={mapPoints}
                  height={440}
                  lat={mapConfig.lat}
                  lng={mapConfig.lng}
                  zoom={mapConfig.zoom}
                  style="streets"
                  showControls={true}
                  searchLocation={searchLocation}
                  onMarkerClick={(point) => {
                    // Marcador clickeado
                  }}
                  onMapClick={(lat, lng) => {
                    // Mapa clickeado
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supports Grid Section */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Soportes Disponibles</h2>
              <p className="text-gray-600">
                {soportesLoading ? 'Cargando...' : soportesError ? 'Error al cargar soportes' : `${soportes.length} soportes encontrados`}
              </p>
            </div>
            
            {/* Toggle Map Button - Centered horizontally, same height as Order by */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                {showMap ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Ocultar mapa
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Mostrar mapa
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <Select defaultValue="featured">
                <SelectTrigger className="w-48 bg-white">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
              soportes.map((soporte) => (
              <div
                key={soporte.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={soporte.images?.[0] && soporte.images[0].trim() ? soporte.images[0] : '/placeholder.svg'}
                    alt={soporte.title}
                    width={250}
                    height={150}
                    className="w-full h-[150px] object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {(() => {
                      // Función para obtener el color y texto del estado
                      const getStatusConfig = (status: string) => {
                        const normalizedStatus = status?.toLowerCase() || '';
                        
                        switch (normalizedStatus) {
                          case 'disponible':
                            return {
                              label: 'Disponible',
                              className: 'bg-green-500 text-white'
                            };
                          case 'reservado':
                            return {
                              label: 'Reservado',
                              className: 'bg-yellow-500 text-white'
                            };
                          case 'ocupado':
                            return {
                              label: 'Ocupado',
                              className: 'bg-red-500 text-white'
                            };
                          case 'mantenimiento':
                            return {
                              label: 'Mantenimiento',
                              className: 'bg-orange-500 text-white'
                            };
                          default:
                            return {
                              label: status || 'Desconocido',
                              className: 'bg-gray-500 text-white'
                            };
                        }
                      };
                      
                      const statusConfig = getStatusConfig(soporte.status);
                      
                      return (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg line-clamp-2">{soporte.title}</h3>
                  
                  {/* Características con iconos - 2 columnas */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {/* Tipo */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                        <Building className="w-2.5 h-2.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Tipo</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{soporte.type}</p>
                      </div>
                    </div>
                    
                    {/* Iluminación */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className={`w-2.5 h-2.5 ${soporte.lighting ? 'text-yellow-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Iluminación</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{soporte.lighting ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                    
                    {/* Medidas */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                        <Ruler className="w-2.5 h-2.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Medidas</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{soporte.dimensions}</p>
                      </div>
                    </div>
                    
                    {/* Ciudad */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-2.5 h-2.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Ciudad</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{soporte.city || soporte.address}</p>
                      </div>
                    </div>
                  </div>
                
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#e94446]">${soporte.pricePerMonth.toLocaleString()}</span>
                      <span className="text-gray-600 text-xs"> / mes</span>
                    </div>
                    <Link href={`/product/${soporte.id}`} className="flex items-center px-3 py-1.5 rounded-lg text-sm bg-[#e94446] text-white font-medium hover:bg-[#D7514C] transition-colors">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Link>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

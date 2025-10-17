'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RedSlider } from "@/components/ui/red-slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuerySync } from '@/hooks/useQuerySync';
import { useCategories } from '@/hooks/useCategories';
import SearchBar from '@/components/SearchBar';
import { Lightbulb, Printer, Building, Car, Ruler, MapPin, Star, Eye } from 'lucide-react';
import LeafletHybridMap, { SupportPoint } from '@/components/maps/LeafletHybridMap';
import Link from 'next/link';
import Image from 'next/image';

export default function BuscarEspacioPage() {
  const searchParams = useSearchParams();
  const setQuery = useQuerySync();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [lighting, setLighting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [centerZone, setCenterZone] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mapPoints, setMapPoints] = useState<SupportPoint[]>([]);
  const [supports, setSupports] = useState<any[]>([]);
  
  const category = searchParams.get('category') || '';
  const priceMin = searchParams.get('priceMin') || '0';
  const priceMax = searchParams.get('priceMax') || '5000';

  // Datos de ejemplo para el mapa y soportes
  useEffect(() => {
    const samplePoints: SupportPoint[] = [
      {
        id: '1',
        lat: -16.5000,
        lng: -68.1500,
        title: 'Valla Principal La Paz',
        type: 'billboard',
        dimensions: '6m x 3m',
        monthlyPrice: 2500,
        city: 'La Paz',
        format: 'Valla Digital'
      },
      {
        id: '2',
        lat: -16.5200,
        lng: -68.1700,
        title: 'Edificio Corporativo',
        type: 'building',
        dimensions: '8m x 4m',
        monthlyPrice: 3500,
        city: 'La Paz',
        format: 'Fachada'
      },
      {
        id: '3',
        lat: -16.4800,
        lng: -68.1300,
        title: 'Valla Centro Comercial',
        type: 'billboard',
        dimensions: '4m x 2.5m',
        monthlyPrice: 1800,
        city: 'La Paz',
        format: 'Valla Tradicional'
      }
    ];
    setMapPoints(samplePoints);

    // Datos de ejemplo para el listado de soportes
    const sampleSupports = [
      {
        id: '1',
        name: 'Valla Principal La Paz',
        dimensions: '6m x 3m',
        monthlyPrice: 2500,
        city: 'La Paz',
        format: 'Valla Digital',
        available: true,
        rating: 4.8,
        reviewsCount: 24,
        images: ['/placeholder.svg'],
        featured: true,
        lighting: true,
        type: 'billboard'
      },
      {
        id: '2',
        name: 'Edificio Corporativo',
        dimensions: '8m x 4m',
        monthlyPrice: 3500,
        city: 'La Paz',
        format: 'Fachada',
        available: true,
        rating: 4.9,
        reviewsCount: 18,
        images: ['/placeholder.svg'],
        featured: false,
        lighting: false,
        type: 'building'
      },
      {
        id: '3',
        name: 'Valla Centro Comercial',
        dimensions: '4m x 2.5m',
        monthlyPrice: 1800,
        city: 'La Paz',
        format: 'Valla Tradicional',
        available: false,
        rating: 4.6,
        reviewsCount: 12,
        images: ['/placeholder.svg'],
        featured: false,
        lighting: true,
        type: 'billboard'
      },
      {
        id: '4',
        name: 'Pantalla LED Plaza',
        dimensions: '5m x 3m',
        monthlyPrice: 4200,
        city: 'La Paz',
        format: 'Pantalla LED',
        available: true,
        rating: 4.7,
        reviewsCount: 31,
        images: ['/placeholder.svg'],
        featured: true,
        lighting: true,
        type: 'billboard'
      },
      {
        id: '5',
        name: 'Valla Avenida Principal',
        dimensions: '7m x 4m',
        monthlyPrice: 3200,
        city: 'La Paz',
        format: 'Valla Digital',
        available: true,
        rating: 4.5,
        reviewsCount: 15,
        images: ['/placeholder.svg'],
        featured: false,
        lighting: true,
        type: 'billboard'
      },
      {
        id: '6',
        name: 'Mural Artístico',
        dimensions: '10m x 6m',
        monthlyPrice: 2800,
        city: 'La Paz',
        format: 'Mural',
        available: true,
        rating: 4.9,
        reviewsCount: 22,
        images: ['/placeholder.svg'],
        featured: true,
        lighting: false,
        type: 'building'
      },
      {
        id: '7',
        name: 'Valla Zona Norte',
        dimensions: '3m x 2m',
        monthlyPrice: 1500,
        city: 'La Paz',
        format: 'Valla Tradicional',
        available: true,
        rating: 4.3,
        reviewsCount: 8,
        images: ['/placeholder.svg'],
        featured: false,
        lighting: false,
        type: 'billboard'
      },
      {
        id: '8',
        name: 'Edificio Residencial',
        dimensions: '6m x 5m',
        monthlyPrice: 2900,
        city: 'La Paz',
        format: 'Fachada',
        available: false,
        rating: 4.4,
        reviewsCount: 19,
        images: ['/placeholder.svg'],
        featured: false,
        lighting: true,
        type: 'building'
      },
      {
        id: '9',
        name: 'Valla Estación de Servicio',
        dimensions: '4m x 3m',
        monthlyPrice: 2100,
        city: 'La Paz',
        format: 'Valla Digital',
        available: true,
        rating: 4.6,
        reviewsCount: 14,
        images: ['/placeholder.svg'],
        featured: false,
        lighting: true,
        type: 'billboard'
      },
      {
        id: '10',
        name: 'Pantalla LED Centro',
        dimensions: '8m x 5m',
        monthlyPrice: 5500,
        city: 'La Paz',
        format: 'Pantalla LED',
        available: true,
        rating: 4.8,
        reviewsCount: 27,
        images: ['/placeholder.svg'],
        featured: true,
        lighting: true,
        type: 'billboard'
      }
    ];
    setSupports(sampleSupports);
  }, []);

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
          <SearchBar />
        </div>

        {/* Filters and Map Section - Side by side */}
        <div className="flex gap-6 mb-8">
          {/* Filters Sidebar - 1/4 width */}
          <div className="w-1/4 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[600px]">
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

              {/* Filter Icons */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros adicionales</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLighting(!lighting)}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      lighting 
                        ? 'border-red-500 bg-red-50 text-red-600' 
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
                        ? 'border-red-500 bg-red-50 text-red-600' 
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
                        ? 'border-red-500 bg-red-50 text-red-600' 
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
                        ? 'border-red-500 bg-red-50 text-red-600' 
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
                  setQuery({ category: null, q: null, priceMin: null, priceMax: null, city: null });
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
          </div>

          {/* Map Section - 3/4 width */}
          <div className="w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[600px]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicaciones en el mapa</h2>
              <div className="h-[540px]">
                <LeafletHybridMap 
                  points={mapPoints}
                  height={540}
                  center={[-16.5000, -68.1500]}
                  zoom={13}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supports Grid Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Soportes Disponibles</h2>
              <p className="text-gray-600">{supports.length} soportes encontrados</p>
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
            {supports.map((support) => (
              <div
                key={support.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={support.images?.[0] || '/placeholder.svg'}
                    alt={support.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {support.featured && (
                      <span className="bg-[#e94446] text-white text-xs font-medium px-2 py-1 rounded-full">
                        Destacado
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      support.available 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {support.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{support.rating}</span>
                    <span>({support.reviewsCount})</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg line-clamp-2">{support.name}</h3>
                  
                  {/* Características con iconos - 2 columnas */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {/* Tipo */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                        <Building className="w-2.5 h-2.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Tipo</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{support.format}</p>
                      </div>
                    </div>
                    
                    {/* Iluminación */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className={`w-2.5 h-2.5 ${support.lighting ? 'text-yellow-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Iluminación</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{support.lighting ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                    
                    {/* Medidas */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                        <Ruler className="w-2.5 h-2.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Medidas</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{support.dimensions}</p>
                      </div>
                    </div>
                    
                    {/* Ciudad */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-2.5 h-2.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Ciudad</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{support.city}</p>
                      </div>
                    </div>
                  </div>
                
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#e94446]">${support.monthlyPrice.toLocaleString()}</span>
                      <span className="text-gray-600 text-xs"> / mes</span>
                    </div>
                    <Link href={`/product/${support.id}`} className="flex items-center px-3 py-1.5 rounded-lg text-sm bg-[#e94446] text-white font-medium hover:bg-[#D7514C] transition-colors">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RedSlider } from "@/components/ui/red-slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuerySync } from '@/hooks/useQuerySync';
import { useCategories } from '@/hooks/useCategories';
import SearchBar from '@/components/SearchBar';
// Ya no usamos datos de ejemplo, cargamos desde la API
import { Lightbulb, Printer, Building, Car, Ruler, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

const SearchMap = dynamic(() => import('@/components/SearchMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">Cargando mapa...</div>
});

interface Product {
  id: string;
  code: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  dimensions: string;
  dailyImpressions: number;
  type: string;
  lighting: boolean;
  pricePerMonth: number;
  rating: number;
  reviewsCount: number;
  images: string;
  featured: boolean;
  available: boolean;
  status: string;
  latitude: number;
  longitude: number;
  shortDescription: string;
  description: string;
  tags: string;
  category?: {
    id: string;
    slug: string;
    label: string;
    iconKey: string;
  };
}

export default function BuscarEspacioPage() {
  const searchParams = useSearchParams();
  const setQuery = useQuerySync();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [lighting, setLighting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [centerZone, setCenterZone] = useState(false);
  const [mobile, setMobile] = useState(false);
  
  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const priceMin = searchParams.get('priceMin') || '0';
  const priceMax = searchParams.get('priceMax') || '5000';
  const city = searchParams.get('city') || '';

  useEffect(() => {
    fetchProducts();
  }, [category, q, priceMin, priceMax, city]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Construir parámetros de búsqueda
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (q) params.append('q', q);
      if (city) params.append('city', city);
      if (priceMin && priceMin !== '0') params.append('priceMin', priceMin);
      if (priceMax && priceMax !== '5000') params.append('priceMax', priceMax);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Error fetching products:', response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  const handlePriceCommit = (values: number[]) => {
    setQuery({ priceMin: values[0], priceMax: values[1] });
  };

  const handleCategoryClick = (slug: string) => {
    setQuery({ category: slug === category ? null : slug });
  };

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
            {products.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[600px]">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicaciones en el mapa</h2>
                <div className="h-[540px]">
                  <SearchMap products={products} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No hay espacios para mostrar en el mapa</p>
                  <p className="text-gray-400">Ajusta los filtros para ver resultados</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sort Section - Below map */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-48 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="relevance">Relevancia</SelectItem>
                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="newest">Más recientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid - Below filters and map */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  {products.length} {products.length === 1 ? 'resultado' : 'resultados'} encontrados
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
                          <span className="text-2xl font-bold text-[#e94446]">${product.pricePerMonth || 0}</span>
                          <span className="text-gray-600 text-sm"> / mes</span>
                        </div>
                        <div className="px-4 py-2 rounded-lg text-sm bg-[#e94446] text-white font-medium">
                          Ver detalles
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No se encontraron resultados</p>
                  <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

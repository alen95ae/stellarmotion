"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  dimensions: string;
  dailyImpressions: number;
  type: string;
  lighting: boolean;
  tags: string;
  images: string;
  lat: number;
  lng: number;
  pricePerMonth: number;
  printingCost: number;
  rating: number;
  reviewsCount: number;
  category: {
    slug: string;
    label: string;
    iconKey: string;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 5000]);

  // Leer filtros de la URL
  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const priceMin = searchParams.get('priceMin') || '0';
  const priceMax = searchParams.get('priceMax') || '5000';

  // Actualizar estado local cuando cambien los parámetros de la URL
  useEffect(() => {
    setPriceRange([parseInt(priceMin), parseInt(priceMax)]);
  }, [priceMin, priceMax]);

  // Fetch productos cuando cambien los filtros
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (q) params.append('q', q);
        if (priceRange[0] > 0) params.append('priceMin', priceRange[0].toString());
        if (priceRange[1] < 5000) params.append('priceMax', priceRange[1].toString());

        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, q, priceRange]);

  // Función para actualizar filtros en la URL
  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.replace(`/search?${params.toString()}`);
  };

  // Función para actualizar el rango de precios
  const handlePriceChange = (newRange: number[]) => {
    setPriceRange(newRange);
    updateFilters({
      priceMin: newRange[0].toString(),
      priceMax: newRange[1].toString(),
    });
  };

  // Función para seleccionar categoría
  const selectCategory = (categorySlug: string) => {
    updateFilters({ category: categorySlug });
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    router.replace('/search');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(price);
  };

  const formatImpressions = (impressions: number) => {
    return new Intl.NumberFormat('es-BO').format(impressions);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Buscar un espacio
        </h1>
        
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Filtro de categorías */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categoriesLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                ) : (
                  <>
                    <Badge
                      variant={!category ? "default" : "outline"}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => selectCategory('')}
                    >
                      Todas
                    </Badge>
                    {categories.map((cat) => (
                      <Badge
                        key={cat.slug}
                        variant={category === cat.slug ? "default" : "outline"}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => selectCategory(cat.slug)}
                      >
                        {cat.label}
                      </Badge>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Filtro de precio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de precio (por mes)
              </label>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={5000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Botón limpiar */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {loading ? 'Cargando...' : `${products.length} espacios encontrados`}
            </p>
            {category && (
              <Badge variant="secondary">
                Categoría: {categories.find(c => c.slug === category)?.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Grilla de productos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {product.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {product.city}, {product.country}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dimensiones:</span>
                        <span className="text-sm font-medium">{product.dimensions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Impactos/día:</span>
                        <span className="text-sm font-medium">
                          {formatImpressions(product.dailyImpressions)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Precio/mes:</span>
                        <span className="text-lg font-bold text-rose-600">
                          {formatPrice(product.pricePerMonth)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron espacios
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros o buscar con otros términos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

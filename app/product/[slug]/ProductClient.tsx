"use client";

import { useState } from 'react';
import { MapPin, Star, Eye, Lightbulb, Ruler, Building, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBox } from '@/components/ui/icon-box';
import { FEATURE_ICONS } from '@/lib/icons';
import ImageCarousel from '@/components/product/ImageCarousel';
import Features from '@/components/product/Features';
import BookingCard from '@/components/product/BookingCard';
import GoogleMapMarker from '@/components/product/GoogleMapMarker';

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

interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Función para formatear impactos
  const formatImpressions = (impressions: number): string => {
    return new Intl.NumberFormat('es-ES').format(impressions);
  };

  // Convertir tags string a array
  const tagsArray = product.tags.split(',').map(tag => tag.trim());
  const imagesArray = product.images.split(',').map(img => img.trim());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-[#D7514C] transition-colors">
                Inicio
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <a href="/search" className="hover:text-[#D7514C] transition-colors">
                Buscar espacios
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Carrusel de imágenes */}
            <ImageCarousel images={imagesArray} title={product.title} />

            {/* Información del producto */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.title}
                </h1>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#D7514C]">
                    {formatCurrency(product.pricePerMonth)}
                  </div>
                  <div className="text-sm text-gray-600">por mes</div>
                </div>
              </div>

              {/* Rating y ubicación */}
              <div className="flex items-center space-x-6 mb-6">
                {product.rating && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating!)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviewsCount} reseñas)
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{product.city}, {product.country}</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span>{formatImpressions(product.dailyImpressions)} impactos/día</span>
                </div>
              </div>

              {/* Descripción */}
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Soporte publicitario de alta calidad ubicado estratégicamente en {product.city}. 
                  Con dimensiones de {product.dimensions}, ofrece un espacio publicitario excepcional 
                  que garantiza máxima visibilidad para tu marca.
                  {product.lighting && ' Cuenta con iluminación LED de alta calidad para visibilidad 24/7.'}
                </p>
              </div>
            </div>

            {/* Características */}
            <Features product={product} />

            {/* Mapa */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Ubicación
              </h2>
              <GoogleMapMarker
                lat={product.lat}
                lng={product.lng}
                category={product.type}
                title={product.title}
              />
              <p className="text-sm text-gray-600 mt-3 text-center">
                Coordenadas: {product.lat.toFixed(6)}, {product.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Sidebar con tarjeta de reserva */}
          <div className="lg:col-span-1">
            <BookingCard product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

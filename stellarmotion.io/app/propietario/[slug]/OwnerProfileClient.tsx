'use client';

import { Owner } from '@/types/owner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar, CheckCircle, MessageCircle, Printer, Monitor } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OwnerProfileClientProps {
  owner: Owner;
}

const ServiceIcon = ({ service }: { service: string }) => {
  if (service.toLowerCase().includes('impresión') || service.toLowerCase().includes('impresion')) {
    return <Printer className="w-4 h-4" />;
  }
  if (service.toLowerCase().includes('soporte') || service.toLowerCase().includes('publicitar')) {
    return <Monitor className="w-4 h-4" />;
  }
  return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
};

export default function OwnerProfileClient({ owner }: OwnerProfileClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Perfil del propietario */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                {/* Avatar y rating */}
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Image
                      src={owner.avatar}
                      alt={owner.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-lg font-semibold">{owner.rating}</span>
                    <span className="ml-1 text-gray-600">({owner.reviewsCount})</span>
                  </div>
                  {owner.verified && (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Verificado</span>
                    </div>
                  )}
                </div>

                {/* Nombre y ubicación */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{owner.name}</h1>
                  <p className="text-gray-600 text-sm mb-2">
                    MIEMBRO DESDE EL {owner.memberSince}
                  </p>
                  <div className="flex items-center justify-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{owner.city}, {owner.country}</span>
                  </div>
                </div>

                {/* Idiomas */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-600 text-xs font-semibold">🌐</span>
                    </div>
                    <span className="font-semibold text-gray-900">Idiomas</span>
                  </div>
                  <p className="text-gray-600 ml-8">{owner.languages.join(', ')}</p>
                </div>

                {/* Servicios */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-green-600 text-xs font-semibold">⚙️</span>
                    </div>
                    <span className="font-semibold text-gray-900">Servicios</span>
                  </div>
                  <div className="ml-8 space-y-2">
                    {owner.services.map((service, index) => (
                      <div key={index} className="flex items-center">
                        <ServiceIcon service={service} />
                        <span className="ml-2 text-gray-600 text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {owner.description}
                  </p>
                </div>

                {/* Botón de contacto */}
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Listado de soportes */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Listados de {owner.name}
              </h2>
              <p className="text-gray-600">
                {owner.products.length} espacios publicitarios disponibles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {owner.products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video">
                    <Image
                      src={(Array.isArray(product.images) ? product.images[0] : undefined) || '/placeholder.svg?height=400&width=600'}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-gray-800 text-white">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        <span>{product.rating}</span>
                        <span className="ml-1">({product.reviewsCount})</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Superficie:</span>
                        <span className="font-medium">{product.dimensions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Impresiones diarias:</span>
                        <span className="font-medium">{(product.dailyImpressions ?? 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">
                        ${product.pricePerMonth ?? 0} / mes
                      </div>
                      {product.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Destacado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mensaje si no hay productos */}
            {owner.products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Monitor className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay espacios disponibles
                </h3>
                <p className="text-gray-600">
                  Este propietario no tiene espacios publicitarios disponibles en este momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

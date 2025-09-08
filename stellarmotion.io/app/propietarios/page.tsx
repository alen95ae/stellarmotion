import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, CheckCircle, Printer, Monitor } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Propietarios de Espacios Publicitarios | StellarMotion',
  description: 'Conoce a las empresas y propietarios de espacios publicitarios en Bolivia. Encuentra proveedores confiables para tus campañas de marketing.'
};

// Mock data - en producción esto vendría de la base de datos
const mockOwners = [
  {
    id: '1',
    name: 'PubliMax Bolivia',
    slug: 'publimax-bolivia',
    avatar: '/placeholder-user.jpg',
    rating: 4.8,
    reviewsCount: 24,
    memberSince: '15/03/2020',
    languages: ['Español', 'Inglés'],
    services: ['Impresión Digital', 'Soportes Publicitarios', 'Mantenimiento'],
    description: 'Empresa líder en publicidad exterior en Bolivia. Especializados en soportes publicitarios de alta calidad con más de 10 años de experiencia en el mercado.',
    verified: true,
    city: 'La Paz',
    country: 'Bolivia',
    productsCount: 12,
    featuredProducts: [
      '/placeholder.svg?height=200&width=300',
      '/placeholder.svg?height=200&width=300',
      '/placeholder.svg?height=200&width=300'
    ]
  },
  {
    id: '2',
    name: 'Outdoor Media SCZ',
    slug: 'outdoor-media-scz',
    avatar: '/placeholder-user.jpg',
    rating: 4.5,
    reviewsCount: 18,
    memberSince: '22/08/2019',
    languages: ['Español', 'Portugués'],
    services: ['Soportes Publicitarios', 'Diseño Gráfico'],
    description: 'Especialistas en publicidad exterior en Santa Cruz. Amplia red de soportes publicitarios estratégicamente ubicados en zonas de alto tráfico.',
    verified: true,
    city: 'Santa Cruz',
    country: 'Bolivia',
    productsCount: 8,
    featuredProducts: [
      '/placeholder.svg?height=200&width=300',
      '/placeholder.svg?height=200&width=300'
    ]
  },
  {
    id: '3',
    name: 'Digital Ads Cochabamba',
    slug: 'digital-ads-cochabamba',
    avatar: '/placeholder-user.jpg',
    rating: 4.7,
    reviewsCount: 15,
    memberSince: '10/01/2021',
    languages: ['Español'],
    services: ['Pantallas LED', 'Impresión Digital'],
    description: 'Especialistas en pantallas LED y publicidad digital en Cochabamba. Tecnología de última generación para campañas impactantes.',
    verified: true,
    city: 'Cochabamba',
    country: 'Bolivia',
    productsCount: 6,
    featuredProducts: [
      '/placeholder.svg?height=200&width=300',
      '/placeholder.svg?height=200&width=300',
      '/placeholder.svg?height=200&width=300'
    ]
  }
];

const ServiceIcon = ({ service }: { service: string }) => {
  if (service.toLowerCase().includes('impresión') || service.toLowerCase().includes('impresion')) {
    return <Printer className="w-4 h-4 text-blue-600" />;
  }
  if (service.toLowerCase().includes('soporte') || service.toLowerCase().includes('publicitar') || service.toLowerCase().includes('valla') || service.toLowerCase().includes('pantalla')) {
    return <Monitor className="w-4 h-4 text-green-600" />;
  }
  return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
};

export default function PropietariosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Propietarios de Espacios Publicitarios
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conecta con empresas y propietarios verificados que ofrecen los mejores espacios 
            publicitarios en Bolivia. Encuentra el socio perfecto para tu próxima campaña.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{mockOwners.length}</div>
            <div className="text-gray-600">Empresas Verificadas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {mockOwners.reduce((acc, owner) => acc + owner.productsCount, 0)}
            </div>
            <div className="text-gray-600">Espacios Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {(mockOwners.reduce((acc, owner) => acc + owner.rating, 0) / mockOwners.length).toFixed(1)}
            </div>
            <div className="text-gray-600">Rating Promedio</div>
          </div>
        </div>

        {/* Lista de propietarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockOwners.map((owner) => (
            <Card key={owner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Información del propietario */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start mb-4">
                      <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                        <Image
                          src={owner.avatar}
                          alt={owner.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {owner.name}
                          </h3>
                          {owner.verified && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 font-semibold">{owner.rating}</span>
                          <span className="ml-1 text-gray-600">({owner.reviewsCount} reseñas)</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{owner.city}, {owner.country}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {owner.description}
                    </p>

                    {/* Servicios */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Servicios:</h4>
                      <div className="flex flex-wrap gap-2">
                        {owner.services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            <ServiceIcon service={service} />
                            <span className="ml-1 text-xs">{service}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Idiomas */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Idiomas:</h4>
                      <p className="text-sm text-gray-600">{owner.languages.join(', ')}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {owner.productsCount} espacios disponibles
                      </span>
                      <Link
                        href={`/propietario/${owner.slug}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Ver perfil
                      </Link>
                    </div>
                  </div>

                  {/* Galería de productos destacados */}
                  <div className="w-full md:w-64 bg-gray-100">
                    <div className="grid grid-cols-3 md:grid-cols-1 h-full">
                      {owner.featuredProducts.slice(0, 3).map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={image}
                            alt={`Espacio ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12 p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Tienes espacios publicitarios?
          </h2>
          <p className="text-gray-600 mb-6">
            Únete a nuestra plataforma y conecta con anunciantes que buscan los mejores espacios.
          </p>
          <Link
            href="/publicar-espacio"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Publicar mis espacios
          </Link>
        </div>
      </div>
    </div>
  );
}

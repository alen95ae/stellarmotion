import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OwnerProfileClient from './OwnerProfileClient';

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
    description: 'Empresa líder en publicidad exterior en Bolivia. Especializados en soportes publicitarios de alta calidad con más de 10 años de experiencia en el mercado. Ofrecemos servicios integrales desde el diseño hasta la instalación.',
    verified: true,
    city: 'La Paz',
    country: 'Bolivia',
    products: [
      {
        id: '1',
        slug: 'valla-centrica-zona-sur',
        title: 'Valla céntrica Zona Sur',
        images: ['/placeholder.svg?height=400&width=600'],
        category: 'VALLAS',
        rating: 4.9,
        reviewsCount: 8,
        pricePerMonth: 850,
        dimensions: '10×4 m',
        dailyImpressions: 45000,
        featured: true
      },
      {
        id: '2',
        slug: 'pantalla-led-calacoto',
        title: 'Pantalla LED Calacoto',
        images: ['/placeholder.svg?height=400&width=600'],
        category: 'PANTALLAS',
        rating: 5.0,
        reviewsCount: 12,
        pricePerMonth: 1200,
        dimensions: '8×6 m',
        dailyImpressions: 65000,
        featured: true
      },
      {
        id: '3',
        slug: 'mupi-avenida-arce',
        title: 'MUPI Avenida Arce',
        images: ['/placeholder.svg?height=400&width=600'],
        category: 'MUPIS',
        rating: 4.7,
        reviewsCount: 5,
        pricePerMonth: 450,
        dimensions: '1.2×1.8 m',
        dailyImpressions: 28000,
        featured: false
      }
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
    products: [
      {
        id: '4',
        slug: 'valla-doble-vista-equipetrol',
        title: 'Valla doble vista Equipetrol',
        images: ['/placeholder.svg?height=400&width=600'],
        category: 'VALLAS',
        rating: 4.6,
        reviewsCount: 7,
        pricePerMonth: 950,
        dimensions: '12×5 m',
        dailyImpressions: 52000,
        featured: true
      }
    ]
  }
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const owner = mockOwners.find(o => o.slug === slug);
  
  if (!owner) {
    return {
      title: 'Propietario no encontrado | StellarMotion'
    };
  }

  return {
    title: `${owner.name} - Propietario | StellarMotion`,
    description: owner.description.substring(0, 160)
  };
}

export default async function OwnerPage({ params }: PageProps) {
  const { slug } = await params;
  const owner = mockOwners.find(o => o.slug === slug);
  
  if (!owner) {
    notFound();
  }

  return <OwnerProfileClient owner={owner} />;
}

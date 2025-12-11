import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, fetchFromERP, API_BASE_URL } from "@/lib/api-config";

// Forzar runtime Node.js para acceso a process.env
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Si el slug es null o vacío, devolver 404
    if (!slug || slug === 'null') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Datos de ejemplo para testing
    const sampleProducts = {
      '1': {
        id: '1',
        slug: '1',
        title: 'Valla Principal La Paz',
        city: 'La Paz',
        country: 'Bolivia',
        dimensions: '6m x 3m',
        dailyImpressions: 15000,
        type: 'billboard',
        lighting: true,
        tags: ['digital', 'centro', 'premium'],
        images: ['/placeholder.svg'],
        shortDescription: 'Valla digital premium en el centro de La Paz',
        description: 'Valla publicitaria digital de alta calidad ubicada en el centro de La Paz. Perfecta visibilidad y alto tráfico vehicular.',
        featured: true,
        lat: -16.5000,
        lng: -68.1500,
        pricePerMonth: 2500,
        printingCost: 200,
        rating: 4.8,
        reviewsCount: 24,
        category: {
          slug: 'vallas-digitales',
          label: 'Vallas Digitales',
          iconKey: 'billboard'
        },
        available: true,
        status: 'disponible'
      },
      '2': {
        id: '2',
        slug: '2',
        title: 'Edificio Corporativo',
        city: 'La Paz',
        country: 'Bolivia',
        dimensions: '8m x 4m',
        dailyImpressions: 8000,
        type: 'building',
        lighting: false,
        tags: ['fachada', 'corporativo', 'exclusivo'],
        images: ['/placeholder.svg'],
        shortDescription: 'Fachada de edificio corporativo exclusivo',
        description: 'Fachada de edificio corporativo con excelente ubicación y visibilidad. Ideal para campañas de alto impacto.',
        featured: false,
        lat: -16.5200,
        lng: -68.1700,
        pricePerMonth: 3500,
        printingCost: 300,
        rating: 4.9,
        reviewsCount: 18,
        category: {
          slug: 'fachadas',
          label: 'Fachadas',
          iconKey: 'building'
        },
        available: true,
        status: 'disponible'
      },
      '3': {
        id: '3',
        slug: '3',
        title: 'Valla Centro Comercial',
        city: 'La Paz',
        country: 'Bolivia',
        dimensions: '4m x 2.5m',
        dailyImpressions: 12000,
        type: 'billboard',
        lighting: true,
        tags: ['tradicional', 'comercial', 'acceso'],
        images: ['/placeholder.svg'],
        shortDescription: 'Valla tradicional en centro comercial',
        description: 'Valla publicitaria tradicional ubicada en centro comercial con alto tráfico peatonal y vehicular.',
        featured: false,
        lat: -16.4800,
        lng: -68.1300,
        pricePerMonth: 1800,
        printingCost: 150,
        rating: 4.6,
        reviewsCount: 12,
        category: {
          slug: 'vallas-tradicionales',
          label: 'Vallas Tradicionales',
          iconKey: 'billboard'
        },
        available: false,
        status: 'ocupado'
      }
    };

    const product = sampleProducts[slug as keyof typeof sampleProducts];
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

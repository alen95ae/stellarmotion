import { NextRequest, NextResponse } from 'next/server';
import { fetchFromERP } from '@/lib/api-config';

// GET - Obtener soportes del partner actual
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const available = searchParams.get('available');
    
    // Construir URL para el ERP
    let erpUrl = `${process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3000'}/api/soportes`;
    const params = new URLSearchParams();
    
    if (partnerId) params.append('partnerId', partnerId);
    if (featured) params.append('featured', featured);
    if (limit) params.append('limit', limit);
    if (available) params.append('available', available);
    
    if (params.toString()) {
      erpUrl += `?${params.toString()}`;
    }
    
    const supports = await fetchFromERP(erpUrl);
    
    // Transformar datos para compatibilidad con el frontend
    const transformedSupports = supports.map((support: any) => ({
      id: support.id,
      slug: support.slug,
      title: support.title,
      city: support.city,
      country: support.country,
      dimensions: support.dimensions || `${support.widthM || 0}x${support.heightM || 0}m`,
      dailyImpressions: support.dailyImpressions || 0,
      type: support.type,
      lighting: support.lighting,
      tags: support.tags,
      images: support.images,
      shortDescription: support.shortDescription,
      description: support.description,
      featured: support.featured,
      lat: support.latitude,
      lng: support.longitude,
      pricePerMonth: support.priceMonth,
      printingCost: support.printingCost,
      rating: support.rating,
      reviewsCount: support.reviewsCount,
      categoryId: support.categoryId,
      status: support.status,
      available: support.available,
      address: support.address,
      createdAt: support.createdAt,
      updatedAt: support.updatedAt
    }));
    
    return NextResponse.json(transformedSupports);
  } catch (error) {
    console.error('Error fetching supports:', error);
    return NextResponse.json([], { status: 200 }); // Devolver array vacío en caso de error
  }
}

// POST - Crear nuevo soporte
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validaciones básicas
    if (!data.title) {
      return NextResponse.json(
        { error: 'Título es requerido' },
        { status: 400 }
      );
    }
    
    if (!data.partnerId) {
      return NextResponse.json(
        { error: 'Partner ID es requerido' },
        { status: 400 }
      );
    }
    
    // Preparar datos para el ERP
    const supportData = {
      title: data.title,
      type: data.type || 'VALLADO',
      city: data.city,
      country: data.country || 'España',
      latitude: data.lat,
      longitude: data.lng,
      address: data.address,
      priceMonth: data.pricePerMonth,
      available: true,
      status: 'DISPONIBLE',
      partnerId: data.partnerId,
      dimensions: data.dimensions,
      dailyImpressions: data.dailyImpressions,
      lighting: data.lighting || false,
      tags: data.tags,
      images: data.images,
      shortDescription: data.shortDescription,
      description: data.description,
      featured: data.featured || false,
      printingCost: data.printingCost,
      categoryId: data.categoryId
    };
    
    const erpUrl = `${process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3000'}/api/soportes`;
    const response = await fetch(erpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supportData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al crear soporte' },
        { status: response.status }
      );
    }
    
    const newSupport = await response.json();
    
    // Transformar respuesta para el frontend
    const transformedSupport = {
      id: newSupport.id,
      slug: newSupport.slug,
      title: newSupport.title,
      city: newSupport.city,
      country: newSupport.country,
      dimensions: newSupport.dimensions || `${newSupport.widthM || 0}x${newSupport.heightM || 0}m`,
      dailyImpressions: newSupport.dailyImpressions || 0,
      type: newSupport.type,
      lighting: newSupport.lighting,
      tags: newSupport.tags,
      images: newSupport.images,
      shortDescription: newSupport.shortDescription,
      description: newSupport.description,
      featured: newSupport.featured,
      lat: newSupport.latitude,
      lng: newSupport.longitude,
      pricePerMonth: newSupport.priceMonth,
      printingCost: newSupport.printingCost,
      rating: newSupport.rating,
      reviewsCount: newSupport.reviewsCount,
      categoryId: newSupport.categoryId,
      status: newSupport.status,
      available: newSupport.available,
      address: newSupport.address,
      createdAt: newSupport.createdAt,
      updatedAt: newSupport.updatedAt
    };
    
    return NextResponse.json(transformedSupport, { status: 201 });
  } catch (error) {
    console.error('Error creating support:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchFromERP } from '@/lib/api-config';

// GET - Obtener soporte específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const erpUrl = `${process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3000'}/api/soportes/${id}`;
    const support = await fetchFromERP(erpUrl);
    
    if (!support) {
      return NextResponse.json(
        { error: 'Soporte no encontrado' },
        { status: 404 }
      );
    }
    
    // Transformar datos para compatibilidad con el frontend
    const transformedSupport = {
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
    };
    
    return NextResponse.json(transformedSupport);
  } catch (error) {
    console.error('Error fetching support:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar soporte
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    // Preparar datos para el ERP
    const supportData = {
      title: data.title,
      type: data.type,
      city: data.city,
      country: data.country,
      latitude: data.lat,
      longitude: data.lng,
      address: data.address,
      priceMonth: data.pricePerMonth,
      available: data.available,
      status: data.status,
      dimensions: data.dimensions,
      dailyImpressions: data.dailyImpressions,
      lighting: data.lighting,
      tags: data.tags,
      images: data.images,
      shortDescription: data.shortDescription,
      description: data.description,
      featured: data.featured,
      printingCost: data.printingCost,
      categoryId: data.categoryId
    };
    
    const erpUrl = `${process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3000'}/api/soportes/${id}`;
    const response = await fetch(erpUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supportData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al actualizar soporte' },
        { status: response.status }
      );
    }
    
    const updatedSupport = await response.json();
    
    // Transformar respuesta para el frontend
    const transformedSupport = {
      id: updatedSupport.id,
      slug: updatedSupport.slug,
      title: updatedSupport.title,
      city: updatedSupport.city,
      country: updatedSupport.country,
      dimensions: updatedSupport.dimensions || `${updatedSupport.widthM || 0}x${updatedSupport.heightM || 0}m`,
      dailyImpressions: updatedSupport.dailyImpressions || 0,
      type: updatedSupport.type,
      lighting: updatedSupport.lighting,
      tags: updatedSupport.tags,
      images: updatedSupport.images,
      shortDescription: updatedSupport.shortDescription,
      description: updatedSupport.description,
      featured: updatedSupport.featured,
      lat: updatedSupport.latitude,
      lng: updatedSupport.longitude,
      pricePerMonth: updatedSupport.priceMonth,
      printingCost: updatedSupport.printingCost,
      rating: updatedSupport.rating,
      reviewsCount: updatedSupport.reviewsCount,
      categoryId: updatedSupport.categoryId,
      status: updatedSupport.status,
      available: updatedSupport.available,
      address: updatedSupport.address,
      createdAt: updatedSupport.createdAt,
      updatedAt: updatedSupport.updatedAt
    };
    
    return NextResponse.json(transformedSupport);
  } catch (error) {
    console.error('Error updating support:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar soporte
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const erpUrl = `${process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3000'}/api/soportes/${id}`;
    const response = await fetch(erpUrl, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al eliminar soporte' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ message: 'Soporte eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting support:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

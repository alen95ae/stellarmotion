import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, fetchFromERP, API_BASE_URL } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Obtener el soporte del backend por slug
    const support = await fetchFromERP(API_ENDPOINTS.supportBySlug(slug));

    if (!support) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Parse JSON strings back to arrays
    let tags = [];
    let images = [];
    
    try {
      tags = support.tags ? support.tags.split(',').map((tag: string) => tag.trim()) : [];
    } catch (e) {
      console.warn('Failed to parse tags for support:', support.slug, support.tags);
      tags = [];
    }
    
    try {
      images = support.images ? JSON.parse(support.images) : [];
      if (!Array.isArray(images)) images = [];
    } catch (e) {
      console.warn('Failed to parse images for support:', support.slug, support.images);
      images = [];
    }
    
    // Filtrar placeholders y URLs vacías
    images = images.filter(img => 
      img && 
      img.trim() !== '' && 
      !img.includes('placeholder.svg') && 
      !img.includes('placeholder.jpg') &&
      !img.includes('placeholder.png')
    );
    
    // Si no hay imágenes válidas en el array pero hay imageUrl válida, usarla
    if (images.length === 0 && support.imageUrl && 
        support.imageUrl.trim() !== '' && 
        !support.imageUrl.includes('placeholder.svg') &&
        !support.imageUrl.includes('placeholder.jpg') &&
        !support.imageUrl.includes('placeholder.png')) {
      // Convertir la URL relativa a una URL absoluta del backend
      const imageUrl = support.imageUrl.startsWith('http') 
        ? support.imageUrl 
        : `${API_BASE_URL}${support.imageUrl}`;
      images = [imageUrl];
    }

    // Transformar soporte a formato de producto para compatibilidad
    const product = {
      id: support.id,
      slug: support.slug,
      title: support.title,
      city: support.city,
      country: support.country,
      dimensions: support.dimensions || (support.widthM && support.heightM ? `${support.widthM}×${support.heightM} m` : 'No especificado'),
      dailyImpressions: support.dailyImpressions || 0,
      type: support.type,
      lighting: support.lighting,
      tags,
      images,
      shortDescription: support.shortDescription || '',
      description: support.description || '',
      featured: support.featured,
      lat: support.latitude,
      lng: support.longitude,
      pricePerMonth: support.priceMonth || 0,
      printingCost: support.printingCost || 0,
      rating: support.rating,
      reviewsCount: support.reviewsCount || 0,
      categoryId: support.categoryId,
      category: support.category,
      available: support.available,
      status: support.status,
      createdAt: support.createdAt,
      updatedAt: support.updatedAt,
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

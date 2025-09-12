import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, fetchFromERP, API_BASE_URL } from "@/lib/api-config";
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Función para extraer coordenadas del enlace de Google Maps
const extractCoordinatesFromGoogleMapsLink = (link: string): { lat: number | null, lng: number | null } => {
  if (!link) return { lat: null, lng: null };

  // Patrones para diferentes formatos de Google Maps
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
    /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
    /query=(-?\d+\.\d+),(-?\d+\.\d+)/, // query=lat,lng (API format)
    /center=(-?\d+\.\d+),(-?\d+\.\d+)/, // center=lat,lng
    /@(-?\d+\.\d+),(-?\d+\.\d+),/ // @lat,lng,zoom
  ];

  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
  }

  return { lat: null, lng: null };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Construir parámetros de búsqueda para el backend
    const params = new URLSearchParams();
    
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const city = searchParams.get('city');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    if (category) {
      // Buscar el ID de la categoría por slug
      const categories = await fetchFromERP(API_ENDPOINTS.categories);
      const categoryObj = categories.find((cat: any) => cat.slug === category);
      if (categoryObj) {
        params.append('categoryId', categoryObj.id);
      }
    }

    if (q) params.append('q', q);
    if (city) params.append('city', city);
    if (featured) params.append('featured', featured);
    if (limit) params.append('limit', limit);

    // Construir URL con parámetros
    const url = `${API_ENDPOINTS.supports}?${params.toString()}`;
    
    // Obtener soportes del backend
    const supports = await fetchFromERP(url);

    // Transformar soportes a formato de productos para compatibilidad
    const products = supports.map((support: any) => {
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

      // Mapear campos del soporte a formato de producto
      return {
        id: support.id,
        slug: support.slug,
        title: support.title,
        city: support.city,
        country: support.country,
        dimensions: support.dimensions || `${support.widthM || 0}×${support.heightM || 0} m`,
        dailyImpressions: support.dailyImpressions || 0,
        type: support.type,
        lighting: support.lighting,
        tags,
        images,
        shortDescription: support.shortDescription || '',
        description: support.description || '',
        featured: support.featured,
        latitude: support.latitude,
        longitude: support.longitude,
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
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extraer datos del formulario
    const title = formData.get('title') as string;
    const categorySlug = formData.get('categoryId') as string | null;
    const pricePerMonth = parseFloat(formData.get('pricePerMonth') as string);
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const dimensions = formData.get('dimensions') as string;
    const lighting = formData.get('lighting') === 'true';
    const type = formData.get('type') as string;
    const dailyImpressions = parseInt(formData.get('dailyImpressions') as string);
    const shortDescription = formData.get('shortDescription') as string;
    const description = formData.get('description') as string;
    let lat = parseFloat(formData.get('lat') as string);
    let lng = parseFloat(formData.get('lng') as string);
    const code = formData.get('code') as string;

    // Validar datos requeridos
    if (!title || !pricePerMonth || !city || !country || 
        !dimensions || !type) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Extraer coordenadas del enlace de Google Maps si no se proporcionaron directamente
    const googleMapsLink = formData.get('googleMapsLink') as string;
    if ((isNaN(lat) || isNaN(lng)) && googleMapsLink) {
      const extractedCoords = extractCoordinatesFromGoogleMapsLink(googleMapsLink);
      if (extractedCoords.lat !== null && extractedCoords.lng !== null) {
        lat = extractedCoords.lat;
        lng = extractedCoords.lng;
        console.log('Coordenadas extraídas del enlace de Google Maps:', { lat, lng });
      }
    }

    // Validar coordenadas (opcional pero si se proporcionan deben ser válidas)
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Coordenadas inválidas o faltantes, usando coordenadas por defecto');
      // Usar coordenadas por defecto (Madrid)
      lat = 40.4168;
      lng = -3.7038;
    }

    // Buscar la categoría en el backend
    let category = null as any;
    if (categorySlug) {
      const categories = await fetchFromERP(API_ENDPOINTS.categories);
      category = categories.find((cat: any) => cat.slug === categorySlug) || null;
      if (!category) {
        return NextResponse.json(
          { error: 'Categoría no encontrada' },
          { status: 400 }
        );
      }
    }

    // Procesar imágenes
    const imageUrls: string[] = [];
    const imageFiles = [];
    
    // Recopilar archivos de imagen
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Guardar imágenes en el sistema de archivos del frontend
    for (const imageFile of imageFiles) {
      if (imageFile.size > 0) {
        // Validar tamaño de archivo (máximo 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          console.warn(`Image ${imageFile.name} is too large, skipping`);
          continue;
        }

        // Validar tipo de archivo
        if (!imageFile.type.startsWith('image/')) {
          console.warn(`File ${imageFile.name} is not an image, skipping`);
          continue;
        }

        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Crear nombre único para la imagen
        const timestamp = Date.now();
        const sanitizedName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `support_${timestamp}_${sanitizedName}`;
        const path = join(process.cwd(), 'public', 'uploads', filename);
        
        try {
          await writeFile(path, buffer);
          imageUrls.push(`/uploads/${filename}`);
        } catch (error) {
          console.error('Error saving image:', error);
          // Continuar con las otras imágenes aunque una falle
        }
      }
    }

    // Si no hay imágenes, usar placeholder
    if (imageUrls.length === 0) {
      imageUrls.push('/placeholder.svg?height=400&width=600');
    }

    // Extraer dimensiones de width y height del string dimensions
    const dimensionsMatch = dimensions.match(/(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)/);
    const widthM = dimensionsMatch ? parseFloat(dimensionsMatch[1]) : null;
    const heightM = dimensionsMatch ? parseFloat(dimensionsMatch[2]) : null;

    // Preparar datos para el backend
    const supportData = {
      title,
      type,
      city,
      country,
      latitude: lat,
      longitude: lng,
      priceMonth: pricePerMonth,
      dailyImpressions,
      lighting,
      dimensions,
      widthM,
      heightM,
      shortDescription: shortDescription || '',
      description: description || '',
      imageUrl: imageUrls[0] || '/placeholder.svg?height=400&width=600',
      images: JSON.stringify(imageUrls),
      tags: '', // Tags vacíos por ahora
      featured: false,
      available: true,
      status: 'DISPONIBLE',
      categoryId: category?.id || null,
      code: code || '', // Código opcional
    };

    // Crear el soporte en el backend
    const response = await fetch(API_ENDPOINTS.supports, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Error al crear el soporte' },
        { status: response.status }
      );
    }

    const createdSupport = await response.json();

    // Transformar a formato de producto para compatibilidad
    const product = {
      id: createdSupport.id,
      slug: createdSupport.slug,
      title: createdSupport.title,
      city: createdSupport.city,
      country: createdSupport.country,
      dimensions: createdSupport.dimensions,
      dailyImpressions: createdSupport.dailyImpressions,
      type: createdSupport.type,
      lighting: createdSupport.lighting,
      tags: [],
      images: imageUrls,
      shortDescription: createdSupport.shortDescription,
      description: createdSupport.description,
      featured: createdSupport.featured,
      latitude: createdSupport.latitude,
      longitude: createdSupport.longitude,
      pricePerMonth: createdSupport.priceMonth,
      printingCost: createdSupport.printingCost || 0,
      rating: createdSupport.rating,
      reviewsCount: createdSupport.reviewsCount || 0,
      categoryId: createdSupport.categoryId,
      category: category,
      available: createdSupport.available,
      status: createdSupport.status,
      createdAt: createdSupport.createdAt,
      updatedAt: createdSupport.updatedAt,
    };

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

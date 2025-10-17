import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS, fetchFromERP } from '@/lib/api-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ERP_BASE_URL = process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3002';
const PLACEHOLDER_PATTERN = /placeholder(\.(svg|png|jpe?g))?/i;

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  }
  return null;
};

const toInteger = (value: unknown): number => {
  const num = toNumber(value);
  return num === null ? 0 : Math.round(num);
};

const toAbsoluteUrl = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return `${ERP_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
};

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      .map((tag) => tag.trim());
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const parseImages = (support: any): string[] => {
  const raw = support?.images;
  let images: string[] = [];

  if (Array.isArray(raw)) {
    images = raw;
  } else if (typeof raw === 'string' && raw.trim()) {
    const trimmed = raw.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        images = parsed as string[];
      } else if (typeof parsed === 'string') {
        images = [parsed];
      }
    } catch (error) {
      if (trimmed.includes(',')) {
        images = trimmed.split(',').map((item) => item.trim());
      } else {
        images = [trimmed];
      }
    }
  }

  const absoluteImages = images
    .map((img) => toAbsoluteUrl(img))
    .filter((img): img is string => Boolean(img) && !PLACEHOLDER_PATTERN.test(img));

  if (absoluteImages.length > 0) {
    return Array.from(new Set(absoluteImages));
  }

  const fallback = toAbsoluteUrl(support?.imageUrl);
  if (fallback && !PLACEHOLDER_PATTERN.test(fallback)) {
    return [fallback];
  }

  return ['/placeholder.svg?height=400&width=600'];
};

const buildDimensions = (support: any): string => {
  if (typeof support?.dimensions === 'string' && support.dimensions.trim().length > 0) {
    return support.dimensions;
  }

  const width = toNumber(support?.widthM);
  const height = toNumber(support?.heightM);

  if (width && height) {
    return `${width}×${height} m`;
  }

  return '';
};

const normalizeSupport = (support: any) => {
  const latitude = toNumber(support?.latitude ?? support?.lat);
  const longitude = toNumber(support?.longitude ?? support?.lng);
  const tags = parseTags(support?.tags);
  const images = parseImages(support);
  const pricePerMonth = toNumber(support?.pricePerMonth ?? support?.priceMonth) ?? 0;
  const printingCost = toNumber(support?.printingCost) ?? 0;
  const rating = toNumber(support?.rating) ?? 0;
  const available = typeof support?.available === 'boolean'
    ? support.available
    : String(support?.status || '').toUpperCase() === 'DISPONIBLE';

  const category = support?.category ?? null;
  const ownerName = support?.owner || support?.company?.name || support?.partner?.name || '';

  return {
    id: support?.id,
    code: support?.code ?? '',
    slug: support?.slug ?? `support-${support?.id}`,
    title: support?.title ?? '',
    city: support?.city ?? '',
    country: support?.country ?? '',
    dimensions: buildDimensions(support),
    dailyImpressions: toInteger(support?.dailyImpressions),
    type: support?.type ?? '',
    lighting: Boolean(support?.lighting),
    tags,
    images,
    shortDescription: support?.shortDescription ?? '',
    description: support?.description ?? '',
    featured: Boolean(support?.featured),
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    pricePerMonth,
    printingCost,
    rating,
    reviewsCount: toInteger(support?.reviewsCount),
    categoryId: support?.categoryId ?? category?.id ?? null,
    category,
    status: support?.status ?? 'DISPONIBLE',
    available,
    address: support?.address ?? '',
    googleMapsLink: support?.googleMapsLink ?? '',
    ownerName,
    partnerId: support?.partnerId ?? support?.partner?.id ?? null,
    createdAt: support?.createdAt,
    updatedAt: support?.updatedAt,
  };
};

// GET - Obtener soportes del ERP (proxy)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    console.log('IO API: Proxying request to ERP at', ERP_BASE_URL);
    
    // Construir la URL del ERP con todos los parámetros
    const erpUrl = `${ERP_BASE_URL}/api/soportes?${searchParams.toString()}`;
    
    console.log('IO API: Fetching from ERP:', erpUrl);
    
    // Hacer petición al ERP
    const response = await fetch(erpUrl, {
      headers: {
        'User-Agent': 'StellarMotion-IO/1.0',
      },
    });
    
    if (!response.ok) {
      console.error('IO API: ERP response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('IO API: ERP error details:', errorText);
      return NextResponse.json([], { status: 200 }); // Devolver array vacío en caso de error
    }
    
    const data = await response.json();
    console.log('IO API: Received from ERP:', Array.isArray(data) ? `${data.length} items` : typeof data);
    
    // Verificar que la respuesta sea un array
    if (!Array.isArray(data)) {
      console.warn('IO API: ERP response is not an array:', data);
      return NextResponse.json([], { status: 200 });
    }
    
    // Transformar datos para compatibilidad con el frontend
    const transformedSupports = data.map(normalizeSupport);
    
    return NextResponse.json(transformedSupports);
  } catch (error) {
    console.error('Error fetching supports:', error);
    return NextResponse.json([], { status: 200 }); // Devolver array vacío en caso de error
  }
}

// POST - Crear nuevo soporte
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Convertir FormData a objeto
    const data: any = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_')) {
        // Las imágenes se manejan por separado
        continue;
      }
      data[key] = value;
    }
    
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
    
    // Procesar imágenes
    const imageUrls: string[] = [];
    const imageFiles = [];
    
    // Recopilar archivos de imagen
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Subir imágenes a Supabase Storage a través del backend ERP
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

        try {
          const fd = new FormData();
          fd.append('file', imageFile, imageFile.name);
          fd.append('filename', imageFile.name);
          const up = await fetch(`${ERP_BASE_URL}/api/upload`, { method: 'POST', body: fd });
          if (!up.ok) {
            const msg = await up.text().catch(() => 'upload failed')
            console.warn('Upload failed:', msg)
            continue;
          }
          const uploadData = await up.json().catch(() => ({} as any));
          const url = uploadData?.url as string | undefined;
          if (url) imageUrls.push(url);
        } catch (error) {
          console.error('Error uploading image to ERP:', error);
          // Continuar con las otras imágenes aunque una falle
        }
      }
    }

    // Extraer dimensiones de width y height del string dimensions
    const dimensionsMatch = data.dimensions?.match(/(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)/);
    const widthM = dimensionsMatch ? parseFloat(dimensionsMatch[1]) : null;
    const heightM = dimensionsMatch ? parseFloat(dimensionsMatch[2]) : null;

    // Función para extraer coordenadas del enlace de Google Maps
    const extractCoordinatesFromGoogleMapsLink = async (link: string): Promise<{ lat: number | null, lng: number | null }> => {
      if (!link) return { lat: null, lng: null };

      const patterns = [
        /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
        /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
        /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
        /query=(-?\d+\.\d+),(-?\d+\.\d+)/, // query=lat,lng (API format)
        /center=(-?\d+\.\d+),(-?\d+\.\d+)/, // center=lat,lng
        /@(-?\d+\.\d+),(-?\d+\.\d+),/ // @lat,lng,zoom
      ];

      // Primero intentar extraer coordenadas directamente de la URL
      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match) {
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2])
          };
        }
      }

      // Si no se encuentran coordenadas y es un enlace acortado, intentar seguir la redirección
      try {
        const url = new URL(link);
        const hostname = url.hostname.toLowerCase();
        
        if (hostname === 'maps.app.goo.gl' || hostname === 'goo.gl') {
          // Para enlaces acortados, intentar obtener la URL final
          const response = await fetch(link, { 
            method: 'HEAD', 
            redirect: 'follow',
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StellarMotion/1.0)' }
          });
          
          if (response.ok) {
            const finalUrl = response.url;
            // Intentar extraer coordenadas de la URL final
            for (const pattern of patterns) {
              const match = finalUrl.match(pattern);
              if (match) {
                return {
                  lat: parseFloat(match[1]),
                  lng: parseFloat(match[2])
                };
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error al seguir redirección de enlace acortado:', error);
      }

      return { lat: null, lng: null };
    };

    // Procesar coordenadas
    let lat = data.lat ? parseFloat(data.lat) : null;
    let lng = data.lng ? parseFloat(data.lng) : null;
    
    // Si no hay coordenadas directas, intentar extraer del enlace de Google Maps
    if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && data.googleMapsLink) {
      const extractedCoords = await extractCoordinatesFromGoogleMapsLink(data.googleMapsLink);
      
      if (extractedCoords.lat !== null && extractedCoords.lng !== null) {
        lat = extractedCoords.lat;
        lng = extractedCoords.lng;
        console.log('Coordenadas extraídas del enlace de Google Maps:', { lat, lng });
      } else {
        console.warn('No se pudieron extraer coordenadas del enlace de Google Maps:', data.googleMapsLink);
      }
    }
    
    // Si aún no hay coordenadas válidas, usar coordenadas por defecto
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      lat = 40.4168;
      lng = -3.7038;
    }

    // Preparar datos para el ERP
    const supportData = {
      title: data.title,
      type: data.type || 'VALLADO',
      city: data.city,
      country: data.country || 'España',
      latitude: lat,
      longitude: lng,
      googleMapsLink: data.googleMapsLink || null, // Guardar el enlace original
      address: data.address,
      priceMonth: data.pricePerMonth,
      available: true,
      status: 'DISPONIBLE',
      partnerId: data.partnerId,
      dimensions: data.dimensions,
      widthM,
      heightM,
      dailyImpressions: data.dailyImpressions,
      lighting: data.lighting === 'true',
      tags: data.tags || '',
      imageUrl: imageUrls[0] || '/placeholder.svg?height=400&width=600',
      images: JSON.stringify(imageUrls),
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      featured: data.featured === 'true' || false,
      printingCost: data.printingCost,
      categoryId: data.categoryId,
      code: data.code || ''
    };
    
    const erpUrl = `${ERP_BASE_URL}/api/soportes`;
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
    
    // Transformar a formato de producto para compatibilidad
    const product = {
      id: newSupport.id,
      slug: newSupport.slug,
      title: newSupport.title,
      city: newSupport.city,
      country: newSupport.country,
      dimensions: newSupport.dimensions,
      dailyImpressions: newSupport.dailyImpressions,
      type: newSupport.type,
      lighting: newSupport.lighting,
      tags: [],
      images: imageUrls,
      shortDescription: newSupport.shortDescription,
      description: newSupport.description,
      featured: newSupport.featured,
      latitude: newSupport.latitude,
      longitude: newSupport.longitude,
      pricePerMonth: newSupport.priceMonth,
      printingCost: newSupport.printingCost || 0,
      rating: newSupport.rating,
      reviewsCount: newSupport.reviewsCount || 0,
      categoryId: newSupport.categoryId,
      category: null,
      available: newSupport.available,
      status: newSupport.status,
      createdAt: newSupport.createdAt,
      updatedAt: newSupport.updatedAt,
    };
    
    return NextResponse.json({
      success: true,
      product
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating support:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchFromERP, API_BASE_URL } from '@/lib/api-config';
import { getSoporteCoordinates } from '@/lib/google-maps-utils';

// Forzar runtime Node.js para acceso a process.env
export const runtime = 'nodejs';

// GET - Obtener un soporte específico por ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de soporte requerido' },
        { status: 400 }
      );
    }
    
    // Construir URL para el ERP
    const erpUrl = `${API_BASE_URL}/api/soportes/${id}`;
    
    console.log('📡 API soportes/[id]: Fetching from ERP:', erpUrl);
    
    let support;
    try {
      support = await fetchFromERP(erpUrl);
    } catch (error) {
      console.error('❌ API soportes/[id]: Error fetching from ERP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Si el error es 404, devolver 404
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        return NextResponse.json(
          { error: 'Soporte no encontrado' },
          { status: 404 }
        );
      }
      
      // Para otros errores, devolver 500 con más información
      return NextResponse.json(
        { error: `Error al obtener soporte: ${errorMessage}` },
        { status: 500 }
      );
    }
    
    if (!support) {
      console.warn('⚠️ API soportes/[id]: Soporte no encontrado (null/undefined)');
      return NextResponse.json(
        { error: 'Soporte no encontrado' },
        { status: 404 }
      );
    }
    
    // Procesar coordenadas del googleMapsLink si está disponible
    let coords = null;
    try {
      coords = await getSoporteCoordinates(support);
    } catch (error) {
      console.warn('⚠️ API soportes/[id]: Error obteniendo coordenadas de Google Maps:', error);
      // Continuar sin coordenadas de Google Maps, usar las del soporte
    }
    const finalLat = coords?.lat || support.latitude || support.latitud || 0;
    const finalLng = coords?.lng || support.longitude || support.longitud || 0;
    
    console.log('ProductClient - soporte data:', {
      latitud: finalLat,
      longitud: finalLng,
      nombre: support.title,
      ciudad: support.city,
      googleMapsLink: support.googleMapsLink
    });

    // Transformar datos para compatibilidad con el frontend
    const transformedSupport = {
      id: support.id,
      slug: support.id, // Usar ID como slug
      title: support.nombre,
      city: support.ciudad,
      country: support.pais,
      dimensions: support.dimensiones ? `${support.dimensiones.ancho || 0}x${support.dimensiones.alto || 0}m` : '0x0m',
      dailyImpressions: support.impactosDiarios || 0,
      type: support.tipo,
      lighting: support.iluminacion,
      tags: [],
      images: support.imagenes || [],
      shortDescription: support.descripcion,
      description: support.descripcion,
      featured: support.destacado,
      lat: finalLat,
      lng: finalLng,
      pricePerMonth: support.precio,
      printingCost: 0,
      rating: 0,
      reviewsCount: 0,
      categoryId: support.categoria,
      status: support.estado,
      available: support.estado === 'Disponible',
      address: support.ubicacion,
      googleMapsLink: support.googleMapsLink,
      createdAt: support.createdAt,
      updatedAt: support.updatedAt,
      code: support.codigoInterno,
      // Campos adicionales para el frontend
      nombre: support.nombre,
      descripcion: support.descripcion,
      ubicacion: support.ubicacion,
      latitud: finalLat,
      longitud: finalLng,
      tipo: support.tipo,
      estado: support.estado,
      precio: support.precio,
      dimensiones: support.dimensiones,
      imagenes: support.imagenes,
      categoria: support.categoria,
      codigoInterno: support.codigoInterno,
      codigoCliente: support.codigoCliente,
      pais: support.pais,
      ciudad: support.ciudad,
      impactosDiarios: support.impactosDiarios,
      impactosDiariosPorM2: support.impactosDiariosPorM2,
      resumenAutomatico: support.resumenAutomatico,
      usuarioId: support.usuarioId,
      owner: support.owner,
      iluminacion: support.iluminacion,
      destacado: support.destacado
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

// PUT - Actualizar un soporte existente
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de soporte requerido' },
        { status: 400 }
      );
    }
    
    // Extraer datos del formulario
    const title = formData.get('title') as string;
    const pricePerMonth = parseFloat(formData.get('pricePerMonth') as string) || 0;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const dimensions = formData.get('dimensions') as string;
    const lighting = formData.get('lighting') === 'true';
    const type = formData.get('type') as string;
    const dailyImpressions = parseInt(formData.get('dailyImpressions') as string) || 0;
    const shortDescription = formData.get('shortDescription') as string;
    const description = formData.get('description') as string;
    let lat = parseFloat(formData.get('lat') as string) || 0;
    let lng = parseFloat(formData.get('lng') as string) || 0;
    const code = formData.get('code') as string;
    const status = formData.get('status') as string;
    
    console.log('Datos extraídos del FormData:', {
      title, pricePerMonth, city, country, dimensions, lighting, type, 
      dailyImpressions, shortDescription, description, lat, lng, code, status
    });

    // Validar datos requeridos
    if (!title || !pricePerMonth || !city || !country || 
        !dimensions || !type) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Extraer coordenadas del enlace de Google Maps si se proporciona
    const googleMapsLink = formData.get('googleMapsLink') as string;
    if (googleMapsLink && googleMapsLink.trim()) {
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
          /@(-?\d+\.\d+),(-?\d+\.\d+),/, // @lat,lng,zoom
          /3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // 3dlat!4dlng (sin ! inicial)
          /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
          /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng (sin zoom)
        ];

        // Primero intentar extraer coordenadas directamente de la URL
        console.log('Extrayendo coordenadas de URL:', link);
        for (const pattern of patterns) {
          const match = link.match(pattern);
          if (match) {
            console.log('Coordenadas encontradas con patrón:', pattern, 'Match:', match);
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
              console.log('URL final después de redirección:', finalUrl);
              // Intentar extraer coordenadas de la URL final
              for (const pattern of patterns) {
                const match = finalUrl.match(pattern);
                if (match) {
                  console.log('Coordenadas encontradas en URL final con patrón:', pattern, 'Match:', match);
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

      console.log('Intentando extraer coordenadas del enlace:', googleMapsLink);
      const extractedCoords = await extractCoordinatesFromGoogleMapsLink(googleMapsLink);
      console.log('Coordenadas extraídas:', extractedCoords);
      
      if (extractedCoords.lat !== null && extractedCoords.lng !== null) {
        lat = extractedCoords.lat;
        lng = extractedCoords.lng;
        console.log('Coordenadas actualizadas desde el enlace:', { lat, lng });
      } else {
        console.warn('No se pudieron extraer coordenadas del enlace de Google Maps:', googleMapsLink);
      }
    }

    // Validar coordenadas (opcional pero si se proporcionan deben ser válidas)
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      console.warn('Coordenadas inválidas o faltantes, usando coordenadas por defecto');
      // Usar coordenadas por defecto (Madrid)
      lat = 40.4168;
      lng = -3.7038;
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

    // Subir imágenes a través del backend ERP
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
          const up = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: fd });
          if (!up.ok) {
            const msg = await up.text().catch(() => 'upload failed')
            console.warn('Upload failed:', msg)
            continue;
          }
          const data = await up.json().catch(() => ({} as any));
          const url = data?.url as string | undefined;
          if (url) imageUrls.push(url);
        } catch (error) {
          console.error('Error uploading image to ERP:', error);
          // Continuar con las otras imágenes aunque una falle
        }
      }
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
      googleMapsLink: googleMapsLink || null, // Guardar el enlace original
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
      available: status === 'DISPONIBLE',
      status: status,
      categoryId: null,
      code: code || '', // Código opcional
    };

    // Actualizar el soporte en el backend
    console.log('=== FRONTEND API: Iniciando actualización ===');
    console.log('Actualizando soporte con ID:', id);
    console.log('URL del ERP:', `${API_BASE_URL}/api/soportes/${id}`);
    console.log('Datos a enviar:', JSON.stringify(supportData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/soportes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supportData),
    });

    console.log('Respuesta del ERP:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del ERP:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Error al actualizar el soporte' },
        { status: response.status }
      );
    }

    const updatedSupport = await response.json();
    console.log('Soporte actualizado del ERP:', updatedSupport);

    // Transformar a formato de producto para compatibilidad
    const product = {
      id: updatedSupport.id,
      slug: updatedSupport.slug,
      title: updatedSupport.title,
      city: updatedSupport.city,
      country: updatedSupport.country,
      dimensions: updatedSupport.dimensions,
      dailyImpressions: updatedSupport.dailyImpressions,
      type: updatedSupport.type,
      lighting: updatedSupport.lighting,
      tags: [],
      images: imageUrls,
      shortDescription: updatedSupport.shortDescription,
      description: updatedSupport.description,
      featured: updatedSupport.featured,
      latitude: updatedSupport.latitude,
      longitude: updatedSupport.longitude,
      pricePerMonth: updatedSupport.priceMonth,
      printingCost: updatedSupport.printingCost || 0,
      rating: updatedSupport.rating,
      reviewsCount: updatedSupport.reviewsCount || 0,
      categoryId: updatedSupport.categoryId,
      category: null,
      available: updatedSupport.available,
      status: updatedSupport.status,
      createdAt: updatedSupport.createdAt,
      updatedAt: updatedSupport.updatedAt,
    };

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error updating support:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualización parcial (p. ej. destacado)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID de soporte requerido' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const featured = body.featured;
    if (typeof featured !== 'boolean') {
      return NextResponse.json({ error: "Se requiere 'featured' (boolean)" }, { status: 400 });
    }
    const response = await fetch(`${API_BASE_URL}/api/soportes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      return NextResponse.json(
        { error: (err as { error?: string }).error || 'Error al actualizar' },
        { status: response.status }
      );
    }
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error PATCH support:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un soporte (proxy al ERP)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID de soporte requerido' }, { status: 400 });
    }
    const response = await fetch(`${API_BASE_URL}/api/soportes/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      return NextResponse.json(
        { error: (err as { error?: string }).error || 'Error al eliminar el soporte' },
        { status: response.status }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting support:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
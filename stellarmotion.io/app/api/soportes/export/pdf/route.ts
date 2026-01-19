export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import { fetchFromERP, API_BASE_URL } from "@/lib/api-config";
import jsPDF from 'jspdf';
import fs from 'fs';
import path from 'path';

/**
 * Función para crear slug SEO-friendly
 */
function createSlug(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Función para normalizar el nombre del archivo eliminando acentos y caracteres especiales
 */
function normalizeFileName(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/[áàäâãÁÀÄÂÃ]/g, 'a')
    .replace(/[éèëêÉÈËÊ]/g, 'e')
    .replace(/[íìïîÍÌÏÎ]/g, 'i')
    .replace(/[óòöôõÓÒÖÔÕ]/g, 'o')
    .replace(/[úùüûÚÙÜÛ]/g, 'u')
    .replace(/[ñÑ]/g, 'n')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-zA-Z0-9\s\-_\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Función para generar URL del soporte en la web pública
 */
function getSoporteWebUrl(soporteTitle: string, soporteId?: string, soporteCode?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stellarmotion.io';
  const slug = createSlug(soporteTitle);
  
  if (slug) {
    return `${baseUrl}/product/${slug}`;
  } else if (soporteId && soporteId.trim() !== '') {
    return `${baseUrl}/product/${soporteId}`;
  } else if (soporteCode && soporteCode.trim() !== '') {
    return `${baseUrl}/product/${soporteCode}`;
  }
  
  return `${baseUrl}/product`;
}

/**
 * Función para cargar una imagen desde URL (con compresión)
 */
async function loadImage(imageUrl: string): Promise<{ base64: string | null; format: string }> {
  if (!imageUrl) {
    return { base64: null, format: 'JPEG' };
  }

  if (imageUrl.startsWith('data:')) {
    return { base64: imageUrl, format: 'JPEG' };
  }

  try {
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      throw new Error(`URL inválida: ${imageUrl}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StellarMotion/1.0)',
        'Accept': 'image/*'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength === 0) {
      throw new Error('Imagen vacía recibida');
    }

    const buffer = Buffer.from(imageBuffer);
    const contentType = response.headers.get('content-type') || '';
    let format = 'JPEG';
    let isPNG = false;
    let isWEBP = false;
    
    if (contentType.includes('png')) {
      format = 'PNG';
      isPNG = true;
    } else if (contentType.includes('webp')) {
      format = 'WEBP';
      isWEBP = true;
    }

    // Optimización conservadora: comprimir imágenes grandes manteniendo calidad visual
    try {
      let canvasModule;
      try {
        canvasModule = await import('canvas');
      } catch (importError) {
        console.warn('⚠️ Canvas no disponible, usando imagen sin comprimir:', importError);
        // Si canvas no está disponible, retornar imagen sin comprimir
        return {
          base64: `data:image/${format.toLowerCase()};base64,${buffer.toString('base64')}`,
          format
        };
      }
      const { createCanvas, loadImage: canvasLoadImage } = canvasModule;
      
      const img = await canvasLoadImage(buffer);
      const imgCanvas = createCanvas(img.width, img.height);
      const imgCtx = imgCanvas.getContext('2d');
      imgCtx.drawImage(img, 0, 0);
      
      let hasAlpha = false;
      if (isPNG) {
        const imageData = imgCtx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            hasAlpha = true;
            break;
          }
        }
      }
      
      if (isPNG && !hasAlpha) {
        const compressedBuffer = imgCanvas.toBuffer('image/jpeg', { 
          quality: 0.89, 
          progressive: true,
          chromaSubsampling: false 
        });
        return {
          base64: `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`,
          format: 'JPEG'
        };
      } else if (format === 'JPEG' || isWEBP) {
        const compressedBuffer = imgCanvas.toBuffer('image/jpeg', { 
          quality: 0.89, 
          progressive: true,
          chromaSubsampling: false 
        });
        return {
          base64: `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`,
          format: 'JPEG'
        };
      } else {
        return {
          base64: `data:image/${format.toLowerCase()};base64,${buffer.toString('base64')}`,
          format
        };
      }
    } catch (compressionError) {
      console.error('No se pudo comprimir imagen, usando original:', compressionError);
      return {
        base64: `data:image/${format.toLowerCase()};base64,${buffer.toString('base64')}`,
        format
      };
    }
  } catch (error) {
    console.error('❌ Error cargando imagen del soporte:', error instanceof Error ? error.message : error);
    return { base64: null, format: 'JPEG' };
  }
}

/**
 * Función para generar mapa OSM respetando políticas de rate limiting
 */
async function generateOSMMap(lat: number, lng: number, mapWidthPx: number, mapHeightPx: number): Promise<string | null> {
  try {
    const zoom = 17;
    const tileSize = 256;

    const n = Math.pow(2, zoom);
    const centerX = (lng + 180) / 360 * n;
    const centerY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n;

    const tileX = Math.floor(centerX);
    const tileY = Math.floor(centerY);

    const pixelX = (centerX - tileX) * tileSize + tileSize;
    const pixelY = (centerY - tileY) * tileSize + tileSize;

    const tilesToDownload: Array<{ tx: number; ty: number; col: number; row: number }> = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        tilesToDownload.push({
          tx: tileX + dx,
          ty: tileY + dy,
          col: dx + 1,
          row: dy + 1
        });
      }
    }

    const MAX_CONCURRENT = 2;
    const DELAY_BETWEEN_TILES = 120;
    const composites: Array<{ input: Buffer; left: number; top: number }> = [];

    for (let i = 0; i < tilesToDownload.length; i += MAX_CONCURRENT) {
      const batch = tilesToDownload.slice(i, i + MAX_CONCURRENT);
      
      const batchPromises = batch.map(async ({ tx, ty, col, row }) => {
        const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const tileResponse = await fetch(tileUrl, {
            headers: {
              'User-Agent': 'StellarMotion/1.0 (+https://stellarmotion.io; contacto@stellarmotion.io)',
              'Accept': 'image/png,image/*',
              'Referer': 'https://stellarmotion.io'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (tileResponse.ok) {
            const tileBuffer = Buffer.from(await tileResponse.arrayBuffer());
            return {
              input: tileBuffer,
              left: col * tileSize,
              top: row * tileSize
            };
          } else {
            console.error(`Tile ${tx},${ty} falló: HTTP ${tileResponse.status}`);
            return null;
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Tile ${tx},${ty} error: ${errorMsg}`);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result !== null) {
          composites.push(result);
        }
      });
      
      if (i + MAX_CONCURRENT < tilesToDownload.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TILES));
      }
    }

    if (composites.length === 0) {
      throw new Error('No se pudo descargar ningún tile de OSM');
    }

    const gridSize = 3 * tileSize;
    
    try {
      let canvasModule;
      try {
        canvasModule = await import('canvas');
      } catch (importError) {
        console.warn('⚠️ Canvas no disponible para mapas, usando tile central:', importError);
        const centralTile = composites.find(c => c.left === tileSize && c.top === tileSize) || composites[0];
        return `data:image/png;base64,${centralTile.input.toString('base64')}`;
      }
      const { createCanvas, loadImage } = canvasModule;
      const canvas = createCanvas(gridSize, gridSize);
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#c8c8c8';
      ctx.fillRect(0, 0, gridSize, gridSize);
      
      for (const composite of composites) {
        const img = await loadImage(composite.input);
        ctx.drawImage(img, composite.left, composite.top);
      }
      
      const cropLeft = Math.max(0, Math.min(gridSize - mapWidthPx, Math.floor(pixelX - mapWidthPx / 2)));
      const cropTop = Math.max(0, Math.min(gridSize - mapHeightPx, Math.floor(pixelY - mapHeightPx / 2)));
      
      // Agregar icono del billboard si existe
      try {
        const iconPath = path.join(process.cwd(), 'public', 'billboard.png');
        if (fs.existsSync(iconPath)) {
          const iconImg = await loadImage(iconPath);
          const iconSizeMm = 20;
          const iconSizePx = Math.round(iconSizeMm * mapWidthPx / 130);
          const offsetDownMm = 10;
          const offsetDownPx = Math.round(offsetDownMm * mapHeightPx / 90);
          ctx.drawImage(iconImg, pixelX - iconSizePx / 2, pixelY - iconSizePx + offsetDownPx, iconSizePx, iconSizePx);
        }
      } catch (iconError) {
        console.error('Error agregando icono en composición:', iconError);
      }
      
      const croppedCanvas = createCanvas(mapWidthPx, mapHeightPx);
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(
        canvas,
        cropLeft, cropTop, mapWidthPx, mapHeightPx,
        0, 0, mapWidthPx, mapHeightPx
      );
      
      const finalMapBuffer = croppedCanvas.toBuffer('image/jpeg', { 
        quality: 0.91, 
        progressive: true,
        chromaSubsampling: false
      });
      return `data:image/jpeg;base64,${finalMapBuffer.toString('base64')}`;
    } catch (canvasError) {
      console.error('Canvas no disponible, usando tile central:', canvasError);
      const centralTile = composites.find(c => c.left === tileSize && c.top === tileSize) || composites[0];
      return `data:image/png;base64,${centralTile.input.toString('base64')}`;
    }
  } catch (error) {
    console.error('❌ Error generando mapa OSM:', error);
    return null;
  }
}

/**
 * Construye el nombre del archivo PDF según los filtros y selección
 */
function buildPDFFileName({
  disponibilidad,
  ciudad,
  soporte,
}: {
  disponibilidad?: string;
  ciudad?: string;
  soporte?: string;
}): string {
  const hoy = new Date();
  const fecha = `${String(hoy.getDate()).padStart(2, "0")}-${String(
    hoy.getMonth() + 1
  ).padStart(2, "0")}-${hoy.getFullYear()}`;

  if (soporte) {
    return `${soporte} - ${fecha}.pdf`;
  }

  if (disponibilidad && ciudad) {
    const dispUpper = disponibilidad === "disponibles" ? "Disponibles" : "Ocupados";
    return `${dispUpper} - ${ciudad} - ${fecha}.pdf`;
  }

  if (disponibilidad) {
    const dispUpper = disponibilidad === "disponibles" ? "Disponibles" : "Ocupados";
    return `${dispUpper} - ${fecha}.pdf`;
  }

  if (ciudad) {
    return `${ciudad} - ${fecha}.pdf`;
  }

  return `Catalogo Soportes - ${fecha}.pdf`;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ids = url.searchParams.get('ids');
    
    const userEmail = url.searchParams.get('email') || undefined;
    const userNumero = url.searchParams.get('numero') || undefined;
    const disponibilidad = url.searchParams.get('disponibilidad') || undefined;
    const ciudad = url.searchParams.get('ciudad') || undefined;
    const soporteTituloEncoded = url.searchParams.get('soporte') || undefined;
    const soporteTitulo = soporteTituloEncoded ? decodeURIComponent(soporteTituloEncoded) : undefined;
    
    if (!ids) {
      return NextResponse.json({ error: "IDs de soportes requeridos" }, { status: 400 });
    }

    const supportIds = ids.split(',');

    // Obtener los soportes del ERP
    const supports = [];
    for (const id of supportIds) {
      try {
        const erpUrl = `${API_BASE_URL}/api/soportes/${id}`;
        console.log(`📡 Obteniendo soporte ${id} desde: ${erpUrl}`);
        const support = await fetchFromERP(erpUrl);
        
        if (!support) {
          console.warn(`⚠️ Soporte ${id} no encontrado o es null`);
          continue;
        }
        
        console.log(`✅ Soporte ${id} obtenido:`, {
          id: support.id,
          nombre: support.nombre || support.title,
          tieneImagenes: !!(support.imagenes || support.images),
          tieneCoordenadas: !!(support.latitud || support.latitude)
        });
        
        if (support) {
          // Extraer dimensiones
          let widthM = 0;
          let heightM = 0;
          let areaM2 = 0;
          if (support.dimensiones) {
            if (typeof support.dimensiones === 'string') {
              const dimMatch = support.dimensiones.match(/(\d+(?:\.\d+)?)[x×](\d+(?:\.\d+)?)/i);
              if (dimMatch) {
                widthM = parseFloat(dimMatch[1]);
                heightM = parseFloat(dimMatch[2]);
                areaM2 = widthM * heightM;
              }
            } else if (typeof support.dimensiones === 'object') {
              widthM = support.dimensiones.ancho || 0;
              heightM = support.dimensiones.alto || 0;
              areaM2 = widthM * heightM;
            }
          }

          // Transformar a formato esperado
          const transformedSupport = {
            id: support.id,
            title: support.nombre || support.title || 'Sin título',
            code: support.codigoInterno || support.code || '',
            city: support.ciudad || support.city || '',
            country: support.pais || support.country || '',
            type: support.tipo || support.type || '',
            dimensions: support.dimensiones ? 
              (typeof support.dimensiones === 'string' ? support.dimensiones : 
               `${widthM || 0}x${heightM || 0}m`) : 
              '0x0m',
            widthM,
            heightM,
            areaM2,
            pricePerMonth: support.precio || support.priceMonth || support.pricePerMonth || 0,
            priceMonth: support.precio || support.priceMonth || support.pricePerMonth || 0,
            status: support.estado || support.status || 'DISPONIBLE',
            images: support.imagenes || support.images || [],
            description: support.descripcion || support.description || '',
            latitude: support.latitud || support.latitude || 0,
            longitude: support.longitud || support.longitude || 0,
            lighting: support.iluminacion || support.lighting || 'No',
            zona: support.zona || '',
            impactosDiarios: support.impactosDiarios || support.dailyImpressions || 0,
            sustrato_precio_venta: 0, // No disponible en stellarmotion.io
            sustrato_nombre: 'LONA 13 Oz + IMPRESIÓN',
            createdTime: support.createdAt || support.createdTime,
          };
          supports.push(transformedSupport);
        }
      } catch (error) {
        console.error(`❌ Error fetching support ${id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`   Detalles: ${errorMessage}`);
        // Continuar con los otros soportes en lugar de fallar completamente
      }
    }

    if (supports.length === 0) {
      console.error('❌ No se encontraron soportes después de procesar todos los IDs');
      return NextResponse.json({ 
        error: "No se encontraron soportes. Verifica que los IDs sean válidos y que los soportes existan en el sistema." 
      }, { status: 404 });
    }
    
    console.log(`✅ Total de soportes obtenidos: ${supports.length} de ${supportIds.length} IDs`);

    // Generar PDF
    console.log('📄 Iniciando generación de PDF...');
    let pdf: Buffer;
    try {
      pdf = await generatePDF(supports, userEmail, userNumero);
      console.log('✅ PDF generado correctamente');
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar PDF';
      return NextResponse.json({ 
        error: `Error al generar el PDF: ${errorMessage}` 
      }, { status: 500 });
    }
    
    // Construir nombre del archivo
    let fileName = buildPDFFileName({
      disponibilidad,
      ciudad,
      soporte: soporteTitulo,
    });
    
    fileName = normalizeFileName(fileName);
    fileName = fileName.trim().replace(/[_\s]+$/, '').replace(/\s+/g, ' ');
    
    // Configurar headers para descarga
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    const encodedFileName = encodeURIComponent(fileName);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`);
    
    return new NextResponse(pdf, { headers });
  } catch (error) {
    console.error("❌ Error en GET /api/soportes/export/pdf:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error("   Stack:", error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json({ 
      error: `Error al generar el catálogo: ${errorMessage}` 
    }, { status: 500 });
  }
}

// Función para obtener el email a mostrar en el footer
function obtenerEmailFooter(email?: string): string | undefined {
  if (!email) return undefined;
  return email;
}

async function generatePDF(supports: any[], userEmail?: string, userNumero?: string): Promise<Buffer> {
  try {
    const emailFooter = obtenerEmailFooter(userEmail);
    console.log('📄 Generando PDF catálogo con email:', emailFooter, 'y número:', userNumero);
    console.log('📄 Número de soportes a procesar:', supports.length);
    
    if (!supports || supports.length === 0) {
      throw new Error('No hay soportes para generar el PDF');
    }
    
    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentYear = new Date().getFullYear();
    
    let pdf: jsPDF;
    try {
      pdf = new jsPDF('l', 'mm', 'a4');
    } catch (pdfError) {
      console.error('❌ Error creando instancia de jsPDF:', pdfError);
      throw new Error(`Error al inicializar el generador de PDF: ${pdfError instanceof Error ? pdfError.message : 'Error desconocido'}`);
    }
    
    const primaryColor: [number, number, number] = [233, 68, 70]; // Color rojo de StellarMotion
    
    let yPosition = 20;

    const getStatusColors = (status: string) => {
      const statusUpper = status.toUpperCase();
      if (statusUpper === 'DISPONIBLE' || statusUpper === 'DISPONIBLES' || statusUpper === 'DISPONIBLE') {
        return { bg: [220, 252, 231], text: [22, 101, 52] };
      } else if (statusUpper === 'RESERVADO' || statusUpper === 'RESERVADOS') {
        return { bg: [254, 249, 195], text: [133, 77, 14] };
      } else if (statusUpper === 'OCUPADO' || statusUpper === 'OCUPADOS') {
        return { bg: [254, 226, 226], text: [153, 27, 27] };
      } else if (statusUpper === 'NO DISPONIBLE' || statusUpper === 'NO DISPONIBLES') {
        return { bg: [243, 244, 246], text: [55, 65, 81] };
      } else if (statusUpper === 'A CONSULTAR') {
        return { bg: [219, 234, 254], text: [30, 64, 175] };
      }
      return { bg: [243, 244, 246], text: [55, 65, 81] };
    };

    // Cargar logo
    let logoBase64Watermark: string | null = null;
    let logoBase64Header: string | null = null;
    try {
      // Intentar primero con el logo de StellarMotion
      const logoPath = path.join(process.cwd(), 'public', 'logostellarmotion.jpg');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
        logoBase64Watermark = logoBase64;
        logoBase64Header = logoBase64;
      } else {
        // Fallback al logo anterior si no existe el nuevo
        const fallbackLogoPath = path.join(process.cwd(), 'public', 'logo.jpg');
        if (fs.existsSync(fallbackLogoPath)) {
          const logoBuffer = fs.readFileSync(fallbackLogoPath);
          const logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
          logoBase64Watermark = logoBase64;
          logoBase64Header = logoBase64;
        }
      }
    } catch (error) {
      console.warn('Logo no disponible:', error);
    }

    // Pre-procesar imágenes y mapas
    console.log('🔄 Pre-procesando imágenes y mapas en paralelo...');
    const mapWidth = 130;
    const mapHeight = 90;
    const mapWidthPx = Math.round(mapWidth * 3.7795);
    const mapHeightPx = Math.round(mapHeight * 3.7795);

    const preprocessPromises = supports.map(async (support) => {
      const processed: { image: { base64: string | null; format: string } | null; map: string | null } = {
        image: null,
        map: null
      };

      if (support.images && support.images.length > 0) {
        const firstImage = Array.isArray(support.images) ? support.images[0] : support.images;
        if (typeof firstImage === 'string') {
          processed.image = await loadImage(firstImage);
        }
      }

      if (support.latitude && support.longitude) {
        processed.map = await generateOSMMap(support.latitude, support.longitude, mapWidthPx, mapHeightPx);
      }

      return processed;
    });

    const preprocessedData = await Promise.all(preprocessPromises);
    console.log('✅ Pre-procesamiento completado');

    // Agregar cada soporte
    for (let index = 0; index < supports.length; index++) {
      const support = supports[index];
      if (index > 0) {
        pdf.addPage();
      }
      
      yPosition = 10;
      
      // Logo
      const addLogo = () => {
        try {
          if (logoBase64Header) {
            const aspectRatio = 24 / 5.5;
            const maxHeight = 15; // Duplicado de 7.5 a 15
            const calculatedWidth = maxHeight * aspectRatio;
            const logoWidth = Math.min(calculatedWidth, 70); // Duplicado de 35 a 70
            const logoHeight = logoWidth / aspectRatio;
            
            const logoX = 12; // Ligeramente a la derecha (de 5 a 12)
            const logoY = yPosition - 1;
            
            pdf.addImage(logoBase64Header, 'JPEG', logoX, logoY, logoWidth, logoHeight);
            return true;
          }
          
          // Intentar primero con el logo de StellarMotion
          const logoPath = path.join(process.cwd(), 'public', 'logostellarmotion.jpg');
          if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            const logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
            
            const aspectRatio = 24 / 5.5;
            const maxHeight = 15; // Duplicado de 7.5 a 15
            const calculatedWidth = maxHeight * aspectRatio;
            const logoWidth = Math.min(calculatedWidth, 70); // Duplicado de 35 a 70
            const logoHeight = logoWidth / aspectRatio;
            
            const logoX = 12; // Ligeramente a la derecha (de 5 a 12)
            const logoY = yPosition - 1;
            
            pdf.addImage(logoBase64, 'JPEG', logoX, logoY, logoWidth, logoHeight);
            return true;
          } else {
            // Fallback al logo anterior
            const fallbackLogoPath = path.join(process.cwd(), 'public', 'logo.jpg');
            if (fs.existsSync(fallbackLogoPath)) {
              const logoBuffer = fs.readFileSync(fallbackLogoPath);
              const logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
              
              const aspectRatio = 24 / 5.5;
              const maxHeight = 15; // Duplicado de 7.5 a 15
              const calculatedWidth = maxHeight * aspectRatio;
              const logoWidth = Math.min(calculatedWidth, 70); // Duplicado de 35 a 70
              const logoHeight = logoWidth / aspectRatio;
              
              const logoX = 12; // Ligeramente a la derecha (de 5 a 12)
              const logoY = yPosition - 1;
              
              pdf.addImage(logoBase64, 'JPEG', logoX, logoY, logoWidth, logoHeight);
              return true;
            }
          }
          return false;
        } catch (error) {
          return false;
        }
      };
      
      addLogo();
      
      // Título del soporte (ajustado para que no se solape con el logo más grande)
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(support.title, 100, yPosition + 8); // Movido más a la derecha y un poco más abajo
      
      yPosition += 20;
      
      // Imagen principal
      const preprocessedImage = preprocessedData[index]?.image;
      if (preprocessedImage && preprocessedImage.base64) {
        try {
          const imageX = 15;
          const imageY = yPosition;
          const imageWidth = 130;
          const imageHeight = 90;
          
          pdf.addImage(preprocessedImage.base64, preprocessedImage.format, imageX, imageY, imageWidth, imageHeight);
          
          const webUrl = getSoporteWebUrl(support.title, support.id, support.code);
          pdf.link(imageX, imageY, imageWidth, imageHeight, { url: webUrl });
          
          // Marca de agua (horizontal, más a la izquierda y centrada más arriba)
          if (logoBase64Watermark) {
            pdf.saveGraphicsState();
            pdf.setGState(new pdf.GState({ opacity: 0.2 })); // Menos transparente (de 0.08 a 0.2)
            
            const aspectRatio = 24 / 5.5;
            const watermarkWidth = 120;
            const watermarkHeight = watermarkWidth / aspectRatio;
            
            // Centrar horizontalmente con la imagen (50% desde la izquierda)
            const imageCenterX = imageX + imageWidth * 0.5;
            // Centrar verticalmente con la imagen (50% desde arriba)
            const imageCenterY = imageY + imageHeight * 0.5;
            
            pdf.addImage(
              logoBase64Watermark,
              'JPEG',
              imageCenterX - watermarkWidth / 2,
              imageCenterY - watermarkHeight / 2,
              watermarkWidth,
              watermarkHeight,
              undefined,
              'NONE',
              0  // Horizontal (sin rotación)
            );
            
            pdf.restoreGraphicsState();
          }
          
          pdf.setTextColor(0, 0, 255);
          pdf.setFontSize(6);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Clic para abrir en página web', imageX + imageWidth/2, imageY + imageHeight + 3, { align: 'center' });
        } catch (pdfError) {
          console.error('❌ Error agregando imagen al PDF:', pdfError);
        }
      }
      
      // Mapa de ubicación
      const preprocessedMap = preprocessedData[index]?.map;
      if (preprocessedMap) {
        try {
          const mapWidth = 130;
          const mapHeight = 90;
          const mapX = 155;
          const mapY = yPosition;
          
          pdf.addImage(preprocessedMap, 'PNG', mapX, mapY, mapWidth, mapHeight);
          
          if (logoBase64Watermark) {
            pdf.saveGraphicsState();
            pdf.setGState(new pdf.GState({ opacity: 0.2 })); // Menos transparente (de 0.08 a 0.2)
            
            const aspectRatio = 24 / 5.5;
            const watermarkWidth = 120;
            const watermarkHeight = watermarkWidth / aspectRatio;
            
            // Centrar horizontalmente con el mapa (50% desde la izquierda)
            const mapCenterX = mapX + mapWidth * 0.5;
            // Centrar verticalmente con el mapa (50% desde arriba)
            const mapCenterY = mapY + mapHeight * 0.5;
            
            pdf.addImage(
              logoBase64Watermark,
              'JPEG',
              mapCenterX - watermarkWidth / 2,
              mapCenterY - watermarkHeight / 2,
              watermarkWidth,
              watermarkHeight,
              undefined,
              'NONE',
              0  // Horizontal (sin rotación)
            );
            
            pdf.restoreGraphicsState();
          }
          
          if (support.latitude && support.longitude) {
            const googleMapsUrl = `https://www.google.com/maps?q=${support.latitude},${support.longitude}`;
            pdf.link(mapX, mapY, mapWidth, mapHeight, { url: googleMapsUrl });
          }
          
          pdf.setTextColor(0, 0, 255);
          pdf.setFontSize(6);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Clic para abrir en Google Maps', mapX + mapWidth/2, mapY + mapHeight + 3, { align: 'center' });
        } catch (pdfError) {
          console.error('❌ Error agregando mapa al PDF:', pdfError);
        }
      } else if (support.latitude && support.longitude) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('UBICACIÓN', 220, yPosition + 5, { align: 'center' });
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Lat: ${support.latitude.toFixed(4)}`, 200, yPosition + 15);
        pdf.text(`Lng: ${support.longitude.toFixed(4)}`, 200, yPosition + 20);
      }
      
      yPosition += 100;
      
      // Línea separadora
      pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.line(15, yPosition, 282, yPosition);
      yPosition += 15;
      
      // Tabla con 4 columnas y 3 filas
      const tableX = 15;
      const tableWidth = 267;
      const tableY = yPosition;
      const colWidths = [66, 66, 66, 69];
      const rowHeight = 16;
      const numRows = 3;
      
      pdf.setLineWidth(0.2);
      pdf.setDrawColor(180, 180, 180);
      
      const tableData = [
        [
          { label: 'Código:', value: String(support.code || 'N/A') },
          { label: 'Tipo de soporte:', value: String(support.type || 'N/A') },
          { label: 'Sustrato de impresión:', value: 'Lona' },
          { label: 'Período de alquiler:', value: 'Mensual' }
        ],
        [
          { label: 'Ciudad:', value: String(support.city || 'N/A') },
          { label: 'Medidas:', value: `${support.widthM || 'N/A'}m × ${support.heightM || 'N/A'}m` },
          { label: 'Divisa:', value: '€' },
          { label: 'Precio de Lona:', value: `${(() => {
            const areaCalculada = (support.widthM || 0) * (support.heightM || 0);
            const areaFinal = areaCalculada > 0 ? areaCalculada : (support.areaM2 || 0);
            if (support.sustrato_precio_venta && areaFinal > 0) {
              return (support.sustrato_precio_venta * areaFinal).toLocaleString('es-ES', { maximumFractionDigits: 2 });
            }
            return 'N/A';
          })()} €` }
        ],
        [
          { label: 'Zona:', value: String(support.zona || 'N/A') },
          { label: 'Iluminación:', value: String(support.lighting === true ? 'Sí' : support.lighting === false ? 'No' : support.lighting || 'No') },
          { label: 'Impactos diarios:', value: support.impactosDiarios ? String(support.impactosDiarios.toLocaleString()) : 'N/A' },
          { label: 'Precio de alquiler:', value: support.priceMonth ? `${support.priceMonth.toLocaleString()} €` : 'N/A €' }
        ]
      ];
      
      for (let row = 0; row < numRows; row++) {
        let currentX = tableX;
        
        for (let col = 0; col < 4; col++) {
          const cellX = currentX;
          const cellY = tableY + row * rowHeight;
          
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(180, 180, 180);
          pdf.setLineWidth(0.2);
          pdf.rect(cellX, cellY, colWidths[col], rowHeight, 'FD');
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(11);
          
          const cellData = tableData[row][col];
          const label = cellData.label;
          // Asegurar que value sea siempre string
          const value = String(cellData.value || 'N/A');
          
          const maxWidth = colWidths[col] - 4;
          const textY = cellY + (rowHeight / 2) + 3;
          const startX = cellX + 3;
          
          pdf.setFont('helvetica', 'bold');
          const labelWidth = pdf.getTextWidth(label);
          pdf.text(label, startX, textY);
          
          pdf.setFont('helvetica', 'normal');
          const valueMaxWidth = maxWidth - labelWidth - 1;
          const valueLines = pdf.splitTextToSize(value, valueMaxWidth);
          
          if (valueLines.length === 1) {
            pdf.text(value, startX + labelWidth + 1, textY);
          } else {
            pdf.text(valueLines[0], startX + labelWidth + 1, textY);
          }
          
          currentX += colWidths[col];
        }
      }
      
      yPosition += numRows * rowHeight + 15;
      
      if (yPosition < 150) {
        if (support.latitude && support.longitude) {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Coordenadas: ${support.latitude.toFixed(6)}, ${support.longitude.toFixed(6)}`, 20, yPosition);
          yPosition += 10;
        }
        
        if (support.createdTime) {
          const createdDate = new Date(support.createdTime).toLocaleDateString('es-ES');
          pdf.text(`Creado: ${createdDate}`, 20, yPosition);
        }
      }
    }
    
    // Agregar footers con paginación
    const totalPages = pdf.getNumberOfPages();
    const footerY = 200;
    const pageWidth = 297;
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, footerY, pageWidth, 12, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      const leftText = `${currentYear} StellarMotion`;
      pdf.text(leftText, 5, footerY + 7);
      
      const leftTextWidth = pdf.getTextWidth(leftText);
      const separator1X = 5 + leftTextWidth + 5;
      pdf.text('|', separator1X, footerY + 7);
      
      let rightContentWidth = 0;
      if (emailFooter && emailFooter.trim() !== '') {
        rightContentWidth += pdf.getTextWidth(emailFooter) + 5;
        if (userNumero && userNumero.trim() !== '') {
          rightContentWidth += 5 + pdf.getTextWidth('|') + 5;
        }
      }
      if (userNumero && userNumero.trim() !== '') {
        rightContentWidth += pdf.getTextWidth(userNumero) + 5;
      }
      const paginationText = `${i}/${totalPages}`;
      rightContentWidth += pdf.getTextWidth(paginationText) + 5;
      if ((emailFooter && emailFooter.trim() !== '') || (userNumero && userNumero.trim() !== '')) {
        rightContentWidth += 5 + pdf.getTextWidth('|');
      }
      
      const separatorWidth = pdf.getTextWidth('|');
      const separator2X = pageWidth - 5 - rightContentWidth - separatorWidth;
      pdf.text('|', separator2X, footerY + 7);
      
      const webText = 'stellarmotion.io';
      const centerX = (separator1X + separator2X) / 2;
      pdf.text(webText, centerX, footerY + 7, { align: 'center' });
      
      let rightContentX = separator2X + 5;
      if (emailFooter && emailFooter.trim() !== '') {
        pdf.text(emailFooter, rightContentX, footerY + 7);
        rightContentX += pdf.getTextWidth(emailFooter) + 5;
        
        if (userNumero && userNumero.trim() !== '') {
          pdf.text('|', rightContentX, footerY + 7);
          rightContentX += 5;
        }
      }
      
      if (userNumero && userNumero.trim() !== '') {
        pdf.text(userNumero, rightContentX, footerY + 7);
        rightContentX += pdf.getTextWidth(userNumero) + 5;
      }
      
      if ((emailFooter && emailFooter.trim() !== '') || (userNumero && userNumero.trim() !== '')) {
        pdf.text('|', rightContentX, footerY + 7);
      }
      
      pdf.text(`${i}/${totalPages}`, pageWidth - 5, footerY + 7, { align: 'right' });
    }
    
    return Buffer.from(pdf.output('arraybuffer'));
  } catch (error) {
    console.error('Error en generatePDF:', error);
    throw error;
  }
}

// Supabase Service
// Servicio para operaciones con Supabase
// IMPORTANTE: Usa SOLO supabaseAdmin (SERVICE_ROLE_KEY) para todas las operaciones

import { supabaseAdmin } from './supabase-admin'

// Función para obtener URL pública de una imagen desde Supabase Storage
export function getPublicImageUrl(path: string | null | undefined): string {
  // Validar que path sea un string válido
  if (!path || typeof path !== 'string') {
    return '';
  }
  
  const trimmedPath = path.trim();
  if (!trimmedPath) {
    return '';
  }
  
  // Si ya es una URL completa, retornarla tal cual
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }
  
  // Obtener URL pública desde Supabase Storage
  const { data } = supabaseAdmin.storage
    .from('soportes')
    .getPublicUrl(trimmedPath);
  
  return data.publicUrl || '';
}

// Interfaces para los datos (mantenemos compatibilidad con el código existente)
export interface Soporte {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  streetViewHeading?: number;
  streetViewPitch?: number;
  streetViewZoom?: number;
  tipo: string;
  estado: 'disponible' | 'ocupado' | 'reservado' | 'mantenimiento';
  precio: number;
  dimensiones: {
    ancho: number;
    alto: number;
    area: number;
  };
  imagenes: string[];
  categoria: string;
  // Campos adicionales
  codigoInterno?: string;
  codigoCliente?: string;
  pais?: string;
  ciudad?: string;
  googleMapsLink?: string;
  resumenAutomatico?: string;
  /** Ubicación aproximada: mostrar círculo en mapa */
  showApproximateLocation?: boolean;
  approximateRadius?: number;
  /** Rango de precios */
  priceRangeEnabled?: boolean;
  priceMin?: number | null;
  priceMax?: number | null;
  /** Periodo de alquiler: dias | semanas | meses */
  rentalPeriod?: string;
  usuarioId?: string;
  usuario?: {
    id: string;
    name: string;
    companyName?: string;
    email: string;
  };
  iluminacion?: boolean;
  destacado?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  nit: string;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

// Función para generar código interno automático secuencial
async function generateInternalCode(): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin
      .from('soportes')
      .select('codigo_interno')
      .not('codigo_interno', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching codes:', error);
      throw error;
    }

    let maxCode = 0;
    const existingCodes = new Set<string>();

    data?.forEach((record) => {
      const codigoInterno = record.codigo_interno || '';
      if (codigoInterno) {
        existingCodes.add(codigoInterno);

        // Buscar patrones de códigos existentes
        const patterns = [
          /^VG-(\d+)$/,
          /^MA-(\d+)$/,
          /^LEPM-(\d+)$/,
          /^PL-CC-(\d+)$/,
          /^VP-R1-(\d+)$/,
          /^SM-(\d+)$/
        ];

        for (const pattern of patterns) {
          const match = codigoInterno.match(pattern);
          if (match) {
            const codeNumber = parseInt(match[1], 10);
            if (codeNumber > maxCode) {
              maxCode = codeNumber;
            }
            break;
          }
        }
      }
    });

    // Generar el siguiente código en formato SM-XXX
    const nextCode = maxCode + 1;
    let newCode = `SM-${String(nextCode).padStart(3, '0')}`;

    // Asegurar que el código no exista
    let counter = nextCode;
    while (existingCodes.has(newCode)) {
      counter++;
      newCode = `SM-${String(counter).padStart(3, '0')}`;
    }

    return newCode;
  } catch (error) {
    console.error('Error generating internal code:', error);
    // Fallback: usar timestamp
    const timestamp = Date.now().toString().slice(-3);
    return `SM-${timestamp}`;
  }
}

// Función para mapear registros de Supabase a nuestro formato
function mapSoporteFromSupabase(record: any): Soporte {
  // Obtener imágenes del campo JSONB imagenes
  let imagenes: string[] = [];
  
  // Log temporal para depurar
  console.log('🔍 [mapSoporteFromSupabase] record.imagenes:', JSON.stringify(record.imagenes), 'type:', typeof record.imagenes);
  
  if (record.imagenes) {
    // Si es un array JSONB, procesarlo directamente
    if (Array.isArray(record.imagenes)) {
      imagenes = record.imagenes
        .filter((img: any) => {
          // Validar que sea un string válido
          const isValid = img !== null && img !== undefined && typeof img === 'string' && img.trim().length > 0;
          if (!isValid && img !== null && img !== undefined) {
            console.warn('⚠️ [mapSoporteFromSupabase] Imagen inválida en array:', img, 'type:', typeof img);
          }
          return isValid;
        })
        .map((path: string) => {
          const url = getPublicImageUrl(path);
          if (!url) {
            console.warn('⚠️ [mapSoporteFromSupabase] No se pudo generar URL para path:', path);
          }
          return url;
        })
        .filter((url: string) => url.length > 0); // Filtrar URLs vacías
    } else if (typeof record.imagenes === 'string') {
      // Si es un string JSON, parsearlo
      try {
        const parsed = JSON.parse(record.imagenes);
        if (Array.isArray(parsed)) {
          imagenes = parsed
            .filter((img: any) => img !== null && img !== undefined && typeof img === 'string' && img.trim().length > 0)
            .map((path: string) => getPublicImageUrl(path))
            .filter((url: string) => url.length > 0);
        } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
          // Si es un string único después de parsear
          imagenes = [getPublicImageUrl(parsed)].filter((url: string) => url.length > 0);
        }
      } catch (e) {
        // Si falla el parse, tratar como string único solo si tiene contenido
        if (record.imagenes.trim().length > 0) {
          const url = getPublicImageUrl(record.imagenes);
          if (url) {
            imagenes = [url];
          }
        }
      }
    }
  }
  
  // Log temporal para validar resultado
  console.log('✅ [mapSoporteFromSupabase] imagenes procesadas:', imagenes.length, 'URLs:', imagenes);

  // Calcular área si no existe
  const ancho = record.ancho || 0;
  const alto = record.alto || 0;
  const area = record.superficie || (ancho * alto);

  // Mapear estado del ENUM a minúsculas
  const estadoMap: Record<string, Soporte['estado']> = {
    'Disponible': 'disponible',
    'disponible': 'disponible',
    'Reservado': 'reservado',
    'reservado': 'reservado',
    'Ocupado': 'ocupado',
    'ocupado': 'ocupado',
    'Mantenimiento': 'mantenimiento',
    'mantenimiento': 'mantenimiento'
  };
  const estado = estadoMap[record.estado] || 'disponible';

  // Construir ubicación desde ciudad y país
  const ubicacion = record.ciudad && record.pais 
    ? `${record.ciudad}, ${record.pais}`
    : record.ciudad || record.pais || '';

  return {
    id: record.id,
    nombre: record.titulo || '',
    descripcion: record.descripcion || '',
    ubicacion,
    latitud: record.latitud || 0,
    longitud: record.longitud || 0,
    tipo: record.tipo_soporte || '',
    estado,
    precio: record.precio_mes || 0,
    dimensiones: {
      ancho: Number(ancho) || 0,
      alto: Number(alto) || 0,
      area: Number(area) || 0
    },
    imagenes,
    categoria: record.categoria_ubicacion || '',
    codigoInterno: record.codigo_interno || '',
    codigoCliente: record.codigo_cliente || '',
    pais: record.pais || '',
    ciudad: record.ciudad || '',
    googleMapsLink: record.google_maps_url || '',
    resumenAutomatico: record.resumen || '',
    showApproximateLocation: record.ubicacion_aproximada ?? false,
    approximateRadius: record.radio_aproximado ?? 500,
    priceRangeEnabled: record.rango_precios ?? false,
    priceMin: record.precio_min != null ? Number(record.precio_min) : null,
    priceMax: record.precio_max != null ? Number(record.precio_max) : null,
    rentalPeriod: record.periodo_alquiler ?? 'meses',
    usuarioId: record.owner_id ?? record.owner?.id ?? null,
    owner: record.owner
      ? {
          id: record.owner.id,
          empresa: record.owner.empresa ?? null,
          nombre: record.owner.nombre ?? null,
          apellidos: record.owner.apellidos ?? null,
          email: record.owner.email ?? null
        }
      : undefined,
    usuario: record.owner
      ? {
          id: record.owner.id,
          name: [record.owner.nombre, record.owner.apellidos].filter(Boolean).join(' ') || record.owner.email || '',
          companyName: record.owner.empresa ?? undefined,
          email: record.owner.email || ''
        }
      : undefined,
    iluminacion: record.iluminacion || false,
    destacado: record.destacado || false,
    streetViewHeading: record.street_view_heading != null ? record.street_view_heading : 0,
    streetViewPitch: record.street_view_pitch != null ? record.street_view_pitch : 0,
    streetViewZoom: record.street_view_zoom != null ? record.street_view_zoom : 1,
    createdAt: new Date(record.created_at || Date.now()),
    updatedAt: new Date(record.updated_at || Date.now())
  };
}

// Función para mapear clientes de Supabase
function mapClienteFromSupabase(record: any): Cliente {
  return {
    id: record.id,
    nombre: record.nombre || '',
    email: record.email || '',
    telefono: record.telefono || '',
    direccion: record.direccion || '',
    nit: record.nit || '',
    estado: (record.estado || 'activo').toLowerCase() as Cliente['estado'],
    createdAt: new Date(record.created_at || Date.now()),
    updatedAt: new Date(record.updated_at || Date.now())
  };
}

// Función para mapear categorías de Supabase
function mapCategoriaFromSupabase(record: any): Categoria {
  return {
    id: record.id,
    nombre: record.nombre || '',
    descripcion: record.descripcion || '',
    icono: record.icono || '',
    color: record.color || '#3B82F6'
  };
}

// Clase principal para manejar operaciones de Supabase
export class SupabaseService {
  // SOPORTES
  static async getSoportes(filters?: {
    search?: string;
    categoria?: string;
    estado?: string;
    tipo?: string;
    page?: number;
    limit?: number;
    usuarioId?: string;
  }): Promise<{ soportes: Soporte[]; total: number }> {
    try {
      console.log('🔍 Fetching soportes from Supabase with filters:', filters);
      
      // DIAGNÓSTICO: Verificar variables de entorno en runtime
      const srkStatus = process.env.SUPABASE_SERVICE_ROLE_KEY ? "LOADED" : "EMPTY";
      const urlStatus = process.env.NEXT_PUBLIC_SUPABASE_URL ? "LOADED" : "EMPTY";
      console.log('🔑 [SupabaseService.getSoportes] SRK:', srkStatus);
      console.log('🔑 [SupabaseService.getSoportes] URL:', urlStatus);
      console.log('🔑 [SupabaseService.getSoportes] cwd:', process.cwd());
      
      // Validar que las variables de entorno estén configuradas
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.error('❌ CRITICAL: NEXT_PUBLIC_SUPABASE_URL no está configurada');
        throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada');
      }
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY no está configurada');
        console.error('  Verifica que .env.local existe en stellarmotion.erp/');
        console.error('  Verifica que Next.js está cargando .env.local');
        throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada');
      }

      const startTime = Date.now();

      // Configurar paginación (si se proporciona)
      const page = filters?.page || 1;
      const limit = filters?.limit || 1000; // Default alto para compatibilidad con código existente
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Query: JOIN soportes.owner_id → usuarios.id (Supabase detecta la FK automáticamente)
      let query = supabaseAdmin
        .from('soportes')
        .select(
          `
          *,
          owner:usuarios (
            id,
            empresa,
            nombre,
            apellidos,
            email
          )
          `,
          { count: 'exact' }
        );

      // Aplicar filtros en la DB (soportes.owner_id)
      if (filters?.ownerId) {
        query = query.eq('owner_id', filters.ownerId);
      }
      if (filters?.estado) {
        // Mapear estado a formato ENUM
        const estadoMap: Record<string, string> = {
          'DISPONIBLE': 'Disponible',
          'RESERVADO': 'Reservado',
          'OCUPADO': 'Ocupado',
          'MANTENIMIENTO': 'Mantenimiento',
          'disponible': 'Disponible',
          'reservado': 'Reservado',
          'ocupado': 'Ocupado',
          'mantenimiento': 'Mantenimiento'
        };
        const estadoSupabase = estadoMap[filters.estado] || filters.estado;
        query = query.eq('estado', estadoSupabase);
      }

      if (filters?.tipo) {
        query = query.eq('tipo_soporte', filters.tipo);
      }

      if (filters?.categoria) {
        query = query.eq('categoria_ubicacion', filters.categoria);
      }

      if (filters?.usuarioId) {
        query = query.eq('owner_id', filters.usuarioId);
      }

      // Búsqueda por texto (si se proporciona)
      // Nota: búsqueda simple con ilike. Para búsqueda full-text, usar textSearch de Supabase
      if (filters?.search) {
        const searchTerm = filters.search;
        // Sintaxis correcta de Supabase para or() con ilike
        // El patrón debe usar * para wildcards en lugar de %
        query = query.or(`titulo.ilike.*${searchTerm}*,descripcion.ilike.*${searchTerm}*,ciudad.ilike.*${searchTerm}*,pais.ilike.*${searchTerm}*`);
      }

      // Aplicar paginación REAL con .range()
      query = query.range(from, to).order('created_at', { ascending: false });

      const queryStartTime = Date.now();
      const { data, error, count } = await query;
      const queryDuration = Date.now() - queryStartTime;
      console.log(`⏱️ Consulta a Supabase completada en ${queryDuration}ms`);

      if (error) {
        console.error('❌ Error fetching soportes:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        
        // Si es un error de autenticación o permisos, dar un mensaje más claro
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          throw new Error('Error de autenticación con Supabase. Verifica SUPABASE_SERVICE_ROLE_KEY');
        }
        
        throw error;
      }

      const total = count || 0;
      console.log(`✅ Found ${data?.length || 0} records (total: ${total}) in Supabase`);

      const soportes = (data || []).map((record: any) => {
        try {
          if (record.owner) {
            console.log('🔍 [getSoportes] record.owner:', { empresa: record.owner.empresa, nombre: record.owner.nombre, apellidos: record.owner.apellidos, email: record.owner.email });
          }
          return mapSoporteFromSupabase(record);
        } catch (mapError) {
          console.error('❌ Error mapping record:', mapError);
          console.error('❌ Error stack:', mapError instanceof Error ? mapError.stack : 'No stack');
          console.error('❌ Record ID:', record.id);
          console.error('❌ Record imagenes:', JSON.stringify(record.imagenes));
          console.error('❌ Record data (partial):', JSON.stringify({
            id: record.id,
            titulo: record.titulo,
            imagenes: record.imagenes
          }, null, 2));
          throw mapError;
        }
      });

      console.log(`📊 Returning ${soportes.length} soportes (página ${page}, total ${total})`);
      return { soportes, total };
    } catch (error) {
      console.error('❌ Error fetching soportes from Supabase:', error);
      throw error;
    }
  }

  static async getSoporteById(id: string): Promise<Soporte | null> {
    try {
      console.log(`🔍 Fetching soporte by ID: ${id}`);

      const { data, error } = await supabaseAdmin
        .from('soportes')
        .select(
          `
          *,
          owner:usuarios (
            id,
            empresa,
            nombre,
            apellidos,
            email
          )
          `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Soporte not found');
          return null;
        }
        throw error;
      }

      console.log('✅ Soporte found in Supabase');
      return mapSoporteFromSupabase(data);
    } catch (error) {
      console.error('❌ Error fetching soporte by ID:', error);
      return null;
    }
  }

  static async createSoporte(data: any): Promise<Soporte | null> {
    try {
      console.log('➕ Creating new soporte in Supabase...');
      console.log('📤 Datos recibidos para crear:', data);

      // Generar código interno si no existe
      const codigoInterno = data['Código interno'] || data.codigoInterno || await generateInternalCode();

      // Calcular área si hay dimensiones
      const ancho = data.dimensiones?.ancho || data.ancho || 0;
      const alto = data.dimensiones?.alto || data.alto || 0;
      const superficie = ancho * alto;

      // Preparar imágenes - usar campo JSONB imagenes
      // Las imágenes deben venir como paths relativos desde Supabase Storage
      // Ejemplo: "soportes_imagenes/{id}/imagen.jpg"
      let imagenesPaths: string[] = [];
      if (data.imagenes && Array.isArray(data.imagenes)) {
        // Filtrar solo paths válidos (no URLs completas, solo paths relativos)
        imagenesPaths = data.imagenes
          .filter((img: any) => img && typeof img === 'string')
          .map((img: string) => {
            // Si es una URL completa, extraer el path
            if (img.startsWith('http://') || img.startsWith('https://')) {
              // Intentar extraer el path de la URL de Supabase Storage
              const match = img.match(/\/storage\/v1\/object\/public\/soportes\/(.+)$/);
              return match ? match[1] : img;
            }
            return img;
          });
      } else if (data.imagenes && typeof data.imagenes === 'string') {
        imagenesPaths = [data.imagenes];
      }

      // Mapear estado a formato ENUM de Supabase
      const mapEstadoToSupabase = (estado: string): string => {
        const estadoUpper = estado.toUpperCase();
        const estadoMap: Record<string, string> = {
          'DISPONIBLE': 'Disponible',
          'RESERVADO': 'Reservado',
          'OCUPADO': 'Ocupado',
          'MANTENIMIENTO': 'Mantenimiento',
          'disponible': 'Disponible',
          'reservado': 'Reservado',
          'ocupado': 'Ocupado',
          'mantenimiento': 'Mantenimiento'
        };
        return estadoMap[estado] || estadoMap[estadoUpper] || 'Disponible';
      };

      const insertData: any = {
        titulo: data['Título del soporte'] || data.titulo || data.nombre || '',
        descripcion: data['Descripción'] || data.descripcion || '',
        tipo_soporte: data['Tipo de soporte'] || data.tipo || '',
        estado: mapEstadoToSupabase(data['Estado del soporte'] || data.estado || 'DISPONIBLE'),
        precio_mes: data['Precio por mes'] || data.precio || null,
        ancho: ancho || null,
        alto: alto || null,
        // ⚠️ NO enviar superficie - es una columna GENERATED en Supabase (ancho * alto)
        codigo_interno: codigoInterno,
        codigo_cliente: data['Código cliente'] || data.codigoCliente || null,
        ciudad: data.ciudad || null,
        pais: data.pais || null,
        latitud: data.latitud || null,
        longitud: data.longitud || null,
        street_view_heading: data.streetViewHeading != null ? data.streetViewHeading : null,
        street_view_pitch: data.streetViewPitch != null ? data.streetViewPitch : null,
        street_view_zoom: data.streetViewZoom != null ? data.streetViewZoom : null,
        google_maps_url: data['Enlace de Google Maps'] || data.googleMapsLink || null,
        categoria_ubicacion: data.categoria || null,
        ubicacion_aproximada: data.showApproximateLocation ?? false,
        radio_aproximado: data.approximateRadius ?? 500,
        rango_precios: data.priceRangeEnabled ?? false,
        precio_min: data.priceMin != null ? data.priceMin : null,
        precio_max: data.priceMax != null ? data.priceMax : null,
        periodo_alquiler: data.rentalPeriod ?? 'meses',
        // propietario: NO existe en tabla soportes
        iluminacion: data['Iluminación'] !== undefined ? data['Iluminación'] : (data.iluminacion !== undefined ? data.iluminacion : false),
        destacado: data['Destacado'] !== undefined ? data['Destacado'] : (data.destacado !== undefined ? data.destacado : false),
        owner_id: data.ownerId ?? data.owner ?? data['Propietario'] ?? null,
        resumen: data['Resumen automático'] || data.resumenAutomatico || null,
        // Usar SOLO campo JSONB imagenes (no usar imagen_1, imagen_2, imagen_3)
        imagenes: imagenesPaths.length > 0 ? imagenesPaths : []
      };

      console.log('📤 Campos que se enviarán a Supabase:', insertData);

      const { data: result, error } = await supabaseAdmin
        .from('soportes')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error response from Supabase:', error);
        throw error;
      }

      console.log('✅ Soporte created successfully');
      return mapSoporteFromSupabase(result);
    } catch (error) {
      console.error('❌ Error creating soporte:', error);
      return null;
    }
  }

  static async updateSoporte(id: string, data: Partial<Soporte>): Promise<Soporte | null> {
    try {
      console.log(`🔄 Updating soporte ${id} in Supabase...`);

      // Obtener el soporte existente
      const existing = await this.getSoporteById(id);
      if (!existing) {
        throw new Error('Soporte no encontrado');
      }

      // Mapear estado a formato ENUM de Supabase
      const mapEstadoToSupabase = (estado: string): string => {
        const estadoUpper = estado.toUpperCase();
        const estadoMap: Record<string, string> = {
          'DISPONIBLE': 'Disponible',
          'RESERVADO': 'Reservado',
          'OCUPADO': 'Ocupado',
          'MANTENIMIENTO': 'Mantenimiento',
          'disponible': 'Disponible',
          'reservado': 'Reservado',
          'ocupado': 'Ocupado',
          'mantenimiento': 'Mantenimiento'
        };
        return estadoMap[estado] || estadoMap[estadoUpper] || 'Disponible';
      };

      // Preparar datos de actualización
      const updateData: any = {};

      if (data['Título del soporte'] !== undefined || data.nombre !== undefined) {
        updateData.titulo = data['Título del soporte'] || data.nombre || existing.nombre;
      }
      if (data['Descripción'] !== undefined || data.descripcion !== undefined) {
        updateData.descripcion = data['Descripción'] || data.descripcion || existing.descripcion;
      }
      if (data['Tipo de soporte'] !== undefined || data.tipo !== undefined) {
        updateData.tipo_soporte = data['Tipo de soporte'] || data.tipo || existing.tipo;
      }
      if (data['Estado del soporte'] !== undefined || data.estado !== undefined) {
        updateData.estado = mapEstadoToSupabase(data['Estado del soporte'] || data.estado || existing.estado);
      }
      if (data['Precio por mes'] !== undefined || data.precio !== undefined) {
        updateData.precio_mes = data['Precio por mes'] || data.precio || existing.precio;
      }

      // Dimensiones
      if (data.dimensiones) {
        const ancho = data.dimensiones.ancho !== undefined ? data.dimensiones.ancho : existing.dimensiones.ancho;
        const alto = data.dimensiones.alto !== undefined ? data.dimensiones.alto : existing.dimensiones.alto;
        updateData.ancho = ancho;
        updateData.alto = alto;
        // ⚠️ NO enviar superficie - es una columna GENERATED en Supabase (ancho * alto)
      }

      // Imágenes - usar SOLO campo JSONB imagenes
      if (data.imagenes !== undefined) {
        // Procesar imágenes: filtrar paths válidos y convertir URLs a paths relativos
        const imagenesInput = Array.isArray(data.imagenes) ? data.imagenes : [data.imagenes];
        const imagenesPaths = imagenesInput
          .filter((img: any) => img !== null && img !== undefined && typeof img === 'string' && img.trim().length > 0)
          .map((img: string) => {
            // Si es una URL completa, extraer el path
            if (img.startsWith('http://') || img.startsWith('https://')) {
              // Intentar extraer el path de la URL de Supabase Storage
              const match = img.match(/\/storage\/v1\/object\/public\/soportes\/(.+)$/);
              return match ? match[1] : img;
            }
            return img.trim();
          })
          .filter((path: string) => path.length > 0); // Filtrar paths vacíos
        
        // Actualizar SOLO campo JSONB imagenes (no usar imagen_1, imagen_2, imagen_3)
        updateData.imagenes = imagenesPaths.length > 0 ? imagenesPaths : [];
      }

      // Otros campos
      if (data['Código interno'] !== undefined || data.codigoInterno !== undefined) {
        updateData.codigo_interno = data['Código interno'] || data.codigoInterno;
      }
      if (data['Código cliente'] !== undefined || data.codigoCliente !== undefined) {
        updateData.codigo_cliente = data['Código cliente'] || data.codigoCliente;
      }
      if (data.showApproximateLocation !== undefined) {
        updateData.ubicacion_aproximada = data.showApproximateLocation;
      }
      if (data.approximateRadius !== undefined) {
        updateData.radio_aproximado = data.approximateRadius;
      }
      if (data.priceRangeEnabled !== undefined) {
        updateData.rango_precios = data.priceRangeEnabled;
      }
      if (data.priceMin !== undefined) {
        updateData.precio_min = data.priceMin;
      }
      if (data.priceMax !== undefined) {
        updateData.precio_max = data.priceMax;
      }
      if (data.rentalPeriod !== undefined) {
        updateData.periodo_alquiler = data.rentalPeriod;
      }
      if (data['Enlace de Google Maps'] !== undefined || data.googleMapsLink !== undefined) {
        updateData.google_maps_url = data['Enlace de Google Maps'] || data.googleMapsLink;
      }
      // propietario: NO existe en tabla soportes
      if (data.ciudad !== undefined) {
        updateData.ciudad = data.ciudad;
      }
      if (data.pais !== undefined) {
        updateData.pais = data.pais;
      }
      if (data.latitud !== undefined) {
        updateData.latitud = data.latitud;
      }
      if (data.longitud !== undefined) {
        updateData.longitud = data.longitud;
      }
      if (data.streetViewHeading !== undefined) {
        updateData.street_view_heading = data.streetViewHeading;
      }
      if (data.streetViewPitch !== undefined) {
        updateData.street_view_pitch = data.streetViewPitch;
      }
      if (data.streetViewZoom !== undefined) {
        updateData.street_view_zoom = data.streetViewZoom;
      }
      if (data['Iluminación'] !== undefined || data.iluminacion !== undefined) {
        updateData.iluminacion = data['Iluminación'] !== undefined ? data['Iluminación'] : data.iluminacion;
      }
      if (data['Destacado'] !== undefined || data.destacado !== undefined) {
        updateData.destacado = data['Destacado'] !== undefined ? data['Destacado'] : data.destacado;
      }
      if (data.categoria !== undefined) {
        updateData.categoria_ubicacion = data.categoria;
      }
      if (data['Resumen automático'] !== undefined || data.resumenAutomatico !== undefined) {
        updateData.resumen = data['Resumen automático'] || data.resumenAutomatico;
      }
      if (data.ownerId !== undefined || data.owner !== undefined) {
        updateData.owner_id = data.ownerId ?? data.owner ?? null;
      }

      console.log('📤 Enviando campos a Supabase:', updateData);

      // Agregar updated_at manualmente si no está en updateData
      if (!updateData.updated_at) {
        updateData.updated_at = new Date().toISOString();
      }

      const { data: result, error } = await supabaseAdmin
        .from('soportes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error response from Supabase:', error);
        throw error;
      }

      console.log('✅ Soporte updated successfully');
      return mapSoporteFromSupabase(result);
    } catch (error) {
      console.error('❌ Error updating soporte:', error);
      return null;
    }
  }

  static async deleteSoporte(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting soporte ${id} from Supabase...`);

      const { error } = await supabaseAdmin
        .from('soportes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('✅ Soporte deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting soporte:', error);
      return false;
    }
  }

  // CLIENTES
  static async getClientes(): Promise<Cliente[]> {
    try {
      console.log('🔍 Fetching clientes from Supabase...');

      const { data, error } = await supabaseAdmin
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} clientes in Supabase`);
      return (data || []).map(mapClienteFromSupabase);
    } catch (error) {
      console.error('❌ Error fetching clientes from Supabase:', error);
      throw error;
    }
  }

  static async getClienteById(id: string): Promise<Cliente | null> {
    try {
      console.log(`🔍 Fetching cliente by ID: ${id}`);

      const { data, error } = await supabaseAdmin
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Cliente not found');
          return null;
        }
        throw error;
      }

      console.log('✅ Cliente found in Supabase');
      return mapClienteFromSupabase(data);
    } catch (error) {
      console.error('❌ Error fetching cliente by ID:', error);
      return null;
    }
  }

  static async createCliente(data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cliente> {
    try {
      console.log('➕ Creating new cliente in Supabase...');

      const insertData = {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        nit: data.nit,
        estado: data.estado.toUpperCase()
      };

      const { data: result, error } = await supabaseAdmin
        .from('clientes')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Cliente created successfully');
      return mapClienteFromSupabase(result);
    } catch (error) {
      console.error('❌ Error creating cliente:', error);
      throw error;
    }
  }

  // OWNERS - Funciones usando Supabase Auth
  
  /**
   * Crea un usuario en Supabase Auth
   */
  static async createAuthUser(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata || {}
      });

      return { user: data?.user || null, error };
    } catch (error) {
      console.error('❌ Error creating auth user:', error);
      return { user: null, error };
    }
  }

  /**
   * Crea un owner en la tabla owners (requiere user_id de Auth)
   * Usa solo los campos que existen en la tabla owners
   */
  static async createOwner(ownerData: {
    user_id: string; // REQUERIDO: ID de auth.users
    nombre_contacto: string; // Nombre completo (nombre + apellidos concatenados)
    email: string;
    telefono: string;
    pais: string;
    tipo_owner: 'persona' | 'empresa' | 'gobierno' | 'agencia';
    direccion?: string | null;
    ciudad?: string | null;
    razon_social?: string | null; // Para empresa, se mapea a 'empresa'
    ein?: string | null; // Para empresa, se mapea a 'nit'
    direccion_fiscal?: string | null; // Para empresa, se mapea a 'direccion'
    sitio_web?: string | null;
    tipo_empresa?: string | null;
    representante_legal?: string | null;
    tax_id?: string | null;
    puesto?: string | null;
    tipo_tenencia?: string | null;
    tiene_permisos?: boolean;
    permite_instalacion?: boolean;
  }): Promise<any> {
    try {
      if (!ownerData.user_id) {
        throw new Error('user_id es requerido para crear un owner');
      }

      console.log('⚡ [createOwner] Intentando insertar en tabla owners...');
      console.log('🔐 [createOwner] Usando supabaseAdmin (SERVICE_ROLE_KEY)');

      // Mapear tipo_owner a tipo_contacto para la tabla owners
      const tipo_contacto_map: Record<string, string> = {
        'persona': 'persona',
        'empresa': 'empresa',
        'gobierno': 'gobierno',
        'agencia': 'agencia'
      };
      
      const tipo_contacto = tipo_contacto_map[ownerData.tipo_owner] || 'persona';

      // Preparar datos de inserción con todos los campos posibles
      const insertData: any = {
        user_id: ownerData.user_id,
        nombre_contacto: ownerData.nombre_contacto,
        email: ownerData.email,
        telefono: ownerData.telefono,
        pais: ownerData.pais,
        tipo_contacto: tipo_contacto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Campos específicos según tipo de owner
      if (ownerData.tipo_owner === 'persona') {
        insertData.direccion = ownerData.direccion || null;
        insertData.ciudad = ownerData.ciudad || null;
      } else if (ownerData.tipo_owner === 'empresa') {
        insertData.empresa = ownerData.razon_social || null;
        insertData.nit = ownerData.ein || null;
        insertData.direccion = ownerData.direccion_fiscal || null;
        insertData.ciudad = ownerData.ciudad || null;
      }

      // Campo sitio_web si está disponible
      if (ownerData.sitio_web !== undefined) {
        insertData.sitio_web = ownerData.sitio_web;
      }

      // Insert usando supabaseAdmin explícitamente (SERVICE_ROLE_KEY)
      const { data, error } = await supabaseAdmin
        .from('owners')
        .insert({
          user_id: insertData.user_id,
          nombre_contacto: insertData.nombre_contacto,
          email: insertData.email,
          telefono: insertData.telefono,
          pais: insertData.pais,
          tipo_contacto: insertData.tipo_contacto,
          empresa: insertData.empresa || null,
          nit: insertData.nit || null,
          direccion: insertData.direccion || null,
          ciudad: insertData.ciudad || null,
          sitio_web: insertData.sitio_web || null,
          tipo_empresa: ownerData.tipo_empresa || null,
          representante_legal: ownerData.representante_legal || null,
          tax_id: ownerData.tax_id || null,
          puesto: ownerData.puesto || null,
          tipo_tenencia: ownerData.tipo_tenencia || null,
          tiene_permisos: ownerData.tiene_permisos || false,
          permite_instalacion: ownerData.permite_instalacion || false,
          created_at: insertData.created_at,
          updated_at: insertData.updated_at
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [createOwner] Error Postgres:', error);
        console.error('❌ [createOwner] Código:', error.code, 'Mensaje:', error.message);
        console.error('❌ [createOwner] Detalles:', error.details);
        console.error('❌ [createOwner] Hint:', error.hint);
        
        // Si es error de permisos, dar mensaje más específico
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          console.error('❌ [createOwner] ERROR DE PERMISOS - Verifica que supabaseAdmin usa SERVICE_ROLE_KEY');
        }
        
        throw error;
      }

      console.log('✅ [createOwner] Owner creado ID:', data.id);
      return data;
    } catch (error) {
      console.error('❌ [createOwner] Error creating owner:', error);
      throw error;
    }
  }

  /**
   * Obtiene un owner por email
   */
  static async getOwnerByEmail(email: string): Promise<any | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('owners')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching owner by email:', error);
      return null;
    }
  }

  /**
   * Obtiene un owner por user_id (ID de auth.users)
   */
  static async getOwnerByUserId(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('owners')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching owner by user_id:', error);
      return null;
    }
  }

  // CATEGORIAS
  static async getCategorias(): Promise<Categoria[]> {
    try {
      console.log('🔍 Fetching categorias from Supabase...');
      const startTime = Date.now();

      // FALLBACK 1: Intentar obtener de tabla categorias (puede no existir)
      const { data, error } = await supabaseAdmin
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true });

      const duration = Date.now() - startTime;
      console.log(`⏱️ Query a categorias tomó ${duration}ms`);

      // Si la tabla no existe (PGRST116 o similar), derivar de soportes
      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('⚠️ Tabla categorias no existe, derivando desde soportes...');
          
          // FALLBACK 2: Obtener categorías únicas desde soportes
          const { data: soportesData, error: soportesError } = await supabaseAdmin
            .from('soportes')
            .select('categoria_ubicacion')
            .not('categoria_ubicacion', 'is', null);

          if (soportesError) {
            console.warn('⚠️ No se pudieron obtener categorías desde soportes:', soportesError.message);
            return []; // Devolver vacío en lugar de fallar
          }

          // Extraer categorías únicas
          const uniqueCategories = new Set<string>();
          soportesData?.forEach(record => {
            if (record.categoria_ubicacion) {
              uniqueCategories.add(record.categoria_ubicacion);
            }
          });

          // Mapear a formato Categoria
          const categorias: Categoria[] = Array.from(uniqueCategories).map(nombre => ({
            id: nombre.toLowerCase().replace(/\s+/g, '-'),
            nombre,
            descripcion: `Categoría: ${nombre}`,
            icono: 'MapPin',
            color: '#3B82F6'
          })).sort((a, b) => a.nombre.localeCompare(b.nombre));

          console.log(`✅ Derivadas ${categorias.length} categorias desde soportes`);
          return categorias;
        }

        console.error('❌ Error fetching categorias:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        
        // Para otros errores, devolver vacío en lugar de fallar
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} categorias in Supabase`);
      return (data || []).map(mapCategoriaFromSupabase);
    } catch (error) {
      console.error('❌ Error fetching categorias from Supabase:', error);
      // En lugar de lanzar error, devolver array vacío
      return [];
    }
  }
}


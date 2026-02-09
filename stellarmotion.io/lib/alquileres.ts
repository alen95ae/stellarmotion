/**
 * Funciones para manejar alquileres en Supabase
 * 
 * IMPORTANTE: Todas las funciones usan supabaseAdmin que está configurado con
 * SUPABASE_SERVICE_ROLE_KEY, lo que significa que BYPASEA RLS automáticamente.
 */

import { supabaseAdmin } from './supabase-sql';
import { Alquiler, AlquilerWithRelations, CreateAlquilerDTO, CreateAlquilerResponse } from '@/types/alquileres';

/**
 * Obtener alquileres del dashboard (solo del owner autenticado)
 */
export async function getAlquileresByOwner(usuarioId: string): Promise<AlquilerWithRelations[]> {
  try {
    // Obtener los IDs de soportes del usuario
    const { data: soportesOwner, error: soportesError } = await supabaseAdmin
      .from('soportes')
      .select('id')
      .eq('usuario_id', usuarioId);

    if (soportesError) {
      throw soportesError;
    }

    if (!soportesOwner || soportesOwner.length === 0) {
      return [];
    }

    const soporteIds = soportesOwner.map((s: any) => s.id);

    // Obtener alquileres sin joins
    const { data: dataSimple, error: errorSimple } = await supabaseAdmin
      .from('alquileres')
      .select('*')
      .in('soporte_id', soporteIds)
      .order('created_at', { ascending: false });
    
    if (errorSimple) {
      throw errorSimple;
    }
    
    if (!dataSimple || dataSimple.length === 0) {
      return [];
    }
    
    // Obtener relaciones (usuarios y soportes)
    const usuarioIds = [...new Set(dataSimple.map(a => a.usuario_id).filter(Boolean))];
    // NORMALIZAR soporteIdsUnicos a strings para evitar problemas de tipo
    const soporteIdsUnicos = [...new Set(dataSimple.map(a => String(a.soporte_id)).filter(Boolean))];
    
    // DEBUG: Verificar soporteIdsUnicos
    console.log('🧪 soporteIdsUnicos (normalized):', soporteIdsUnicos);
    console.log('🧪 soporteIdsUnicos length:', soporteIdsUnicos.length);
    console.log('🧪 dataSimple[0].soporte_id:', dataSimple[0]?.soporte_id, typeof dataSimple[0]?.soporte_id);
    
    const { data: usuariosData, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email, telefono, empresa')
      .in('id', usuarioIds);
    
    if (usuariosError) {
      console.error('Error obteniendo usuarios:', usuariosError);
    }
    
    const { data: soportesData, error: soportesError2 } = await supabaseAdmin
      .from('soportes')
      .select('id, titulo, codigo_interno, codigo_cliente, tipo_soporte')
      .in('id', soporteIdsUnicos);
    
    if (soportesError2) {
      console.error('❌ Error obteniendo soportes:', soportesError2);
    }
    
    // DEBUG: Verificar datos obtenidos
    console.log('🧪 soportesData length:', soportesData?.length || 0);
    console.log('🧪 soportesData[0]:', soportesData?.[0]);
    if (soportesData && soportesData.length > 0) {
      console.log('🧪 soportesData[0].id:', soportesData[0].id, typeof soportesData[0].id);
      console.log('🧪 soportesData[0].codigo_cliente:', soportesData[0].codigo_cliente);
    }
    
    // Tipo explícito para Soporte
    type Soporte = {
      id: string;
      nombre: string;
      codigo_interno: string | null;
      codigo_cliente: string | null;
      tipo_soporte: string | null;
    };
    
    // Crear mapas para búsqueda rápida
    const usuariosMap = new Map((usuariosData || []).map(u => [u.id, u]));
    
    // Crear Map EXPLÍCITO: Map<string, Soporte>
    // NORMALIZAR todas las claves a STRING UUID
    const soportesMap = new Map<string, Soporte>();
    
    (soportesData || []).forEach(s => {
      // Asegurar que s.id sea STRING UUID
      const soporteId = String(s.id);
      
      // Asegurar que todos los campos estén presentes
      const soporte: Soporte = {
        id: String(s.id),
        nombre: String(s.titulo || ''),
        codigo_interno: s.codigo_interno ? String(s.codigo_interno) : null,
        codigo_cliente: s.codigo_cliente ? String(s.codigo_cliente) : null,
        tipo_soporte: s.tipo_soporte ? String(s.tipo_soporte) : null
      };
      
      soportesMap.set(soporteId, soporte);
    });
    
    // Logs OBLIGATORIOS antes del map
    console.log('🧪 soportesMap keys:', Array.from(soportesMap.keys()));
    console.log('🧪 soportesMap size:', soportesMap.size);
    
    // Mapear alquileres con sus relaciones
    const alquileres: AlquilerWithRelations[] = dataSimple.map((alquiler: any) => {
      // Asegurar que alquiler.soporte_id sea STRING UUID
      const soporteId = String(alquiler.soporte_id);
      
      // Log OBLIGATORIO antes del map
      console.log('🧪 alquiler.soporte_id:', alquiler.soporte_id, typeof alquiler.soporte_id);
      
      // Mapeo EXACTO: soportesMap.get(alquiler.soporte_id) ?? null
      const soporte = soportesMap.get(soporteId) ?? null;
      
      // Si no se encuentra pero soporte_id es válido, log error explícito
      if (!soporte && alquiler.soporte_id) {
        console.error('❌ ERROR: Soporte no encontrado para alquiler', {
          alquilerId: alquiler.id,
          soporteId: soporteId,
          soporteIdType: typeof soporteId,
          mapKeys: Array.from(soportesMap.keys()),
          mapSize: soportesMap.size
        });
      }
      
      return {
        ...alquiler,
        usuario: usuariosMap.get(alquiler.usuario_id) || null,
        soporte: soporte,
      };
    });
    
    // DEBUG: Verificar resultado final
    if (alquileres.length > 0) {
      console.log('🧪 RESULTADO FINAL - alquileres[0].soporte:', alquileres[0].soporte);
      console.log('🧪 RESULTADO FINAL - alquileres[0].soporte?.codigo_cliente:', alquileres[0].soporte?.codigo_cliente);
    }
    
    return alquileres;
  } catch (error) {
    console.error('❌ [getAlquileresByOwner] Error:', error);
    throw error;
  }
}

/**
 * Obtener alquiler por ID (con relaciones)
 */
export async function getAlquilerById(alquilerId: string): Promise<AlquilerWithRelations | null> {
  try {
    // Obtener alquiler sin joins primero
    const { data: alquilerData, error: alquilerError } = await supabaseAdmin
      .from('alquileres')
      .select('*')
      .eq('id', alquilerId)
      .single();

    if (alquilerError) {
      if (alquilerError.code === 'PGRST116') {
        return null;
      }
      throw alquilerError;
    }

    if (!alquilerData) {
      return null;
    }

    // Obtener relaciones manualmente
    const { data: usuarioData, error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email, telefono, empresa')
      .eq('id', alquilerData.usuario_id)
      .maybeSingle();

    if (usuarioError) {
      console.error('Error obteniendo usuario:', usuarioError);
    }

    const { data: soporteData, error: soporteError } = await supabaseAdmin
      .from('soportes')
      .select('id, titulo, codigo_interno, codigo_cliente, tipo_soporte')
      .eq('id', alquilerData.soporte_id)
      .maybeSingle();

    if (soporteError) {
      console.error('Error obteniendo soporte:', soporteError);
    }

    // Mapeo explícito del soporte con codigo_cliente
    const soporte = soporteData ? {
      id: soporteData.id,
      nombre: soporteData.titulo,
      codigo_interno: soporteData.codigo_interno ?? null,
      codigo_cliente: soporteData.codigo_cliente ?? null, // Explícito
      tipo_soporte: soporteData.tipo_soporte ?? null
    } : null;

    return {
      ...alquilerData,
      usuario: usuarioData || null,
      soporte: soporte,
    };
  } catch (error) {
    console.error('❌ [getAlquilerById] Error:', error);
    throw error;
  }
}

/**
 * Generar número de alquiler automático (RES-YYYY-XXX)
 */
async function generarNumeroAlquiler(): Promise<string> {
  try {
    const year = new Date().getFullYear();
    
    // Obtener el último número de alquiler del año actual
    // NOTA: Esta query usa supabaseAdmin que IGNORA RLS automáticamente
    const { data, error } = await supabaseAdmin
      .from('alquileres')
      .select('numero')
      .like('numero', `RES-${year}-%`)
      .order('numero', { ascending: false })
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('Error obteniendo último número:', error);
    }

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumero = data[0].numero;
      const match = lastNumero.match(/RES-\d{4}-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const numero = `RES-${year}-${String(nextNumber).padStart(3, '0')}`;
    return numero;
  } catch (error) {
    console.error('Error generando número de alquiler:', error);
    // Fallback: usar timestamp
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-3);
    return `RES-${year}-${timestamp}`;
  }
}


/**
 * Obtener precio del soporte
 */
async function getSoportePrecio(soporteId: string): Promise<number> {
  try {
    // NOTA: Esta query usa supabaseAdmin que IGNORA RLS automáticamente
    const { data, error } = await supabaseAdmin
      .from('soportes')
      .select('precio_mes')
      .eq('id', soporteId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo precio del soporte:', error);
      throw error;
    }

    return data?.precio_mes || 0;
  } catch (error) {
    console.error('❌ Error en getSoportePrecio:', error);
    throw error;
  }
}

/**
 * Obtener servicios adicionales disponibles
 * Nota: Asumiendo que hay una tabla 'servicios_adicionales' o se definen en el código
 */
const SERVICIOS_ADICIONALES: Record<string, { nombre: string; precio: number }> = {
  'impresion': { nombre: 'Impresión del diseño', precio: 150 },
  'instalacion': { nombre: 'Instalación en soporte', precio: 200 },
  'diseno': { nombre: 'Diseño gráfico', precio: 100 },
};

function calcularPrecioServicios(serviciosIds: string[]): number {
  return serviciosIds.reduce((total, servicioId) => {
    const servicio = SERVICIOS_ADICIONALES[servicioId];
    return total + (servicio?.precio || 0);
  }, 0);
}

/**
 * Crear nuevo alquiler desde brand (público)
 */
export async function createAlquiler(data: CreateAlquilerDTO): Promise<CreateAlquilerResponse> {
  try {
    // Validaciones
    if (!data.soporte_id || !data.usuario_id || !data.fecha_inicio || !data.meses) {
      throw new Error('Faltan campos requeridos');
    }

    if (data.meses < 1) {
      throw new Error('Los meses deben ser al menos 1');
    }

    // 1. Obtener precio del soporte
    const precioSoporte = await getSoportePrecio(data.soporte_id);

    // 2. Calcular fechas
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + data.meses);

    // 3. Calcular precios
    const precioAlquiler = precioSoporte * data.meses;
    const precioServicios = calcularPrecioServicios(data.servicios_adicionales);
    const precioComision = precioAlquiler * 0.03; // 3% de comisión
    const precioTotal = precioAlquiler + precioComision + precioServicios;

    // 4. Generar número de alquiler
    const numero = await generarNumeroAlquiler();

    // 5. Preparar servicios adicionales como JSONB
    const serviciosAdicionales = data.servicios_adicionales.reduce((acc, servicioId) => {
      const servicio = SERVICIOS_ADICIONALES[servicioId];
      if (servicio) {
        acc[servicioId] = {
          nombre: servicio.nombre,
          precio: servicio.precio,
        };
      }
      return acc;
    }, {} as Record<string, any>);

    // 6. Insertar alquiler usando usuario_id directamente
    const { data: newAlquiler, error: insertError } = await supabaseAdmin
      .from('alquileres')
      .insert({
        numero,
        soporte_id: data.soporte_id,
        usuario_id: data.usuario_id,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
        meses: data.meses,
        precio_alquiler: precioAlquiler,
        precio_comision: precioComision,
        precio_servicios: precioServicios || 0,
        precio_total: precioTotal,
        servicios_adicionales: Object.keys(serviciosAdicionales).length > 0 ? serviciosAdicionales : [],
        estado: 'pendiente',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ Error insertando alquiler:', insertError);
      throw insertError;
    }

    return {
      success: true,
      numero,
      alquiler_id: newAlquiler.id,
      message: 'Alquiler creado exitosamente',
    };
  } catch (error: any) {
    console.error('❌ Error en createAlquiler:', error);
    throw error;
  }
}


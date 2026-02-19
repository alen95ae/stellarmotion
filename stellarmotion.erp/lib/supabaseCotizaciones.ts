import { supabaseAdmin } from "@/lib/supabase-admin";

export type Cotizacion = {
  id: string;
  codigo: string;
  cliente: string | null;
  contacto_id: string | null;
  vendedor: string | null;
  sucursal: string | null;
  estado: string | null;
  subtotal: number | null;
  total_iva: number | null;
  total_final: number | null;
  vigencia: number | null;
  plazo: string | null;
  cantidad_items: number | null;
  requiere_nueva_aprobacion: boolean | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
};

export interface CotizacionInput {
  codigo?: string;
  cliente?: string;
  contacto_id?: string | null;
  vendedor?: string;
  sucursal?: string;
  estado?: string;
  subtotal?: number;
  total_iva?: number;
  total_final?: number;
  vigencia?: number;
  plazo?: string | null;
  cantidad_items?: number;
  requiere_nueva_aprobacion?: boolean;
}

export async function getCotizaciones(options?: {
  estado?: string;
  cliente?: string;
  vendedor?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  let query = supabaseAdmin
    .from("cotizaciones")
    .select("*", { count: "exact" })
    .order("fecha_creacion", { ascending: false });

  if (options?.estado) query = query.eq("estado", options.estado);
  if (options?.cliente) query = query.ilike("cliente", `%${options.cliente}%`);
  if (options?.vendedor) query = query.ilike("vendedor", `%${options.vendedor}%`);
  if (options?.search) {
    query = query.or(
      `codigo.ilike.%${options.search}%,cliente.ilike.%${options.search}%,vendedor.ilike.%${options.search}%`
    );
  }

  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  const ahora = new Date();
  const cotizacionesActualizadas = await Promise.all(
    (data || []).map(async (cotizacion) => {
      if (cotizacion.estado !== "Aprobada" && cotizacion.estado !== "Rechazada" && cotizacion.fecha_creacion) {
        const fechaCreacion = new Date(cotizacion.fecha_creacion);
        const vigenciaDias = cotizacion.vigencia || 30;
        const fechaVencimiento = new Date(fechaCreacion);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + vigenciaDias);
        if (ahora > fechaVencimiento && cotizacion.estado !== "Vencida") {
          try {
            await updateCotizacion(cotizacion.id, { estado: "Vencida" });
            return { ...cotizacion, estado: "Vencida" };
          } catch {
            return cotizacion;
          }
        }
      }
      return cotizacion;
    })
  );

  return { data: cotizacionesActualizadas as Cotizacion[], count: count || 0 };
}

export async function getCotizacionById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  if (data && data.estado !== "Aprobada" && data.estado !== "Rechazada" && data.fecha_creacion) {
    const fechaCreacion = new Date(data.fecha_creacion);
    const vigenciaDias = data.vigencia || 30;
    const fechaVencimiento = new Date(fechaCreacion);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + vigenciaDias);
    if (new Date() > fechaVencimiento && data.estado !== "Vencida") {
      try {
        return await updateCotizacion(data.id, { estado: "Vencida" });
      } catch {
        return data as Cotizacion;
      }
    }
  }

  return data as Cotizacion;
}

export async function createCotizacion(cotizacion: CotizacionInput) {
  const insertData: Record<string, unknown> = {
    codigo: cotizacion.codigo || "",
    cliente: cotizacion.cliente || null,
    vendedor: cotizacion.vendedor || null,
    sucursal: cotizacion.sucursal || null,
    estado: cotizacion.estado || "Pendiente",
    subtotal: cotizacion.subtotal || 0,
    total_iva: cotizacion.total_iva || 0,
    total_final: cotizacion.total_final || 0,
    vigencia: cotizacion.vigencia || 30,
    plazo: cotizacion.plazo || null,
    cantidad_items: cotizacion.cantidad_items || 0,
  };
  if (cotizacion.contacto_id !== undefined) insertData.contacto_id = cotizacion.contacto_id || null;

  const { data, error } = await supabaseAdmin
    .from("cotizaciones")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data as Cotizacion;
}

export async function updateCotizacion(id: string, cotizacion: Partial<CotizacionInput>) {
  const updateData: Record<string, unknown> = {
    fecha_actualizacion: new Date().toISOString(),
  };
  if (cotizacion.codigo !== undefined) updateData.codigo = cotizacion.codigo;
  if (cotizacion.cliente !== undefined) updateData.cliente = cotizacion.cliente;
  if (cotizacion.contacto_id !== undefined) updateData.contacto_id = cotizacion.contacto_id;
  if (cotizacion.vendedor !== undefined) updateData.vendedor = cotizacion.vendedor;
  if (cotizacion.sucursal !== undefined) updateData.sucursal = cotizacion.sucursal;
  if (cotizacion.estado !== undefined) updateData.estado = cotizacion.estado;
  if (cotizacion.subtotal !== undefined) updateData.subtotal = cotizacion.subtotal;
  if (cotizacion.total_iva !== undefined) updateData.total_iva = cotizacion.total_iva;
  if (cotizacion.total_final !== undefined) updateData.total_final = cotizacion.total_final;
  if (cotizacion.vigencia !== undefined) updateData.vigencia = cotizacion.vigencia;
  if (cotizacion.plazo !== undefined) updateData.plazo = cotizacion.plazo;
  if (cotizacion.cantidad_items !== undefined) updateData.cantidad_items = cotizacion.cantidad_items;
  if (cotizacion.requiere_nueva_aprobacion !== undefined) updateData.requiere_nueva_aprobacion = cotizacion.requiere_nueva_aprobacion;

  const { data, error } = await supabaseAdmin
    .from("cotizaciones")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Cotizacion;
}

export async function deleteCotizacion(id: string) {
  const { error } = await supabaseAdmin.from("cotizaciones").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function generarSiguienteCodigoCotizacion(): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.rpc("generar_codigo_cotizacion");
    if (!error && data) return String(data).trim();
  } catch (_) {}
  const ahora = new Date();
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
  const año = ahora.getFullYear().toString().slice(-2);
  return `COT-${mes}-${año}-00001`;
}

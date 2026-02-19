import { supabaseAdmin } from "@/lib/supabase-admin";

export type CotizacionLinea = {
  id: string;
  cotizacion_id: string;
  tipo: string;
  codigo_producto: string | null;
  nombre_producto: string | null;
  descripcion: string | null;
  cantidad: number | null;
  unidad_medida: string | null;
  precio_unitario: number | null;
  comision: number | null;
  con_iva: boolean | null;
  orden: number | null;
  subtotal_linea: number | null;
  fecha_creacion: string;
};

export interface CotizacionLineaInput {
  cotizacion_id: string;
  tipo?: string;
  codigo_producto?: string | null;
  nombre_producto?: string | null;
  descripcion?: string | null;
  cantidad?: number;
  unidad_medida?: string;
  precio_unitario?: number;
  comision?: number;
  con_iva?: boolean;
  orden?: number;
  subtotal_linea?: number;
}

export async function getLineasByCotizacionId(cotizacionId: string) {
  const { data: cotizacion, error: cotizacionError } = await supabaseAdmin
    .from("cotizaciones")
    .select("id")
    .eq("id", cotizacionId)
    .single();

  if (cotizacionError || !cotizacion) throw new Error(`Cotización con ID ${cotizacionId} no existe`);

  const { data, error } = await supabaseAdmin
    .from("cotizacion_lineas")
    .select("*")
    .eq("cotizacion_id", cotizacionId)
    .order("orden", { ascending: true });

  if (error) throw error;
  return (data || []) as CotizacionLinea[];
}

export async function getLineaById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("cotizacion_lineas")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as CotizacionLinea;
}

export async function createLinea(linea: CotizacionLineaInput) {
  const insertData = {
    cotizacion_id: linea.cotizacion_id,
    tipo: linea.tipo || "servicio",
    codigo_producto: linea.codigo_producto || null,
    nombre_producto: linea.nombre_producto || null,
    descripcion: linea.descripcion || null,
    cantidad: linea.cantidad ?? 0,
    unidad_medida: linea.unidad_medida || "ud",
    precio_unitario: linea.precio_unitario ?? 0,
    comision: linea.comision ?? 0,
    con_iva: linea.con_iva !== undefined ? linea.con_iva : true,
    orden: linea.orden ?? 0,
    subtotal_linea: linea.subtotal_linea ?? 0,
  };

  const { data, error } = await supabaseAdmin
    .from("cotizacion_lineas")
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;
  return data as CotizacionLinea;
}

export async function createMultipleLineas(lineas: CotizacionLineaInput[]) {
  if (lineas.length === 0) return [];

  const cotizacionId = lineas[0].cotizacion_id;
  if (!lineas.every((l) => l.cotizacion_id === cotizacionId)) {
    throw new Error("Todas las líneas deben pertenecer a la misma cotización");
  }

  const { data: cotizacion, error: cotizacionError } = await supabaseAdmin
    .from("cotizaciones")
    .select("id")
    .eq("id", cotizacionId)
    .single();
  if (cotizacionError || !cotizacion) throw new Error(`Cotización con ID ${cotizacionId} no existe`);

  const insertData = lineas.map((linea) => ({
    cotizacion_id: linea.cotizacion_id,
    tipo: linea.tipo || "servicio",
    codigo_producto: linea.codigo_producto || null,
    nombre_producto: linea.nombre_producto || null,
    descripcion: linea.descripcion || null,
    cantidad: linea.cantidad ?? 0,
    unidad_medida: linea.unidad_medida || "ud",
    precio_unitario: linea.precio_unitario ?? 0,
    comision: linea.comision ?? 0,
    con_iva: linea.con_iva !== undefined ? linea.con_iva : true,
    orden: linea.orden ?? 0,
    subtotal_linea: linea.subtotal_linea ?? 0,
  }));

  const { data, error } = await supabaseAdmin
    .from("cotizacion_lineas")
    .insert(insertData)
    .select();
  if (error) throw error;
  return (data || []) as CotizacionLinea[];
}

export async function updateLinea(id: string, linea: Partial<CotizacionLineaInput>) {
  const updateData: Record<string, unknown> = {};
  if (linea.tipo !== undefined) updateData.tipo = linea.tipo;
  if (linea.codigo_producto !== undefined) updateData.codigo_producto = linea.codigo_producto;
  if (linea.nombre_producto !== undefined) updateData.nombre_producto = linea.nombre_producto;
  if (linea.descripcion !== undefined) updateData.descripcion = linea.descripcion;
  if (linea.cantidad !== undefined) updateData.cantidad = linea.cantidad;
  if (linea.unidad_medida !== undefined) updateData.unidad_medida = linea.unidad_medida;
  if (linea.precio_unitario !== undefined) updateData.precio_unitario = linea.precio_unitario;
  if (linea.comision !== undefined) updateData.comision = linea.comision;
  if (linea.con_iva !== undefined) updateData.con_iva = linea.con_iva;
  if (linea.orden !== undefined) updateData.orden = linea.orden;
  if (linea.subtotal_linea !== undefined) updateData.subtotal_linea = linea.subtotal_linea;

  const { data, error } = await supabaseAdmin
    .from("cotizacion_lineas")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CotizacionLinea;
}

export async function deleteLinea(id: string) {
  const { error } = await supabaseAdmin.from("cotizacion_lineas").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function deleteLineasByCotizacionId(cotizacionId: string) {
  const { error } = await supabaseAdmin
    .from("cotizacion_lineas")
    .delete()
    .eq("cotizacion_id", cotizacionId);
  if (error) throw error;
  return { success: true };
}

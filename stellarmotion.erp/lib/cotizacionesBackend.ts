import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { verifySession } from "@/lib/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ============================================================================
// TIPOS
// ============================================================================

export interface LineaPayload {
  tipo: string;
  codigo_producto?: string | null;
  nombre_producto?: string | null;
  descripcion?: string | null;
  cantidad: number;
  unidad_medida?: string;
  precio_unitario: number;
  comision_porcentaje?: number;
  comision?: number;
  con_iva: boolean;
  orden?: number;
  subtotal_linea: number;
}

export interface CotizacionPayload {
  codigo?: string;
  cliente: string;
  contacto_id?: string | null;
  vendedor: string;
  sucursal: string;
  estado?: string;
  vigencia_dias?: number;
  plazo?: string | null;
  lineas: LineaPayload[];
  total_final?: number | null;
  regenerar_alquileres?: boolean;
}

export interface UsuarioAutenticado {
  id: string;
  email: string;
  role?: string;
  name?: string;
}

/**
 * Obtiene el usuario autenticado: primero sesión NextAuth, luego fallback a cookie st_session (ERP).
 */
export async function getUsuarioAutenticado(request: NextRequest): Promise<UsuarioAutenticado | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const u = session.user as { id?: string; email?: string | null; name?: string | null; role?: string };
      const id = u.id ?? (session.user as { sub?: string }).sub;
      if (id) {
        return {
          id,
          email: u.email ?? "",
          role: u.role,
          name: u.name ?? undefined,
        };
      }
    }

    const token = request.cookies.get("st_session")?.value;
    if (!token) return null;
    const payload = await verifySession(token);
    if (!payload || !payload.sub) return null;
    return {
      id: payload.sub,
      email: payload.email || "",
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

/** Stub: en ERP no validamos contra tabla clientes; aceptamos cualquier valor */
export async function verificarClienteExiste(_clienteId: string): Promise<boolean> {
  return true;
}

/** Stub: en ERP no validamos contra tabla usuarios; aceptamos cualquier valor */
export async function verificarVendedorExiste(_vendedorId: string): Promise<boolean> {
  return true;
}

// ============================================================================
// VALIDACIÓN Y NORMALIZACIÓN DE LÍNEAS
// ============================================================================

function validarYNormalizarLinea(linea: Record<string, unknown>, index: number): LineaPayload | null {
  const tipoNorm = (linea.tipo || "").toString().toLowerCase();
  const esServicio = tipoNorm === "servicio" || tipoNorm === "producto";
  const esNota = tipoNorm === "nota";
  const esSeccion = tipoNorm === "sección" || tipoNorm === "seccion";

  if (!esServicio && !esNota && !esSeccion) return null;

  if (esNota || esSeccion) {
    return {
      tipo: esSeccion ? "Sección" : "Nota",
      codigo_producto: null,
      nombre_producto: esSeccion ? (linea.nombre_producto as string) || (linea.texto as string) || "" : null,
      descripcion: esNota ? (linea.descripcion as string) || (linea.texto as string) || "" : null,
      cantidad: 0,
      unidad_medida: "",
      precio_unitario: 0,
      comision_porcentaje: 0,
      con_iva: false,
      orden: (linea.orden as number) || index + 1,
      subtotal_linea: 0,
    };
  }

  const cantidad = parseFloat(String(linea.cantidad)) || 0;
  const precioUnitario = parseFloat(String(linea.precio_unitario)) || 0;
  const subtotalLinea = parseFloat(String(linea.subtotal_linea)) || 0;
  if (cantidad < 0 || precioUnitario < 0 || subtotalLinea < 0) return null;

  return {
    tipo: "servicio",
    codigo_producto: (linea.codigo_producto as string) || null,
    nombre_producto: (linea.nombre_producto as string) || null,
    descripcion: (linea.descripcion as string) || null,
    cantidad,
    unidad_medida: (linea.unidad_medida as string) || "ud",
    precio_unitario: precioUnitario,
    comision_porcentaje: (linea.comision_porcentaje as number) ?? (linea.comision as number) ?? 0,
    con_iva: linea.con_iva !== undefined ? Boolean(linea.con_iva) : true,
    orden: (linea.orden as number) || index + 1,
    subtotal_linea: subtotalLinea,
  };
}

export function validarYNormalizarLineas(lineas: unknown[]): LineaPayload[] {
  const out: LineaPayload[] = [];
  lineas.forEach((linea, i) => {
    const norm = validarYNormalizarLinea(typeof linea === "object" && linea ? (linea as Record<string, unknown>) : {}, i);
    if (norm) out.push(norm);
  });
  return out;
}

// ============================================================================
// TOTALES
// ============================================================================

export function validarTotalFinal(
  totalFinal: number | null | undefined,
  lineas: LineaPayload[],
  tolerancia = 0.01
): boolean {
  if (totalFinal === null || totalFinal === undefined) return true;
  const suma = lineas
    .filter((l) => l.tipo === "servicio" || l.tipo === "Producto")
    .reduce((s, l) => s + (l.subtotal_linea || 0), 0);
  return Math.abs(totalFinal - suma) <= tolerancia;
}

export function calcularTotalFinalDesdeLineas(lineas: LineaPayload[]): number {
  const total = lineas
    .filter((l) => l.tipo === "servicio" || l.tipo === "Producto")
    .reduce((s, l) => s + (l.subtotal_linea || 0), 0);
  return Math.round(total * 100) / 100;
}

export function calcularDesgloseImpuestos(lineas: LineaPayload[]): { subtotal: number; totalIVA: number } {
  let subtotal = 0;
  let totalIVA = 0;
  lineas.forEach((linea) => {
    if (linea.tipo === "servicio" || linea.tipo === "Producto") {
      const lineaTotal = linea.subtotal_linea || 0;
      subtotal += lineaTotal;
      if (linea.con_iva) {
        const base = lineaTotal / 1.21;
        totalIVA += base * 0.21;
      }
    }
  });
  return { subtotal, totalIVA };
}

import { NextRequest, NextResponse } from "next/server";
import {
  getCotizacionById,
  updateCotizacion,
  deleteCotizacion,
} from "@/lib/supabaseCotizaciones";
import {
  getLineasByCotizacionId,
  deleteLineasByCotizacionId,
  createMultipleLineas,
} from "@/lib/supabaseCotizacionLineas";
import {
  getUsuarioAutenticado,
  validarYNormalizarLineas,
  validarTotalFinal,
  calcularTotalFinalDesdeLineas,
  calcularDesgloseImpuestos,
  type CotizacionPayload,
} from "@/lib/cotizacionesBackend";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cotizacion = await getCotizacionById(id);
    const lineas = await getLineasByCotizacionId(id);
    return NextResponse.json({
      success: true,
      data: { cotizacion, lineas },
    });
  } catch (error) {
    console.error("Error obteniendo cotización:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al obtener cotización";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await getUsuarioAutenticado(request);
  if (!usuario) {
    return NextResponse.json(
      { success: false, error: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    let body: CotizacionPayload & { regenerar_alquileres?: boolean };
    try {
      body = (await request.json()) as CotizacionPayload & { regenerar_alquileres?: boolean };
    } catch {
      body = {} as CotizacionPayload & { regenerar_alquileres?: boolean };
    }

    const lineasRaw = body.lineas;
    delete (body as Record<string, unknown>).lineas;
    delete (body as Record<string, unknown>).regenerar_alquileres;

    const totalFinalManual = body.total_final;
    const { vigencia_dias, notas_generales, terminos_condiciones, total_final, ...camposLimpios } = body as CotizacionPayload & {
      vigencia_dias?: number;
      notas_generales?: string;
      terminos_condiciones?: string;
    };

    let lineasNormalizadas: ReturnType<typeof validarYNormalizarLineas> = [];
    if (lineasRaw && Array.isArray(lineasRaw)) {
      lineasNormalizadas = validarYNormalizarLineas(lineasRaw);

      if (lineasNormalizadas.length === 0 && lineasRaw.length > 0) {
        return NextResponse.json(
          { success: false, error: "Todas las líneas son inválidas." },
          { status: 400 }
        );
      }

      if (totalFinalManual !== null && totalFinalManual !== undefined) {
        if (!validarTotalFinal(totalFinalManual, lineasNormalizadas)) {
          return NextResponse.json(
            { success: false, error: "El total_final no coincide con la suma de las líneas." },
            { status: 400 }
          );
        }
      }

      const { subtotal, totalIVA } = calcularDesgloseImpuestos(lineasNormalizadas);
      camposLimpios.subtotal = subtotal;
      (camposLimpios as Record<string, unknown>).total_iva = totalIVA;
      (camposLimpios as Record<string, unknown>).total_final =
        totalFinalManual !== undefined && totalFinalManual !== null
          ? totalFinalManual
          : calcularTotalFinalDesdeLineas(lineasNormalizadas);
      (camposLimpios as Record<string, unknown>).cantidad_items = lineasNormalizadas.filter(
        (l) => l.tipo === "servicio" || l.tipo === "Producto"
      ).length;
    }

    if (vigencia_dias !== undefined) {
      (camposLimpios as Record<string, unknown>).vigencia = vigencia_dias;
    }

    const cotizacionActualizada = await updateCotizacion(id, camposLimpios as Parameters<typeof updateCotizacion>[1]);

    if (lineasNormalizadas.length > 0) {
      await deleteLineasByCotizacionId(id);
      const lineasData = lineasNormalizadas
        .filter((l) => l.tipo === "servicio" || l.tipo === "Producto" || l.tipo === "Nota" || l.tipo === "Sección")
        .map((linea) => ({
          cotizacion_id: id,
          tipo: linea.tipo === "Producto" ? "servicio" : linea.tipo,
          codigo_producto: linea.codigo_producto || null,
          nombre_producto: linea.nombre_producto || null,
          descripcion: linea.descripcion || null,
          cantidad: linea.cantidad,
          unidad_medida: linea.unidad_medida || "ud",
          precio_unitario: linea.precio_unitario,
          comision: linea.comision_porcentaje ?? linea.comision ?? 0,
          con_iva: linea.con_iva,
          orden: linea.orden || 0,
          subtotal_linea: linea.subtotal_linea,
        }));

      await createMultipleLineas(lineasData);
      const numItems = lineasNormalizadas.filter((l) => l.tipo === "servicio" || l.tipo === "Producto").length;
      await updateCotizacion(id, { cantidad_items: numItems });
    }

    return NextResponse.json({ success: true, data: cotizacionActualizada });
  } catch (error) {
    console.error("Error actualizando cotización:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar cotización";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuario = await getUsuarioAutenticado(request);
  if (!usuario) {
    return NextResponse.json(
      { success: false, error: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    await deleteLineasByCotizacionId(id);
    await deleteCotizacion(id);
    return NextResponse.json({ success: true, message: "Cotización eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando cotización:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al eliminar cotización";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

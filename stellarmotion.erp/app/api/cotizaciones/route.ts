import { NextRequest, NextResponse } from "next/server";
import {
  getCotizaciones,
  createCotizacion,
  generarSiguienteCodigoCotizacion,
} from "@/lib/supabaseCotizaciones";
import { createMultipleLineas } from "@/lib/supabaseCotizacionLineas";
import {
  getUsuarioAutenticado,
  verificarClienteExiste,
  verificarVendedorExiste,
  validarYNormalizarLineas,
  validarTotalFinal,
  calcularTotalFinalDesdeLineas,
  calcularDesgloseImpuestos,
  type CotizacionPayload,
} from "@/lib/cotizacionesBackend";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticado(request);
    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const estado = searchParams.get("estado") || "";
    const cliente = searchParams.get("cliente") || "";
    const vendedor = searchParams.get("vendedor") || "";
    const search = searchParams.get("search") || "";

    const result = await getCotizaciones({
      estado: estado || undefined,
      cliente: cliente || undefined,
      vendedor: vendedor || undefined,
      search: search || undefined,
      page,
      limit: pageSize,
    });

    const total = result.count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error en API cotizaciones:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const usuario = await getUsuarioAutenticado(request);
  if (!usuario) {
    return NextResponse.json(
      { success: false, error: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  try {
    let body: CotizacionPayload;
    try {
      body = (await request.json()) as CotizacionPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "El cuerpo de la solicitud no es un JSON válido" },
        { status: 400 }
      );
    }

    const lineasRaw = body.lineas || [];
    const lineasNormalizadas = validarYNormalizarLineas(lineasRaw);

    if (lineasNormalizadas.length === 0 && lineasRaw.length > 0) {
      return NextResponse.json(
        { success: false, error: "Todas las líneas son inválidas. Verifica los datos enviados." },
        { status: 400 }
      );
    }

    const totalFinalManual = body.total_final;
    if (totalFinalManual !== null && totalFinalManual !== undefined) {
      if (!validarTotalFinal(totalFinalManual, lineasNormalizadas)) {
        return NextResponse.json(
          { success: false, error: "El total_final no coincide con la suma de las líneas." },
          { status: 400 }
        );
      }
    }

    if (body.cliente) await verificarClienteExiste(body.cliente);
    if (body.vendedor) await verificarVendedorExiste(body.vendedor);

    let codigo = body.codigo;
    if (!codigo) codigo = await generarSiguienteCodigoCotizacion();

    const { subtotal, totalIVA } = calcularDesgloseImpuestos(lineasNormalizadas);
    const totalFinal =
      totalFinalManual !== undefined && totalFinalManual !== null
        ? totalFinalManual
        : calcularTotalFinalDesdeLineas(lineasNormalizadas);

    const { vigencia_dias, ...camposLimpios } = body;

    let nuevaCotizacion: Awaited<ReturnType<typeof createCotizacion>> | null = null;

    try {
      nuevaCotizacion = await createCotizacion({
        codigo,
        cliente: camposLimpios.cliente || "",
        contacto_id: camposLimpios.contacto_id ?? null,
        vendedor: camposLimpios.vendedor || "",
        sucursal: camposLimpios.sucursal || "La Paz",
        estado: camposLimpios.estado || "Pendiente",
        subtotal,
        total_iva: totalIVA,
        total_final: totalFinal,
        vigencia: vigencia_dias || 30,
        plazo: camposLimpios.plazo || null,
        cantidad_items: lineasNormalizadas.filter((l) => l.tipo === "servicio" || l.tipo === "Producto").length,
      });

      if (lineasNormalizadas.length > 0) {
        const lineasData = lineasNormalizadas
          .filter((l) => l.tipo === "servicio" || l.tipo === "Producto" || l.tipo === "Nota" || l.tipo === "Sección")
          .map((linea) => ({
            cotizacion_id: nuevaCotizacion!.id,
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

        const lineasCreadas = await createMultipleLineas(lineasData);
        return NextResponse.json({
          success: true,
          data: { cotizacion: nuevaCotizacion, lineas: lineasCreadas },
        });
      }

      return NextResponse.json({
        success: true,
        data: { cotizacion: nuevaCotizacion, lineas: [] },
      });
    } catch (errorCrear) {
      if (nuevaCotizacion) {
        const { deleteCotizacion } = await import("@/lib/supabaseCotizaciones");
        try {
          await deleteCotizacion(nuevaCotizacion.id);
        } catch (_) {}
      }
      throw errorCrear;
    }
  } catch (error) {
    console.error("Error creando cotización:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al crear cotización";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

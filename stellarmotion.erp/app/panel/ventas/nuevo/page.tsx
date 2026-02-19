"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface LineaForm {
  id: string;
  tipo: "servicio" | "Nota" | "Sección";
  nombre_producto: string;
  descripcion: string;
  cantidad: number;
  unidad_medida: string;
  precio_unitario: number;
  con_iva: boolean;
  subtotal_linea: number;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function calcSubtotal(cantidad: number, precio: number, conIVA: boolean): number {
  let t = cantidad * precio;
  if (conIVA) t *= 1.21;
  return round2(t);
}

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [cliente, setCliente] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [sucursal, setSucursal] = useState("La Paz");
  const [vigencia, setVigencia] = useState(30);
  const [lineas, setLineas] = useState<LineaForm[]>([
    {
      id: crypto.randomUUID(),
      tipo: "servicio",
      nombre_producto: "",
      descripcion: "",
      cantidad: 1,
      unidad_medida: "ud",
      precio_unitario: 0,
      con_iva: true,
      subtotal_linea: 0,
    },
  ]);

  const updateLinea = (id: string, upd: Partial<LineaForm>) => {
    setLineas((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...upd };
        if (
          upd.cantidad !== undefined ||
          upd.precio_unitario !== undefined ||
          upd.con_iva !== undefined
        ) {
          next.subtotal_linea =
            next.tipo === "servicio"
              ? calcSubtotal(
                  next.cantidad,
                  next.precio_unitario,
                  next.con_iva
                )
              : 0;
        }
        return next;
      })
    );
  };

  const addLinea = () => {
    setLineas((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        tipo: "servicio",
        nombre_producto: "",
        descripcion: "",
        cantidad: 1,
        unidad_medida: "ud",
        precio_unitario: 0,
        con_iva: true,
        subtotal_linea: 0,
      },
    ]);
  };

  const removeLinea = (id: string) => {
    if (lineas.length <= 1) return;
    setLineas((prev) => prev.filter((l) => l.id !== id));
  };

  const totalFinal = round2(
    lineas.reduce((s, l) => s + (l.subtotal_linea || 0), 0)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim()) {
      toast.error("Indica el cliente.");
      return;
    }

    const payload = {
      cliente: cliente.trim(),
      vendedor: vendedor.trim() || "—",
      sucursal: sucursal.trim() || "La Paz",
      estado: "Pendiente",
      vigencia_dias: vigencia,
      lineas: lineas.map((l, i) => {
        if (l.tipo === "Nota")
          return {
            tipo: "Nota",
            descripcion: l.descripcion,
            cantidad: 0,
            unidad_medida: "",
            precio_unitario: 0,
            con_iva: false,
            orden: i + 1,
            subtotal_linea: 0,
          };
        if (l.tipo === "Sección")
          return {
            tipo: "Sección",
            nombre_producto: l.nombre_producto,
            descripcion: "",
            cantidad: 0,
            unidad_medida: "",
            precio_unitario: 0,
            con_iva: false,
            orden: i + 1,
            subtotal_linea: 0,
          };
        return {
          tipo: "servicio",
          codigo_producto: null,
          nombre_producto: l.nombre_producto || null,
          descripcion: l.descripcion || null,
          cantidad: l.cantidad,
          unidad_medida: l.unidad_medida,
          precio_unitario: l.precio_unitario,
          comision_porcentaje: 0,
          con_iva: l.con_iva,
          orden: i + 1,
          subtotal_linea: l.subtotal_linea,
        };
      }),
      total_final: totalFinal,
    };

    setSaving(true);
    try {
      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Error al crear la cotización.");
        return;
      }

      toast.success("Cotización creada.");
      const id = data.data?.cotizacion?.id;
      if (id) router.replace(`/panel/ventas/editar/${id}`);
      else router.replace("/panel/ventas/cotizaciones");
    } catch (err) {
      toast.error("Error al crear la cotización.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/panel/ventas/cotizaciones">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva cotización</h1>
          <p className="text-muted-foreground text-sm">Crear una nueva cotización.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Datos generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <Label htmlFor="vendedor">Vendedor</Label>
                <Input
                  id="vendedor"
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                  placeholder="Nombre del vendedor"
                />
              </div>
              <div>
                <Label htmlFor="sucursal">Sucursal</Label>
                <Input
                  id="sucursal"
                  value={sucursal}
                  onChange={(e) => setSucursal(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="vigencia">Vigencia (días)</Label>
                <Input
                  id="vigencia"
                  type="number"
                  min={1}
                  value={vigencia}
                  onChange={(e) => setVigencia(Number(e.target.value) || 30)}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Líneas</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLinea}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir línea
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-2 text-foreground">Tipo</th>
                    <th className="text-left py-2 pr-2 text-foreground">Concepto / Descripción</th>
                    <th className="text-left py-2 pr-2 text-foreground w-24">Cant.</th>
                    <th className="text-left py-2 pr-2 text-foreground w-28">P. unit.</th>
                    <th className="text-left py-2 pr-2 text-foreground w-24">IVA</th>
                    <th className="text-right py-2 text-foreground w-28">Subtotal</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l) => (
                    <tr key={l.id} className="border-b border-border">
                      <td className="py-2 pr-2">
                        <select
                          value={l.tipo}
                          onChange={(e) =>
                            updateLinea(l.id, {
                              tipo: e.target.value as LineaForm["tipo"],
                              subtotal_linea:
                                e.target.value === "servicio"
                                  ? calcSubtotal(
                                      l.cantidad,
                                      l.precio_unitario,
                                      l.con_iva
                                    )
                                  : 0,
                            })
                          }
                          className="bg-background border border-border rounded text-foreground px-2 py-1"
                        >
                          <option value="servicio">Servicio</option>
                          <option value="Nota">Nota</option>
                          <option value="Sección">Sección</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        {l.tipo === "servicio" ? (
                          <>
                            <Input
                              placeholder="Concepto"
                              value={l.nombre_producto}
                              onChange={(e) =>
                                updateLinea(l.id, { nombre_producto: e.target.value })
                              }
                              className="mb-1 bg-background border-border text-foreground text-sm"
                            />
                            <Input
                              placeholder="Descripción"
                              value={l.descripcion}
                              onChange={(e) =>
                                updateLinea(l.id, { descripcion: e.target.value })
                              }
                              className="bg-background border-border text-foreground text-sm"
                            />
                          </>
                        ) : l.tipo === "Nota" ? (
                          <Input
                            placeholder="Texto nota"
                            value={l.descripcion}
                            onChange={(e) =>
                              updateLinea(l.id, { descripcion: e.target.value })
                            }
                            className="bg-background border-border text-foreground"
                          />
                        ) : (
                          <Input
                            placeholder="Título sección"
                            value={l.nombre_producto}
                            onChange={(e) =>
                              updateLinea(l.id, { nombre_producto: e.target.value })
                            }
                            className="bg-background border-border text-foreground"
                          />
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={l.cantidad}
                          onChange={(e) =>
                            updateLinea(l.id, {
                              cantidad: Number(e.target.value) || 0,
                            })
                          }
                          disabled={l.tipo !== "servicio"}
                          className="w-24 bg-background border-border text-foreground"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={l.precio_unitario}
                          onChange={(e) =>
                            updateLinea(l.id, {
                              precio_unitario: Number(e.target.value) || 0,
                            })
                          }
                          disabled={l.tipo !== "servicio"}
                          className="w-28 bg-background border-border text-foreground"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        {l.tipo === "servicio" ? (
                          <input
                            type="checkbox"
                            checked={l.con_iva}
                            onChange={(e) =>
                              updateLinea(l.id, { con_iva: e.target.checked })
                            }
                            className="rounded border-border"
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 text-right text-foreground font-medium">
                        {l.tipo === "servicio"
                          ? `${l.subtotal_linea.toFixed(2)} €`
                          : "—"}
                      </td>
                      <td className="py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLinea(l.id)}
                          disabled={lineas.length <= 1}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <span className="text-foreground font-semibold">
                Total: {totalFinal.toFixed(2)} €
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando…
              </>
            ) : (
              "Crear cotización"
            )}
          </Button>
          <Link href="/panel/ventas/cotizaciones">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  Loader2,
  Copy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface Cotizacion {
  id: string;
  codigo: string;
  fecha_creacion: string;
  cliente: string | null;
  vendedor: string | null;
  sucursal: string | null;
  total_final: number | null;
  estado: string;
}

const ESTADO_OPTS = [
  { value: "all", label: "Todos" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Aprobada", label: "Aprobada" },
  { value: "Rechazada", label: "Rechazada" },
  { value: "Vencida", label: "Vencida" },
] as const;

function getEstadoClass(estado: string): string {
  switch (estado) {
    case "Aprobada":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Rechazada":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Pendiente":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "Vencida":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export default function CotizacionesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [descargandoPDF, setDescargandoPDF] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? sessionStorage.getItem("cotizaciones_filtros_erp") : null;
      if (saved) {
        const f = JSON.parse(saved);
        setSearchTerm(f.searchTerm ?? "");
        setFiltroEstado(f.filtroEstado ?? "all");
      }
    } catch {
      // ignore
    }
    setFiltersLoaded(true);
  }, []);

  useEffect(() => {
    if (!filtersLoaded) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "cotizaciones_filtros_erp",
        JSON.stringify({ searchTerm, filtroEstado })
      );
    }
  }, [searchTerm, filtroEstado, filtersLoaded]);

  useEffect(() => {
    if (!filtersLoaded) return;
    setCurrentPage(1);
  }, [filtroEstado, searchTerm, filtersLoaded]);

  useEffect(() => {
    if (!filtersLoaded) return;
    fetchCotizaciones(currentPage);
  }, [currentPage, filtroEstado, searchTerm, filtersLoaded]);

  const fetchCotizaciones = async (page: number) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "50");
      if (filtroEstado !== "all") params.set("estado", filtroEstado);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/cotizaciones?${params.toString()}`, { credentials: "include" });
      const data = await res.json();

      if (data.success) {
        setCotizaciones(data.data ?? []);
        setPagination(data.pagination ?? pagination);
      } else {
        toast.error(data.error || "Error al cargar cotizaciones");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar cotizaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta cotización?")) return;
    try {
      const res = await fetch(`/api/cotizaciones/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Cotización eliminada");
        setCurrentPage(1);
        fetchCotizaciones(1);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/cotizaciones/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar la cotización");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al cargar");

      const cot = data.data.cotizacion;
      const lineas = data.data.lineas || [];

      const payload = {
        cliente: cot.cliente || "",
        contacto_id: cot.contacto_id ?? null,
        vendedor: cot.vendedor || "",
        sucursal: cot.sucursal || "La Paz",
        estado: "Pendiente",
        vigencia_dias: cot.vigencia || 30,
        plazo: cot.plazo || null,
        lineas: lineas.map((l: Record<string, unknown>, i: number) => ({
          tipo: l.tipo || "servicio",
          codigo_producto: l.codigo_producto ?? null,
          nombre_producto: l.nombre_producto ?? null,
          descripcion: l.descripcion ?? null,
          cantidad: l.cantidad ?? 0,
          unidad_medida: l.unidad_medida || "ud",
          precio_unitario: l.precio_unitario ?? 0,
          comision: l.comision ?? 0,
          con_iva: l.con_iva !== undefined ? l.con_iva : true,
          orden: l.orden ?? i + 1,
          subtotal_linea: l.subtotal_linea ?? 0,
        })),
      };

      const createRes = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.error || "Error al crear");
      }
      const createData = await createRes.json();
      toast.success("Cotización duplicada");
      setSelectedIds([]);
      fetchCotizaciones(currentPage);
      if (createData.data?.cotizacion?.id) {
        window.location.href = `/panel/ventas/editar/${createData.data.cotizacion.id}`;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al duplicar");
    }
  };

  const handleDescargarPDF = (_id: string, _codigo: string) => {
    setDescargandoPDF(_id);
    toast.info("Descarga de PDF en preparación.");
    setDescargandoPDF(null);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? cotizaciones.map((c) => c.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroEstado("all");
    if (typeof window !== "undefined") sessionStorage.removeItem("cotizaciones_filtros_erp");
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6">
        <main className="w-full max-w-full overflow-hidden">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Cotizaciones</h1>
            <p className="text-muted-foreground">Gestiona cotizaciones y propuestas comerciales.</p>
          </div>

          <Card className="mb-6 border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código o cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-background border-border text-foreground"
                    />
                  </div>
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="w-44 bg-background border-border text-foreground">
                      <Filter className="w-4 h-4 text-muted-foreground mr-1" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADO_OPTS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Link href="/panel/ventas/nuevo">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva cotización
                  </Button>
                </Link>
              </div>
              {(searchTerm || filtroEstado !== "all") && (
                <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-border mt-3">
                  {searchTerm && (
                    <span className="text-sm text-muted-foreground">
                      Búsqueda: {searchTerm}
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="ml-1 text-foreground hover:underline"
                      >
                        <X className="w-3 h-3 inline" />
                      </button>
                    </span>
                  )}
                  {filtroEstado !== "all" && (
                    <span className="text-sm text-muted-foreground">
                      Estado: {filtroEstado}
                      <button
                        type="button"
                        onClick={() => setFiltroEstado("all")}
                        className="ml-1 text-foreground hover:underline"
                      >
                        <X className="w-3 h-3 inline" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Listado</CardTitle>
              <CardDescription>
                {isLoading ? "Cargando…" : `${pagination.total} cotización(es)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedIds.length > 0 && (
                <div className="mb-4 p-3 bg-muted/50 border border-border rounded-lg flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    {selectedIds.length} seleccionada(s)
                  </span>
                  {selectedIds.length === 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(selectedIds[0])}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </Button>
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : cotizaciones.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No hay cotizaciones.
                  <Link href="/panel/ventas/nuevo">
                    <Button className="mt-4">Crear primera cotización</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 w-12">
                          <Checkbox
                            checked={
                              cotizaciones.length > 0 &&
                              selectedIds.length === cotizaciones.length
                            }
                            onCheckedChange={(c) => handleSelectAll(!!c)}
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Código</th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Fecha</th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Estado</th>
                        <th className="text-center py-3 px-4 font-medium text-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotizaciones.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-border hover:bg-muted/30"
                        >
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selectedIds.includes(c.id)}
                              onCheckedChange={(checked) =>
                                handleSelectOne(c.id, !!checked)
                              }
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-foreground">
                              {c.codigo}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(c.fecha_creacion).toLocaleDateString("es-ES")}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">
                            {c.cliente || "—"}
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            {Number(c.total_final ?? 0).toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            €
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={getEstadoClass(c.estado)}
                            >
                              {c.estado}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="PDF (en preparación)"
                                onClick={() =>
                                  handleDescargarPDF(c.id, c.codigo)
                                }
                                disabled={descargandoPDF === c.id}
                              >
                                {descargandoPDF === c.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </Button>
                              <Link href={`/panel/ventas/editar/${c.id}`}>
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Eliminar"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(c.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchCotizaciones(currentPage - 1)}
                    disabled={!pagination.hasPrev || isLoading}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchCotizaciones(currentPage + 1)}
                    disabled={!pagination.hasNext || isLoading}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}

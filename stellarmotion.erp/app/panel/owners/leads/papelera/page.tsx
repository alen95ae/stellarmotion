"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderUser from "@/components/dashboard/HeaderUser";
import { TableCellTruncate } from "@/components/TableCellTruncate";
import BulkActionsPapelera from "@/components/owners/BulkActionsPapelera";

interface Lead {
  id: string;
  nombre: string;
  email?: string[] | string;
  telefono?: string;
  ciudad?: string;
  sector?: string;
  deleted_at?: string | null;
}

export default function OwnersLeadsPapeleraPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const fetchPapelera = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(page));
      params.set("limit", "50");
      const res = await fetch(`/api/leads/papelera?${params}`);
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setLeads(data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch {
      toast.error("Error al cargar papelera");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapelera(1);
  }, [q]);

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch("/api/leads/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error");
      toast.success("Restaurado");
      fetchPapelera(pagination.page);
    } catch {
      toast.error("Error al restaurar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar definitivamente este registro?")) return;
    try {
      const res = await fetch(`/api/contactos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      toast.success("Eliminado");
      fetchPapelera(pagination.page);
    } catch {
      toast.error("Error al eliminar");
    }
  };

  function formatEliminado(deletedAt: string | null | undefined): string {
    if (!deletedAt) return "—";
    try {
      const d = new Date(deletedAt);
      return d.toLocaleDateString("es-ES", { dateStyle: "short" }) + " " + d.toLocaleTimeString("es-ES", { timeStyle: "short" });
    } catch {
      return deletedAt;
    }
  }

  const ids = leads.map((l) => l.id);
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const allSelected = ids.length > 0 && ids.every((id) => selected[id]);
  const someSelected = ids.some((id) => selected[id]);

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    ids.forEach((id) => {
      next[id] = checked;
    });
    setSelected(next);
  }

  async function bulkRestore() {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Devolver ${selectedIds.length} registro(s) a la lista de Owners?`)) return;
    try {
      const res = await fetch("/api/leads/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error("Error");
      const data = await res.json();
      toast.success(`${data.count ?? selectedIds.length} restaurado(s)`);
      setSelected({});
      fetchPapelera(pagination.page);
    } catch {
      toast.error("Error al restaurar");
    }
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border dark:bg-[#141414] dark:border-[#1E1E1E] px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link prefetch={false} href="/panel/owners" className="text-[#e94446] font-medium hover:text-[#d63d3f]">
                Owners
              </Link>
            </div>
            <HeaderUser />
          </div>
        </header>

        <main className="w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Papelera</h1>
          <p className="text-muted-foreground">
            Registros movidos a papelera. Puedes restaurarlos a la lista de Owners.
          </p>
        </div>

        <div className="bg-card dark:bg-[#141414] border border-border dark:border-[#1E1E1E] rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] max-w-md">
              <Input
                placeholder="Buscar en papelera..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
              />
            </div>
          </div>
        </div>

        <Card className="dark:bg-[#141414] dark:border-[#1E1E1E]">
          <CardHeader>
            <CardTitle>Papelera ({pagination.total})</CardTitle>
            <CardDescription>Registros movidos a papelera. Puedes restaurarlos a la lista de Owners.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <BulkActionsPapelera selectedCount={selectedIds.length} onBulkRestore={bulkRestore} />
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : leads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay leads en la papelera.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={(v) => toggleAll(Boolean(v))}
                        aria-label="Seleccionar todo"
                        className="data-[state=checked]:!bg-[#e94446] data-[state=checked]:!border-[#e94446] data-[state=checked]:!text-white"
                      />
                    </TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Eliminado</TableHead>
                    <TableHead className="text-right w-[1%]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="w-10">
                        <Checkbox
                          checked={!!selected[l.id]}
                          onCheckedChange={(v) =>
                            setSelected((prev) => ({ ...prev, [l.id]: Boolean(v) }))
                          }
                          aria-label={`Seleccionar ${l.nombre}`}
                          className="data-[state=checked]:!bg-[#e94446] data-[state=checked]:!border-[#e94446] data-[state=checked]:!text-white"
                        />
                      </TableCell>
                      <TableCell className="max-w-[22ch]">
                        <TableCellTruncate value={l.nombre} />
                      </TableCell>
                      <TableCell className="max-w-[22ch]">
                        <TableCellTruncate
                          value={Array.isArray(l.email) ? l.email.join(", ") : (l.email as string)}
                        />
                      </TableCell>
                      <TableCell className="max-w-[14ch]">
                        <TableCellTruncate value={l.telefono} />
                      </TableCell>
                      <TableCell className="max-w-[18ch]">
                        <TableCellTruncate value={l.ciudad} />
                      </TableCell>
                      <TableCell className="max-w-[18ch]">
                        <TableCellTruncate value={l.sector} />
                      </TableCell>
                      <TableCell className="max-w-[20ch] text-muted-foreground">
                        {formatEliminado(l.deleted_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(l.id)}
                            title="Restaurar"
                            className="border-border text-foreground hover:bg-muted dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(l.id)}
                            title="Eliminar"
                            className="border-border text-red-600 hover:bg-red-600/10 hover:text-red-600 dark:border-red-600 dark:text-red-600 dark:hover:bg-red-600/10 dark:hover:border-red-600 dark:hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => fetchPapelera(pagination.page - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => fetchPapelera(pagination.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </main>
      </div>
    </Sidebar>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, User, Plus, Edit, Trash2, FileSpreadsheet, Trash, Send, ArrowUpDown, X } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderUser from "@/components/dashboard/HeaderUser";
import { TableCellTruncate } from "@/components/TableCellTruncate";
import BulkActionsOwners from "@/components/owners/BulkActionsOwners";

const STORAGE_KEY = "owners_filtros";

interface Contact {
  id: string;
  displayName: string;
  legalName?: string;
  nif?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  relation: string;
  sector?: string;
  status: string;
  kind?: string;
  origen?: string;
  website?: string;
}

export default function OwnersPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({ q: "", sector: "ALL", interes: "ALL", origen: "ALL" });
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [sortColumn, setSortColumn] = useState<"nombre" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [allContactsForSort, setAllContactsForSort] = useState<Contact[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [uniqueOrigenes, setUniqueOrigenes] = useState<string[]>([]);
  const [uniqueSectores, setUniqueSectores] = useState<string[]>([]);
  const [uniqueIntereses, setUniqueIntereses] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const f = JSON.parse(saved);
        setFilters({
          q: f.q ?? "",
          sector: f.sector ?? "ALL",
          interes: f.interes ?? "ALL",
          origen: f.origen ?? "ALL",
        });
        setSortColumn(f.sortColumn ?? null);
        setSortDirection(f.sortDirection ?? "asc");
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
        STORAGE_KEY,
        JSON.stringify({
          q: filters.q,
          sector: filters.sector,
          interes: filters.interes,
          origen: filters.origen,
          sortColumn,
          sortDirection,
        })
      );
    }
  }, [filters, sortColumn, sortDirection, filtersLoaded]);

  const fetchContacts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.sector !== "ALL") params.set("sector", filters.sector);
      if (filters.interes !== "ALL") params.set("interes", filters.interes);
      if (filters.origen !== "ALL") params.set("origen", filters.origen);
      params.set("page", String(page));
      params.set("limit", sortColumn ? "10000" : "50");
      const res = await fetch(`/api/contactos?${params}`);
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      const list = data.data || [];
      if (sortColumn) {
        setAllContactsForSort(list);
        setCurrentPage(1);
        setPagination({
          page: 1,
          limit: 50,
          total: list.length,
          totalPages: Math.ceil(list.length / 50) || 1,
          hasNext: list.length > 50,
          hasPrev: false,
        });
      } else {
        setAllContactsForSort([]);
        setContacts(list);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch {
      toast.error("Error al cargar owners");
      setContacts([]);
      setAllContactsForSort([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filtersLoaded) return;
    fetchContacts(1);
  }, [filters, filtersLoaded, sortColumn]);

  useEffect(() => {
    (async () => {
      try {
        const [rOrigen, rSector, rInteres] = await Promise.all([
          fetch("/api/contactos/unique-values?field=origen").then((r) => r.json()),
          fetch("/api/contactos/unique-values?field=sector").then((r) => r.json()),
          fetch("/api/contactos/unique-values?field=interes").then((r) => r.json()),
        ]);
        setUniqueOrigenes(Array.isArray(rOrigen) ? rOrigen : []);
        setUniqueSectores(Array.isArray(rSector) ? rSector : []);
        setUniqueIntereses(Array.isArray(rInteres) ? rInteres : []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const limpiarTodosFiltros = () => {
    setFilters({ q: "", sector: "ALL", interes: "ALL", origen: "ALL" });
    setSortColumn(null);
    setSortDirection("asc");
    if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
    toast.info("Filtros limpiados");
  };

  const eliminarFiltro = (tipo: "q" | "sector" | "interes" | "origen" | "sort") => {
    if (tipo === "q") setFilters((p) => ({ ...p, q: "" }));
    else if (tipo === "sector") setFilters((p) => ({ ...p, sector: "ALL" }));
    else if (tipo === "interes") setFilters((p) => ({ ...p, interes: "ALL" }));
    else if (tipo === "origen") setFilters((p) => ({ ...p, origen: "ALL" }));
    else if (tipo === "sort") {
      setSortColumn(null);
      setSortDirection("asc");
    }
  };

  const handleSortNombre = () => {
    if (sortColumn === "nombre") {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn("nombre");
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este owner?")) return;
    try {
      const res = await fetch(`/api/contactos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Owner eliminado");
      fetchContacts(1);
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handlePapelera = async (id: string) => {
    if (!confirm("¿Mover a papelera?")) return;
    try {
      const res = await fetch("/api/leads/kill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      if (!res.ok) throw new Error("Error");
      toast.success("Movido a papelera");
      fetchContacts(1);
    } catch {
      toast.error("Error al mover a papelera");
    }
  };

  const sortedForDisplay =
    sortColumn === "nombre"
      ? [...allContactsForSort].sort((a, b) => {
          const va = (a.displayName || "").toLowerCase();
          const vb = (b.displayName || "").toLowerCase();
          if (va < vb) return sortDirection === "asc" ? -1 : 1;
          if (va > vb) return sortDirection === "asc" ? 1 : -1;
          return 0;
        })
      : [];

  const limit = 50;
  const displayContacts =
    sortColumn === "nombre"
      ? sortedForDisplay.slice((currentPage - 1) * limit, currentPage * limit)
      : contacts;
  const computedPagination =
    sortColumn === "nombre"
      ? {
          page: currentPage,
          limit,
          total: sortedForDisplay.length,
          totalPages: Math.ceil(sortedForDisplay.length / limit) || 1,
          hasNext: currentPage < Math.ceil(sortedForDisplay.length / limit),
          hasPrev: currentPage > 1,
        }
      : pagination;

  const ids = displayContacts.map((c) => c.id);
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

  const RELATION_LABELS: Record<string, string> = {
    CUSTOMER: "Cliente",
    SUPPLIER: "Proveedor",
  };

  async function bulkRelationChange(relation: string) {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Cambiar relación de ${selectedIds.length} owner(s) a ${RELATION_LABELS[relation] ?? relation}?`)) return;
    let ok = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/contactos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relation }),
        });
        if (res.ok) ok++;
      } catch {
        // continue
      }
    }
    toast.success(`${ok} owner(s) actualizado(s)`);
    setSelected({});
    fetchContacts(1);
  }

  function bulkExportSelection() {
    const rows = displayContacts.filter((c) => selected[c.id]);
    if (rows.length === 0) {
      toast.error("Selecciona al menos un owner");
      return;
    }
    const headers = ["Nombre", "Web", "Email", "Teléfono", "Ciudad", "Relación"];
    const csvRows = [
      headers.join(";"),
      ...rows.map((c) =>
        [
          `"${(c.displayName || "").replace(/"/g, '""')}"`,
          `"${(c.website || "").replace(/"/g, '""')}"`,
          `"${(c.email || "").replace(/"/g, '""')}"`,
          `"${(c.phone || "").replace(/"/g, '""')}"`,
          `"${(c.city || "").replace(/"/g, '""')}"`,
          `"${((RELATION_LABELS[c.relation] ?? c.relation) || "").replace(/"/g, '""')}"`,
        ].join(";")
      ),
    ];
    const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `owners-seleccion-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV descargado");
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Eliminar ${selectedIds.length} owner(s)?`)) return;
    let ok = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/contactos/${id}`, { method: "DELETE" });
        if (res.ok) ok++;
      } catch {
        // continue
      }
    }
    toast.success(`${ok} owner(s) eliminado(s)`);
    setSelected({});
    fetchContacts(1);
  }

  async function bulkOrigenChange(origen: string) {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Cambiar origen de ${selectedIds.length} registro(s) a "${origen}"?`)) return;
    let ok = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/contactos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origen }),
        });
        if (res.ok) ok++;
      } catch {
        // continue
      }
    }
    toast.success(`${ok} registro(s) actualizado(s)`);
    setSelected({});
    fetchContacts(1);
  }

  async function bulkPapelera() {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Mover ${selectedIds.length} registro(s) a la papelera?`)) return;
    try {
      const res = await fetch("/api/leads/kill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error("Error");
      const data = await res.json();
      toast.success(`${data.count ?? selectedIds.length} movido(s) a papelera`);
      setSelected({});
      fetchContacts(1);
    } catch {
      toast.error("Error al mover a papelera");
    }
  }

  function exportAllCsv() {
    const toExport = sortColumn ? sortedForDisplay : contacts;
    if (toExport.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    const headers = ["Nombre", "Web", "Email", "Teléfono", "Ciudad", "Relación"];
    const csvRows = [
      headers.join(";"),
      ...toExport.map((c) =>
        [
          `"${(c.displayName || "").replace(/"/g, '""')}"`,
          `"${(c.website || "").replace(/"/g, '""')}"`,
          `"${(c.email || "").replace(/"/g, '""')}"`,
          `"${(c.phone || "").replace(/"/g, '""')}"`,
          `"${(c.city || "").replace(/"/g, '""')}"`,
          `"${((RELATION_LABELS[c.relation] ?? c.relation) || "").replace(/"/g, '""')}"`,
        ].join(";")
      ),
    ];
    const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `owners-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV descargado");
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-background">
        <header className="bg-[#141414] border-b border-[#1E1E1E] px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-[#e94446] font-medium">Owners</span>
            </div>
            <HeaderUser />
          </div>
        </header>

        <main className="w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Owners</h1>
          <p className="text-muted-foreground">
            Gestiona contactos y leads.
          </p>
        </div>

        <div className="sticky top-14 z-10 bg-card dark:bg-[#141414] border border-border rounded-lg p-4 mb-6 shadow-sm">
          {(filters.q || filters.sector !== "ALL" || filters.interes !== "ALL" || filters.origen !== "ALL" || sortColumn) && (
            <div className="flex flex-wrap gap-2 items-center mb-4 pb-4 border-b border-[#1E1E1E]">
              {filters.q && (
                <div className="flex items-center gap-1 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-700/40 rounded-full px-3 py-1.5 text-sm text-blue-200">
                  <span className="font-medium">Búsqueda:</span>
                  <span className="text-blue-100">{filters.q}</span>
                  <button type="button" onClick={() => eliminarFiltro("q")} className="ml-0.5 text-blue-300 hover:text-[#3EE6C1] transition-colors" aria-label="Quitar filtro">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {filters.sector !== "ALL" && (
                <div className="flex items-center gap-1 bg-emerald-900/40 hover:bg-emerald-800/40 border border-emerald-600/40 rounded-full px-3 py-1.5 text-sm text-emerald-200">
                  <span className="font-medium">Sector:</span>
                  <span className="text-emerald-100">{filters.sector}</span>
                  <button type="button" onClick={() => eliminarFiltro("sector")} className="ml-0.5 text-emerald-300 hover:text-[#3EE6C1] transition-colors" aria-label="Quitar sector">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {filters.interes !== "ALL" && (
                <div className="flex items-center gap-1 bg-purple-900/40 hover:bg-purple-800/40 border border-purple-600/40 rounded-full px-3 py-1.5 text-sm text-purple-200">
                  <span className="font-medium">Interés:</span>
                  <span className="text-purple-100">{filters.interes}</span>
                  <button type="button" onClick={() => eliminarFiltro("interes")} className="ml-0.5 text-purple-300 hover:text-[#3EE6C1] transition-colors" aria-label="Quitar interés">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {filters.origen !== "ALL" && (
                <div className="flex items-center gap-1 bg-amber-900/40 hover:bg-amber-800/40 border border-amber-600/40 rounded-full px-3 py-1.5 text-sm text-amber-200">
                  <span className="font-medium">Origen:</span>
                  <span className="text-amber-100">{filters.origen}</span>
                  <button type="button" onClick={() => eliminarFiltro("origen")} className="ml-0.5 text-amber-300 hover:text-[#3EE6C1] transition-colors" aria-label="Quitar origen">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {sortColumn && (
                <div className="flex items-center gap-1 bg-cyan-900/40 hover:bg-cyan-800/40 border border-cyan-600/40 rounded-full px-3 py-1.5 text-sm text-cyan-200">
                  <span className="font-medium">Orden:</span>
                  <span className="text-cyan-100">Nombre ({sortDirection === "asc" ? "A-Z" : "Z-A"})</span>
                  <button type="button" onClick={() => eliminarFiltro("sort")} className="ml-0.5 text-cyan-300 hover:text-[#3EE6C1] transition-colors" aria-label="Quitar orden">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button type="button" onClick={limpiarTodosFiltros} className="text-sm text-muted-foreground hover:text-[#e94446] underline ml-2 transition-colors">
                Limpiar todo
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] max-w-md">
              <Input
                placeholder="Buscar owners..."
                value={filters.q}
                onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                className="w-full focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
              />
            </div>
            <Select value={filters.sector} onValueChange={(v) => setFilters((prev) => ({ ...prev, sector: v }))}>
              <SelectTrigger className="w-36 overflow-hidden dark:bg-[#1E1E1E] dark:hover:bg-[#2a2a2a] dark:border-[#1E1E1E] dark:text-foreground">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                <SelectItem value="ALL" className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">Sector</SelectItem>
                {uniqueSectores.map((s) => (
                  <SelectItem key={s} value={s} className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.interes} onValueChange={(v) => setFilters((prev) => ({ ...prev, interes: v }))}>
              <SelectTrigger className="w-36 overflow-hidden dark:bg-[#1E1E1E] dark:hover:bg-[#2a2a2a] dark:border-[#1E1E1E] dark:text-foreground">
                <SelectValue placeholder="Interés" />
              </SelectTrigger>
              <SelectContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                <SelectItem value="ALL" className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">Interés</SelectItem>
                {uniqueIntereses.map((i) => (
                  <SelectItem key={i} value={i} className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.origen} onValueChange={(v) => setFilters((prev) => ({ ...prev, origen: v }))}>
              <SelectTrigger className="w-36 overflow-hidden dark:bg-[#1E1E1E] dark:hover:bg-[#2a2a2a] dark:border-[#1E1E1E] dark:text-foreground">
                <SelectValue placeholder="Origen" />
              </SelectTrigger>
              <SelectContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                <SelectItem value="ALL" className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">Origen</SelectItem>
                {uniqueOrigenes.map((o) => (
                  <SelectItem key={o} value={o} className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button variant="outline" size="sm" asChild>
              <Link prefetch={false} href="/panel/owners/leads/papelera">
                <Trash className="w-4 h-4 mr-2" />
                Papelera
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={exportAllCsv}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Link prefetch={false} href="/panel/owners/nuevo">
              <Button className="bg-[#e94446] hover:bg-[#D7514C] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            </Link>
          </div>
        </div>

        <Card className="dark:bg-[#141414]">
          <CardHeader>
            <CardTitle>Owners ({computedPagination.total})</CardTitle>
            <CardDescription>Lista unificada de owners y leads.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <BulkActionsOwners
              selectedCount={selectedIds.length}
              onBulkRelationChange={bulkRelationChange}
              onBulkOrigenChange={bulkOrigenChange}
              onBulkExportSelection={bulkExportSelection}
              onBulkPapelera={bulkPapelera}
              onBulkDelete={bulkDelete}
              uniqueOrigenes={uniqueOrigenes}
            />
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : displayContacts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay registros con los filtros aplicados.
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
                      />
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={handleSortNombre}
                        className="flex items-center gap-1 font-medium hover:text-foreground"
                      >
                        Nombre
                        <ArrowUpDown className="w-3 h-3 opacity-70" />
                      </button>
                    </TableHead>
                    <TableHead>Web</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-center w-[1%] whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayContacts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="w-10">
                        <Checkbox
                          checked={!!selected[c.id]}
                          onCheckedChange={(v) =>
                            setSelected((prev) => ({ ...prev, [c.id]: Boolean(v) }))
                          }
                          aria-label={`Seleccionar ${c.displayName}`}
                          className="data-[state=checked]:!bg-[#e94446] data-[state=checked]:!border-[#e94446] data-[state=checked]:!text-white"
                        />
                      </TableCell>
                      <TableCell className="max-w-[24ch]">
                        <div className="flex items-center gap-2">
                          {c.kind === "COMPANY" ? (
                            <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <User className="w-4 h-4 shrink-0 text-muted-foreground" />
                          )}
                          <TableCellTruncate value={c.displayName} maxCh={20} />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[20ch]">
                        {c.website ? (
                          <a
                            href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#e94446] hover:text-[#d63d3f] truncate block max-w-full"
                            title={c.website}
                          >
                            <TableCellTruncate value={c.website} maxCh={22} />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[22ch]">
                        <TableCellTruncate value={c.email} />
                      </TableCell>
                      <TableCell className="max-w-[14ch]">
                        <TableCellTruncate value={c.phone} />
                      </TableCell>
                      <TableCell className="max-w-[18ch]">
                        <TableCellTruncate value={c.city} />
                      </TableCell>
                      <TableCell className="max-w-[12ch]">
                        <TableCellTruncate value={c.sector ?? "—"} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link prefetch={false} href={`/panel/owners/${c.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Editar"
                              className="border-[#404040] text-[#D1D1D1] hover:bg-[#1E1E1E] hover:text-[#FFFFFF]"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open("/panel/crm", "_blank")}
                            title="Enviar a pipeline"
                            className="border-[#404040] text-[#D1D1D1] hover:bg-[#1E1E1E] hover:text-[#FFFFFF]"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePapelera(c.id)}
                            title="Papelera"
                            className="border-[#404040] text-[#D1D1D1] hover:bg-[#1E1E1E] hover:text-[#FFFFFF]"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(c.id)}
                            title="Eliminar"
                            className="border-red-600 text-red-600 hover:bg-red-600/10 hover:border-red-600 hover:text-red-600"
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

        {computedPagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={!computedPagination.hasPrev}
              onClick={() => {
                if (sortColumn) setCurrentPage((p) => p - 1);
                else fetchContacts(computedPagination.page - 1);
              }}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Página {computedPagination.page} de {computedPagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!computedPagination.hasNext}
              onClick={() => {
                if (sortColumn) setCurrentPage((p) => p + 1);
                else fetchContacts(computedPagination.page + 1);
              }}
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

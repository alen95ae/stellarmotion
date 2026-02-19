"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, User, Plus, Edit, Trash2, FileSpreadsheet, Trash, Send, ArrowUpDown, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import BulkActionsBrands from "@/components/brands/BulkActionsBrands";

const TOOLTIP_CONTENT_CLASS = "bg-[#e94446] text-white border-0";

const STORAGE_KEY = "brands_filtros";

function firstOfList(s: string | number | undefined | null): string {
  if (s == null && s !== 0) return "";
  const str = String(s).trim();
  if (!str) return "";
  const parts = str.split(",").map((p) => p.trim()).filter(Boolean);
  return parts[0] ?? "";
}

function csvEsc(s: unknown): string {
  const str = s == null ? "" : String(s);
  return `"${str.replace(/"/g, '""')}"`;
}

const CSV_HEADERS = [
  "Nombre",
  "Razón social",
  "Tipo",
  "NIF",
  "Email",
  "Teléfono",
  "Web",
  "Dirección",
  "Ciudad",
  "Código postal",
  "País",
  "Sector",
  "Interés",
  "Origen",
  "Notas",
  "Categorías",
  "Personas de contacto",
  "Latitud",
  "Longitud",
  "Relación",
];

function contactToCsvRow(c: Contact): string[] {
  const personaStr =
    Array.isArray(c.persona_contacto) && c.persona_contacto.length
      ? c.persona_contacto.map((p) => `${p.nombre || ""} (${p.email || ""})`).join("; ")
      : "";
  return [
    c.displayName ?? c.nombre ?? "",
    c.razonSocial ?? "",
    c.kind ?? "",
    c.nif ?? "",
    c.email ?? "",
    c.phone ?? c.telefono ?? "",
    c.website ?? "",
    c.address ?? "",
    c.city ?? "",
    c.postalCode ?? "",
    c.country ?? "",
    c.sector ?? "",
    c.interes ?? "",
    c.origen ?? "",
    c.notes ?? "",
    Array.isArray(c.categories) ? c.categories.join(", ") : "",
    personaStr,
    c.latitud != null ? String(c.latitud) : "",
    c.longitud != null ? String(c.longitud) : "",
    RELATION_LABELS[c.relation] ?? c.relation ?? "",
  ];
}

interface Contact {
  id: string;
  displayName: string;
  legalName?: string;
  nombre?: string;
  razonSocial?: string;
  nif?: string;
  phone?: string;
  telefono?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  roles?: string[];
  relation: string;
  sector?: string;
  status: string;
  kind?: string;
  origen?: string;
  interes?: string;
  website?: string;
  notes?: string;
  persona_contacto?: { nombre: string; email?: string }[];
  categories?: string[];
  latitud?: number | null;
  longitud?: number | null;
}

const RELATION_LABELS: Record<string, string> = {
  CUSTOMER: "Cliente",
  SUPPLIER: "Proveedor",
  BRAND: "Brand",
  OWNER: "Owner",
  MAKER: "Maker",
};

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

  const [editedContacts, setEditedContacts] = useState<Record<string, Partial<Contact>>>({});
  const [savingChanges, setSavingChanges] = useState(false);

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
      params.set("relation", "BRAND");
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
      toast.error("Error al cargar brands");
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
          fetch("/api/contactos/unique-values?field=origen&relation=BRAND").then((r) => r.json()),
          fetch("/api/contactos/unique-values?field=sector&relation=BRAND").then((r) => r.json()),
          fetch("/api/contactos/unique-values?field=interes&relation=BRAND").then((r) => r.json()),
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
    if (!confirm("¿Eliminar este brand?")) return;
    try {
      const res = await fetch(`/api/contactos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Brand eliminado");
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

  const handleFieldChange = (contactId: string, field: keyof Contact, value: string) => {
    setEditedContacts((prev) => ({
      ...prev,
      [contactId]: {
        ...prev[contactId],
        [field]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(editedContacts).length === 0) return;
    setSavingChanges(true);
    try {
      const count = Object.keys(editedContacts).length;
      const promises = Object.entries(editedContacts).map(async ([id, changes]) => {
        return fetch(`/api/contactos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        });
      });
      await Promise.all(promises);
      setEditedContacts({});
      setSelected({});
      fetchContacts(1);
      toast.success(`${count} brand(s) actualizado(s)`);
    } catch {
      toast.error("Error al guardar cambios");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleDiscardChanges = () => {
    setEditedContacts({});
    toast.info("Cambios descartados");
  };

  function bulkExportSelection() {
    const rows = displayContacts.filter((c) => selected[c.id]);
    if (rows.length === 0) {
      toast.error("Selecciona al menos un brand");
      return;
    }
    const headerLine = CSV_HEADERS.join(",");
    const dataLines = rows.map((c) =>
      contactToCsvRow(c).map((v) => csvEsc(v)).join(",")
    );
    const csvContent = [headerLine, ...dataLines].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brands-seleccion-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV descargado");
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Eliminar ${selectedIds.length} brand(s)?`)) return;
    let ok = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/contactos/${id}`, { method: "DELETE" });
        if (res.ok) ok++;
      } catch {
        // continue
      }
    }
    toast.success(`${ok} brand(s) eliminado(s)`);
    setSelected({});
    fetchContacts(1);
  }

  async function bulkRelationChange(relation: string) {
    if (selectedIds.length === 0) return;
    const roleLower = relation.toLowerCase();
    let ok = 0;
    const updatedMap: Record<string, string[]> = {};
    for (const id of selectedIds) {
      const contact = displayContacts.find((c) => c.id === id) ?? allContactsForSort.find((c) => c.id === id);
      if (!contact) continue;
      const currentRoles = (contact.roles ?? []).map((r) => r.toLowerCase());
      const hasRole = currentRoles.includes(roleLower);
      const newRoles = hasRole
        ? currentRoles.filter((r) => r !== roleLower)
        : [...currentRoles, roleLower];
      if (newRoles.length === 0) continue;
      try {
        const res = await fetch(`/api/contactos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roles: newRoles }),
        });
        if (res.ok) {
          ok++;
          updatedMap[id] = newRoles;
        }
      } catch {
        // continue
      }
    }
    if (ok > 0) {
      toast.success(`${ok} registro(s) actualizado(s)`);
      setSelected({});
      fetchContacts(computedPagination.page);
    }
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

  async function exportAllCsv() {
    try {
      const toExport: Contact[] = [];
      let page = 1;
      const limit = 500;
      let hasMore = true;
      while (hasMore) {
        const res = await fetch(
          `/api/contactos?relation=BRAND&page=${page}&limit=${limit}`
        );
        if (!res.ok) throw new Error("Error al cargar");
        const data = await res.json();
        const chunk = (data.data || []) as Contact[];
        toExport.push(...chunk);
        hasMore = chunk.length === limit;
        page += 1;
      }
      if (toExport.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }
      const headerLine = CSV_HEADERS.join(",");
      const dataLines = toExport.map((c) =>
        contactToCsvRow(c).map((v) => csvEsc(v)).join(",")
      );
      const csvContent = [headerLine, ...dataLines].join("\r\n");
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brands-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`CSV descargado (${toExport.length} registros)`);
    } catch {
      toast.error("Error al exportar CSV");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Brands</h1>
          <p className="text-muted-foreground">
            Gestiona brands.
          </p>
        </div>

        <div className="bg-card dark:bg-[#141414] border border-border rounded-lg p-4 mb-6 shadow-sm">
          {(filters.q || filters.sector !== "ALL" || filters.interes !== "ALL" || filters.origen !== "ALL" || sortColumn) && (
            <div className="flex flex-wrap gap-2 items-center mb-4 pb-4 border-b border-border dark:border-[#1E1E1E]">
              {filters.q && (
                <div className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded-full px-3 py-1.5 text-sm text-blue-800 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 dark:border-blue-700/40 dark:text-blue-200">
                  <span className="font-medium">Búsqueda:</span>
                  <span className="text-blue-700 dark:text-blue-100">{filters.q}</span>
                  <button type="button" onClick={() => eliminarFiltro("q")} className="ml-0.5 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-[#3EE6C1] transition-colors" aria-label="Quitar filtro">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {filters.sector !== "ALL" && (
                <div className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 rounded-full px-3 py-1.5 text-sm text-emerald-800 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/40 dark:border-emerald-600/40 dark:text-emerald-200">
                  <span className="font-medium">Sector:</span>
                  <span className="text-emerald-700 dark:text-emerald-100">{filters.sector}</span>
                  <button type="button" onClick={() => eliminarFiltro("sector")} className="ml-0.5 text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-[#3EE6C1] transition-colors" aria-label="Quitar sector">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {filters.interes !== "ALL" && (
                <div className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded-full px-3 py-1.5 text-sm text-purple-800 dark:bg-purple-900/40 dark:hover:bg-purple-800/40 dark:border-purple-600/40 dark:text-purple-200">
                  <span className="font-medium">Interés:</span>
                  <span className="text-purple-700 dark:text-purple-100">{filters.interes}</span>
                  <button type="button" onClick={() => eliminarFiltro("interes")} className="ml-0.5 text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-[#3EE6C1] transition-colors" aria-label="Quitar interés">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {filters.origen !== "ALL" && (
                <div className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 border border-amber-200 rounded-full px-3 py-1.5 text-sm text-amber-800 dark:bg-amber-900/40 dark:hover:bg-amber-800/40 dark:border-amber-600/40 dark:text-amber-200">
                  <span className="font-medium">Origen:</span>
                  <span className="text-amber-700 dark:text-amber-100">{filters.origen}</span>
                  <button type="button" onClick={() => eliminarFiltro("origen")} className="ml-0.5 text-amber-600 hover:text-amber-800 dark:text-amber-300 dark:hover:text-[#3EE6C1] transition-colors" aria-label="Quitar origen">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {sortColumn && (
                <div className="flex items-center gap-1 bg-cyan-100 hover:bg-cyan-200 border border-cyan-200 rounded-full px-3 py-1.5 text-sm text-cyan-800 dark:bg-cyan-900/40 dark:hover:bg-cyan-800/40 dark:border-cyan-600/40 dark:text-cyan-200">
                  <span className="font-medium">Orden:</span>
                  <span className="text-cyan-700 dark:text-cyan-100">Nombre ({sortDirection === "asc" ? "A-Z" : "Z-A"})</span>
                  <button type="button" onClick={() => eliminarFiltro("sort")} className="ml-0.5 text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-[#3EE6C1] transition-colors" aria-label="Quitar orden">
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
                placeholder="Buscar brands..."
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
            <Button variant="outline" size="sm" asChild className="border-border text-foreground hover:bg-muted hover:text-foreground dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]">
              <Link prefetch={false} href="/panel/brands/leads/papelera">
                <Trash className="w-4 h-4 mr-2" />
                Papelera
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllCsv}
              className="border-border text-foreground hover:bg-muted hover:text-foreground dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Link prefetch={false} href="/panel/brands/nuevo">
              <Button className="bg-[#e94446] hover:bg-[#D7514C] text-white shadow-[0_0_12px_rgba(233,68,70,0.45)] hover:shadow-[0_0_20px_rgba(233,68,70,0.6)] dark:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </Button>
            </Link>
          </div>
        </div>

        <Card className="dark:bg-[#141414]">
          <CardHeader>
            <CardTitle>Brands ({computedPagination.total})</CardTitle>
            <CardDescription>Lista de brands.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <BulkActionsBrands
              selectedCount={selectedIds.length}
              relationsInSelection={[...new Set(displayContacts.filter((c) => selected[c.id]).flatMap((c) => (c.roles ?? []).map((r) => r.toUpperCase())).filter(Boolean))]}
              onBulkRelationChange={bulkRelationChange}
              onBulkExportSelection={bulkExportSelection}
              onBulkPapelera={bulkPapelera}
              onBulkDelete={bulkDelete}
              editedCount={Object.keys(editedContacts).length}
              onSaveChanges={handleSaveChanges}
              onDiscardChanges={handleDiscardChanges}
              savingChanges={savingChanges}
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
                        <ArrowUpDown className={`w-3 h-3 ${sortColumn === "nombre" ? "text-[#e94446]" : "opacity-70"}`} />
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
                  {displayContacts.map((c) => {
                    const isSelected = !!selected[c.id];
                    const edited = editedContacts[c.id];
                    return (
                    <TableRow key={c.id}>
                      <TableCell className="w-10">
                        <Checkbox
                          checked={isSelected}
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
                          {isSelected ? (
                            <Input
                              value={edited?.displayName ?? c.displayName}
                              onChange={(e) => handleFieldChange(c.id, "displayName", e.target.value)}
                              className="h-8 text-sm flex-1 min-w-0"
                            />
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate">{c.displayName || "—"}</span>
                              </TooltipTrigger>
                              <TooltipContent className={TOOLTIP_CONTENT_CLASS} hideArrow>
                                {c.displayName || "—"}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[20ch]">
                        {isSelected ? (
                          <Input
                            value={edited?.website ?? c.website ?? ""}
                            onChange={(e) => handleFieldChange(c.id, "website", e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (() => {
                          const web = c.website?.trim();
                          const href = web && !/^https?:\/\//i.test(web) ? `https://${web}` : web;
                          const isUrl = href && /^https?:\/\//i.test(href);
                          return isUrl ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#e94446] hover:underline truncate block"
                                >
                                  {web}
                                </a>
                              </TooltipTrigger>
                              <TooltipContent className={TOOLTIP_CONTENT_CLASS} hideArrow>
                                {web || "—"}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate block">{web || "—"}</span>
                              </TooltipTrigger>
                              <TooltipContent className={TOOLTIP_CONTENT_CLASS} hideArrow>
                                {web || "—"}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="max-w-[22ch]">
                        {isSelected ? (
                          <Input
                            value={firstOfList(edited?.email ?? c.email)}
                            onChange={(e) => handleFieldChange(c.id, "email", e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block">{firstOfList(c.email) || "—"}</span>
                            </TooltipTrigger>
                            <TooltipContent className={TOOLTIP_CONTENT_CLASS} hideArrow>
                              {c.email ?? "—"}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[14ch]">
                        {isSelected ? (
                          <Input
                            value={firstOfList(edited?.phone ?? c.phone ?? c.telefono)}
                            onChange={(e) => handleFieldChange(c.id, "phone", e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block">{firstOfList(c.phone ?? c.telefono) || "—"}</span>
                            </TooltipTrigger>
                            <TooltipContent className={TOOLTIP_CONTENT_CLASS} hideArrow>
                              {c.phone ?? c.telefono ?? "—"}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[18ch]">
                        {isSelected ? (
                          <Input
                            value={edited?.city ?? c.city ?? ""}
                            onChange={(e) => handleFieldChange(c.id, "city", e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block">{c.city || "—"}</span>
                            </TooltipTrigger>
                            <TooltipContent className={TOOLTIP_CONTENT_CLASS} hideArrow>
                              {c.city || "—"}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[12ch]">
                        {isSelected ? (
                          <Input
                            value={edited?.sector ?? c.sector ?? ""}
                            onChange={(e) => handleFieldChange(c.id, "sector", e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block">{c.sector || "—"}</span>
                            </TooltipTrigger>
                            <TooltipContent className={TOOLTIP_CONTENT_CLASS} hideArrow>
                              {c.sector || "—"}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link prefetch={false} href={`/panel/brands/${c.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Editar"
                              className="border-border text-foreground hover:bg-muted dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open("/panel/crm", "_blank")}
                            title="Enviar a pipeline"
                            className="border-border text-foreground hover:bg-muted dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePapelera(c.id)}
                            title="Papelera"
                            className="border-border text-foreground hover:bg-muted dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(c.id)}
                            title="Eliminar"
                            className="border-border text-red-600 hover:bg-red-600/10 hover:text-red-600 dark:border-red-600 dark:text-red-600 dark:hover:bg-red-600/10 dark:hover:border-red-600 dark:hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {computedPagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <nav
              className="flex items-center justify-center gap-1 sm:gap-2 px-4 py-3"
              aria-label="Paginación"
            >
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-md bg-background border-border shadow-sm text-[#e94446] hover:text-[#e94446] hover:bg-muted/80 dark:bg-[#141414] dark:border-[#2a2a2a] dark:hover:bg-[#2a2a2a]"
                disabled={!computedPagination.hasPrev}
                onClick={() => {
                  if (sortColumn) setCurrentPage(1);
                  else fetchContacts(1);
                }}
                aria-label="Primera página"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-md bg-background border-border shadow-sm text-[#e94446] hover:text-[#e94446] hover:bg-muted/80 dark:bg-[#141414] dark:border-[#2a2a2a] dark:hover:bg-[#2a2a2a]"
                disabled={!computedPagination.hasPrev}
                onClick={() => {
                  if (sortColumn) setCurrentPage((p) => p - 1);
                  else fetchContacts(computedPagination.page - 1);
                }}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 mx-1 min-w-[120px] justify-center flex-wrap">
                {(() => {
                  const total = computedPagination.totalPages;
                  const current = computedPagination.page;
                  const items: (number | "ellipsis")[] = [];
                  const add = (p: number) => {
                    if (p >= 1 && p <= total) items.push(p);
                  };
                  add(1);
                  if (current > 3) items.push("ellipsis");
                  for (let p = Math.max(2, current - 2); p <= Math.min(total - 1, current + 2); p++) add(p);
                  if (current < total - 2) items.push("ellipsis");
                  if (total > 1) add(total);
                  return items.map((x, i) =>
                    x === "ellipsis" ? (
                      <span key={`e-${i}`} className="px-1.5 text-foreground">
                        ...
                      </span>
                    ) : (
                      <button
                        key={x}
                        type="button"
                        onClick={() => {
                          if (sortColumn) setCurrentPage(x);
                          else fetchContacts(x);
                        }}
                        className={`min-w-[32px] h-9 px-2 rounded-md text-sm font-medium transition-colors ${
                          x === current
                            ? "bg-[#e94446] text-white hover:bg-[#D7514C]"
                            : "text-foreground hover:bg-muted/80 dark:hover:bg-[#2a2a2a]"
                        }`}
                      >
                        {x}
                      </button>
                    )
                  );
                })()}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-md bg-background border-border shadow-sm text-[#e94446] hover:text-[#e94446] hover:bg-muted/80 dark:bg-[#141414] dark:border-[#2a2a2a] dark:hover:bg-[#2a2a2a]"
                disabled={!computedPagination.hasNext}
                onClick={() => {
                  if (sortColumn) setCurrentPage((p) => p + 1);
                  else fetchContacts(computedPagination.page + 1);
                }}
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-md bg-background border-border shadow-sm text-[#e94446] hover:text-[#e94446] hover:bg-muted/80 dark:bg-[#141414] dark:border-[#2a2a2a] dark:hover:bg-[#2a2a2a]"
                disabled={!computedPagination.hasNext}
                onClick={() => {
                  if (sortColumn) setCurrentPage(computedPagination.totalPages);
                  else fetchContacts(computedPagination.totalPages);
                }}
                aria-label="Última página"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}

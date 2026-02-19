"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, MapPin, Building2, User, X, Check, Rat, Rabbit, Squirrel } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { buildGoogleMapsLinkFromCoords } from "@/lib/extract-google-maps-coords";
import GoogleMapsLoader from "@/components/GoogleMapsLoader";
import type { PersonaContactoItem } from "@/lib/contactos-unified";

const EditableGoogleMap = dynamic(() => import("@/components/EditableGoogleMap"), { ssr: false });

const DEFAULT_MAP_CENTER = { lat: 40.4168, lng: -3.7038 };
const MAP_HEIGHT = 320;

type FormState = {
  kind: "INDIVIDUAL" | "COMPANY";
  roles: string[];
  nombre: string;
  empresa: string;
  nif: string;
  razonSocial: string;
  persona_contacto: PersonaContactoItem[];
  emails: string[];
  phone: string;
  website: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  sector: string;
  categorias: string[];
  interes: string;
  origen: string;
  notes: string;
  googleMapsLink: string;
  latitud: number | null;
  longitud: number | null;
};

const emptyForm: FormState = {
  kind: "INDIVIDUAL",
  roles: ["maker"],
  nombre: "",
  empresa: "",
  nif: "",
  razonSocial: "",
  persona_contacto: [],
  emails: [],
  phone: "",
  website: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  sector: "",
  categorias: [],
  interes: "",
  origen: "",
  notes: "",
  googleMapsLink: "",
  latitud: null,
  longitud: null,
};

export default function EditMakerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mapCoordsLoading, setMapCoordsLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uniqueSectores, setUniqueSectores] = useState<string[]>([]);
  const [uniqueIntereses, setUniqueIntereses] = useState<string[]>([]);
  const [uniqueOrigenes, setUniqueOrigenes] = useState<string[]>([]);
  const [personaInputValue, setPersonaInputValue] = useState("");
  const [personaSuggestions, setPersonaSuggestions] = useState<{ id: string; displayName: string; email?: string }[]>([]);
  const [personaSuggestionsOpen, setPersonaSuggestionsOpen] = useState(false);
  const [personaSuggestionsLoading, setPersonaSuggestionsLoading] = useState(false);
  const personaInputRef = useRef<HTMLInputElement>(null);
  const personaWrapperRef = useRef<HTMLDivElement>(null);
  const personaSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [emailInputValue, setEmailInputValue] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [categoriasInputValue, setCategoriasInputValue] = useState("");
  const categoriasInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/contactos/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Maker no encontrado");
            router.replace("/panel/makers");
            return;
          }
          throw new Error("Error al cargar");
        }
        const data = await res.json();
        const rawEmail = data.email ?? "";
        const emails = Array.isArray(rawEmail)
          ? rawEmail.filter((e: string) => typeof e === "string" && e.trim()).map((e: string) => e.trim())
          : typeof rawEmail === "string" && rawEmail.trim()
            ? rawEmail.split(",").map((e: string) => e.trim()).filter(Boolean)
            : [];
        const rawPersonas = Array.isArray(data.persona_contacto) ? data.persona_contacto : [];
        const kind = data.kind === "COMPANY" ? "COMPANY" : "INDIVIDUAL";
        const persona_contacto = rawPersonas.filter((p: PersonaContactoItem) => p?.nombre?.trim());
        const notesStr = data.notes ?? "";
        const empresaMatch = notesStr.match(/^Empresa:\s*(.+?)(?:\n|$)/);
        const empresa = kind === "INDIVIDUAL" && empresaMatch ? empresaMatch[1].trim() : "";
        const notesWithoutEmpresa = empresaMatch ? notesStr.replace(/^Empresa:\s*.+?(?:\n|$)/, "").trim() : notesStr;
        setForm({
          kind,
          roles: Array.isArray(data.roles) && data.roles.length > 0 ? data.roles.map((r: string) => r.toLowerCase()) : ["maker"],
          nombre: data.nombre ?? data.displayName ?? "",
          empresa: kind === "INDIVIDUAL" ? empresa : "",
          nif: data.nif ?? "",
          razonSocial: data.razonSocial ?? data.displayName ?? "",
          persona_contacto,
          emails: emails,
          phone: Array.isArray(data.phone) ? (data.phone[0] ?? "") : (data.phone ?? ""),
          website: data.website ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          postalCode: data.postalCode ?? "",
          country: data.country ?? "",
          sector: data.sector ?? "",
          categorias: Array.isArray(data.categories) ? data.categories : [],
          interes: data.interes ?? "",
          origen: data.origen ?? "",
          notes: notesWithoutEmpresa,
          googleMapsLink:
            data.latitud != null && data.longitud != null
              ? buildGoogleMapsLinkFromCoords(data.latitud, data.longitud)
              : "",
          latitud: data.latitud ?? null,
          longitud: data.longitud ?? null,
        });
      } catch {
        toast.error("Error al cargar el maker");
        router.replace("/panel/makers");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  useEffect(() => {
    (async () => {
      try {
        const [s, i, o] = await Promise.all([
          fetch("/api/contactos/unique-values?field=sector").then((r) => r.json()),
          fetch("/api/contactos/unique-values?field=interes").then((r) => r.json()),
          fetch("/api/contactos/unique-values?field=origen").then((r) => r.json()),
        ]);
        setUniqueSectores(Array.isArray(s) ? s : []);
        setUniqueIntereses(Array.isArray(i) ? i : []);
        setUniqueOrigenes(Array.isArray(o) ? o : []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const removeEmail = (index: number) =>
    setForm((p) => ({ ...p, emails: p.emails.filter((_, i) => i !== index) }));
  const handleEmailInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = emailInputValue.trim();
      if (!trimmed) return;
      setForm((p) => ({ ...p, emails: [...p.emails.filter(Boolean), trimmed] }));
      setEmailInputValue("");
    }
  };
  const removeCategoria = (index: number) =>
    setForm((p) => ({ ...p, categorias: p.categorias.filter((_, i) => i !== index) }));
  const handleCategoriasInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = categoriasInputValue.trim();
      if (!trimmed) return;
      setForm((p) => ({ ...p, categorias: [...p.categorias, trimmed] }));
      setCategoriasInputValue("");
    }
  };

  const addPersonaFromInput = useCallback(() => {
    const trimmed = personaInputValue.trim();
    if (!trimmed) return;
    setForm((p) => ({ ...p, persona_contacto: [...p.persona_contacto, { nombre: trimmed, email: "" }] }));
    setPersonaInputValue("");
    setPersonaSuggestionsOpen(false);
  }, [personaInputValue]);

  const addPersonaFromSuggestion = useCallback((contact: { id: string; displayName: string; email?: string }) => {
    const alreadyAdded = form.persona_contacto.some((p) => p.nombre === contact.displayName);
    if (alreadyAdded) return;
    setForm((p) => ({
      ...p,
      persona_contacto: [...p.persona_contacto, { nombre: contact.displayName, email: contact.email ?? "" }],
    }));
    setPersonaInputValue("");
    setPersonaSuggestionsOpen(false);
    setPersonaSuggestions([]);
    personaInputRef.current?.focus();
  }, [form.persona_contacto]);

  const fetchPersonaSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setPersonaSuggestions([]);
      setPersonaSuggestionsOpen(false);
      return;
    }
    setPersonaSuggestionsLoading(true);
    setPersonaSuggestionsOpen(true);
    try {
      const res = await fetch(`/api/contactos?q=${encodeURIComponent(query.trim())}&limit=10&page=1`);
      if (!res.ok) return;
      const json = await res.json();
      const data = (json.data || []) as { id: string; displayName: string; email?: string }[];
      const filtered = data.filter((c) => c.id !== id && !form.persona_contacto.some((p) => p.nombre === c.displayName));
      setPersonaSuggestions(filtered);
      setPersonaSuggestionsOpen(filtered.length > 0);
    } catch {
      setPersonaSuggestions([]);
    } finally {
      setPersonaSuggestionsLoading(false);
    }
  }, [id, form.persona_contacto]);

  useEffect(() => {
    if (personaSearchTimeoutRef.current) clearTimeout(personaSearchTimeoutRef.current);
    if (!personaInputValue.trim()) {
      setPersonaSuggestions([]);
      setPersonaSuggestionsOpen(false);
      return;
    }
    personaSearchTimeoutRef.current = setTimeout(() => {
      fetchPersonaSuggestions(personaInputValue);
    }, 300);
    return () => {
      if (personaSearchTimeoutRef.current) clearTimeout(personaSearchTimeoutRef.current);
    };
  }, [personaInputValue, fetchPersonaSuggestions]);

  const handlePersonaInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (personaSuggestionsOpen && personaSuggestions.length > 0) {
        addPersonaFromSuggestion(personaSuggestions[0]);
      } else {
        addPersonaFromInput();
      }
    }
    if (e.key === "Escape") {
      setPersonaSuggestionsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (personaWrapperRef.current && !personaWrapperRef.current.contains(ev.target as Node)) {
        setPersonaSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const removePersona = (index: number) =>
    setForm((p) => ({ ...p, persona_contacto: p.persona_contacto.filter((_, i) => i !== index) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const emailStr = form.emails.filter(Boolean).join(",");
      const empresaNote = form.kind === "INDIVIDUAL" && form.empresa.trim() ? "Empresa: " + form.empresa.trim() + "\n" : "";
      const payload = {
        roles: form.roles,
        nombre: form.nombre.trim() || undefined,
        razonSocial: form.razonSocial.trim() || undefined,
        displayName: (form.nombre.trim() || form.razonSocial.trim() || "") || undefined,
        kind: form.kind,
        nif: form.nif.trim() || undefined,
        persona_contacto:
          form.kind === "COMPANY"
            ? form.persona_contacto.filter((p) => p.nombre.trim() || p.email?.trim())
            : undefined,
        email: emailStr || undefined,
        notes: empresaNote + (form.notes || "").trim(),
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        country: form.country.trim() || undefined,
        sector: form.sector.trim() || undefined,
        categories: form.categorias.length ? form.categorias : undefined,
        interes: form.interes.trim() || undefined,
        origen: form.origen.trim() || undefined,
        latitud: form.latitud,
        longitud: form.longitud,
      };
      const res = await fetch(`/api/contactos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar");
      toast.success("Maker actualizado");
      setSaved(true);
      setTimeout(() => router.push("/panel/makers"), 1200);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">Editar maker</h1>
          <p className="text-muted-foreground text-sm mt-1">Modifica la información del contacto.</p>
        </div>
          <div className="mb-6 flex justify-end gap-2">
            <Link prefetch={false} href="/panel/makers">
              <Button
                type="button"
                variant="outline"
                className="border-border text-foreground hover:bg-muted hover:text-foreground dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
              >
                Descartar
              </Button>
            </Link>
            <Button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={saving}
              className={`bg-[#e94446] hover:bg-[#D7514C] text-white shadow-[0_0_12px_rgba(233,68,70,0.45)] hover:shadow-[0_0_20px_rgba(233,68,70,0.6)] dark:text-white transition-all duration-300 ${saved ? "scale-105" : ""}`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Guardado
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </>
              )}
            </Button>
          </div>
          <form id="owner-form" ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <Card className="dark:bg-[#141414] dark:border-[#1E1E1E]">
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
                <CardDescription>Nombre, tipo y datos fiscales.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={form.nombre}
                      onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                      required
                      placeholder="Nombre"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={form.kind}
                      onValueChange={(v: "INDIVIDUAL" | "COMPANY") =>
                        setForm((p) => ({
                          ...p,
                          kind: v,
                          persona_contacto: v === "COMPANY" && p.persona_contacto.length === 0 ? [{ nombre: "", email: "" }] : p.persona_contacto,
                        }))
                      }
                    >
                      <SelectTrigger className="overflow-hidden dark:bg-[#1E1E1E] dark:hover:bg-[#2a2a2a] dark:border-[#1E1E1E] dark:text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                        <SelectItem value="INDIVIDUAL" className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4" /> Individual
                          </span>
                        </SelectItem>
                        <SelectItem value="COMPANY" className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">
                          <span className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Empresa
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="shrink-0">Relación</Label>
                  <div className="flex items-center gap-1">
                    {([["brand", "Brands", Rat], ["owner", "Owners", Rabbit], ["maker", "Makers", Squirrel]] as const).map(([role, label, Icon]) => {
                      const active = form.roles.includes(role);
                      return (
                        <Button
                          key={role}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setForm((p) => {
                            const next = active ? p.roles.filter((r) => r !== role) : [...p.roles, role];
                            return { ...p, roles: next.length > 0 ? next : p.roles };
                          })}
                          className={active ? "bg-[#e94446] text-white border-[#e94446] hover:bg-[#D7514C] dark:bg-[#e94446] dark:border-[#e94446] dark:hover:bg-[#D7514C] dark:text-white" : "dark:border-[#2a2a2a] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {form.kind === "COMPANY" ? (
                  <div className="w-full">
                    <Label>Persona de contacto</Label>
                    <p className="text-xs text-muted-foreground mb-2">Busca en contactos o escribe un nombre y pulsa Intro.</p>
                    <div ref={personaWrapperRef} className="relative w-full">
                      <div
                        className="flex flex-wrap items-center gap-2 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                        onClick={() => personaInputRef.current?.focus()}
                      >
                        {form.persona_contacto.map((p, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 gap-1 font-normal shrink-0 bg-secondary text-secondary-foreground dark:bg-gray-700 dark:text-gray-200"
                          >
                            {p.nombre}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePersona(i);
                              }}
                              className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                              aria-label="Eliminar"
                            >
                              <span className="sr-only">Eliminar</span>
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                        <input
                          ref={personaInputRef}
                          type="text"
                          placeholder={form.persona_contacto.length === 0 ? "Buscar o escribir nombre..." : ""}
                          value={personaInputValue}
                          onChange={(e) => setPersonaInputValue(e.target.value)}
                          onKeyDown={handlePersonaInputKeyDown}
                          onFocus={() => personaInputValue.trim() && personaSuggestions.length > 0 && setPersonaSuggestionsOpen(true)}
                          className="flex-1 min-w-[180px] border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      {personaSuggestionsOpen && (personaSuggestions.length > 0 || personaSuggestionsLoading) && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-md">
                          {personaSuggestionsLoading ? (
                            <div className="px-3 py-4 text-center text-sm text-muted-foreground">Buscando...</div>
                          ) : (
                            personaSuggestions.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex flex-col gap-0.5"
                                onClick={() => addPersonaFromSuggestion(c)}
                              >
                                <span className="font-medium">{c.displayName}</span>
                                {c.email && <span className="text-xs text-muted-foreground">{c.email}</span>}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={form.empresa}
                      onChange={(e) => setForm((p) => ({ ...p, empresa: e.target.value }))}
                      placeholder="Empresa"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nif">NIF/CIF</Label>
                    <Input
                      id="nif"
                      value={form.nif}
                      onChange={(e) => setForm((p) => ({ ...p, nif: e.target.value }))}
                      placeholder="NIF o CIF"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="razonSocial">Razón social</Label>
                    <Input
                      id="razonSocial"
                      value={form.razonSocial}
                      onChange={(e) => setForm((p) => ({ ...p, razonSocial: e.target.value }))}
                      placeholder="Razón social"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Notas internas"
                    rows={3}
                    className="resize-none focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Clasificación */}
            <Card className="dark:bg-[#141414] dark:border-[#1E1E1E]">
              <CardHeader>
                <CardTitle>Clasificación</CardTitle>
                <CardDescription>Sector, categorías, interés y origen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={form.sector}
                      onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
                      placeholder="Sector"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interes">Interés</Label>
                    <Input
                      id="interes"
                      value={form.interes}
                      onChange={(e) => setForm((p) => ({ ...p, interes: e.target.value }))}
                      placeholder="Interés"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="origen">Origen</Label>
                    <Input
                      id="origen"
                      value={form.origen}
                      onChange={(e) => setForm((p) => ({ ...p, origen: e.target.value }))}
                      placeholder="Origen"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                </div>
                <div>
                  <Label>Categorías</Label>
                  <p className="text-xs text-muted-foreground mb-2">Escribe una categoría y pulsa Intro para añadirla.</p>
                  <div
                    className="flex flex-wrap items-center gap-2 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                    onClick={() => categoriasInputRef.current?.focus()}
                  >
                    {form.categorias.map((cat, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 gap-1 font-normal shrink-0 bg-secondary text-secondary-foreground dark:bg-gray-700 dark:text-gray-200"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCategoria(idx);
                          }}
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                          aria-label="Eliminar"
                        >
                          <span className="sr-only">Eliminar</span>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      ref={categoriasInputRef}
                      type="text"
                      placeholder={form.categorias.length === 0 ? "Ej. Cliente, Proveedor..." : ""}
                      value={categoriasInputValue}
                      onChange={(e) => setCategoriasInputValue(e.target.value)}
                      onKeyDown={handleCategoriasInputKeyDown}
                      className="flex-1 min-w-[180px] border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de contacto + Dirección en dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                  <CardDescription>Teléfono, email y sitio web.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Teléfono"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-xs text-muted-foreground mb-2">Escribe un email y pulsa Intro para añadirlo.</p>
                    <div
                      className="flex flex-wrap items-center gap-2 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                      onClick={() => emailInputRef.current?.focus()}
                    >
                      {form.emails
                        .map((email, idx) => ({ email, idx }))
                        .filter(({ email }) => email)
                        .map(({ email, idx }) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 gap-1 font-normal shrink-0 bg-secondary text-secondary-foreground dark:bg-gray-700 dark:text-gray-200"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEmail(idx);
                              }}
                              className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                              aria-label="Eliminar"
                            >
                              <span className="sr-only">Eliminar</span>
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      <input
                        ref={emailInputRef}
                        type="email"
                        placeholder={form.emails.filter(Boolean).length === 0 ? "email@ejemplo.com" : ""}
                        value={emailInputValue}
                        onChange={(e) => setEmailInputValue(e.target.value)}
                        onKeyDown={handleEmailInputKeyDown}
                        className="flex-1 min-w-[180px] border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Sitio web</Label>
                    <Input
                      id="website"
                      type="text"
                      value={form.website}
                      onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                      placeholder="Ej. www.ejemplo.com"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                <CardHeader>
                  <CardTitle>Dirección</CardTitle>
                  <CardDescription>Dirección, ciudad, país y código postal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Calle, número"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Ciudad" className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50" />
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input id="country" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="País" className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50" />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Código postal</Label>
                    <Input id="postalCode" value={form.postalCode} onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))} placeholder="Código postal" className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ubicación y mapa */}
            <Card className="w-full max-w-[50%] dark:bg-[#141414] dark:border-[#1E1E1E]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Ubicación
                </CardTitle>
                <CardDescription>Coordenadas y mapa con chincheta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitud">Latitud</Label>
                    <Input
                      id="latitud"
                      type="text"
                      inputMode="decimal"
                      value={form.latitud != null ? String(form.latitud) : ""}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        const n = v === "" ? null : parseFloat(v);
                        setForm((p) => ({ ...p, latitud: v === "" ? null : Number.isNaN(n) ? p.latitud : n }));
                      }}
                      placeholder="Ej. 40.4168"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitud">Longitud</Label>
                    <Input
                      id="longitud"
                      type="text"
                      inputMode="decimal"
                      value={form.longitud != null ? String(form.longitud) : ""}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        const n = v === "" ? null : parseFloat(v);
                        setForm((p) => ({ ...p, longitud: v === "" ? null : Number.isNaN(n) ? p.longitud : n }));
                      }}
                      placeholder="Ej. -3.7038"
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Mapa</Label>
                  <div className="w-full rounded-lg border border-border overflow-hidden" style={{ height: MAP_HEIGHT }}>
                    {mapCoordsLoading ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground bg-muted">Cargando...</div>
                    ) : (
                      <GoogleMapsLoader loadingElement={<div className="h-full bg-muted flex items-center justify-center text-muted-foreground">Cargando mapa...</div>}>
                        <EditableGoogleMap
                          lat={form.latitud ?? DEFAULT_MAP_CENTER.lat}
                          lng={form.longitud ?? DEFAULT_MAP_CENTER.lng}
                          height={MAP_HEIGHT}
                          onChange={(c) =>
                            setForm((p) => ({
                              ...p,
                              latitud: c.lat,
                              longitud: c.lng,
                            }))
                          }
                        />
                      </GoogleMapsLoader>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Arrastra la chincheta o haz clic en el mapa para fijar la ubicación.
                  </p>
                </div>
              </CardContent>
            </Card>
          </form>
        </main>
    </div>
  );
}

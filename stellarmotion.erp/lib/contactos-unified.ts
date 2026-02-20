/**
 * Tabla unificada public.contactos.
 * Roles de negocio: lead, owner, brand, maker. Email: jsonb array.
 * - Leads: roles = ['lead']; getLeads/getLeadsPapelera filtran por rol 'lead'.
 * - Owners/contactos: roles = ['owner']|['brand']|['maker']; getContactos filtra por rol.
 * Si la columna roles es un enum, debe incluir 'lead'. Datos antiguos creados como leads
 * con solo rol 'owner' pueden requerir un backfill (añadir 'lead' a roles) para verse en la lista de leads.
 */
import { supabaseAdmin } from "./supabase-admin";

/** Normaliza texto para búsqueda: quita acentos, ñ→n, ç→c, minúsculas. */
function normalizeSearchForQuery(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ñ/g, "n")
    .replace(/ç/g, "c")
    .trim();
}

/** Escapa un término para usarlo en una expresión .or() de Supabase (evita inyección y errores de sintaxis). */
function escapeIlikeTerm(term: string): string {
  return term.replace(/'/g, "''").trim();
}

/**
 * Columnas de texto sobre las que se permite búsqueda (telefono es JSONB, no usar ilike).
 * Para mejor rendimiento a escala: añadir columna tsvector en la tabla y usar .textSearch()
 * o índice GIN sobre expresión to_tsvector(nombre || ' ' || razon_social || ' ' || coalesce(nif, '')).
 */
const SEARCH_TEXT_COLUMNS = ["nombre", "razon_social", "nif"] as const;

/** Construye la cláusula OR para filtro de búsqueda por texto (ilike). Una sola vez por término. */
function buildSearchOrClause(term: string, columns: readonly string[] = SEARCH_TEXT_COLUMNS): string {
  const esc = escapeIlikeTerm(term);
  if (!esc) return "";
  return columns.map((col) => `${col}.ilike.%${esc}%`).join(",");
}

/** Aplica filtro de búsqueda por texto a la query. Si searchTerm está vacío, no modifica la query. */
function applySearchFilter<T extends { or: (clause: string) => T }>(
  q: T,
  searchTerm: string,
  columns: readonly string[] = SEARCH_TEXT_COLUMNS
): T {
  const t = searchTerm.trim().replace(/,/g, " ");
  if (!t) return q;
  const tNorm = normalizeSearchForQuery(t);
  const terms = tNorm && tNorm !== t ? [t, tNorm] : [t];
  const orClauses = terms.map((term) => buildSearchOrClause(term, columns)).filter(Boolean);
  if (orClauses.length === 0) return q;
  return q.or(orClauses.join(","));
}

export type SourceEnum = "scraping" | "manual" | "web" | "import" | "other";

/**
 * Estructura de una fila en public.contactos (tipado estricto para respuestas Supabase).
 * lifecycle_status es opcional; no existe en el esquema actual pero se reserva para futuras migraciones.
 */
export interface ContactoCrm {
  id: string;
  user_id: string | null;
  roles: string[];
  origen: string | null;
  tipo_entidad: string | null;
  nombre: string | null;
  apellidos: string | null;
  razon_social: string;
  nif: string | null;
  email: unknown;
  telefono: string | null;
  sitio_web: string | null;
  idioma: string | null;
  direccion: string | null;
  ciudad: string | null;
  codigo_postal: string | null;
  pais: string | null;
  latitud: number | null;
  longitud: number | null;
  sector: string | null;
  interes: string | null;
  categories: unknown;
  persona_contacto: unknown;
  notas: string | null;
  comercial_asignado_id: string | null;
  empresa_id: string | null;
  representante_legal: string | null;
  puesto: string | null;
  tiene_permisos: boolean | null;
  permite_instalacion: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  lifecycle_status?: string | null;
}

/** Alias para compatibilidad; preferir ContactoCrm. */
export type ContactoRow = ContactoCrm;

/** Type guard: comprueba que el valor tiene la forma mínima de una fila contacto. */
export function isContactoRow(raw: unknown): raw is ContactoCrm {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.razon_social === "string" &&
    Array.isArray(r.roles)
  );
}

/** Parsea y valida una fila devuelta por Supabase; devuelve null si no es válida. */
export function parseContactoRow(raw: unknown): ContactoCrm | null {
  if (!isContactoRow(raw)) return null;
  return raw;
}

export interface PersonaContactoItem {
  nombre: string;
  email?: string;
}

export interface ContactoFormato {
  id: string;
  displayName: string;
  nombre?: string;
  razonSocial?: string;
  legalName?: string;
  nif?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  roles?: string[];
  relation: string;
  status: string;
  notes?: string;
  salesOwnerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  kind?: string;
  sector?: string;
  website?: string;
  origen?: string;
  interes?: string;
  persona_contacto?: PersonaContactoItem[];
  categories?: string[];
  latitud?: number | null;
  longitud?: number | null;
}

export interface LeadFormato {
  id: string;
  nombre: string;
  email?: string[];
  telefono?: string;
  ciudad?: string;
  calle?: string;
  postal_code?: string;
  pais?: string;
  web?: string;
  latitud?: number;
  longitud?: number;
  sector?: string;
  categories?: string[];
  interes?: string;
  origen?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Datos unificados para crear/actualizar en public.contactos (lead u owner/contacto).
 * Campos opcionales según el uso; el tipo 'lead' | 'owner' determina roles y mapeo.
 */
export type CrmEntityData = Partial<
  ContactoFormato &
    Pick<LeadFormato, "nombre" | "email" | "telefono" | "ciudad" | "calle" | "postal_code" | "pais" | "web" | "latitud" | "longitud" | "sector" | "categories" | "interes" | "origen">
> & { id?: string };

/* ── helpers para email jsonb ── */

function emailFromJsonb(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const list = raw.filter((e): e is string => typeof e === "string" && e.trim() !== "");
    return list.length > 0 ? list.join(", ") : undefined;
  }
  if (typeof raw === "string") return raw.trim() || undefined;
  return undefined;
}

function emailArrayFromJsonb(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((e): e is string => typeof e === "string" && e.trim() !== "").map((e) => e.trim());
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.includes(",") ? raw.split(",").map((e) => e.trim()).filter(Boolean) : [raw.trim()];
  }
  return [];
}

function emailToJsonb(email: string | undefined | null): unknown {
  if (!email) return [];
  const trimmed = email.trim();
  if (!trimmed) return [];
  return trimmed.includes(",")
    ? trimmed.split(",").map((e) => e.trim()).filter(Boolean)
    : [trimmed];
}

/** Siempre devuelve array JSONB para columna telefono (nunca string ni null). */
function phoneToJsonb(phone: string | undefined | null): string[] {
  if (!phone || !String(phone).trim()) return [];
  return [String(phone).trim()];
}

/* ── helpers para persona_contacto y categories ── */

function parsePersonaContacto(v: unknown): PersonaContactoItem[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .filter((x): x is Record<string, unknown> => x != null && typeof x === "object" && "nombre" in x)
      .map((x) => ({
        nombre: String(x.nombre ?? "").trim(),
        email: x.email != null ? String(x.email).trim() : undefined,
      }))
      .filter((x) => x.nombre);
  }
  if (typeof v === "object" && v !== null && "nombre" in (v as object)) {
    const o = v as { nombre: string; email?: string };
    return [{ nombre: String(o.nombre ?? "").trim(), email: o.email != null ? String(o.email).trim() : undefined }];
  }
  return [];
}

function parseCategories(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((c): c is string => typeof c === "string");
  return [];
}

/* ── row → formato (solo recibir ContactoCrm ya validado con parseContactoRow/isContactoRow) ── */

function rowToContacto(r: ContactoCrm): ContactoFormato {
  const email = emailFromJsonb(r.email);
  const personaContacto = parsePersonaContacto(r.persona_contacto);
  const categories = parseCategories(r.categories);
  const displayName = r.nombre ?? r.razon_social ?? "";
  const roles = Array.isArray(r.roles) ? r.roles : [];
  const relation = roles.includes("owner") ? "OWNER" : roles.includes("brand") ? "BRAND" : roles.includes("maker") ? "MAKER" : "CUSTOMER";
  return {
    id: r.id,
    displayName: displayName || "",
    nombre: r.nombre ?? undefined,
    razonSocial: r.razon_social ?? undefined,
    legalName: r.razon_social ?? undefined,
    nif: r.nif ?? undefined,
    phone: Array.isArray(r.telefono) ? (r.telefono[0] ?? undefined) : (r.telefono ?? undefined),
    email,
    address: r.direccion ?? undefined,
    city: r.ciudad ?? undefined,
    postalCode: r.codigo_postal ?? undefined,
    country: r.pais ?? undefined,
    roles,
    relation,
    status: "active",
    notes: r.notas ?? undefined,
    salesOwnerId: r.comercial_asignado_id ?? undefined,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
    kind: (r.tipo_entidad === "persona" ? "INDIVIDUAL" : "COMPANY") as string,
    sector: r.sector ?? undefined,
    website: r.sitio_web ?? undefined,
    origen: r.origen ?? undefined,
    interes: r.interes ?? undefined,
    persona_contacto: personaContacto.length ? personaContacto : undefined,
    categories: categories.length ? categories : undefined,
    latitud: r.latitud ?? undefined,
    longitud: r.longitud ?? undefined,
  };
}

function rowToLead(r: ContactoCrm): LeadFormato {
  const emailArr = emailArrayFromJsonb(r.email);
  const categories = parseCategories(r.categories);
  return {
    id: r.id,
    nombre: r.nombre ?? r.razon_social ?? "",
    email: emailArr.length ? emailArr : undefined,
    telefono: r.telefono ?? undefined,
    ciudad: r.ciudad ?? undefined,
    calle: r.direccion ?? undefined,
    postal_code: r.codigo_postal ?? undefined,
    pais: r.pais ?? undefined,
    web: r.sitio_web ?? undefined,
    latitud: r.latitud ?? undefined,
    longitud: r.longitud ?? undefined,
    sector: r.sector ?? undefined,
    categories: categories.length ? categories : undefined,
    interes: r.interes ?? undefined,
    origen: r.origen ?? undefined,
    created_at: r.created_at ?? undefined,
    updated_at: r.updated_at ?? undefined,
    deleted_at: r.deleted_at ?? undefined,
  };
}

/* ── queries ── */

/** Listar contactos por rol: OWNER / BRAND / MAKER. */
export async function getContactos(filters: {
  q?: string;
  relation?: string;
  kind?: string;
  origen?: string;
  sector?: string;
  interes?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ContactoFormato[]; total: number }> {
  try {
    const isBrand = filters.relation === "BRAND";
    const isMaker = filters.relation === "MAKER";
    const base = supabaseAdmin
      .from("contactos")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("razon_social", { ascending: true });

    let q = isBrand
      ? base.contains("roles", ["brand"])
      : isMaker
        ? base.contains("roles", ["maker"])
        : base.contains("roles", ["owner"]);

    q = applySearchFilter(q, filters.q ?? "");
    if (filters.kind === "INDIVIDUAL") {
      q = q.eq("tipo_entidad", "persona");
    } else if (filters.kind === "COMPANY") {
      q = q.eq("tipo_entidad", "empresa");
    }
    if (filters.origen?.trim() && filters.origen !== "ALL") {
      q = q.eq("origen", filters.origen.trim());
    }
    if (filters.sector?.trim() && filters.sector !== "ALL") {
      q = q.eq("sector", filters.sector.trim());
    }
    if (filters.interes?.trim() && filters.interes !== "ALL") {
      q = q.eq("interes", filters.interes.trim());
    }

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 500);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    q = q.range(from, to);

    const { data, error, count } = await q;
    if (error) {
      console.error("getContactos error:", JSON.stringify(error));
      return { data: [], total: 0 };
    }
    const rows = (data || []).filter(isContactoRow);
    return { data: rows.map(rowToContacto), total: count ?? rows.length };
  } catch (e) {
    console.error("getContactos:", e);
    return { data: [], total: 0 };
  }
}

/** Listar leads: filas con rol 'lead' en public.contactos. (Registros antiguos con solo 'owner' pueden requerir backfill de roles.) */
export async function getLeads(filters: {
  q?: string;
  sector?: string;
  interes?: string;
  origen?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}): Promise<{ data: LeadFormato[]; total: number }> {
  try {
    let q = supabaseAdmin
      .from("contactos")
      .select("*", { count: "exact" })
      .contains("roles", ["lead"])
      .order("created_at", { ascending: false });

    if (!filters.includeDeleted) {
      q = q.is("deleted_at", null);
    }

    q = applySearchFilter(q, filters.q ?? "", ["nombre", "razon_social", "nif", "sector"]);
    if (filters.sector?.trim() && filters.sector !== "ALL") {
      q = q.eq("sector", filters.sector.trim());
    }
    if (filters.origen?.trim() && filters.origen !== "ALL") {
      q = q.eq("origen", filters.origen.trim());
    }

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 500);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    q = q.range(from, to);

    const { data, error, count } = await q;
    if (error) {
      console.error("getLeads error:", JSON.stringify(error));
      return { data: [], total: 0 };
    }
    const rows = (data || []).filter(isContactoRow);
    return { data: rows.map(rowToLead), total: count ?? rows.length };
  } catch (e) {
    console.error("getLeads:", e);
    return { data: [], total: 0 };
  }
}

export async function getContactoById(id: string): Promise<ContactoFormato | null> {
  const { data, error } = await supabaseAdmin
    .from("contactos")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  const row = parseContactoRow(data);
  return row ? rowToContacto(row) : null;
}

export async function getLeadById(id: string): Promise<LeadFormato | null> {
  const { data, error } = await supabaseAdmin.from("contactos").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  const row = parseContactoRow(data);
  return row ? rowToLead(row) : null;
}

/** Construye el objeto insert para public.contactos según tipo CRM (lead vs owner). */
function buildInsertFromCrm(data: CrmEntityData, tipo: "lead" | "owner"): Record<string, unknown> {
  if (tipo === "lead") {
    const emailArr = Array.isArray(data.email) ? (data.email as string[]).filter(Boolean) : (data.email as string) ? [String(data.email).trim()] : [];
    const nombre = (data.nombre ?? "").toString().trim();
    return {
      roles: ["lead"],
      origen: (data.origen as string)?.trim() || "manual",
      tipo_entidad: "empresa",
      nombre: nombre || null,
      razon_social: nombre || "Sin nombre",
      email: emailArr.length > 0 ? emailArr : [],
      telefono: phoneToJsonb(data.telefono ?? data.phone),
      direccion: (data.calle ?? data.address)?.trim() || null,
      ciudad: (data.ciudad ?? data.city)?.trim() || null,
      codigo_postal: (data.postal_code ?? data.postalCode)?.trim() || null,
      pais: (data.pais ?? data.country)?.trim() || null,
      sitio_web: (data.web ?? data.website)?.trim() || null,
      sector: data.sector?.trim() || null,
      interes: data.interes?.trim() || null,
      categories: Array.isArray(data.categories) ? data.categories : [],
      latitud: data.latitud ?? null,
      longitud: data.longitud ?? null,
    };
  }
  const roles =
    Array.isArray(data.roles) && data.roles.length > 0
      ? data.roles.map((r) => String(r).toLowerCase())
      : data.relation === "BRAND"
        ? ["brand"]
        : data.relation === "MAKER"
          ? ["maker"]
          : ["owner"];
  return {
    roles,
    origen: data.origen?.trim() || "manual",
    tipo_entidad: data.kind === "INDIVIDUAL" ? "persona" : "empresa",
    nombre: data.nombre?.trim() || data.displayName?.trim() || null,
    razon_social: data.razonSocial?.trim() || data.displayName?.trim() || "Sin nombre",
    nif: data.nif?.trim() || null,
    email: emailToJsonb(data.email as string | undefined),
    telefono: phoneToJsonb(data.phone),
    direccion: data.address?.trim() || null,
    ciudad: data.city?.trim() || null,
    codigo_postal: data.postalCode?.trim() || null,
    pais: data.country?.trim() || null,
    sitio_web: data.website?.trim() || null,
    notas: data.notes?.trim() || null,
    comercial_asignado_id: data.salesOwnerId || null,
    sector: data.sector?.trim() || null,
    interes: data.interes?.trim() || null,
    latitud: data.latitud ?? null,
    longitud: data.longitud ?? null,
    categories: Array.isArray(data.categories) ? data.categories : [],
    persona_contacto:
      Array.isArray(data.persona_contacto) && data.persona_contacto.length
        ? data.persona_contacto.filter((p) => p?.nombre?.trim()).map((p) => ({ nombre: p.nombre.trim(), email: p.email?.trim() || null }))
        : null,
  };
}

/**
 * Crear fila en public.contactos de forma unificada (lead u owner/contacto).
 * - tipo 'lead': roles = ['lead'], mapeo desde campos estilo LeadFormato.
 * - tipo 'owner': roles desde payload (owner/brand/maker), mapeo desde ContactoFormato.
 */
export async function crearContactoCrm(
  data: CrmEntityData,
  tipo: "lead" | "owner"
): Promise<ContactoFormato | LeadFormato | null> {
  const insert = buildInsertFromCrm(data, tipo);
  if (tipo === "owner") {
    console.log("crearContactoCrm(owner) insert payload:", JSON.stringify({ ...insert, email: insert.email, telefono: insert.telefono }));
  }
  const { data: row, error } = await supabaseAdmin.from("contactos").insert(insert).select().single();
  if (tipo === "owner") {
    console.log("crearContactoCrm(owner) resultado:", { hasData: !!row, error: error ? JSON.stringify(error) : null });
  }
  if (error) {
    console.error("crearContactoCrm:", tipo, JSON.stringify(error));
    return null;
  }
  if (!row) return null;
  const parsed = parseContactoRow(row);
  return parsed ? (tipo === "lead" ? rowToLead(parsed) : rowToContacto(parsed)) : null;
}

/** Crear contacto (owner/brand/maker). Delega en crearContactoCrm con tipo 'owner'. */
export async function createContacto(payload: Partial<ContactoFormato>): Promise<ContactoFormato | null> {
  const result = await crearContactoCrm(payload as CrmEntityData, "owner");
  return result as ContactoFormato | null;
}

/** Crear lead. Delega en crearContactoCrm con tipo 'lead'. */
export async function createLead(payload: Partial<LeadFormato>): Promise<LeadFormato | null> {
  const result = await crearContactoCrm(payload as CrmEntityData, "lead");
  return result as LeadFormato | null;
}

/** Construye el objeto update para public.contactos según tipo CRM. */
function buildUpdateFromCrm(data: CrmEntityData, tipo: "lead" | "owner"): Record<string, unknown> {
  const up: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (tipo === "lead") {
    if (data.nombre !== undefined) {
      up.nombre = data.nombre.trim();
      up.razon_social = data.nombre.trim();
    }
    if (data.email !== undefined) {
      const emailArr = Array.isArray(data.email) ? (data.email as string[]).filter(Boolean) : [];
      up.email = emailArr.length > 0 ? emailArr : [];
    }
    if (data.telefono !== undefined) up.telefono = phoneToJsonb(data.telefono);
    if (data.ciudad !== undefined) up.ciudad = data.ciudad?.trim() || null;
    if (data.calle !== undefined) up.direccion = data.calle?.trim() || null;
    if (data.postal_code !== undefined) up.codigo_postal = data.postal_code?.trim() || null;
    if (data.pais !== undefined) up.pais = data.pais?.trim() || null;
    if (data.web !== undefined) up.sitio_web = data.web?.trim() || null;
    if (data.sector !== undefined) up.sector = data.sector?.trim() || null;
    if (data.interes !== undefined) up.interes = data.interes?.trim() || null;
    if (data.origen !== undefined) up.origen = data.origen?.trim() || null;
    if (data.categories !== undefined) up.categories = Array.isArray(data.categories) ? data.categories : [];
    if (data.latitud !== undefined) up.latitud = data.latitud;
    if (data.longitud !== undefined) up.longitud = data.longitud;
    return up;
  }
  if (data.kind !== undefined) up.tipo_entidad = data.kind === "INDIVIDUAL" ? "persona" : "empresa";
  if (data.nombre !== undefined) up.nombre = data.nombre?.trim() || null;
  if (data.razonSocial !== undefined) up.razon_social = data.razonSocial?.trim() || null;
  if (data.displayName !== undefined && data.razonSocial === undefined) up.razon_social = (data.displayName as string).trim();
  if (data.nif !== undefined) up.nif = data.nif?.trim() || null;
  if (data.phone !== undefined) up.telefono = phoneToJsonb(data.phone as string);
  if (data.email !== undefined) up.email = emailToJsonb(data.email as string);
  if (data.address !== undefined) up.direccion = data.address?.trim() || null;
  if (data.city !== undefined) up.ciudad = data.city?.trim() || null;
  if (data.postalCode !== undefined) up.codigo_postal = data.postalCode?.trim() || null;
  if (data.country !== undefined) up.pais = data.country?.trim() || null;
  if (data.website !== undefined) up.sitio_web = data.website?.trim() || null;
  if (data.notes !== undefined) up.notas = data.notes?.trim() || null;
  if (data.salesOwnerId !== undefined) up.comercial_asignado_id = data.salesOwnerId || null;
  if (data.sector !== undefined) up.sector = data.sector?.trim() || null;
  if (data.origen !== undefined) up.origen = data.origen?.trim() || null;
  if (data.interes !== undefined) up.interes = data.interes?.trim() || null;
  if (data.persona_contacto !== undefined) {
    up.persona_contacto = Array.isArray(data.persona_contacto)
      ? data.persona_contacto.filter((p) => p?.nombre?.trim()).map((p) => ({ nombre: p.nombre.trim(), email: p.email?.trim() || null }))
      : null;
  }
  if (data.categories !== undefined) up.categories = Array.isArray(data.categories) ? data.categories : [];
  if (data.latitud !== undefined) up.latitud = data.latitud;
  if (data.longitud !== undefined) up.longitud = data.longitud;
  if (Array.isArray(data.roles)) up.roles = data.roles;
  return up;
}

/**
 * Actualizar fila en public.contactos de forma unificada (lead u owner/contacto).
 */
export async function actualizarContactoCrm(
  id: string,
  data: CrmEntityData,
  tipo: "lead" | "owner"
): Promise<ContactoFormato | LeadFormato | null> {
  const up = buildUpdateFromCrm(data, tipo);
  const { data: row, error } = await supabaseAdmin.from("contactos").update(up).eq("id", id).select().single();
  if (error || !row) return null;
  const parsed = parseContactoRow(row);
  return parsed ? (tipo === "lead" ? rowToLead(parsed) : rowToContacto(parsed)) : null;
}

/** Actualizar contacto (owner/brand/maker). Delega en actualizarContactoCrm con tipo 'owner'. */
export async function updateContacto(id: string, payload: Partial<ContactoFormato>): Promise<ContactoFormato | null> {
  const result = await actualizarContactoCrm(id, payload as CrmEntityData, "owner");
  return result as ContactoFormato | null;
}

/** Actualizar lead. Delega en actualizarContactoCrm con tipo 'lead'. */
export async function updateLead(id: string, payload: Partial<LeadFormato>): Promise<LeadFormato | null> {
  const result = await actualizarContactoCrm(id, payload as CrmEntityData, "lead");
  return result as LeadFormato | null;
}

export async function deleteContacto(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("contactos").delete().eq("id", id);
  return !error;
}

export async function softDeleteLead(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("contactos").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  return !error;
}

export async function restoreLead(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("contactos").update({ deleted_at: null }).eq("id", id);
  return !error;
}

/** Convertir contacto: asegurar que tiene rol owner. */
export async function convertLeadToContacto(id: string): Promise<ContactoFormato | null> {
  const { data: row } = await supabaseAdmin.from("contactos").select("roles").eq("id", id).maybeSingle();
  if (!row) return null;
  const rowObj = row as Record<string, unknown>;
  const currentRoles = Array.isArray(rowObj.roles) ? (rowObj.roles as string[]) : [];
  const newRoles = Array.from(new Set([...currentRoles, "owner"]));
  const { data, error } = await supabaseAdmin
    .from("contactos")
    .update({
      roles: newRoles,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  const parsed = parseContactoRow(data);
  return parsed ? rowToContacto(parsed) : null;
}

/** Añadir rol owner a un contacto existente. */
export async function promoteLeadToOwner(contactId: string): Promise<boolean> {
  const { data: row, error: fetchError } = await supabaseAdmin
    .from("contactos")
    .select("roles")
    .eq("id", contactId)
    .maybeSingle();
  if (fetchError || !row) return false;
  const currentRoles = (row as { roles: string[] | null }).roles ?? [];
  const newRoles = Array.from(new Set([...currentRoles, "owner"]));
  const { error: updateError } = await supabaseAdmin
    .from("contactos")
    .update({
      roles: newRoles,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contactId);
  return !updateError;
}

/** Listar leads soft-deleted (papelera); solo filas con rol 'lead'. */
export async function getLeadsPapelera(filters: {
  q?: string;
  relation?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: LeadFormato[]; total: number }> {
  try {
    let q = supabaseAdmin
      .from("contactos")
      .select("*", { count: "exact" })
      .contains("roles", ["lead"])
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    const role = filters.relation === "BRAND" ? "brand" : filters.relation === "MAKER" ? "maker" : filters.relation === "OWNER" ? "owner" : null;
    if (role) {
      q = q.contains("roles", [role]);
    }

    q = applySearchFilter(q, filters.q ?? "");

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 500);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    q = q.range(from, to);

    const { data, error, count } = await q;
    if (error) {
      console.error("getLeadsPapelera error:", JSON.stringify(error));
      return { data: [], total: 0 };
    }
    const rows = (data || []).filter(isContactoRow);
    return { data: rows.map(rowToLead), total: count ?? rows.length };
  } catch (e) {
    console.error("getLeadsPapelera:", e);
    return { data: [], total: 0 };
  }
}

/** Valores únicos para filtros de leads (solo filas con rol 'lead', no eliminados). */
export async function getLeadsUniqueValues(field: "sector" | "interes" | "origen"): Promise<string[]> {
  const col = field === "origen" ? "origen" : field;
  const { data, error } = await supabaseAdmin
    .from("contactos")
    .select(col)
    .contains("roles", ["lead"])
    .is("deleted_at", null)
    .not(col, "is", null);
  if (error) return [];
  const set = new Set<string>();
  for (const r of data || []) {
    const row = r as Record<string, unknown>;
    const v = row[col];
    if (v != null && typeof v === "string") set.add(v.trim());
  }
  return Array.from(set).sort();
}

/** Valores únicos filtrados por rol (OWNER / BRAND / MAKER). */
export async function getContactosUniqueValues(
  field: "origen" | "sector" | "interes",
  relation?: string
): Promise<string[]> {
  const base = supabaseAdmin
    .from("contactos")
    .select(field)
    .is("deleted_at", null)
    .not(field, "is", null);

  const role = relation === "BRAND" ? "brand" : relation === "MAKER" ? "maker" : "owner";
  const q = base.contains("roles", [role]);

  const { data, error } = await q;
  if (error) return [];
  const set = new Set<string>();
  for (const r of data || []) {
    const row = r as Record<string, unknown>;
    const v = row[field];
    if (v != null && typeof v === "string") set.add(v.trim());
  }
  return Array.from(set).sort();
}

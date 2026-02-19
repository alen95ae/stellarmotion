/**
 * Tabla unificada public.contactos.
 * Roles de negocio: owner, brand, maker (contacto_rol_enum[]).
 * Email: jsonb array (e.g. ["email@example.com"]).
 * No existe lifecycle_status en el esquema actual.
 */
import { supabaseAdmin } from "./supabase-admin";

export type SourceEnum = "scraping" | "manual" | "web" | "import" | "other";

export interface ContactoRow {
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
      .filter((x) => x && typeof x === "object" && "nombre" in x)
      .map((x) => ({
        nombre: String((x as any).nombre ?? "").trim(),
        email: (x as any).email != null ? String((x as any).email).trim() : undefined,
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

/* ── row → formato ── */

function rowToContacto(r: ContactoRow): ContactoFormato {
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

function rowToLead(r: ContactoRow): LeadFormato {
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

    if (filters.q?.trim()) {
      const t = filters.q.trim().replace(/,/g, " ");
      q = q.or(`nombre.ilike.%${t}%,razon_social.ilike.%${t}%,telefono.ilike.%${t}%,nif.ilike.%${t}%`);
    }
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
    const rows = (data || []) as ContactoRow[];
    return { data: rows.map(rowToContacto), total: count ?? rows.length };
  } catch (e) {
    console.error("getContactos:", e);
    return { data: [], total: 0 };
  }
}

/** Listar contactos generales (sin filtro de rol). Usado por APIs legacy de leads. */
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
      .order("created_at", { ascending: false });

    if (!filters.includeDeleted) {
      q = q.is("deleted_at", null);
    }

    if (filters.q?.trim()) {
      const t = filters.q.trim().replace(/,/g, " ");
      q = q.or(`nombre.ilike.%${t}%,razon_social.ilike.%${t}%,telefono.ilike.%${t}%,sector.ilike.%${t}%`);
    }
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
    const rows = (data || []) as ContactoRow[];
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
  return rowToContacto(data as ContactoRow);
}

export async function getLeadById(id: string): Promise<LeadFormato | null> {
  const { data, error } = await supabaseAdmin.from("contactos").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return rowToLead(data as ContactoRow);
}

/** Crear contacto. relation → rol: OWNER→owner, BRAND→brand, MAKER→maker. Default: owner. */
export async function createContacto(payload: Partial<ContactoFormato>): Promise<ContactoFormato | null> {
  const roles = Array.isArray(payload.roles) && payload.roles.length > 0
    ? payload.roles.map((r) => r.toLowerCase())
    : payload.relation === "BRAND" ? ["brand"] : payload.relation === "MAKER" ? ["maker"] : ["owner"];
  const insert: Record<string, unknown> = {
    roles,
    origen: payload.origen?.trim() || "manual",
    tipo_entidad: payload.kind === "INDIVIDUAL" ? "persona" : "empresa",
    nombre: payload.nombre?.trim() || payload.displayName?.trim() || null,
    razon_social: payload.razonSocial?.trim() || payload.displayName?.trim() || "Sin nombre",
    nif: payload.nif?.trim() || null,
    email: emailToJsonb(payload.email),
    telefono: phoneToJsonb(payload.phone),
    direccion: payload.address?.trim() || null,
    ciudad: payload.city?.trim() || null,
    codigo_postal: payload.postalCode?.trim() || null,
    pais: payload.country?.trim() || null,
    sitio_web: payload.website?.trim() || null,
    notas: payload.notes?.trim() || null,
    comercial_asignado_id: payload.salesOwnerId || null,
    sector: payload.sector?.trim() || null,
    interes: payload.interes?.trim() || null,
    latitud: payload.latitud ?? null,
    longitud: payload.longitud ?? null,
    categories: Array.isArray(payload.categories) ? payload.categories : [],
    persona_contacto: Array.isArray(payload.persona_contacto) && payload.persona_contacto.length
      ? payload.persona_contacto.filter((p) => p?.nombre?.trim()).map((p) => ({ nombre: p.nombre.trim(), email: p.email?.trim() || null }))
      : null,
  };
  console.log("createContacto insert payload:", JSON.stringify({ ...insert, email: insert.email, telefono: insert.telefono }));
  const { data, error } = await supabaseAdmin.from("contactos").insert(insert).select().single();
  console.log("createContacto resultado insert:", { hasData: !!data, error: error ? JSON.stringify(error) : null });
  if (error) {
    console.error("createContacto:", JSON.stringify(error));
    return null;
  }
  if (!data) {
    console.error("createContacto: insert ok pero data vacío");
    return null;
  }
  return rowToContacto(data as ContactoRow);
}

/** Crear contacto con formato lead (usado por /api/leads POST). Crea con rol owner por defecto. */
export async function createLead(payload: Partial<LeadFormato>): Promise<LeadFormato | null> {
  const emailArr = Array.isArray(payload.email) ? payload.email.filter(Boolean) : payload.email ? [payload.email] : [];
  const insert: Record<string, unknown> = {
    roles: ["owner"],
    origen: (payload.origen as string) || "manual",
    tipo_entidad: "empresa",
    nombre: payload.nombre?.trim() || null,
    razon_social: payload.nombre?.trim() || "Sin nombre",
    email: emailArr.length > 0 ? emailArr : [],
    telefono: phoneToJsonb(payload.telefono),
    direccion: payload.calle?.trim() || null,
    ciudad: payload.ciudad?.trim() || null,
    codigo_postal: payload.postal_code?.trim() || null,
    pais: payload.pais?.trim() || null,
    sitio_web: payload.web?.trim() || null,
    sector: payload.sector?.trim() || null,
    interes: payload.interes?.trim() || null,
    categories: Array.isArray(payload.categories) ? payload.categories : [],
    latitud: payload.latitud ?? null,
    longitud: payload.longitud ?? null,
  };
  const { data, error } = await supabaseAdmin.from("contactos").insert(insert).select().single();
  if (error) {
    console.error("createLead:", JSON.stringify(error));
    return null;
  }
  return rowToLead(data as ContactoRow);
}

export async function updateContacto(id: string, payload: Partial<ContactoFormato>): Promise<ContactoFormato | null> {
  const up: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.kind !== undefined) up.tipo_entidad = payload.kind === "INDIVIDUAL" ? "persona" : "empresa";
  if (payload.nombre !== undefined) up.nombre = payload.nombre?.trim() || null;
  if (payload.razonSocial !== undefined) up.razon_social = payload.razonSocial?.trim() || null;
  if (payload.displayName !== undefined && payload.razonSocial === undefined) up.razon_social = payload.displayName.trim();
  if (payload.nif !== undefined) up.nif = payload.nif?.trim() || null;
  if (payload.phone !== undefined) up.telefono = phoneToJsonb(payload.phone);
  if (payload.email !== undefined) up.email = emailToJsonb(payload.email);
  if (payload.address !== undefined) up.direccion = payload.address?.trim() || null;
  if (payload.city !== undefined) up.ciudad = payload.city?.trim() || null;
  if (payload.postalCode !== undefined) up.codigo_postal = payload.postalCode?.trim() || null;
  if (payload.country !== undefined) up.pais = payload.country?.trim() || null;
  if (payload.website !== undefined) up.sitio_web = payload.website?.trim() || null;
  if (payload.notes !== undefined) up.notas = payload.notes?.trim() || null;
  if (payload.salesOwnerId !== undefined) up.comercial_asignado_id = payload.salesOwnerId || null;
  if (payload.sector !== undefined) up.sector = payload.sector?.trim() || null;
  if (payload.origen !== undefined) up.origen = payload.origen?.trim() || null;
  if (payload.interes !== undefined) up.interes = payload.interes?.trim() || null;
  if (payload.persona_contacto !== undefined) {
    up.persona_contacto = Array.isArray(payload.persona_contacto)
      ? payload.persona_contacto.filter((p) => p?.nombre?.trim()).map((p) => ({ nombre: p.nombre.trim(), email: p.email?.trim() || null }))
      : null;
  }
  if (payload.categories !== undefined) up.categories = Array.isArray(payload.categories) ? payload.categories : [];
  if (payload.latitud !== undefined) up.latitud = payload.latitud;
  if (payload.longitud !== undefined) up.longitud = payload.longitud;
  if (Array.isArray(payload.roles)) up.roles = payload.roles;

  const { data, error } = await supabaseAdmin.from("contactos").update(up).eq("id", id).select().single();
  if (error) return null;
  return rowToContacto(data as ContactoRow);
}

export async function updateLead(id: string, payload: Partial<LeadFormato>): Promise<LeadFormato | null> {
  const up: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (payload.nombre !== undefined) {
    up.nombre = payload.nombre.trim();
    up.razon_social = payload.nombre.trim();
  }
  if (payload.email !== undefined) {
    const emailArr = Array.isArray(payload.email) ? payload.email.filter(Boolean) : [];
    up.email = emailArr.length > 0 ? emailArr : [];
  }
  if (payload.telefono !== undefined) up.telefono = phoneToJsonb(payload.telefono);
  if (payload.ciudad !== undefined) up.ciudad = payload.ciudad?.trim() || null;
  if (payload.calle !== undefined) up.direccion = payload.calle?.trim() || null;
  if (payload.postal_code !== undefined) up.codigo_postal = payload.postal_code?.trim() || null;
  if (payload.pais !== undefined) up.pais = payload.pais?.trim() || null;
  if (payload.web !== undefined) up.sitio_web = payload.web?.trim() || null;
  if (payload.sector !== undefined) up.sector = payload.sector?.trim() || null;
  if (payload.interes !== undefined) up.interes = payload.interes?.trim() || null;
  if (payload.origen !== undefined) up.origen = payload.origen?.trim() || null;
  if (payload.categories !== undefined) up.categories = Array.isArray(payload.categories) ? payload.categories : [];
  if (payload.latitud !== undefined) up.latitud = payload.latitud;
  if (payload.longitud !== undefined) up.longitud = payload.longitud;

  const { data, error } = await supabaseAdmin.from("contactos").update(up).eq("id", id).select().single();
  if (error) return null;
  return rowToLead(data as ContactoRow);
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
  const currentRoles = Array.isArray((row as any).roles) ? (row as any).roles as string[] : [];
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
  return rowToContacto(data as ContactoRow);
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

/** Listar contactos soft-deleted (papelera). */
export async function getLeadsPapelera(filters: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: LeadFormato[]; total: number }> {
  try {
    let q = supabaseAdmin
      .from("contactos")
      .select("*", { count: "exact" })
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (filters.q?.trim()) {
      const t = filters.q.trim().replace(/,/g, " ");
      q = q.or(`nombre.ilike.%${t}%,razon_social.ilike.%${t}%,telefono.ilike.%${t}%`);
    }

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
    const rows = (data || []) as ContactoRow[];
    return { data: rows.map(rowToLead), total: count ?? rows.length };
  } catch (e) {
    console.error("getLeadsPapelera:", e);
    return { data: [], total: 0 };
  }
}

/** Valores únicos para filtros (todos los contactos no eliminados). */
export async function getLeadsUniqueValues(field: "sector" | "interes" | "origen"): Promise<string[]> {
  const col = field === "origen" ? "origen" : field;
  const { data, error } = await supabaseAdmin
    .from("contactos")
    .select(col)
    .is("deleted_at", null)
    .not(col, "is", null);
  if (error) return [];
  const set = new Set<string>();
  (data || []).forEach((r: Record<string, string>) => {
    const v = r[col];
    if (v && typeof v === "string") set.add(v.trim());
  });
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
  (data || []).forEach((r: Record<string, string>) => {
    const v = r[field];
    if (v && typeof v === "string") set.add(v.trim());
  });
  return Array.from(set).sort();
}

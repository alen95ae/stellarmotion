/**
 * Tabla unificada public.contactos (leads + contactos).
 * Leads: lifecycle_status = 'lead'. Contactos: lifecycle_status != 'lead'.
 * Requiere en Supabase: enum crm_lifecycle_enum, crm_source_enum y tabla contactos.
 */
import { supabaseAdmin } from "./supabase-admin";

export type LifecycleStatus = "lead" | "contact" | "customer" | "opportunity";
export type SourceEnum = "scraping" | "manual" | "web" | "import" | "other";

export interface ContactoRow {
  id: string;
  user_id: string | null;
  roles: string[];
  lifecycle_status: string;
  origen: string | null;
  tipo_entidad: string | null;
  nombre: string | null;
  razon_social: string | null;
  nombre_razon_social?: string | null;
  nif: string | null;
  email: string | null;
  telefono: string | null;
  telefono_secundario: string | null;
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
  categories: string[] | null;
  persona_contacto: unknown;
  notas: string | null;
  rating: number | null;
  comercial_asignado_id: string | null;
  datos_fiscales: unknown;
  metadata_scraping: unknown;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

/** Persona de contacto (para tipo empresa) */
export interface PersonaContactoItem {
  nombre: string;
  email?: string;
}

/** Formato contacto para la sección Contactos (lista/detalle) */
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

/** Formato lead para la sección Leads */
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

function parsePersonaContacto(v: unknown): PersonaContactoItem[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .filter((x) => x && (typeof x === "object") && "nombre" in x)
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

function rowToContacto(r: ContactoRow): ContactoFormato {
  const email = r.email?.trim() || undefined;
  const personaContacto = parsePersonaContacto(r.persona_contacto);
  const categories = Array.isArray(r.categories) ? r.categories.filter((c): c is string => typeof c === "string") : [];
  const displayName = r.nombre ?? r.razon_social ?? (r as any).nombre_razon_social ?? "";
  return {
    id: r.id,
    displayName: displayName || "",
    nombre: r.nombre ?? undefined,
    razonSocial: r.razon_social ?? undefined,
    legalName: r.razon_social ?? (r as any).nombre_razon_social ?? undefined,
    nif: r.nif ?? undefined,
    phone: r.telefono ?? undefined,
    email: email ?? undefined,
    address: r.direccion ?? undefined,
    city: r.ciudad ?? undefined,
    postalCode: r.codigo_postal ?? undefined,
    country: r.pais ?? undefined,
    relation: "CUSTOMER",
    status: r.lifecycle_status || "contact",
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
  const emailArr = r.email ? (r.email.includes(",") ? r.email.split(",").map((e) => e.trim()).filter(Boolean) : [r.email.trim()]) : [];
  const categories = Array.isArray(r.categories) ? r.categories : [];
  return {
    id: r.id,
    nombre: r.nombre ?? r.razon_social ?? (r as any).nombre_razon_social ?? "",
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

/** Listar Owners unificado: contactos con rol 'owner' O lifecycle_status = 'lead' (no eliminados). Una sola lista. */
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
    let q = supabaseAdmin
      .from("contactos")
      .select("*", { count: "exact" })
      .or("roles.cs.{\"owner\"},lifecycle_status.eq.lead")
      .is("deleted_at", null)
      .order("razon_social", { ascending: true });

    if (filters.q?.trim()) {
      const t = filters.q.trim().replace(/,/g, " ");
      q = q.or(`nombre.ilike.%${t}%,razon_social.ilike.%${t}%,email.ilike.%${t}%,telefono.ilike.%${t}%,nif.ilike.%${t}%`);
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
      console.error("getContactos error:", error);
      return { data: [], total: 0 };
    }
    const rows = (data || []) as ContactoRow[];
    return { data: rows.map(rowToContacto), total: count ?? rows.length };
  } catch (e) {
    console.error("getContactos:", e);
    return { data: [], total: 0 };
  }
}

/** Listar leads: lifecycle_status = 'lead' Y que NO tengan rol 'owner'. Opcionalmente incluir eliminados. */
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
      .eq("lifecycle_status", "lead")
      .order("created_at", { ascending: false });

    if (!filters.includeDeleted) {
      q = q.is("deleted_at", null);
    }

    // Excluir leads que ya tienen rol 'owner' (solo mostrar leads que aún no son owners)
    q = q.not("roles", "cs", ["owner"]);

    if (filters.q?.trim()) {
      const t = filters.q.trim().replace(/,/g, " ");
      q = q.or(`nombre.ilike.%${t}%,razon_social.ilike.%${t}%,email.ilike.%${t}%,telefono.ilike.%${t}%,sector.ilike.%${t}%`);
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
      console.error("getLeads error:", error);
      return { data: [], total: 0 };
    }
    const rows = (data || []) as ContactoRow[];
    return { data: rows.map(rowToLead), total: count ?? rows.length };
  } catch (e) {
    console.error("getLeads:", e);
    return { data: [], total: 0 };
  }
}

/** Obtener un contacto/lead por ID */
export async function getContactoById(id: string): Promise<ContactoFormato | null> {
  const { data, error } = await supabaseAdmin.from("contactos").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error || !data) return null;
  return rowToContacto(data as ContactoRow);
}

export async function getLeadById(id: string): Promise<LeadFormato | null> {
  const { data, error } = await supabaseAdmin.from("contactos").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return rowToLead(data as ContactoRow);
}

/** Crear contacto (como contact, no lead) */
export async function createContacto(payload: Partial<ContactoFormato>): Promise<ContactoFormato | null> {
  const insert: Record<string, unknown> = {
    roles: ["contact"],
    lifecycle_status: "contact",
    origen: "manual",
    tipo_entidad: payload.kind === "INDIVIDUAL" ? "persona" : "empresa",
    nombre: payload.nombre?.trim() || payload.displayName?.trim() || null,
    razon_social: payload.razonSocial?.trim() || payload.displayName?.trim() || "Sin nombre",
    nif: payload.nif?.trim() || null,
    email: payload.email?.trim() || null,
    telefono: payload.phone?.trim() || null,
    direccion: payload.address?.trim() || null,
    ciudad: payload.city?.trim() || null,
    codigo_postal: payload.postalCode?.trim() || null,
    pais: payload.country?.trim() || null,
    sitio_web: payload.website?.trim() || null,
    notas: payload.notes?.trim() || null,
    comercial_asignado_id: payload.salesOwnerId || null,
    sector: payload.sector?.trim() || null,
  };
  const { data, error } = await supabaseAdmin.from("contactos").insert(insert).select().single();
  if (error) {
    console.error("createContacto:", error);
    return null;
  }
  return rowToContacto(data as ContactoRow);
}

/** Crear lead */
export async function createLead(payload: Partial<LeadFormato>): Promise<LeadFormato | null> {
  const emailStr = Array.isArray(payload.email) ? payload.email.filter(Boolean).join(",") : payload.email;
  const insert: Record<string, unknown> = {
    roles: ["lead"],
    lifecycle_status: "lead",
    origen: (payload.origen as string) || "manual",
    tipo_entidad: "empresa",
    nombre: payload.nombre?.trim() || null,
    razon_social: payload.nombre?.trim() || "Sin nombre",
    email: emailStr?.trim() || null,
    telefono: payload.telefono?.trim() || null,
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
    console.error("createLead:", error);
    return null;
  }
  return rowToLead(data as ContactoRow);
}

/** Actualizar contacto */
export async function updateContacto(id: string, payload: Partial<ContactoFormato>): Promise<ContactoFormato | null> {
  const up: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.nombre !== undefined) up.nombre = payload.nombre?.trim() || null;
  if (payload.razonSocial !== undefined) up.razon_social = payload.razonSocial?.trim() || null;
  if (payload.displayName !== undefined && payload.razonSocial === undefined) up.razon_social = payload.displayName.trim();
  if (payload.nif !== undefined) up.nif = payload.nif?.trim() || null;
  if (payload.phone !== undefined) up.telefono = payload.phone?.trim() || null;
  if (payload.email !== undefined) up.email = payload.email?.trim() || null;
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

  const { data, error } = await supabaseAdmin.from("contactos").update(up).eq("id", id).select().single();
  if (error) return null;
  return rowToContacto(data as ContactoRow);
}

/** Actualizar lead */
export async function updateLead(id: string, payload: Partial<LeadFormato>): Promise<LeadFormato | null> {
  const up: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (payload.nombre !== undefined) up.nombre = payload.nombre.trim();
  if (payload.nombre !== undefined) up.razon_social = payload.nombre.trim();
  if (payload.email !== undefined) {
    up.email = Array.isArray(payload.email) ? payload.email.filter(Boolean).join(",") : payload.email;
  }
  if (payload.telefono !== undefined) up.telefono = payload.telefono?.trim() || null;
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

/** Eliminar contacto (hard delete) */
export async function deleteContacto(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("contactos").delete().eq("id", id);
  return !error;
}

/** Soft delete lead (deleted_at) */
export async function softDeleteLead(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("contactos").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  return !error;
}

/** Restaurar lead (quitar deleted_at) */
export async function restoreLead(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("contactos").update({ deleted_at: null }).eq("id", id);
  return !error;
}

/** Convertir lead a contacto (cambiar lifecycle_status y roles) */
export async function convertLeadToContacto(id: string): Promise<ContactoFormato | null> {
  const { data, error } = await supabaseAdmin
    .from("contactos")
    .update({
      lifecycle_status: "contact",
      roles: ["contact"],
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return rowToContacto(data as ContactoRow);
}

/** Promocionar lead a Owner: añade 'owner' a roles, lifecycle_status = 'customer'. El registro pasa a listado Owners. */
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
      lifecycle_status: "customer",
      updated_at: new Date().toISOString(),
    })
    .eq("id", contactId);
  return !updateError;
}

/** Listar solo leads eliminados (papelera) */
export async function getLeadsPapelera(filters: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: LeadFormato[]; total: number }> {
  try {
    let q = supabaseAdmin
      .from("contactos")
      .select("*", { count: "exact" })
      .eq("lifecycle_status", "lead")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (filters.q?.trim()) {
      const t = filters.q.trim().replace(/,/g, " ");
      q = q.or(`nombre.ilike.%${t}%,razon_social.ilike.%${t}%,email.ilike.%${t}%,telefono.ilike.%${t}%`);
    }

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 500);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    q = q.range(from, to);

    const { data, error, count } = await q;
    if (error) {
      console.error("getLeadsPapelera error:", error);
      return { data: [], total: 0 };
    }
    const rows = (data || []) as ContactoRow[];
    return { data: rows.map(rowToLead), total: count ?? rows.length };
  } catch (e) {
    console.error("getLeadsPapelera:", e);
    return { data: [], total: 0 };
  }
}

/** Valores únicos para filtros (leads) */
export async function getLeadsUniqueValues(field: "sector" | "interes" | "origen"): Promise<string[]> {
  const col = field === "origen" ? "origen" : field;
  const { data, error } = await supabaseAdmin
    .from("contactos")
    .select(col)
    .eq("lifecycle_status", "lead")
    .not(col, "is", null);
  if (error) return [];
  const set = new Set<string>();
  (data || []).forEach((r: Record<string, string>) => {
    const v = r[col];
    if (v && typeof v === "string") set.add(v.trim());
  });
  return Array.from(set).sort();
}

/** Valores únicos para filtros (lista unificada Owners: owners + leads) */
export async function getContactosUniqueValues(field: "origen" | "sector" | "interes"): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("contactos")
    .select(field)
    .or("roles.cs.{\"owner\"},lifecycle_status.eq.lead")
    .is("deleted_at", null)
    .not(field, "is", null);
  if (error) return [];
  const set = new Set<string>();
  (data || []).forEach((r: Record<string, string>) => {
    const v = r[field];
    if (v && typeof v === "string") set.add(v.trim());
  });
  return Array.from(set).sort();
}

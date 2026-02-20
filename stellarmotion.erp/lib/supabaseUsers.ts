import { supabaseAdmin } from './supabase-admin'

export interface UsuarioSupabase {
  id: string
  email: string
  passwordhash?: string
  rol_id?: string
  activo: boolean
  ultimo_acceso?: string
  created_at?: string
  updated_at?: string
  invitacion_id?: string
  email_verificado: boolean
  contacto_id?: string
}

export interface Usuario {
  id: string
  fields: {
    Email: string
    PasswordHash?: string
    Nombre?: string
    Rol?: string
    RolId?: string
    Activo?: boolean
    UltimoAcceso?: string
  }
}

/** Forma del contacto anidado en la query de usuarios (contactos!contacto_id). */
interface UsuarioContactoRelation {
  id?: string
  nombre?: string | null
  apellidos?: string | null
  razon_social?: string | null
  telefono?: unknown
  ciudad?: string | null
  pais?: string | null
  email?: unknown
  roles?: string[] | null
}

/** Forma del rol anidado en la query de usuarios (roles!rol_id). */
interface UsuarioRolRelation {
  id?: string
  nombre?: string | null
}

/** Fila de usuarios con relaciones (select USUARIO_SELECT). */
interface UsuarioRowWithRelations {
  id: string
  email: string
  passwordhash?: string | null
  rol_id?: string | null
  activo?: boolean
  ultimo_acceso?: string | null
  created_at?: string | null
  updated_at?: string | null
  invitacion_id?: string | null
  email_verificado?: boolean
  contacto_id?: string | null
  rol?: UsuarioRolRelation | null
  contacto?: UsuarioContactoRelation | null
}

function isUsuarioRowWithRelations(raw: unknown): raw is UsuarioRowWithRelations {
  if (!raw || typeof raw !== 'object') return false
  const r = raw as Record<string, unknown>
  return typeof r.id === 'string' && typeof r.email === 'string'
}

function supabaseToUsuario(record: UsuarioRowWithRelations): Usuario {
  const contacto = record.contacto
  const rolRecord = record.rol
  const nombre = (contacto?.nombre ?? contacto?.razon_social ?? '') as string
  const rolName = (rolRecord?.nombre ?? 'invitado') as string
  return {
    id: record.id,
    fields: {
      Email: record.email,
      PasswordHash: record.passwordhash ?? undefined,
      Nombre: nombre,
      Rol: rolName,
      RolId: record.rol_id ?? undefined,
      Activo: record.activo ?? true,
      UltimoAcceso: record.ultimo_acceso ?? undefined,
    }
  }
}

const USUARIO_SELECT = `
  id,
  email,
  passwordhash,
  rol_id,
  activo,
  ultimo_acceso,
  created_at,
  updated_at,
  invitacion_id,
  email_verificado,
  contacto_id,
  rol:roles!rol_id(id, nombre),
  contacto:contactos!contacto_id(id, nombre, apellidos, razon_social, telefono, ciudad, pais, email, roles)
`;

export async function findUserByEmailSupabase(email: string): Promise<Usuario | null> {
  const emailNormalized = email.trim().toLowerCase()
  console.log('[Auth] findUserByEmail:', emailNormalized)

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select(USUARIO_SELECT)
    .eq('email', emailNormalized)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[Auth] findUserByEmail error:', error.code, error.message)
    return null
  }
  if (!data) {
    console.log('[Auth] findUserByEmail: not found')
    return null
  }

  if (!isUsuarioRowWithRelations(data)) {
    console.error('[Auth] findUserByEmail: invalid row shape')
    return null
  }
  console.log('[Auth] findUserByEmail: found', data.id)
  return supabaseToUsuario(data)
}

async function getRoleId(rol: string): Promise<string | undefined> {
  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('nombre', rol)
    .maybeSingle()
  if (error || !data) return undefined
  return data.id
}

export async function createUserSupabase(
  email: string,
  passwordHash: string,
  _nombre?: string,
  rol?: string,
  _telefono?: string,
  _pais?: string,
  _apellidos?: string
): Promise<Usuario> {
  const now = new Date().toISOString()
  let rol_id: string | undefined = undefined
  if (rol) {
    rol_id = await getRoleId(rol)
  }

  const userData: Record<string, unknown> = {
    email: email.trim().toLowerCase(),
    passwordhash: passwordHash,
    activo: true,
    created_at: now,
    updated_at: now,
  }
  if (rol_id) userData.rol_id = rol_id

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .insert([userData])
    .select(USUARIO_SELECT)
    .single()

  if (error) {
    console.error('[Auth] createUser error:', error.code, error.message)
    throw new Error(`Error creating user: ${error.message} (code: ${error.code})`)
  }
  if (!data) throw new Error('No data returned after creating user')
  if (!isUsuarioRowWithRelations(data)) throw new Error('Invalid row shape after creating user')
  return supabaseToUsuario(data)
}

export async function updateLastAccessSupabase(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({ ultimo_acceso: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) console.error('[Auth] updateLastAccess error:', error.message)
}

/** Usuario expandido devuelto por getUserByIdSupabase (para panel/perfil). */
export interface UsuarioByIdResult {
  id: string
  email: string
  nombre: string | null
  apellidos: string | null
  telefono: unknown
  pais: string | null
  ciudad: string | null
  rol: string
  rol_id: string | null
  contacto_id: string | null
  contacto_roles: string[]
  activo: boolean
}

export async function getUserByIdSupabase(userId: string): Promise<UsuarioByIdResult | null> {
  console.log('[Auth] getUserById:', userId)

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select(USUARIO_SELECT)
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('[Auth] getUserById error:', error.code, error.message)
    return null
  }
  if (!data || !isUsuarioRowWithRelations(data)) return null

  const contacto = data.contacto
  const rolRecord = data.rol
  const roleName = (rolRecord?.nombre ?? 'invitado') as string

  return {
    id: data.id,
    email: data.email,
    nombre: (contacto?.nombre ?? contacto?.razon_social ?? null) as string | null,
    apellidos: (contacto?.apellidos ?? null) as string | null,
    telefono: contacto?.telefono ?? null,
    pais: (contacto?.pais ?? null) as string | null,
    ciudad: (contacto?.ciudad ?? null) as string | null,
    rol: roleName,
    rol_id: data.rol_id ?? null,
    contacto_id: data.contacto_id ?? null,
    contacto_roles: Array.isArray(contacto?.roles) ? contacto.roles : [],
    activo: data.activo ?? true,
  }
}

export async function updateUserRoleSupabase(userId: string, role: string): Promise<void> {
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('nombre', role)
    .maybeSingle()

  if (roleError || !roleData) {
    throw new Error(`Rol ${role} no encontrado`)
  }

  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({ rol_id: roleData.id, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    throw new Error(`Error updating user role: ${error.message}`)
  }
}

export async function userExistsById(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  if (error && error.code !== 'PGRST116') return false
  return !!data
}

import { supabaseAdmin } from './supabase-admin'

// Interfaz para el usuario en Supabase
export interface UsuarioSupabase {
  id: string
  email: string
  passwordhash?: string
  nombre?: string
  rol_id?: string
  activo: boolean
  fecha_creacion?: string
  ultimo_acceso?: string
  created_at?: string
  updated_at?: string
}

// Interfaz para el usuario en el frontend (compatible con UserRecord)
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

/**
 * Convertir usuario de Supabase al formato esperado por el frontend
 */
function supabaseToUsuario(record: any): Usuario {
  return {
    id: record.id,
    fields: {
      Email: record.email,
      PasswordHash: record.passwordhash || record.password_hash || undefined,
      Nombre: record.nombre || '',
      Rol: record.rol || 'invitado',
      RolId: record.rol_id || undefined,
      Activo: record.activo ?? true,
      UltimoAcceso: record.ultimo_acceso || undefined,
    }
  }
}

/**
 * Buscar usuario por email
 */
export async function findUserByEmailSupabase(email: string): Promise<Usuario | null> {
  const emailNormalized = email.trim().toLowerCase()
  console.log('🔍 [Supabase ERP] Buscando usuario con email:', emailNormalized)
  console.log('🔐 [Supabase ERP] Usando cliente: supabaseAdmin (SERVICE_ROLE_KEY)')
  console.log('🔐 [Supabase ERP] Schema: public')
  console.log('🔐 [Supabase ERP] Tabla: usuarios')
  
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('email', emailNormalized)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('❌ [Supabase ERP] Error finding user by email:', error)
    console.error('❌ [Supabase ERP] Error code:', error.code)
    console.error('❌ [Supabase ERP] Error message:', error.message)
    console.error('❌ [Supabase ERP] Error details:', error.details)
    console.error('❌ [Supabase ERP] Error hint:', error.hint)
    return null
  }

  if (!data) {
    console.log('⚠️ [Supabase ERP] No se encontró usuario con email:', emailNormalized)
    return null
  }

  console.log('✅ [Supabase ERP] Usuario encontrado:', data.id, data.email)
  return supabaseToUsuario(data as UsuarioSupabase)
}

/**
 * Obtener ID de rol por nombre
 */
async function getRoleId(rol: string): Promise<string | undefined> {
  try {
    console.log('🔍 [getRoleId] Buscando rol:', rol)
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('nombre', rol)
      .maybeSingle()
    
    if (roleError && roleError.code !== 'PGRST116') {
      console.error('❌ [getRoleId] Error obteniendo rol:', roleError)
      return undefined
    }
    
    if (roleData) {
      console.log('✅ [getRoleId] Rol encontrado:', rol, 'ID:', roleData.id)
      return roleData.id
    } else {
      console.warn(`⚠️ [getRoleId] Rol '${rol}' no encontrado en la tabla roles.`)
      return undefined
    }
  } catch (error: any) {
    console.error('❌ [getRoleId] Error al obtener rol:', error.message)
    return undefined
  }
}

/**
 * Crear nuevo usuario
 */
export async function createUserSupabase(
  email: string,
  passwordHash: string,
  nombre?: string,
  rol?: string,
  telefono?: string,
  pais?: string,
  ciudad?: string,
  tipo_owner?: string,
  nombre_empresa?: string,
  tipo_empresa?: string,
  apellidos?: string
): Promise<Usuario> {
  const now = new Date().toISOString()
  
  // Obtener rol_id si se proporciona un nombre de rol
  let rol_id: string | undefined = undefined
  if (rol) {
    rol_id = await getRoleId(rol)
  }
  
  const userData: any = {
    email: email.trim().toLowerCase(),
    passwordhash: passwordHash,
    nombre: nombre?.trim() || null,
    activo: true,
    fecha_creacion: now,
    created_at: now,
    updated_at: now
  }
  
  if (rol_id) {
    userData.rol_id = rol_id
  }
  
  // Agregar campos opcionales del paso 1
  if (telefono) userData.telefono = telefono.trim()
  if (pais) userData.pais = pais.trim()
  if (ciudad) userData.ciudad = ciudad.trim()
  if (tipo_owner) userData.tipo_owner = tipo_owner
  if (nombre_empresa) userData.nombre_empresa = nombre_empresa.trim()
  if (tipo_empresa) userData.tipo_empresa = tipo_empresa.trim()
  if (apellidos) userData.apellidos = apellidos.trim()
  
  console.log('🔐 [createUserSupabase] Usando cliente: supabaseAdmin (SERVICE_ROLE_KEY)')
  console.log('🔐 [createUserSupabase] Schema: public')
  console.log('🔐 [createUserSupabase] Tabla: usuarios')
  console.log('📤 [createUserSupabase] Insertando:', {
    email: userData.email,
    nombre: userData.nombre,
    telefono: userData.telefono || 'no proporcionado',
    pais: userData.pais || 'no proporcionado',
    ciudad: userData.ciudad || 'no proporcionado',
    tipo_owner: userData.tipo_owner || 'no proporcionado',
    nombre_empresa: userData.nombre_empresa || 'no proporcionado',
    tipo_empresa: userData.tipo_empresa || 'no proporcionado',
    apellidos: userData.apellidos || 'no proporcionado',
    hasRolId: !!userData.rol_id
  })
  
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .insert([userData])
    .select()
    .single()

  if (error) {
    console.error('❌ [createUserSupabase] Error creating user:', error)
    console.error('❌ [createUserSupabase] Error code:', error.code)
    console.error('❌ [createUserSupabase] Error message:', error.message)
    console.error('❌ [createUserSupabase] Error details:', error.details)
    console.error('❌ [createUserSupabase] Error hint:', error.hint)
    throw new Error(`Error creating user: ${error.message} (code: ${error.code})`)
  }

  if (!data) {
    throw new Error('No data returned after creating user')
  }

  return supabaseToUsuario(data as UsuarioSupabase)
}

/**
 * Actualizar último acceso del usuario
 */
export async function updateLastAccessSupabase(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({
      ultimo_acceso: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating last access:', error)
  }
}

/**
 * Obtener usuario por ID
 */
export async function getUserByIdSupabase(userId: string): Promise<any | null> {
  console.log('🔍 [getUserByIdSupabase] Obteniendo usuario por ID:', userId)
  console.log('🔐 [getUserByIdSupabase] Usando cliente: supabaseAdmin (SERVICE_ROLE_KEY)')
  console.log('🔐 [getUserByIdSupabase] Schema: public')
  console.log('🔐 [getUserByIdSupabase] Tabla: usuarios')
  
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('⚠️ [getUserByIdSupabase] Usuario no encontrado (PGRST116)')
      return null
    }
    console.error('❌ [getUserByIdSupabase] Error getting user by id:', error)
    console.error('❌ [getUserByIdSupabase] Error code:', error.code)
    console.error('❌ [getUserByIdSupabase] Error message:', error.message)
    console.error('❌ [getUserByIdSupabase] Error details:', error.details)
    return null
  }

  if (!data) {
    console.log('⚠️ [getUserByIdSupabase] No data returned')
    return null
  }

  // Obtener el nombre del rol desde la tabla roles
  let roleName = 'invitado'
  if (data.rol_id) {
    try {
      console.log('🔍 [getUserByIdSupabase] Obteniendo nombre del rol, rol_id:', data.rol_id)
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('nombre')
        .eq('id', data.rol_id)
        .single()
      
      if (roleError) {
        console.error('❌ [getUserByIdSupabase] Error obteniendo nombre del rol:', roleError)
      } else if (roleData?.nombre) {
        roleName = roleData.nombre
        console.log('✅ [getUserByIdSupabase] Rol encontrado:', roleName)
      }
    } catch (error: any) {
      console.error('❌ [getUserByIdSupabase] Error obteniendo nombre del rol:', error.message)
    }
  }

  const usuario = supabaseToUsuario(data as UsuarioSupabase)
  return {
    ...usuario,
    email: data.email,
    nombre: data.nombre,
    apellidos: data.apellidos || null,
    telefono: data.telefono || null,
    pais: data.pais || null,
    ciudad: data.ciudad || null,
    tipo_owner: data.tipo_owner || null,
    nombre_empresa: data.nombre_empresa || null,
    tipo_empresa: data.tipo_empresa || null,
    rol: roleName,
    rol_id: data.rol_id || null,
  }
}

/**
 * Actualizar rol del usuario
 */
export async function updateUserRoleSupabase(userId: string, role: string): Promise<void> {
  console.log('🔍 [updateUserRoleSupabase] Actualizando rol del usuario:', userId, 'a rol:', role)
  console.log('🔐 [updateUserRoleSupabase] Usando cliente: supabaseAdmin (SERVICE_ROLE_KEY)')
  console.log('🔐 [updateUserRoleSupabase] Schema: public')
  
  // Obtener rol_id
  console.log('🔍 [updateUserRoleSupabase] Buscando rol en tabla roles')
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('nombre', role)
    .maybeSingle()
  
  if (roleError) {
    console.error('❌ [updateUserRoleSupabase] Error obteniendo rol:', roleError)
    console.error('❌ [updateUserRoleSupabase] Error code:', roleError.code)
    console.error('❌ [updateUserRoleSupabase] Error message:', roleError.message)
    throw new Error(`Error obteniendo rol: ${roleError.message} (code: ${roleError.code})`)
  }
  
  if (!roleData) {
    console.error('❌ [updateUserRoleSupabase] Rol no encontrado:', role)
    throw new Error(`Rol ${role} no encontrado`)
  }

  console.log('✅ [updateUserRoleSupabase] Rol encontrado:', role, 'ID:', roleData.id)
  console.log('🔄 [updateUserRoleSupabase] Actualizando usuario en tabla usuarios')
  
  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({
      rol_id: roleData.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('❌ [updateUserRoleSupabase] Error updating user role:', error)
    console.error('❌ [updateUserRoleSupabase] Error code:', error.code)
    console.error('❌ [updateUserRoleSupabase] Error message:', error.message)
    console.error('❌ [updateUserRoleSupabase] Error details:', error.details)
    console.error('❌ [updateUserRoleSupabase] Error hint:', error.hint)
    throw new Error(`Error updating user role: ${error.message} (code: ${error.code})`)
  }
  
  console.log('✅ [updateUserRoleSupabase] Rol actualizado correctamente')
}

/**
 * Verificar si un usuario existe por ID
 */
export async function userExistsById(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking user existence:', error)
    return false
  }

  return !!data
}


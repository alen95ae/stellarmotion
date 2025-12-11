import bcrypt from 'bcryptjs';
import { getAdminSupabase } from '@/lib/supabase/admin';

/**
 * Buscar usuario por email en Supabase
 */
export async function findUserByEmail(email: string) {
  const emailNormalizado = email.toLowerCase().trim();
  console.log('🔍 [findUserByEmail] Buscando usuario por email:', emailNormalizado);
  
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', emailNormalizado)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ [findUserByEmail] Error:', error);
    return null;
  }

  if (data) {
    console.log('✅ [findUserByEmail] Usuario encontrado:', {
      id: data.id,
      email: data.email,
    });
  } else {
    console.log('ℹ️ [findUserByEmail] Usuario NO encontrado con email:', emailNormalizado);
  }

  return data;
}

/**
 * Obtener rol_id por nombre de rol
 */
async function getRoleId(roleName: string): Promise<string | undefined> {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from('roles')
    .select('id')
    .eq('nombre', roleName)
    .maybeSingle();

  if (error) {
    console.error('❌ [getRoleId] Error:', error);
    return undefined;
  }

  return data?.id;
}

/**
 * Crear usuario en Supabase
 */
export async function createUser(
  email: string,
  password: string,
  nombre?: string,
  role: string = 'client',
  telefono?: string,
  pais?: string,
  apellidos?: string
) {
  const supabase = getAdminSupabase();
  const now = new Date().toISOString();
  
  // Hash de contraseña
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Obtener rol_id
  const rol_id = await getRoleId(role);
  
  const userData: any = {
    email: email.trim().toLowerCase(),
    passwordhash: passwordHash,
    nombre: nombre?.trim() || null,
    activo: true,
    fecha_creacion: now,
    created_at: now,
    updated_at: now,
  };
  
  if (rol_id) {
    userData.rol_id = rol_id;
  }
  
  // Campos del paso 1
  if (telefono) userData.telefono = telefono.trim();
  if (pais) userData.pais = pais.trim();
  if (apellidos) userData.apellidos = apellidos.trim();
  
  console.log('📤 [createUser] Creando usuario en Supabase:', {
    email: userData.email,
    nombre: userData.nombre,
    apellidos: userData.apellidos || null,
    telefono: userData.telefono || null,
    pais: userData.pais || null,
    hasPasswordHash: !!userData.passwordhash,
    hasRolId: !!userData.rol_id,
    camposGuardados: Object.keys(userData).filter(k => userData[k] !== null && userData[k] !== undefined),
  });
  
  const { data, error } = await supabase
    .from('usuarios')
    .insert([userData])
    .select()
    .single();

  if (error) {
    console.error('❌ [createUser] Error:', error);
    throw new Error(`Error al crear usuario: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se devolvieron datos después de crear el usuario');
  }

  console.log('✅ [createUser] Usuario creado exitosamente en Supabase:', {
    id: data.id,
    email: data.email,
    nombre: data.nombre,
    apellidos: data.apellidos,
    telefono: data.telefono,
    pais: data.pais,
  });
  
  console.log('✅ [createUser] ID del usuario creado:', data.id);
  console.log('✅ [createUser] Este ID debe usarse en el JWT y en todas las operaciones posteriores');

  return {
    id: data.id,
    email: data.email,
    nombre: data.nombre,
    apellidos: data.apellidos,
    telefono: data.telefono,
    pais: data.pais,
    rol_id: data.rol_id,
  };
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(userId: string) {
  console.log('🔍 [getUserById] Iniciando búsqueda de usuario:', userId);
  
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ [getUserById] Error al buscar usuario:', error);
    console.error('❌ [getUserById] userId buscado:', userId);
    return null;
  }

  if (data) {
    console.log('✅ [getUserById] Usuario encontrado:', {
      id: data.id,
      email: data.email,
      nombre: data.nombre,
    });
  } else {
    console.error('❌ [getUserById] Usuario NO encontrado en BD');
    console.error('❌ [getUserById] userId buscado:', userId);
  }

  return data;
}

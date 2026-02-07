import bcrypt from 'bcryptjs';
import { getAdminSupabase } from '@/lib/supabase/admin';

/**
 * Buscar usuario por email en Supabase
 */
export async function findUserByEmail(email: string) {
  const emailNormalizado = email.toLowerCase().trim();
  
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', emailNormalizado)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    return null;
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
  
  if (telefono) userData.telefono = telefono.trim();
  if (pais) userData.pais = pais.trim();
  if (apellidos) userData.apellidos = apellidos.trim();
  
  const { data, error } = await supabase
    .from('usuarios')
    .insert([userData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear usuario: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se devolvieron datos después de crear el usuario');
  }

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
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    return null;
  }

  return data;
}

/**
 * Actualizar perfil del usuario (nombre, teléfono y opcionalmente contraseña)
 */
export async function updateUserProfile(
  email: string,
  updates: { nombre?: string; telefono?: string; passwordNueva?: string },
  passwordActual?: string
): Promise<{ error?: string }> {
  const supabase = getAdminSupabase();
  const user = await findUserByEmail(email);
  if (!user) {
    return { error: 'Usuario no encontrado' };
  }

  if (updates.passwordNueva) {
    if (!passwordActual) {
      return { error: 'Debes ingresar tu contraseña actual' };
    }
    const ok = await bcrypt.compare(passwordActual, user.passwordhash || '');
    if (!ok) {
      return { error: 'Contraseña actual incorrecta' };
    }
    if (updates.passwordNueva.length < 6) {
      return { error: 'La contraseña nueva debe tener al menos 6 caracteres' };
    }
  }

  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    updated_at: now,
  };
  if (updates.nombre !== undefined) payload.nombre = updates.nombre.trim() || null;
  if (updates.telefono !== undefined) payload.telefono = updates.telefono?.trim() || null;
  if (updates.passwordNueva) {
    payload.passwordhash = await bcrypt.hash(updates.passwordNueva, 10);
  }

  const { error } = await supabase
    .from('usuarios')
    .update(payload)
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }
  return {};
}

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

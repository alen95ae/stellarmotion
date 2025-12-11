import bcrypt from "bcryptjs";
import { sign, verify } from "./auth/jwt";
import { 
  findUserByEmailSupabase, 
  createUserSupabase,
  updateLastAccessSupabase,
  type Usuario 
} from "./supabaseUsers";

const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

export type UserRecord = {
  id: string;
  fields: {
    Email: string;
    PasswordHash?: string;
    Nombre?: string;
    Rol?: string;
    Activo?: boolean;
    UltimoAcceso?: string;
  };
};

// Convertir Usuario (Supabase) a UserRecord (compatible con código existente)
function usuarioToUserRecord(usuario: Usuario): UserRecord {
  return {
    id: usuario.id,
    fields: {
      Email: usuario.fields.Email,
      PasswordHash: usuario.fields.PasswordHash,
      Nombre: usuario.fields.Nombre,
      Rol: usuario.fields.Rol,
      Activo: usuario.fields.Activo,
      UltimoAcceso: usuario.fields.UltimoAcceso,
    }
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    console.log('🔍 [Auth ERP] Buscando usuario con email:', email);
    
    const usuario = await findUserByEmailSupabase(email);
    if (usuario) {
      console.log('✅ [Auth ERP] Usuario encontrado en Supabase:', usuario.id, usuario.fields.Email);
      return usuarioToUserRecord(usuario);
    }
    
    console.log('❌ [Auth ERP] Usuario no encontrado en Supabase');
    return null;
  } catch (error) {
    console.error("❌ [Auth ERP] Error finding user by email:", error);
    return null;
  }
}

export async function createUser(email: string, password: string, name?: string) {
  const hash = await bcrypt.hash(password, 10);
  const usuario = await createUserSupabase(email, hash, name, "client");
  return usuarioToUserRecord(usuario);
}

export async function createUserWithRole(
  email: string,
  password: string,
  name?: string,
  role: string = "client",
  telefono?: string,
  pais?: string,
  ciudad?: string,
  tipo_owner?: string,
  nombre_empresa?: string,
  tipo_empresa?: string,
  apellidos?: string
) {
  const hash = await bcrypt.hash(password, 10);
  const usuario = await createUserSupabase(
    email,
    hash,
    name,
    role,
    telefono,
    pais,
    ciudad,
    tipo_owner,
    nombre_empresa,
    tipo_empresa,
    apellidos
  );
  return usuarioToUserRecord(usuario);
}

export async function updateUserLastAccess(userId: string) {
  await updateLastAccessSupabase(userId);
}

export async function signSession(user: { id: string; email: string; role?: string; name?: string }) {
  return await sign({
    sub: user.id,
    email: user.email,
    role: user.role || "client",
    name: user.name || ""
  }, JWT_EXPIRES);
}

export async function verifySession(token: string) {
  return await verify<{ sub: string; email: string; role?: string; name?: string; iat: number; exp: number }>(token);
}


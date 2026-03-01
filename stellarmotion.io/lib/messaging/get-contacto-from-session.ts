import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { findUserByEmail } from '@/lib/auth/users';

export interface SessionContacto {
  userId: string;
  contactoId: string;
  email: string;
}

/** Sin sesión (no cookie o token inválido) */
export type SessionNoContact = { userId: string; email: string; contactoId: null };

/**
 * Obtiene el contacto_id del usuario autenticado.
 * - null = no hay sesión (cookie/token).
 * - contactoId null = usuario existe pero no tiene contacto_id en usuarios.
 */
export async function getContactoFromSession(): Promise<SessionContacto | SessionNoContact | null> {
  const cookieStore = await cookies();
  const st = cookieStore.get('st_session');
  if (!st?.value) return null;

  const payload = await verifySession(st.value);
  if (!payload?.sub) return null;

  const user = await findUserByEmail(payload.email);
  if (!user) return null;

  const raw = (user as { contacto_id?: string | null }).contacto_id;
  const contactoId = raw != null && raw !== '' ? String(raw) : null;

  if (contactoId) {
    return { userId: payload.sub, contactoId, email: payload.email };
  }
  return { userId: payload.sub, email: payload.email, contactoId: null };
}

/** Tipo guard: tiene contacto_id válido para mensajería */
export function hasContactoId(
  s: SessionContacto | SessionNoContact | null
): s is SessionContacto {
  return s != null && 'contactoId' in s && typeof (s as SessionContacto).contactoId === 'string';
}

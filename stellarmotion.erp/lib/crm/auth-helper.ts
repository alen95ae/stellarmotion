// ============================================================================
// CRM AUTH HELPER - Obtener userId del request (NextAuth o cookie st_session)
// ============================================================================

import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifySession } from '@/lib/auth';

/**
 * Obtener userId: primero sesión NextAuth, luego fallback a cookie st_session.
 * Usar en todos los endpoints CRM.
 */
export async function getUserIdFromRequest(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const u = session.user as { id?: string; sub?: string };
    const id = u.id ?? u.sub;
    if (id) return id;
  }

  const cookieStore = await cookies();
  const st = cookieStore.get("st_session");
  if (!st?.value) {
    throw new Error('No autorizado');
  }

  const payload = await verifySession(st.value);
  if (!payload?.sub) {
    throw new Error('Sesión inválida');
  }

  return payload.sub;
}



// ============================================================================
// CRM AUTH HELPER - Obtener userId del request
// ============================================================================

import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

/**
 * Obtener userId del JWT en el request
 * Usar en todos los endpoints CRM
 */
export async function getUserIdFromRequest(): Promise<string> {
  const cookieStore = await cookies();
  const st = cookieStore.get("st_session");

  if (!st || !st.value) {
    throw new Error('No autorizado');
  }

  const payload = await verifySession(st.value);
  
  if (!payload || !payload.sub) {
    throw new Error('Sesión inválida');
  }

  return payload.sub;
}



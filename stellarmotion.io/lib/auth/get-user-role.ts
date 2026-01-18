/**
 * Helper para obtener el rol del usuario desde las cookies en el servidor
 * Usado en layouts y middleware
 */

import { cookies } from 'next/headers';
import { verifySession } from './session';
import { getRoleFromPayload, AppRole } from './role';

/**
 * Obtiene el rol del usuario autenticado desde las cookies
 * Retorna undefined si no hay sesión válida
 */
export async function getUserRole(): Promise<AppRole | undefined> {
  try {
    const cookieStore = await cookies();
    const st = cookieStore.get('st_session');

    if (!st || !st.value) {
      return undefined;
    }

    const payload = await verifySession(st.value);
    
    if (!payload || !payload.sub) {
      return undefined;
    }

    return getRoleFromPayload(payload.role);
  } catch (error) {
    console.error('Error obteniendo rol del usuario:', error);
    return undefined;
  }
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(requiredRole: AppRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === requiredRole;
}

/**
 * Verifica si el usuario tiene alguno de los roles especificados
 */
export async function hasAnyRole(requiredRoles: AppRole[]): Promise<boolean> {
  const userRole = await getUserRole();
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}



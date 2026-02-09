// Fuente única de verdad para roles del sistema
export const APP_ROLES = [
  'admin',
  'owner',
  'seller',
  'client',
] as const;

export type AppRole = typeof APP_ROLES[number];

// Mapa explícito para normalización de roles
const ROLE_MAP: Record<string, AppRole> = {
  admin: 'admin',
  owner: 'owner',
  seller: 'seller',
  client: 'client',
  cliente: 'client', // Brand (rol en BD: client)
};

/**
 * Safely extract the normalized application role from a JWT payload or role string.
 * 
 * Regla: El rol debe existir en BD, JWT, Tipo TS, y Normalizador.
 * Si falta en uno → bug inevitable.
 */
export function getRoleFromPayload(role: string | null | undefined): AppRole | undefined {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth/role.ts:25',message:'getRoleFromPayload entry',data:{role,roleType:typeof role,isNull:role===null,isUndefined:role===undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (!role) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth/role.ts:27',message:'getRoleFromPayload early return undefined',data:{role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return undefined;
  }
  
  const normalized = role.toLowerCase().trim();
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth/role.ts:31',message:'getRoleFromPayload normalized',data:{normalized,inMap:normalized in ROLE_MAP,mappedValue:ROLE_MAP[normalized]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return ROLE_MAP[normalized];
}

/**
 * Get default role for navigation (used when role is undefined)
 */
export function getDefaultRole(): AppRole {
  return 'client';
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string | null | undefined): role is AppRole {
  if (!role) return false;
  return role.toLowerCase().trim() in ROLE_MAP;
}

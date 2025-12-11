export type AppRole = 'admin' | 'owner' | 'client';

/**
 * Safely extract the normalized application role from a JWT payload or role string.
 * 
 * This function works with the new JWT-based authentication system.
 * It normalizes role strings to the AppRole type.
 */
export function getRoleFromPayload(role: string | undefined | null): AppRole | undefined {
  if (!role) return undefined;

  const normalized = String(role).toLowerCase();

  if (normalized === 'admin') return 'admin';
  if (normalized === 'owner') return 'owner';
  if (normalized === 'client') return 'client';

  return undefined;
}

/**
 * Get default role for navigation (used when role is undefined)
 */
export function getDefaultRole(): AppRole {
  return 'client';
}




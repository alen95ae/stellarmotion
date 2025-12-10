import type { User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'owner' | 'client';

/**
 * Safely extract the normalized application role from a Supabase user.
 *
 * It checks (in order):
 * - user.user_metadata.role
 * - user.user_metadata.rol  (legacy key without "e")
 * - user.app_metadata.role
 */
export function getRoleFromUser(user: User | null | undefined): AppRole | undefined {
  if (!user) return undefined;

  const meta = (user.user_metadata || {}) as Record<string, any>;
  const appMeta = (user.app_metadata || {}) as Record<string, any>;

  const rawRole =
    (meta.role as string | undefined) ??
    (meta.rol as string | undefined) ??
    (appMeta.role as string | undefined);

  if (!rawRole) return undefined;

  const normalized = String(rawRole).toLowerCase();

  if (normalized === 'admin') return 'admin';
  if (normalized === 'owner') return 'owner';
  if (normalized === 'client') return 'client';

  // Any other custom role is treated as undefined here
  return undefined;
}



import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ROUTES } from '../routes';

/**
 * Extract and validate the `next` parameter from search params.
 * Returns undefined if it's missing, malformed or potentially unsafe.
 */
export function getNextFromSearchParams(
  searchParams: ReadonlyURLSearchParams | URLSearchParams | null | undefined,
): string | undefined {
  if (!searchParams) return undefined;

  const next = searchParams.get('next');
  if (!next) return undefined;

  try {
    // Only allow same-origin relative paths
    if (!next.startsWith('/')) return undefined;

    // Very small safeguard against open redirects
    const url = new URL(next, 'http://localhost');
    return url.pathname + url.search + url.hash;
  } catch {
    return undefined;
  }
}

/**
 * Safe client-side redirect helper.
 *
 * - Avoids redirecting to the login page itself unless explicitly desired.
 * - Falls back to HOME when the target is invalid.
 */
export function safeRedirect(router: AppRouterInstance, target?: string | null) {
  const url = target && target.startsWith('/') ? target : ROUTES.HOME;

  // Avoid trivial infinite loops like /auth/login?next=/auth/login
  if (url === ROUTES.LOGIN) {
    router.replace(ROUTES.HOME);
    return;
  }

  router.replace(url);
}







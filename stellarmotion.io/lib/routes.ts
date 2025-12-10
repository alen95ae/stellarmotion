// Centralized route constants for stellarmotion.io
// NOTE: Keep this file UI-agnostic – only paths, no components.

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  OWNER_REGISTER: '/owner/register',
  OWNER_COMPLETE: '/owner/register/complete',
  DASHBOARD_OWNER: '/owners/dashboard',
  DASHBOARD_ADMIN: '/panel/inicio',
} as const;

export type AppRouteKey = keyof typeof ROUTES;

export function getRoute(key: AppRouteKey): string {
  return ROUTES[key];
}



// Centralized route constants for stellarmotion.io
// NOTE: Keep this file UI-agnostic – only paths, no components.

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  OWNER_REGISTER: '/owner/register',
  OWNER_ONBOARDING: '/owner/onboarding',
  ACCOUNT: '/account',
  DASHBOARD: '/dashboard',
  DASHBOARD_OWNER: '/dashboard/owner',
  DASHBOARD_ADMIN: '/dashboard/admin',
} as const;

export type AppRouteKey = keyof typeof ROUTES;

export function getRoute(key: AppRouteKey): string {
  return ROUTES[key];
}



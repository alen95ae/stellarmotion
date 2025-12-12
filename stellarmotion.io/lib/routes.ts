// Centralized route constants for stellarmotion.io
// NOTE: Keep this file UI-agnostic – only paths, no components.

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  REGISTER: '/register',
  ACCOUNT: '/account',
  DASHBOARD: '/dashboard',
  DASHBOARD_ADMIN: '/dashboard/admin',
} as const;

export type AppRouteKey = keyof typeof ROUTES;

export function getRoute(key: AppRouteKey): string {
  return ROUTES[key];
}



import { NextResponse, type NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/signup',
  '/auth/logout',
  '/auth/error',
  '/buscar-un-espacio',
  '/product',
  '/propietarios',
  '/register',
] as const;

// Rutas que requieren autenticación pero son accesibles para cualquier usuario autenticado
const AUTHENTICATED_ROUTES = [
  '/account',
  '/owner/paso-2',
] as const;

// Rutas protegidas por rol
const ADMIN_ROUTES = [
  '/admin',
  '/dashboard/admin',
] as const;

const OWNER_ROUTES = [
  '/panel',
] as const;

const CLIENT_ROUTES = [
  '/dashboard',
] as const;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir rutas de API (se protegen individualmente si es necesario)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Permitir archivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar si es ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar cookie de sesión (sin validar JWT todavía hasta confirmar JWT_SECRET)
  const cookie = req.cookies.get("st_session");
  
  // Verificar si es ruta que requiere autenticación
  const isAuthenticatedRoute = AUTHENTICATED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isAuthenticatedRoute && !cookie) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar rutas protegidas por rol
  const isAdminRoute = ADMIN_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  const isOwnerRoute = OWNER_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  const isClientRoute = CLIENT_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isAdminRoute || isOwnerRoute || isClientRoute) {
    if (!cookie) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Permitir acceso a otras rutas
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

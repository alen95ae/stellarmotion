import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { getRoleFromPayload } from '@/lib/auth/role';

// Basic Auth para entorno dev (DEV_USER / DEV_PASS)
function checkBasicAuth(req: NextRequest): NextResponse | null {
  const auth = req.headers.get('authorization');
  if (!auth) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="StellarMotion Dev"' },
    });
  }
  const [, encoded] = auth.split(' ');
  const decoded = atob(encoded);
  const [user, pass] = decoded.split(':');
  if (user !== process.env.DEV_USER || pass !== process.env.DEV_PASS) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  return null;
}

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

// Rutas accesibles para admin y owner
const ADMIN_OR_OWNER_ROUTES = [
  '/panel',
] as const;

// Rutas específicas de owner (admin, owner, seller)
const OWNER_ROUTES = [
  '/panel/owner',
] as const;

// Rutas específicas de cliente
const CLIENT_ROUTES = [
  '/panel/cliente',
  '/dashboard',
] as const;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Basic Auth (Vercel): cuando DEV_USER y DEV_PASS existen, SIEMPRE se exige.
  // En Vercel, asegura que las variables estén en Environment Variables y disponibles en Runtime (no solo Build).
  if (process.env.DEV_USER && process.env.DEV_PASS) {
    const basicResponse = checkBasicAuth(req);
    if (basicResponse) return basicResponse;
  }

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

  const isAdminOrOwnerRoute = ADMIN_OR_OWNER_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  const isOwnerRoute = OWNER_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  const isClientRoute = CLIENT_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isAdminRoute || isAdminOrOwnerRoute || isOwnerRoute || isClientRoute) {
    if (!cookie) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar el rol del usuario para rutas protegidas por rol
    try {
      const payload = await verifySession(cookie.value);
      
      if (!payload) {
        const loginUrl = new URL('/auth/login', req.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Normalizar el rol usando el helper centralizado
      const normalizedRole = getRoleFromPayload(payload.role);
      const userRole = normalizedRole || 'client';

      // Debug logs para rutas de cliente
      if (isClientRoute) {
        console.log('🔍 Middleware - Verificando acceso:', {
          pathname,
          userRole,
          rawRole: payload.role,
          isClientRoute,
        });
      }

      // Validar acceso según el rol
      if (isAdminRoute && userRole !== 'admin') {
        // Solo admin puede acceder a rutas de admin
        return NextResponse.redirect(new URL('/', req.url));
      }

      if (isAdminOrOwnerRoute && userRole !== 'admin' && userRole !== 'owner' && userRole !== 'seller') {
        // Solo admin, owner y seller pueden acceder a /panel (ruta raíz)
        // Pero las rutas específicas se validan por separado
        if (!pathname.startsWith('/panel/owner') && !pathname.startsWith('/panel/cliente')) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }

      // ✅ DEV: todos los usuarios autenticados pueden ver Owner y Cliente.
      // El middleware solo exige sesión para estas rutas.

      // Si llegamos aquí, el acceso está permitido
      if (isClientRoute) {
        console.log('✅ Middleware - Acceso permitido para:', userRole, 'a', pathname);
      }
    } catch (error) {
      console.error('Error verifying session in middleware:', error);
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Permitir acceso a otras rutas
  return NextResponse.next();
}

// Sin matcher = se ejecuta en TODAS las rutas (necesario para que Basic Auth corra en Vercel).
// Opcional: si quieres excluir estáticos, usa: matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']

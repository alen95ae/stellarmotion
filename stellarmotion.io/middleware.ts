import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/error',
    '/auth/forgot-password',
    '/login',
    '/buscar-un-espacio',
    '/product',
    '/propietarios',
    '/owners/registrarse',
  ]
  
  // Rutas que requieren autenticación pero son accesibles para cualquier usuario autenticado
  const authenticatedRoutes = [
    '/owners/registrarse/info', // Paso 2 requiere autenticación
  ]

  // Rutas de API siempre son públicas (no requieren autenticación)
  const isApiRoute = pathname.startsWith('/api/')

  // Verificar si la ruta es pública
  const isPublicRoute = isApiRoute || publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Verificar si la ruta requiere autenticación (pero no rol específico)
  const isAuthenticatedRoute = authenticatedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Si es ruta que requiere autenticación y no hay usuario, redirigir a login
  if (isAuthenticatedRoute && !user) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Proteger /account - requiere autenticación
  if (pathname.startsWith('/account') && !user) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si está autenticado y trata de acceder a login/register, redirigir según su rol
  // Pero permitir acceso a /login si viene del registro de owner
  if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const userRole = user.user_metadata?.role as string | undefined
    let redirectPath = '/'
    
    switch (userRole) {
      case 'admin':
        redirectPath = '/panel/inicio'
        break
      case 'owner':
        redirectPath = '/panel/inicio'
        break
      case 'seller':
        redirectPath = '/panel/inicio'
        break
      case 'client':
        redirectPath = '/'
        break
    }
    
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  // Permitir acceso a /login incluso si está autenticado (para completar registro de owner)
  // La lógica de redirección se manejará en el componente

  // Si no está autenticado y trata de acceder a una ruta protegida, redirigir a login
  // Las rutas de API no requieren autenticación, así que las dejamos pasar
  if (!user && !isPublicRoute && !isApiRoute) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Proteger rutas según rol
  if (user) {
    const userRole = user.user_metadata?.role as string | undefined

    // Proteger /admin/** solo para admin
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Permitir acceso a /owners/registrarse/info para TODOS los usuarios autenticados
    // (necesario para que clients puedan convertirse en owners)
    if (pathname === '/owners/registrarse/info' || pathname === '/owners/registrarse') {
      // Permitir acceso a cualquier usuario autenticado
      return response
    }

    // Proteger /owners/dashboard/** solo para owner
    if (pathname.startsWith('/owners/dashboard') && userRole !== 'owner') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Proteger /seller/** solo para seller
    if (pathname.startsWith('/seller') && userRole !== 'seller') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Proteger /client/** solo para client
    if (pathname.startsWith('/client') && userRole !== 'client') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Proteger /panel/** para admin, owner y seller
    if (pathname.startsWith('/panel')) {
      if (userRole !== 'admin' && userRole !== 'owner' && userRole !== 'seller') {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

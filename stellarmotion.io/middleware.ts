import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Si las variables de entorno no están configuradas, permitir acceso (modo desarrollo)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase variables no configuradas en middleware. Permitiendo acceso sin autenticación.')
    return res
  }
  
  // Crear cliente de Supabase para el middleware
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })

  // Intentar obtener sesión
  let session = null
  try {
    const { data: { session: sessionData }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.log('Error getting session in middleware:', sessionError.message)
    } else {
      session = sessionData
    }
  } catch (error) {
    // Si no hay sesión, continuar sin autenticación
    console.log('No session found in middleware:', error)
  }

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/error',
    '/buscar-un-espacio',
    '/product',
    '/propietarios',
    '/owners/registrarse',
    '/owners/registrarse/info',
  ]

  // Rutas que requieren autenticación
  const protectedRoutes = [
    '/panel',
    '/owners/dashboard',
    '/agencias/dashboard',
  ]

  // Verificar si la ruta es pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Si es una ruta protegida y no hay sesión, redirigir a login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si está autenticado y trata de acceder a login/register, redirigir al panel
  if (session && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/panel/inicio', req.url))
  }

  // Verificar roles para rutas específicas
  if (session && isProtectedRoute) {
    // Determinar rol del usuario
    let userRole: string | null = null

    // Primero verificar si es owner (tabla owners)
    const { data: ownerData } = await supabase
      .from('owners')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (ownerData) {
      userRole = 'owner'
    } else {
      // Si no es owner, verificar en user_metadata
      userRole = session.user.user_metadata?.rol || null
    }

    // Proteger /panel/** solo para admin
    if (pathname.startsWith('/panel') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }

    // Proteger /owners/dashboard solo para owner
    if (pathname.startsWith('/owners/dashboard') && userRole !== 'owner') {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }

    // Proteger /agencias/dashboard solo para agency
    if (pathname.startsWith('/agencias/dashboard') && userRole !== 'agency') {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }
  }

  return res
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


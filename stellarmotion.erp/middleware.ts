import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que NUNCA deben pasar por la protección DEV_PASS (NextAuth, login, estáticos, etc.)
function isExcludedFromDevProtection(pathname: string): boolean {
  if (pathname.startsWith('/api/auth')) return true   // CRÍTICO: NextAuth debe funcionar sin Basic Auth
  if (pathname === '/login') return true              // Login público para evitar bucles con redirecciones NextAuth
  if (pathname.startsWith('/_next')) return true     // Internos Next.js
  if (pathname.startsWith('/static') || pathname.startsWith('/public')) return true
  if (pathname === '/favicon.ico' || pathname.startsWith('/favicon')) return true
  return false
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Paso libre: no aplicar DEV_PASS a auth ni estáticos (rompe el bucle de /api/auth/me)
  if (isExcludedFromDevProtection(pathname)) {
    return NextResponse.next()
  }

  if (!process.env.DEV_USER || !process.env.DEV_PASS) {
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')

  if (!auth) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="StellarMotion Dev"',
      },
    })
  }

  const [, encoded] = auth.split(' ')
  const decoded = atob(encoded)
  const [user, pass] = decoded.split(':')

  if (
    user !== process.env.DEV_USER ||
    pass !== process.env.DEV_PASS
  ) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

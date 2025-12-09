import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Rutas que requieren rol ADMIN
    const adminRoutes = [
      '/panel/soportes',
      '/panel/owners',
      '/panel/clientes',
      '/panel/reservas',
      '/panel/facturacion',
      '/panel/contactos'
    ]

    // Rutas que requieren rol OWNER
    const ownerRoutes = [
      '/panel/inicio',
      '/panel/anuncios',
      '/panel/mensajeria',
      '/panel/ajustes'
    ]

    // Verificar si la ruta requiere rol específico
    const requiresAdmin = adminRoutes.some(route => pathname.startsWith(route))
    const requiresOwner = ownerRoutes.some(route => pathname.startsWith(route))

    if (requiresAdmin && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (requiresOwner && token?.role !== 'owner') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = { 
  matcher: [
    "/panel/:path*",
    "/dashboard/:path*"
  ] 
}

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Rutas que requieren rol ADMIN
    const adminRoutes = [
      '/panel/soportes',
      '/panel/partners',
      '/panel/clientes',
      '/panel/reservas',
      '/panel/facturacion',
      '/panel/contactos'
    ]

    // Rutas que requieren rol PARTNER
    const partnerRoutes = [
      '/panel/inicio',
      '/panel/anuncios',
      '/panel/mensajeria',
      '/panel/ajustes'
    ]

    // Verificar si la ruta requiere rol específico
    const requiresAdmin = adminRoutes.some(route => pathname.startsWith(route))
    const requiresPartner = partnerRoutes.some(route => pathname.startsWith(route))

    if (requiresAdmin && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (requiresPartner && token?.role !== 'PARTNER') {
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

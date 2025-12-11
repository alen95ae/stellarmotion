// TEMPORAL: Se desactiva todo el middleware del ERP para poder entrar sin login
// ⚠️ IMPORTANTE: Reactivar la autenticación después de configurar usuarios y roles
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Permitir acceso libre a todas las rutas
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/api/erp/:path*"],
};

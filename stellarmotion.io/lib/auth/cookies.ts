import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';
const domain = process.env.COOKIE_DOMAIN || undefined;

export function createAuthCookie(name: string, token: string, maxAgeSec: number) {
  return serialize(name, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    domain,
    maxAge: maxAgeSec,
  });
}

export function clearAuthCookie(name: string) {
  return serialize(name, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    domain,
    maxAge: 0,
  });
}

/**
 * Limpia la cookie de sesión con el formato correcto para localhost
 * @param response - La respuesta NextResponse donde se limpiará la cookie
 */
export function clearSessionCookie(response: NextResponse) {
  response.headers.set(
    "Set-Cookie",
    `st_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure=false`
  );
}


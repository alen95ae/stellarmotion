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
 * Establece la cookie de sesión con el formato correcto
 * @param response - La respuesta NextResponse donde se establecerá la cookie
 * @param token - El token JWT a guardar
 */
export function setSessionCookie(response: NextResponse, token: string) {
  const maxAge = 7 * 24 * 60 * 60; // 7 días en segundos
  const cookie = createAuthCookie('st_session', token, maxAge);
  response.headers.set('Set-Cookie', cookie);
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


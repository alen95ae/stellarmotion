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
 * Establece la cookie de sesión con el formato correcto para localhost
 * @param response - La respuesta NextResponse donde se establecerá la cookie
 * @param token - El token JWT a guardar en la cookie
 */
export function setSessionCookie(response: NextResponse, token: string) {
  // Max-Age de 30 días (2592000 segundos)
  const maxAge = 2592000;
  const cookieValue = `st_session=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure=false`;
  
  response.headers.set("Set-Cookie", cookieValue);
  
  console.log('🍪 [setSessionCookie] Cookie establecida:', cookieValue.substring(0, 80) + '...');
  console.log('🍪 [setSessionCookie] Token length:', token.length);
  
  // Verificar que se estableció
  const verifyHeader = response.headers.get('Set-Cookie');
  if (verifyHeader) {
    console.log('✅ [setSessionCookie] Verificación: Cookie confirmada en headers');
  } else {
    console.error('❌ [setSessionCookie] ERROR: Cookie NO se pudo establecer');
  }
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
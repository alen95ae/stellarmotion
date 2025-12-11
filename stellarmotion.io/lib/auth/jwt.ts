import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-please-change-in-production"
);

export function signToken(payload: object, expiresIn: string | number = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken<T = any>(token: string): Promise<T | null> {
  try { 
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as T; 
  } catch (error: any) {
    console.error("JWT verification failed:", error.message);
    return null; 
  }
}


import { signToken, verifyToken } from './jwt';

const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

export interface SessionPayload {
  sub: string; // user id
  email: string;
  role?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export async function signSession(user: { id: string; email: string; role?: string; name?: string }): Promise<string> {
  return await signToken({
    sub: user.id,
    email: user.email,
    role: user.role || "client",
    name: user.name || ""
  }, JWT_EXPIRES);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  return await verifyToken<SessionPayload>(token);
}


import { NextResponse } from "next/server";

// Forzar runtime Node.js para consistencia
export const runtime = 'nodejs';

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true });

    res.headers.append(
      "Set-Cookie",
      "st_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );

    return res;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

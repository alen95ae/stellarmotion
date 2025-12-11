import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/cookies";

export async function POST() {
  console.log("LOGOUT triggered:", new Date().toISOString());
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}

// ❌ NO permitir GET: evita logout por prefetch / _rsc
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}


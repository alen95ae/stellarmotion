import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "FALTA",
    VALUE: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + "..."
      : null
  });
}



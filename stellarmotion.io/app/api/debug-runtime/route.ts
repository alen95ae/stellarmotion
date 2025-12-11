// Forzar runtime Node.js para acceso completo a process.env
export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    cwd: process.cwd(),
    envLoaded: Object.keys(process.env).filter(k =>
      k.includes("SUPABASE") ||
      k.includes("NEXT_PUBLIC") ||
      k.includes("SERVICE")
    ),
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING",
    runtime: process.env.NEXT_RUNTIME || "node",
  });
}

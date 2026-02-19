export const dynamic = "force-dynamic";

export async function POST() {
  console.log("TEST DEBUG HIT");
  return Response.json({ ok: true });
}

export const dynamic = "force-dynamic";

export default function EnvCheck() {
  const pub = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY.replace(/^(.{6}).+(.{4})$/, "$1•••$2")
    : "NO CARGADA";
  const srv = process.env.GOOGLE_MAPS_SERVER_KEY ? "CARGADA" : "NO CARGADA";

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Env Check</h1>
      <p>Cliente: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: <b>{pub}</b></p>
      <p>Servidor: GOOGLE_MAPS_API_KEY: <b>{srv}</b></p>
      <ul className="list-disc pl-6 mt-4 space-y-2">
        <li><a className="text-blue-600 underline" href="/test-map">/test-map</a></li>
        <li><a className="text-blue-600 underline" href="/api/places?q=La%20Paz">/api/places?q=La Paz</a></li>
      </ul>
    </main>
  );
}

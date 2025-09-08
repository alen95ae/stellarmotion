"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  console.error("GlobalError:", error);
  return (
    <html><body className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border mb-3">
        {error?.message}
      </pre>
      <button onClick={() => reset()} className="px-4 py-2 rounded bg-black text-white">Reintentar</button>
    </body></html>
  );
}

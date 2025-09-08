'use client';

export default function GlobalError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void 
}) {
  return (
    <div className="min-h-[70vh] p-8 space-y-4">
      <h1 className="text-3xl font-extrabold">Algo salió mal</h1>
      <pre className="bg-neutral-50 border rounded p-4 text-sm whitespace-pre-wrap">
        {String(error?.message || error)}
      </pre>
      <button 
        onClick={reset} 
        className="px-4 py-2 rounded bg-black text-white"
      >
        Reintentar
      </button>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * El módulo de alquileres del dashboard Brand fue sustituido por Solicitudes.
 * Redirigir a solicitudes para no romper enlaces antiguos.
 */
export default function ClienteAlquileresPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/panel/cliente/solicitudes');
  }, [router]);
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Redirigiendo a Solicitudes...</p>
    </div>
  );
}



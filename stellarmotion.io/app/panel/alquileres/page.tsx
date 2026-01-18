import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/alquileres a /panel/owner/alquileres
 */
export default function AlquileresRedirect() {
  redirect('/panel/owner/alquileres');
}

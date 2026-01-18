import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/mapa a /panel/owner/mapa
 */
export default function MapaRedirect() {
  redirect('/panel/owner/mapa');
}

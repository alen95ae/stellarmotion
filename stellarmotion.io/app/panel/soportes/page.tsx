import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/soportes a /panel/owner/soportes
 */
export default function SoportesRedirect() {
  redirect('/panel/owner/soportes');
}

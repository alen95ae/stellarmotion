import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/clientes a /panel/owner/clientes
 */
export default function ClientesRedirect() {
  redirect('/panel/owner/clientes');
}

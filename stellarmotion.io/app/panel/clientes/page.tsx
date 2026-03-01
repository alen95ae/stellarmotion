import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/clientes al inicio del panel owner
 */
export default function ClientesRedirect() {
  redirect('/panel/owner/inicio');
}

import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/mantenimiento al inicio del panel owner
 */
export default function MantenimientoRedirect() {
  redirect('/panel/owner/inicio');
}

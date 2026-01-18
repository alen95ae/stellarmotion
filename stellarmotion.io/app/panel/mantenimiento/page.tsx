import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/mantenimiento a /panel/owner/mantenimiento
 */
export default function MantenimientoRedirect() {
  redirect('/panel/owner/mantenimiento');
}

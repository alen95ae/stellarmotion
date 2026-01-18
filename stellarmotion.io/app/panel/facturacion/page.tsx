import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/facturacion a /panel/owner/facturacion
 */
export default function FacturacionRedirect() {
  redirect('/panel/owner/facturacion');
}

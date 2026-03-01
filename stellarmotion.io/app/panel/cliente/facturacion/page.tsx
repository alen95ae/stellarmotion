import { redirect } from 'next/navigation';

/**
 * Redirige desde /panel/cliente/facturacion a /panel/cliente/pagos
 */
export default function ClienteFacturacionRedirect() {
  redirect('/panel/cliente/pagos');
}

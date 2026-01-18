import { redirect } from 'next/navigation';

/**
 * Redirige desde la ruta antigua /panel/metricas a /panel/owner/metricas
 */
export default function MetricasRedirect() {
  redirect('/panel/owner/metricas');
}

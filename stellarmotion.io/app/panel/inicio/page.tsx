import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/auth/get-user-role';

/**
 * Redirige desde la ruta antigua /panel/inicio según el rol
 */
export default async function InicioRedirect() {
  const userRole = await getUserRole();

  if (!userRole) {
    redirect('/auth/login');
  }

  switch (userRole) {
    case 'owner':
    case 'admin':
    case 'seller':
      redirect('/panel/owner/inicio');
    case 'client':
      redirect('/panel/cliente/inicio');
    default:
      redirect('/panel');
  }
}

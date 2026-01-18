import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/auth/get-user-role';

/**
 * Página raíz del panel - redirige según el rol del usuario
 */
export default async function PanelPage() {
  const userRole = await getUserRole();

  if (!userRole) {
    redirect('/auth/login');
  }

  // Redirigir según el rol
  switch (userRole) {
    case 'owner':
    case 'admin':
    case 'seller':
      redirect('/panel/owner/inicio');
    case 'client':
      redirect('/panel/cliente/inicio');
    default:
      redirect('/');
  }
}

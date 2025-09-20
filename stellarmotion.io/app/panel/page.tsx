import { redirect } from 'next/navigation';

export default function PanelPage() {
  // Redirigir automáticamente a la página de inicio del panel
  redirect('/panel/inicio');
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OwnerSidebar from '@/components/sidebar/OwnerSidebar';
import { canAccessOwnerPanel } from '@/lib/auth/can-access-owner-panel';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar autorización del lado del usuario
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (!response.ok) {
          router.replace('/auth/login?next=/panel/owner/inicio');
          return;
        }

        const data = await response.json();
        const role = data?.user?.role || data?.user?.rol;
        if (!canAccessOwnerPanel(role)) {
          setIsAuthorized(false);
          router.replace('/owner/paso-2');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.replace('/auth/login?next=/panel/owner/inicio');
      }
    };
    checkAuth();
  }, [router]);

  if (isAuthorized === null) {
    return <div>Cargando...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      {/* Main content - ajustado para el sidebar */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-64'} pt-0 mt-0`}>
        {/* Spacer estructural para compensar header fijo (64px = h-16) */}
        <div style={{ height: '64px', margin: 0, padding: 0 }} className="bg-gray-50 dark:bg-gray-950" aria-hidden="true" />
        <main className="pb-0 pt-0 mt-0">
          <div className="w-full px-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


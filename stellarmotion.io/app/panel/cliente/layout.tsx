'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClienteSidebar from '@/components/sidebar/ClienteSidebar';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar autorización del lado del cliente
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (!response.ok) {
          router.push('/');
          return;
        }
        // ✅ DEV: cualquier usuario autenticado puede ver Owner y Cliente
        // (selección de vista desde el header).
        setIsAuthorized(true);
      } catch (error) {
        router.push('/');
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
      <ClienteSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      {/* Main content - ajustado para el header y sidebar */}
      <div className={`pt-16 transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-64'}`}>
        <main className="py-2">
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


/**
 * Layout principal del panel - Mantiene compatibilidad con rutas antiguas
 * Las rutas específicas por rol tienen sus propios layouts
 * Este layout se usa para rutas comunes como /panel/mensajeria y /panel/ajustes
 */
export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

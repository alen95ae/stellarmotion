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
      <main className="pb-1">
        <div className="w-full px-2">
          {children}
        </div>
      </main>
    </div>
  );
}

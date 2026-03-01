'use client';

export default function BrandLayout({
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

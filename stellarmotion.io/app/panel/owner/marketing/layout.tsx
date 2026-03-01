import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketing · Campañas | Stellarmotion',
  description: 'Gestiona tus campañas OOH y DOOH',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

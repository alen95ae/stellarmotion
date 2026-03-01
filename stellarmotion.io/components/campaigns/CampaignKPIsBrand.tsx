import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, Target, Layers, TrendingUp } from 'lucide-react';
import type { Campaign } from '@/types/campaigns';

function formatEur(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

interface CampaignKPIsBrandProps {
  campaigns: Campaign[];
}

export default function CampaignKPIsBrand({ campaigns }: CampaignKPIsBrandProps) {
  const gastoTotal = campaigns
    .filter((c) => c.status !== 'borrador')
    .reduce((s, c) => s + Number(c.budget ?? 0), 0);
  const campañasActivas = campaigns.filter((c) => c.status === 'activa').length;
  const totalCampañas = campaigns.length;
  const cpmPromedio = '€ 3.50';

  const items = [
    { label: 'Gasto Total', value: formatEur(gastoTotal), icon: Euro },
    { label: 'Campañas Activas', value: String(campañasActivas), icon: Target },
    { label: 'Total Campañas', value: String(totalCampañas), icon: Layers },
    { label: 'CPM Promedio', value: cpmPromedio, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifySession } from '@/lib/auth/session';
import { getAdminSupabase } from '@/lib/supabase/admin';
import CampaignKPIsBrand from '@/components/campaigns/CampaignKPIsBrand';
import CampaignsTableBrand from '@/components/campaigns/CampaignsTableBrand';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Campaign } from '@/types/campaigns';

export const metadata = {
  title: 'Ads Manager · Campañas | Stellarmotion',
  description: 'Gestiona tus campañas OOH y DOOH',
};

export default async function BrandCampaignsPage() {
  const cookieStore = await cookies();
  const st = cookieStore.get('st_session');
  if (!st?.value) {
    redirect('/auth/login?next=/panel/brand/campaigns');
  }

  const payload = await verifySession(st.value);
  if (!payload?.sub) {
    redirect('/auth/login?next=/panel/brand/campaigns');
  }

  const userId = payload.sub;
  const supabase = getAdminSupabase();
  const { data: rows, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[brand/campaigns] list error:', error);
  }

  const campaigns: Campaign[] = (rows ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    brand_id: String(r.brand_id),
    name: String(r.name ?? ''),
    status: (r.status as Campaign['status']) ?? 'borrador',
    budget: Number(r.budget ?? 0),
    start_date: String(r.start_date ?? ''),
    end_date: String(r.end_date ?? ''),
    delivery_type: r.delivery_type != null ? String(r.delivery_type) : undefined,
    objective: r.objective != null ? String(r.objective) : undefined,
    created_at: String(r.created_at ?? ''),
    updated_at: r.updated_at != null ? String(r.updated_at) : null,
    spent: r.spent != null ? Number(r.spent) : undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Ads Manager</h1>
          <p className="text-sm text-muted-foreground">Gestiona tus campañas OOH y DOOH</p>
        </div>
        <Button asChild className="bg-[#e94446] hover:bg-[#e94446]/90">
          <Link href="/panel/brand/campaigns/crear">
            <Plus className="mr-2 h-4 w-4" />
            Crear Campaña
          </Link>
        </Button>
      </div>

      <CampaignKPIsBrand campaigns={campaigns} />
      <CampaignsTableBrand campaigns={campaigns} basePath="/panel/brand/campaigns" />
    </div>
  );
}

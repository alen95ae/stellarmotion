'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CampaignKPIs from './CampaignKPIs';
import CampaignsTable from './CampaignsTable';
import type {
  CampaignsSummary,
  CampaignRow,
  CampaignStatusFilter,
} from '@/types/campaigns';

interface CampaignDashboardClientProps {
  /** Ruta base del módulo (ej. /panel/owner/marketing) */
  basePath?: string;
}

export default function CampaignDashboardClient({ basePath = '/panel/owner/marketing' }: CampaignDashboardClientProps = {}) {
  const [summary, setSummary] = useState<CampaignsSummary | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>('todas');

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/campaigns', { credentials: 'include' });
        if (cancelled) return;
        if (!res.ok) {
          setError('No se pudieron cargar las campañas');
          return;
        }
        const data = await res.json();
        setSummary(data.summary ?? null);
        setCampaigns(data.campaigns ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error de conexión');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleToggleStatus = (campaign: CampaignRow, active: boolean) => {
    // TODO: PATCH /api/campaigns/[id] para actualizar status
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaign.id
          ? { ...c, status: active ? 'activa' : 'pausada' }
          : c
      )
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Campañas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona tus campañas OOH y DOOH
          </p>
        </div>
      </header>

      {error && (
        <div
          className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <CampaignKPIs summary={summary} loading={loading} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar por nombre o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-lg border-gray-200 dark:border-gray-700"
              aria-label="Buscar campañas"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as CampaignStatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="activa">Activa</SelectItem>
              <SelectItem value="pausada">Pausada</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href={`${basePath}/crear`} className="shrink-0">
          <Button
            className="rounded-lg bg-[#e94446] hover:bg-[#d63a3a] text-white font-medium gap-2"
            size="default"
          >
            <Plus className="h-4 w-4" />
            Crear Campaña
          </Button>
        </Link>
      </div>

      <CampaignsTable
        campaigns={campaigns}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onToggleStatus={handleToggleStatus}
        loading={loading}
        basePath={basePath}
      />
    </div>
  );
}

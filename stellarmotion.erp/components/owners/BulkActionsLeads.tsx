"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GitBranch, Download, UserPlus, Trash2 } from "lucide-react";

interface BulkActionsLeadsProps {
  selectedCount: number;
  onBulkExportSelection: () => void;
  onBulkConvert: () => void;
  onBulkKill: () => void;
}

export default function BulkActionsLeads({
  selectedCount,
  onBulkExportSelection,
  onBulkConvert,
  onBulkKill,
}: BulkActionsLeadsProps) {
  if (selectedCount === 0) return null;
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 border-t border-border bg-muted/20 p-4">
      <span className="text-sm text-muted-foreground">
        {selectedCount} elemento{selectedCount !== 1 ? "s" : ""} seleccionado
        {selectedCount !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/panel/crm")}
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Enviar a pipeline
        </Button>
        <Button variant="outline" size="sm" onClick={onBulkExportSelection}>
          <Download className="w-4 h-4 mr-2" />
          Exportar selección
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-[#e94446] hover:text-[#e94446]"
          onClick={onBulkConvert}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Convertir a contacto
        </Button>
        <Button variant="destructive" size="sm" onClick={onBulkKill}>
          <Trash2 className="w-4 h-4 mr-2" />
          Matar lead (a papelera)
        </Button>
      </div>
    </div>
  );
}

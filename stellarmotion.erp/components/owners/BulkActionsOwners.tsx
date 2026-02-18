"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, Trash2, Send, Trash } from "lucide-react";

interface BulkActionsOwnersProps {
  selectedCount: number;
  onBulkRelationChange: (relation: string) => void;
  onBulkOrigenChange: (origen: string) => void;
  onBulkExportSelection: () => void;
  onBulkPapelera: () => void;
  onBulkDelete: () => void;
  uniqueOrigenes: string[];
}

const RELATION_LABELS: Record<string, string> = {
  CUSTOMER: "Cliente",
  SUPPLIER: "Proveedor",
};

export default function BulkActionsOwners({
  selectedCount,
  onBulkRelationChange,
  onBulkOrigenChange,
  onBulkExportSelection,
  onBulkPapelera,
  onBulkDelete,
  uniqueOrigenes,
}: BulkActionsOwnersProps) {
  const [relationSelect, setRelationSelect] = useState("");
  const [origenSelect, setOrigenSelect] = useState("");
  const router = useRouter();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 border-t border-border bg-muted/20 p-4 flex-wrap">
      <span className="text-sm text-muted-foreground">
        {selectedCount} elemento{selectedCount !== 1 ? "s" : ""} seleccionado
        {selectedCount !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-2 flex-wrap items-center">
        <Select
          value={relationSelect}
          onValueChange={(v) => {
            if (v) {
              onBulkRelationChange(v);
              setRelationSelect("");
            }
          }}
        >
          <SelectTrigger className="w-36 overflow-hidden [&>svg]:shrink-0">
            <SelectValue placeholder="Relación" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RELATION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={origenSelect}
          onValueChange={(v) => {
            if (v) {
              onBulkOrigenChange(v);
              setOrigenSelect("");
            }
          }}
        >
          <SelectTrigger className="w-36 overflow-hidden [&>svg]:shrink-0">
            <SelectValue placeholder="Origen" />
          </SelectTrigger>
          <SelectContent>
            {uniqueOrigenes.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
            {uniqueOrigenes.length === 0 && (
              <SelectItem value="_empty" disabled>Sin valores</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => router.push("/panel/crm")}>
          <Send className="w-4 h-4 mr-2" />
          Enviar a pipeline
        </Button>
        <Button variant="outline" size="sm" onClick={onBulkExportSelection}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar selección
        </Button>
        <Button variant="outline" size="sm" onClick={onBulkPapelera}>
          <Trash className="w-4 h-4 mr-2" />
          Papelera
        </Button>
        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar
        </Button>
      </div>
    </div>
  );
}

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
    <div className="pt-4 mx-4">
      {/* Ventana ediciones masivas: mismo rojo que estado Ocupado en soportes */}
      <div className="p-4 rounded-xl bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-red-800 dark:text-red-400 font-medium">
            <span className="font-semibold">
              {selectedCount}
            </span>
            {" "}elemento{selectedCount !== 1 ? "s" : ""} seleccionado{selectedCount !== 1 ? "s" : ""}
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
            <SelectTrigger className="w-36 overflow-hidden [&>svg]:shrink-0 dark:bg-[#1E1E1E] dark:hover:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:text-[#FFFFFF] dark:[&>span]:text-[#9CA3AF]">
              <SelectValue placeholder="Relación" />
            </SelectTrigger>
            <SelectContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
              {Object.entries(RELATION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value} className="dark:text-[#FFFFFF] dark:focus:bg-[#1E1E1E] dark:hover:bg-[#1E1E1E]">
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
            <SelectTrigger className="w-36 overflow-hidden [&>svg]:shrink-0 dark:bg-[#1E1E1E] dark:hover:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:text-[#FFFFFF] dark:[&>span]:text-[#9CA3AF]">
              <SelectValue placeholder="Origen" />
            </SelectTrigger>
            <SelectContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
              {uniqueOrigenes.map((o) => (
                <SelectItem key={o} value={o} className="dark:text-[#FFFFFF] dark:focus:bg-[#1E1E1E] dark:hover:bg-[#1E1E1E]">
                  {o}
                </SelectItem>
              ))}
              {uniqueOrigenes.length === 0 && (
                <SelectItem value="_empty" disabled>Sin valores</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => router.push("/panel/crm")} className="dark:border-[#2a2a2a] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]">
          <Send className="w-4 h-4 mr-2" />
          Enviar a pipeline
        </Button>
          <Button variant="outline" size="sm" onClick={onBulkExportSelection} className="dark:border-[#2a2a2a] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar selección
        </Button>
        <Button variant="outline" size="sm" onClick={onBulkPapelera} className="dark:border-[#2a2a2a] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]">
          <Trash className="w-4 h-4 mr-2" />
          Papelera
        </Button>
        <Button variant="destructive" size="sm" onClick={onBulkDelete} className="dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600/10">
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar
        </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

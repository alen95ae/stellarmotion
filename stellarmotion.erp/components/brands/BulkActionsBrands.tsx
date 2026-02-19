"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Trash2, Send, Trash, Rat, Rabbit, Squirrel } from "lucide-react";

const relationBtnClass = (active: boolean) =>
  active
    ? "bg-[#e94446] text-white border-[#e94446] hover:bg-[#D7514C] dark:bg-[#e94446] dark:border-[#e94446] dark:hover:bg-[#D7514C] dark:text-white"
    : "dark:border-[#2a2a2a] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]";

interface BulkActionsBrandsProps {
  selectedCount: number;
  relationsInSelection: string[];
  onBulkRelationChange: (relation: string) => void;
  onBulkExportSelection: () => void;
  onBulkPapelera: () => void;
  onBulkDelete: () => void;
  editedCount: number;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  savingChanges: boolean;
}

export default function BulkActionsBrands({
  selectedCount,
  relationsInSelection,
  onBulkRelationChange,
  onBulkExportSelection,
  onBulkPapelera,
  onBulkDelete,
  editedCount,
  onSaveChanges,
  onDiscardChanges,
  savingChanges,
}: BulkActionsBrandsProps) {
  const router = useRouter();

  if (selectedCount === 0 && editedCount === 0) return null;

  return (
    <div className="pt-4 mx-4">
      <div className="p-4 rounded-xl bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-red-800 dark:text-red-400 font-medium">
              <span className="font-semibold">{selectedCount}</span>
              {" "}elemento{selectedCount !== 1 ? "s" : ""} seleccionado{selectedCount !== 1 ? "s" : ""}
            </span>

            {selectedCount >= 1 && (
              <>
                <Button variant="outline" size="sm" onClick={() => onBulkRelationChange("BRAND")} title="Brands" className={relationBtnClass(relationsInSelection.includes("BRAND"))}>
                  <Rat className="w-4 h-4 mr-2" />
                  Brands
                </Button>
                <Button variant="outline" size="sm" onClick={() => onBulkRelationChange("OWNER")} title="Owners" className={relationBtnClass(relationsInSelection.includes("OWNER"))}>
                  <Rabbit className="w-4 h-4 mr-2" />
                  Owners
                </Button>
                <Button variant="outline" size="sm" onClick={() => onBulkRelationChange("MAKER")} title="Makers" className={relationBtnClass(relationsInSelection.includes("MAKER"))}>
                  <Squirrel className="w-4 h-4 mr-2" />
                  Makers
                </Button>
              </>
            )}

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

          {editedCount > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onSaveChanges}
                disabled={savingChanges}
                className="bg-[#e94446] hover:bg-[#D7514C] text-white"
              >
                {savingChanges ? "Guardando..." : `Guardar cambios (${editedCount})`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDiscardChanges}
              >
                Descartar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

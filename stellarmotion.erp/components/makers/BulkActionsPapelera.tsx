"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface BulkActionsPapeleraProps {
  selectedCount: number;
  onBulkRestore: () => void;
}

export default function BulkActionsPapelera({
  selectedCount,
  onBulkRestore,
}: BulkActionsPapeleraProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="pt-4 mx-4">
      <div className="p-4 rounded-xl bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-red-800 dark:text-red-400 font-medium">
            <span className="font-semibold">{selectedCount}</span>
            {" "}elemento{selectedCount !== 1 ? "s" : ""} seleccionado{selectedCount !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2 flex-wrap items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkRestore}
              className="border-border text-foreground hover:bg-muted dark:border-[#2a2a2a] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar todos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

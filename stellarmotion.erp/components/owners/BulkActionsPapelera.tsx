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
    <div className="flex items-center gap-2 border-t border-border bg-muted/20 p-4">
      <span className="text-sm text-muted-foreground">
        {selectedCount} elemento{selectedCount !== 1 ? "s" : ""} seleccionado
        {selectedCount !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onBulkRestore}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar todos
        </Button>
      </div>
    </div>
  );
}

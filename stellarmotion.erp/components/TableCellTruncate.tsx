"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MAX_CH = 22;

export function TableCellTruncate({
  value,
  maxCh = MAX_CH,
  className = "",
}: {
  value: string | undefined | null;
  maxCh?: number;
  className?: string;
}) {
  const text = value ?? "—";
  const display = String(text);
  const needsTooltip = display.length > maxCh;

  if (needsTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block truncate" style={{ maxWidth: `${maxCh}ch` }}>
              {display}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs break-words">
            {display}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return <span className={className}>{display}</span>;
}

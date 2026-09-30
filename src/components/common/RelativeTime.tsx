import { useEffect, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatAbsolute, formatRelative } from "@/lib/formatters";

export function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => formatRelative(iso, new Date(iso).getTime()));

  useEffect(() => {
    setLabel(formatRelative(iso));
    const id = setInterval(() => setLabel(formatRelative(iso)), 30_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={iso} className="text-sm text-muted-foreground tabular-nums">
          {label}
        </time>
      </TooltipTrigger>
      <TooltipContent>
        <span className="font-mono text-xs">{formatAbsolute(iso)}</span>
      </TooltipContent>
    </Tooltip>
  );
}

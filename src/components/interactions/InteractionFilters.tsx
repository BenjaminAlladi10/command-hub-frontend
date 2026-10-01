import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMANDS, INTERACTION_STATUSES, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { Guild, InteractionStatus } from "@/types";

export interface FilterValues {
  status?: InteractionStatus;
  command?: string;
  guildId?: string;
  q?: string;
}

const ALL = "__all";
const STATUS_LABEL: Record<InteractionStatus, string> = {
  received: "Received",
  replied: "Replied",
  failed: "Failed",
};

export function InteractionFilters({
  value,
  guilds,
  onChange,
}: {
  value: FilterValues;
  guilds: Guild[];
  onChange: (next: FilterValues) => void;
}) {
  const [q, setQ] = useState(value.q ?? "");

  useEffect(() => setQ(value.q ?? ""), [value.q]);

  useEffect(() => {
    if ((value.q ?? "") === q) return;
    const t = setTimeout(() => onChange({ ...value, q: q || undefined }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q, value, onChange]);

  const hasFilters = Boolean(value.status || value.command || value.guildId || value.q);

  return (
    <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          aria-label="Search interactions"
          placeholder="Search message, user or ID"
          className="pl-8"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 lg:flex">
        <Select
          value={value.status ?? ALL}
          onValueChange={(v) => onChange({ ...value, status: v === ALL ? undefined : (v as InteractionStatus) })}
        >
          <SelectTrigger aria-label="Status" className="lg:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {INTERACTION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={value.command ?? ALL}
          onValueChange={(v) => onChange({ ...value, command: v === ALL ? undefined : v })}
        >
          <SelectTrigger aria-label="Command" className="lg:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All commands</SelectItem>
            {COMMANDS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={value.guildId ?? ALL}
          onValueChange={(v) => onChange({ ...value, guildId: v === ALL ? undefined : v })}
        >
          <SelectTrigger aria-label="Guild" className="lg:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All guilds</SelectItem>
            {guilds.map((g) => (
              <SelectItem key={g.guildId} value={g.guildId}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          <X className="size-4" aria-hidden="true" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}

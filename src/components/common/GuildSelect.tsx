import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Guild } from "@/types";

export function GuildSelect({
  guilds,
  value,
  onChange,
}: {
  guilds: Guild[];
  value: string | undefined;
  onChange: (guildId: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="Guild" className="w-full sm:w-60">
        <SelectValue placeholder="Select a guild" />
      </SelectTrigger>
      <SelectContent>
        {guilds.map((g) => (
          <SelectItem key={g.guildId} value={g.guildId}>{g.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import { request } from "@/api/client";
import { asCommand } from "@/api/normalize";
import { commandSlug } from "@/lib/constants";
import type { CommandConfig } from "@/types";

export async function listCommands(guildId: string): Promise<CommandConfig[]> {
  const payload = await request<Array<Omit<CommandConfig, "guildId"> & { guildId?: string }>>(
    `/api/commands?guildId=${encodeURIComponent(guildId)}`,
  );
  return payload.map((command) => asCommand(command, guildId));
}

export interface UpdateCommandInput {
  guildId: string;
  name: string;
  enabled: boolean;
  rule: CommandConfig["rule"];
}

export async function updateCommand(input: UpdateCommandInput): Promise<CommandConfig> {
  const payload = await request<Omit<CommandConfig, "guildId"> & { guildId?: string }>(
    `/api/commands/${encodeURIComponent(commandSlug(input.name))}?guildId=${encodeURIComponent(input.guildId)}`,
    { method: "PUT", body: { enabled: input.enabled, rule: input.rule } },
  );
  return asCommand(payload, input.guildId);
}

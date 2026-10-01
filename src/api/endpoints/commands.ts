import { request, USE_MOCK } from "@/api/client";
import { getDb, latency, requireSession } from "@/api/mock/store";
import { ApiError } from "@/lib/api-error";
import { commandSlug } from "@/lib/constants";
import type { CommandConfig } from "@/types";

export async function listCommands(guildId: string): Promise<CommandConfig[]> {
  if (!USE_MOCK) return request(`/api/commands?guildId=${encodeURIComponent(guildId)}`);

  await latency();
  requireSession();
  return structuredClone(getDb().commands.filter((c) => c.guildId === guildId));
}

export interface UpdateCommandInput {
  guildId: string;
  name: string;
  enabled: boolean;
  rule: CommandConfig["rule"];
}

export async function updateCommand(input: UpdateCommandInput): Promise<CommandConfig> {
  if (!USE_MOCK) {
    return request(
      `/api/commands/${encodeURIComponent(commandSlug(input.name))}?guildId=${encodeURIComponent(input.guildId)}`,
      { method: "PUT", body: { enabled: input.enabled, rule: input.rule } },
    );
  }

  await latency();
  requireSession();
  const existing = getDb().commands.find(
    (c) => c.guildId === input.guildId && c.name === input.name,
  );
  if (!existing) throw new ApiError(404, "Command not found");
  existing.enabled = input.enabled;
  existing.rule = { ...input.rule, flagKeywords: [...input.rule.flagKeywords] };
  return structuredClone(existing);
}

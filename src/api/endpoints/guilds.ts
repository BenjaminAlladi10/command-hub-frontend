import { request, USE_MOCK } from "@/api/client";
import { getDb, latency, requireSession } from "@/api/mock/store";
import { ApiError } from "@/lib/api-error";
import type { Guild } from "@/types";

export async function listGuilds(): Promise<Guild[]> {
  if (!USE_MOCK) return request("/api/guilds");

  await latency();
  requireSession();
  return structuredClone(getDb().guilds);
}

export interface UpdateGuildInput {
  guildId: string;
  name: string;
  channelId: string;
  channels: Guild["channels"];
  /** Write-only. Omitted when unchanged; never read back. */
  mirrorWebhook?: string;
}

export async function updateGuild(input: UpdateGuildInput): Promise<Guild> {
  const { guildId, ...body } = input;
  if (!USE_MOCK) {
    return request(`/api/guilds/${encodeURIComponent(guildId)}`, { method: "PUT", body });
  }

  await latency();
  requireSession();
  const guild = getDb().guilds.find((g) => g.guildId === guildId);
  if (!guild) throw new ApiError(404, "Guild not found");

  guild.name = body.name;
  guild.channelId = body.channelId;
  guild.channels = structuredClone(body.channels);
  if (body.mirrorWebhook) guild.mirrorConfigured = true;
  return structuredClone(guild);
}

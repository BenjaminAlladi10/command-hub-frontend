import { request } from "@/api/client";
import { asGuild } from "@/api/normalize";
import type { Guild } from "@/types";

export async function listGuilds(): Promise<Guild[]> {
  const payload = await request<Array<Guild & { channelId: string | null }>>("/api/guilds");
  return payload.map(asGuild);
}

export interface UpdateGuildInput {
  guildId: string;
  name: string;
  channelId: string | null;
  channels: Guild["channels"];
  /** Write-only. Omitted when unchanged; never read back. */
  mirrorWebhook?: string;
}

export async function updateGuild(input: UpdateGuildInput): Promise<Guild> {
  const { guildId, ...body } = input;
  const payload = await request<Guild & { channelId: string | null }>(
    `/api/guilds/${encodeURIComponent(guildId)}`,
    { method: "PUT", body },
  );
  return asGuild(payload);
}

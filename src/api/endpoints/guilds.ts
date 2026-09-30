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

export async function updateGuild(input: {
  guildId: string;
  channelId: string;
  mirrorWebhook?: string;
}): Promise<Guild> {
  if (!USE_MOCK) {
    return request(`/api/guilds/${encodeURIComponent(input.guildId)}`, {
      method: "PUT",
      body: { channelId: input.channelId, mirrorWebhook: input.mirrorWebhook },
    });
  }

  await latency();
  requireSession();
  const db = getDb();
  const guild = db.guilds.find((g) => g.guildId === input.guildId);
  if (!guild) throw new ApiError(404, "Server not found");

  guild.channelId = input.channelId;
  if (input.mirrorWebhook) {
    // Write-only: stored server-side, never returned to the client.
    db.mirrorSecrets[input.guildId] = "configured";
    guild.mirrorConfigured = true;
  }
  return structuredClone(guild);
}

export async function getInviteUrl(): Promise<{ url: string }> {
  if (!USE_MOCK) return request("/api/guilds/invite-url");

  await latency(150, 400);
  requireSession();
  return { url: getDb().inviteUrl };
}

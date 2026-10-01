import type { Action, CommandConfig, Guild, Interaction, User } from "@/types";

export function displayCommand(name: string): string {
  return name.startsWith("/") ? name : `/${name}`;
}

function iso(value: string | Date | null | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value.toISOString();
}

export function asUser(payload: unknown): User {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.id === "string" && typeof record.email === "string") {
      return { id: record.id, email: record.email };
    }
    const nested = record.user;
    if (nested && typeof nested === "object") {
      const user = nested as Record<string, unknown>;
      if (typeof user.id === "string" && typeof user.email === "string") {
        return { id: user.id, email: user.email };
      }
    }
  }
  throw new Error("Unexpected auth response");
}

export function asCommand(raw: Omit<CommandConfig, "guildId"> & { guildId?: string }, guildId: string): CommandConfig {
  return {
    guildId: raw.guildId ?? guildId,
    name: displayCommand(raw.name),
    enabled: raw.enabled,
    rule: raw.rule,
  };
}

export function asGuild(raw: Guild & { channelId: string | null }): Guild {
  return {
    guildId: raw.guildId,
    name: raw.name,
    channelId: raw.channelId ?? "",
    channels: Array.isArray(raw.channels) ? raw.channels : [],
    mirrorConfigured: Boolean(raw.mirrorConfigured),
    connectedAt: iso(raw.connectedAt),
  };
}

export function asInteraction(raw: Interaction): Interaction {
  return {
    ...raw,
    command: displayCommand(raw.command),
    receivedAt: iso(raw.receivedAt),
    aiSummary: raw.aiSummary ?? null,
    aiTags: raw.aiTags ?? [],
    actions: (raw.actions ?? []).map((action) => asAction(action, raw.id)),
  };
}

function asAction(action: Action, interactionId: string): Action {
  return {
    ...action,
    interactionId: action.interactionId || interactionId,
    lastError: action.lastError ?? null,
    nextRetryAt: action.nextRetryAt ? iso(action.nextRetryAt) : null,
    updatedAt: iso(action.updatedAt),
  };
}

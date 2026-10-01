import { request, USE_MOCK } from "@/api/client";
import { getDb, latency, maybeFail, requireSession } from "@/api/mock/store";
import { ApiError } from "@/lib/api-error";
import { PAGE_SIZE } from "@/lib/constants";
import type { Interaction, InteractionPage, InteractionQuery } from "@/types";

function buildSearch(query: InteractionQuery): string {
  const params = new URLSearchParams();
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status && query.status !== "all") params.set("status", query.status);
  if (query.command) params.set("command", query.command);
  if (query.guildId) params.set("guildId", query.guildId);
  if (query.q) params.set("q", query.q);
  const search = params.toString();
  return search ? `?${search}` : "";
}

export async function listInteractions(query: InteractionQuery): Promise<InteractionPage> {
  if (!USE_MOCK) return request(`/api/interactions${buildSearch(query)}`);

  await latency();
  requireSession();
  maybeFail(0.03);

  const limit = query.limit ?? PAGE_SIZE;
  const needle = query.q?.trim().toLowerCase();

  const filtered = getDb()
    .interactions.filter((i) => {
      if (query.status && query.status !== "all" && i.status !== query.status) return false;
      if (query.command && i.command !== query.command) return false;
      if (query.guildId && i.guildId !== query.guildId) return false;
      if (needle) {
        const haystack = `${i.text} ${i.username} ${i.id}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    })
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));

  const start = query.cursor ? filtered.findIndex((i) => i.id === query.cursor) + 1 : 0;
  const items = filtered.slice(start, start + limit);
  const nextCursor =
    start + limit < filtered.length ? (items[items.length - 1]?.id ?? null) : null;

  return { items: structuredClone(items), nextCursor };
}

export async function getInteraction(id: string): Promise<Interaction> {
  if (!USE_MOCK) return request(`/api/interactions/${encodeURIComponent(id)}`);

  await latency();
  requireSession();
  const found = getDb().interactions.find((i) => i.id === id);
  if (!found) throw new ApiError(404, "Interaction not found");
  return structuredClone(found);
}

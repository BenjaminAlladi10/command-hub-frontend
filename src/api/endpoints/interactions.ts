import { request } from "@/api/client";
import { asInteraction } from "@/api/normalize";
import { PAGE_SIZE, commandSlug } from "@/lib/constants";
import type { Interaction, InteractionPage, InteractionQuery } from "@/types";

interface BackendInteractionPage {
  data: Interaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function matchesFilters(item: Interaction, query: InteractionQuery): boolean {
  if (query.status && query.status !== "all" && item.status !== query.status) return false;
  if (query.command && commandSlug(item.command) !== commandSlug(query.command)) return false;
  if (query.guildId && item.guildId !== query.guildId) return false;
  const needle = query.q?.trim().toLowerCase();
  if (needle) {
    const haystack = `${item.text} ${item.username} ${item.id}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function hasClientFilters(query: InteractionQuery): boolean {
  return Boolean(
    (query.status && query.status !== "all") || query.command || query.guildId || query.q?.trim(),
  );
}

async function fetchPage(page: number, limit: number): Promise<BackendInteractionPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request(`/api/interactions?${params.toString()}`);
}

export async function listInteractions(query: InteractionQuery): Promise<InteractionPage> {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit ?? PAGE_SIZE;

  if (!hasClientFilters(query)) {
    const payload = await fetchPage(page, limit);
    return {
      items: payload.data.map(asInteraction),
      nextCursor: payload.pagination.page < payload.pagination.totalPages ? String(payload.pagination.page + 1) : null,
    };
  }

  // Express list endpoint ignores filter query params; apply them after fetch.
  const collected: Interaction[] = [];
  let backendPage = 1;
  let totalPages = 1;
  do {
    const payload = await fetchPage(backendPage, 100);
    totalPages = Math.max(payload.pagination.totalPages, 1);
    collected.push(...payload.data.map(asInteraction));
    backendPage += 1;
  } while (backendPage <= totalPages);

  const filtered = collected.filter((item) => matchesFilters(item, query));
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  return {
    items,
    nextCursor: start + limit < filtered.length ? String(page + 1) : null,
  };
}

export async function getInteraction(id: string): Promise<Interaction> {
  const payload = await request<Interaction>(`/api/interactions/${encodeURIComponent(id)}`);
  return asInteraction(payload);
}

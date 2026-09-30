import { request, USE_MOCK } from "@/api/client";
import { getDb, latency, requireSession } from "@/api/mock/store";
import type { Stats } from "@/types";

export async function getStats(): Promise<Stats> {
  if (!USE_MOCK) return request("/api/stats");

  await latency();
  requireSession();
  const { interactions } = getDb();
  const cutoff = Date.now() - 86_400_000;
  const recent = interactions.filter((i) => new Date(i.receivedAt).getTime() >= cutoff);

  const failedCount = recent.filter((i) => i.status === "failed").length;
  const replied = recent.filter((i) => i.status === "replied").length;
  const pendingRetries = interactions.reduce(
    (sum, i) => sum + i.actions.filter((a) => a.status === "retrying" || a.status === "pending").length,
    0,
  );

  const counts = new Map<string, number>();
  for (const i of recent) counts.set(i.command, (counts.get(i.command) ?? 0) + 1);

  return {
    total24h: recent.length,
    successRate: recent.length === 0 ? 1 : replied / recent.length,
    failedCount,
    pendingRetries,
    byCommand: [...counts.entries()].map(([command, count]) => ({ command, count })),
  };
}

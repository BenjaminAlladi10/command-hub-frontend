import { request, USE_MOCK } from "@/api/client";
import { getDb, latency, requireSession } from "@/api/mock/store";
import type { Stats } from "@/types";

export async function getStats(): Promise<Stats> {
  if (!USE_MOCK) return request("/api/stats");

  await latency();
  requireSession();
  const { interactions, commands } = getDb();

  return {
    totalInteractions: interactions.length,
    successfulInteractions: interactions.filter((i) => i.status === "replied").length,
    failedInteractions: interactions.filter((i) => i.status === "failed").length,
    totalCommands: new Set(commands.map((c) => c.name)).size,
    totalMirrors: interactions.filter((i) =>
      i.actions.some((a) => a.kind === "mirror" && a.status === "success"),
    ).length,
  };
}

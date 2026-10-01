import { request } from "@/api/client";
import type { Stats } from "@/types";

export async function getStats(): Promise<Stats> {
  return request("/api/stats");
}

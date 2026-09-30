import { ApiError } from "@/lib/api-error";
import { createMockDb, type MockDb } from "./seed";

let db: MockDb | null = null;

/** Lazy so no data is built at module scope (SSR/worker-safe). */
export function getDb(): MockDb {
  if (!db) db = createMockDb();
  return db;
}

const SESSION_COOKIE = "ch_mock_session";

export function hasMockSession(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${SESSION_COOKIE}=1`));
}

export function setMockSession(active: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = active
    ? `${SESSION_COOKIE}=1; path=/; max-age=86400; samesite=lax`
    : `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export async function latency(min = 300, max = 800): Promise<void> {
  const ms = min + Math.random() * (max - min);
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Occasional simulated failure so error states are reachable in the demo. */
export function maybeFail(rate = 0.05): void {
  if (Math.random() < rate) {
    throw new ApiError(503, "Upstream service unavailable", "mock_flake");
  }
}

export function requireSession(): void {
  if (!hasMockSession()) throw new ApiError(401, "Unauthorized");
}

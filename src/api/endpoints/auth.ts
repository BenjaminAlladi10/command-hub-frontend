import { request, USE_MOCK } from "@/api/client";
import { getDb, hasMockSession, latency, setMockSession } from "@/api/mock/store";
import { ApiError } from "@/lib/api-error";
import type { User } from "@/types";

export async function login(input: { email: string; password: string }): Promise<{ user: User }> {
  if (!USE_MOCK) return request("/api/auth/login", { method: "POST", body: input });

  await latency();
  const db = getDb();
  if (input.password !== db.password) {
    throw new ApiError(401, "Incorrect email or password.");
  }
  setMockSession(true);
  return { user: { ...db.user, email: input.email } };
}

export async function logout(): Promise<void> {
  if (!USE_MOCK) {
    await request<void>("/api/auth/logout", { method: "POST" });
    return;
  }
  await latency(120, 300);
  setMockSession(false);
}

export async function me(): Promise<{ user: User }> {
  if (!USE_MOCK) return request("/api/auth/me");

  await latency(120, 350);
  if (!hasMockSession()) throw new ApiError(401, "Unauthorized");
  return { user: getDb().user };
}

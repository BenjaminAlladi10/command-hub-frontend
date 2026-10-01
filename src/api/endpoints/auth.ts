import { request } from "@/api/client";
import { asUser } from "@/api/normalize";
import type { User } from "@/types";

export async function login(input: { email: string; password: string }): Promise<{ user: User }> {
  const payload = await request<unknown>("/api/auth/login", { method: "POST", body: input });
  return { user: asUser(payload) };
}

export async function logout(): Promise<void> {
  await request<unknown>("/api/auth/logout", { method: "POST" });
}

export async function me(): Promise<{ user: User }> {
  const payload = await request<unknown>("/api/auth/me");
  return { user: asUser(payload) };
}

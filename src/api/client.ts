import { ApiError } from "@/lib/api-error";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") !== "false";

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler = () => {};

/** Registered once by the auth provider so a 401 anywhere clears the session. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  let response: Response;
  try {
    const init: RequestInit = {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    };
    if (body !== undefined) init.body = JSON.stringify(body);
    if (signal) init.signal = signal;
    response = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(0, "Network request failed.", "network");
  }

  if (response.status === 401) {
    onUnauthorized();
    throw new ApiError(401, "Unauthorized");
  }

  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    try {
      const data = (await response.json()) as { message?: string; code?: string };
      if (data.message) message = data.message;
      if (data.code) code = data.code;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(response.status, message, code);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

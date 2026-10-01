import { ApiError } from "@/lib/api-error";

const isBrowser = typeof window !== "undefined";
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (isBrowser ? "" : "http://localhost:3000");

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

interface ErrorEnvelope {
  error?: { code?: string; message?: string };
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  const init: RequestInit = { method, credentials: "include" };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  if (signal) init.signal = signal;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(0, "Network request failed.", "network");
  }

  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    try {
      const data = (await response.json()) as ErrorEnvelope;
      if (data.error?.message) message = data.error.message;
      if (data.error?.code) code = data.error.code;
    } catch {
      /* non-JSON error body */
    }
    if (response.status === 401) onUnauthorized();
    throw new ApiError(response.status, message, code);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

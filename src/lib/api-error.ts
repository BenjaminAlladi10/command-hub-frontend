export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const FALLBACK = "Something went wrong. Please try again.";

/** Single source of truth for turning any thrown value into a safe user-facing message. */
export function toMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session expired. Please sign in again.";
    if (error.status === 403) return "You don't have permission to do that.";
    if (error.status === 404) return "We couldn't find what you were looking for.";
    if (error.status === 429) return "Too many requests. Give it a moment and try again.";
    if (error.status >= 500) return "The service is unavailable right now. Please try again.";
    return error.message || FALLBACK;
  }
  if (error instanceof Error && error.message && !error.stack?.includes("at ")) {
    return error.message;
  }
  if (error instanceof Error && error.message.length < 160) return error.message;
  return FALLBACK;
}

export function isNoRetryStatus(status: number): boolean {
  return status === 401 || status === 403 || status === 404;
}

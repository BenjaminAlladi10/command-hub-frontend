import type { ActionKind, ActionStatus, InteractionStatus } from "@/types";

export const COMMANDS = ["/hello", "/notify"] as const;

export const INTERACTION_STATUSES: InteractionStatus[] = ["received", "replied", "failed"];

export const ACTION_KIND_LABEL: Record<ActionKind, string> = {
  reply: "Reply",
  mirror: "Mirror",
  ai: "AI triage",
};

export const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  pending: "Pending",
  success: "Success",
  failed: "Failed",
  retrying: "Retrying",
};

/**
 * The backend stores the AI triage flag but does not run triage yet.
 * Flip to true once the backend implements it.
 */
export const AI_TRIAGE_AVAILABLE = false;

export const PAGE_SIZE = 25;
export const SEARCH_DEBOUNCE_MS = 300;

export const WEBHOOK_PREFIXES = [
  "https://discord.com/api/webhooks/",
  "https://hooks.slack.com/",
] as const;

/** "/hello" -> "hello" for URLs. */
export function commandSlug(name: string): string {
  return name.replace(/^\//, "");
}

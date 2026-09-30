import type { ActionKind, ActionStatus, InteractionStatus } from "@/types";

export const COMMANDS = ["/report", "/status"] as const;

export const INTERACTION_STATUSES: InteractionStatus[] = ["received", "replied", "failed"];

export const ACTION_KIND_LABEL: Record<ActionKind, string> = {
  reply: "Discord reply",
  mirror: "Mirror notification",
  ai: "AI triage",
};

export const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  pending: "Pending",
  success: "Success",
  failed: "Failed",
  retrying: "Retrying",
};

export const LIVE_REFETCH_MS = 5000;
export const PAGE_SIZE = 25;
export const SEARCH_DEBOUNCE_MS = 300;

export const WEBHOOK_PREFIXES = [
  "https://discord.com/api/webhooks/",
  "https://hooks.slack.com/",
] as const;

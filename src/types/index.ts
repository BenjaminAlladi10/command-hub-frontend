export type InteractionStatus = "received" | "replied" | "failed";
export type ActionKind = "reply" | "mirror" | "ai";
export type ActionStatus = "pending" | "success" | "failed" | "retrying";

export interface User {
  id: string;
  email: string;
}

export interface Action {
  id: string;
  interactionId: string;
  kind: ActionKind;
  status: ActionStatus;
  attempts: number;
  lastError: string | null;
  nextRetryAt: string | null;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  guildId: string;
  guildName: string;
  userId: string;
  username: string;
  command: string;
  text: string;
  status: InteractionStatus;
  receivedAt: string;
  actions: Action[];
}

export interface CommandRule {
  replyTemplate: string;
  mirror: boolean;
  flagKeywords: string[];
  useAiTriage: boolean;
}

export interface CommandConfig {
  guildId: string;
  /** Slash command name including the leading slash, e.g. "/hello". */
  name: string;
  enabled: boolean;
  rule: CommandRule;
}

export interface GuildChannel {
  id: string;
  name: string;
}

export interface Guild {
  guildId: string;
  name: string;
  channelId: string;
  channels: GuildChannel[];
  /** The webhook URL itself is never returned by the backend. */
  mirrorConfigured: boolean;
  connectedAt: string;
}

export interface Stats {
  totalInteractions: number;
  successfulInteractions: number;
  failedInteractions: number;
  totalCommands: number;
  totalMirrors: number;
}

export interface InteractionQuery {
  cursor?: string | null;
  limit?: number;
  status?: InteractionStatus | "all";
  command?: string;
  guildId?: string;
  q?: string;
}

export interface InteractionPage {
  items: Interaction[];
  nextCursor: string | null;
}

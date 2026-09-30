import type { InteractionQuery } from "@/types";

export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  stats: {
    all: () => ["stats"] as const,
  },
  interactions: {
    all: () => ["interactions"] as const,
    list: (filters: Omit<InteractionQuery, "cursor">) =>
      ["interactions", "list", filters] as const,
    detail: (id: string) => ["interactions", "detail", id] as const,
  },
  commands: {
    all: () => ["commands"] as const,
    list: (guildId: string) => ["commands", "list", guildId] as const,
  },
  guilds: {
    all: () => ["guilds"] as const,
    list: () => ["guilds", "list"] as const,
    inviteUrl: () => ["guilds", "invite-url"] as const,
  },
} as const;

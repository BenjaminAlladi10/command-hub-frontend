import { COMMANDS } from "@/lib/constants";
import type { Action, CommandConfig, Guild, Interaction, User } from "@/types";

/** Deterministic PRNG so the mock dataset is stable across reloads. */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const GUILD_SEED: Omit<Guild, "connectedAt">[] = [
  {
    guildId: "912440311220",
    name: "Northwind Community",
    channelId: "chan_ops",
    channels: [
      { id: "chan_ops", name: "#ops-alerts" },
      { id: "chan_general", name: "#general" },
      { id: "chan_mods", name: "#mod-log" },
    ],
    mirrorConfigured: true,
  },
  {
    guildId: "774102883941",
    name: "Halcyon Games",
    channelId: "chan_support",
    channels: [
      { id: "chan_support", name: "#support" },
      { id: "chan_reports", name: "#reports" },
      { id: "chan_lobby", name: "#lobby" },
    ],
    mirrorConfigured: false,
  },
];

const USERNAMES = [
  "ada.reyes",
  "j_mora",
  "kelsey.n",
  "orion",
  "t.whitfield",
  "priya_v",
  "dmitri",
  "sam.okafor",
];

const REPORT_TEXTS = [
  "Spam links being posted in #lobby by a new account",
  "User impersonating a moderator in DMs",
  "Voice channel raid started about five minutes ago",
  "Someone is posting NSFW images in #general",
  "Repeated harassment after a mute expired",
  "Bot command loop flooding the reports channel",
];

const STATUS_TEXTS = [
  "checking queue depth",
  "mirror health",
  "latency check",
  "uptime since last deploy",
];

const ERRORS = [
  "Discord API 503: service unavailable",
  "Mirror webhook responded 404",
  "Request timed out after 10000ms",
  "Rate limited by Discord (retry_after 4.2s)",
];

export interface MockDb {
  user: User;
  password: string;
  guilds: Guild[];
  mirrorSecrets: Record<string, string>;
  commands: CommandConfig[];
  interactions: Interaction[];
  inviteUrl: string;
}

function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)] as T;
}

export function createMockDb(): MockDb {
  const rand = makeRandom(20260930);
  const now = Date.now();

  const guilds: Guild[] = GUILD_SEED.map((g, i) => ({
    ...g,
    connectedAt: new Date(now - (40 + i * 22) * 86_400_000).toISOString(),
  }));

  const commands: CommandConfig[] = guilds.flatMap((g) =>
    COMMANDS.map((name) => ({
      guildId: g.guildId,
      name,
      enabled: true,
      rule: {
        replyTemplate:
          name === "/report"
            ? "Thanks {user}, your report has been logged and the moderators were notified."
            : "Status for {user}: {text}",
        mirror: name === "/report",
        flagKeywords: name === "/report" ? ["raid", "nsfw", "doxx"] : [],
        useAiTriage: name === "/report",
      },
    })),
  );

  const interactions: Interaction[] = [];
  for (let i = 0; i < 140; i += 1) {
    const guild = pick(rand, guilds);
    const command = pick(rand, COMMANDS);
    const receivedAt = new Date(now - i * 11 * 60_000 - Math.floor(rand() * 400_000));
    const roll = rand();
    const status = roll < 0.12 ? "failed" : roll < 0.2 ? "received" : "replied";
    const id = `int_${(100000 + i).toString(36)}${i}`;
    const text =
      command === "/report" ? pick(rand, REPORT_TEXTS) : pick(rand, STATUS_TEXTS);

    const actions: Action[] = [];
    const mkAction = (
      kind: Action["kind"],
      actionStatus: Action["status"],
      attempts: number,
      lastError: string | null,
    ): Action => ({
      id: `act_${id}_${kind}`,
      interactionId: id,
      kind,
      status: actionStatus,
      attempts,
      lastError,
      nextRetryAt:
        actionStatus === "retrying"
          ? new Date(receivedAt.getTime() + 120_000).toISOString()
          : null,
      updatedAt: new Date(receivedAt.getTime() + 4_000).toISOString(),
    });

    if (status === "failed") {
      actions.push(mkAction("reply", "success", 1, null));
      actions.push(mkAction("mirror", rand() < 0.4 ? "retrying" : "failed", 3, pick(rand, ERRORS)));
    } else if (status === "received") {
      actions.push(mkAction("reply", "pending", 0, null));
    } else {
      actions.push(mkAction("reply", "success", 1, null));
      if (command === "/report") actions.push(mkAction("mirror", "success", 1, null));
    }

    const interaction: Interaction = {
      id,
      guildId: guild.guildId,
      guildName: guild.name,
      userId: `usr_${(900000 + i).toString(36)}`,
      username: pick(rand, USERNAMES),
      command,
      text,
      status,
      receivedAt: receivedAt.toISOString(),
      actions,
    };

    if (command === "/report" && rand() < 0.65) {
      actions.push(mkAction("ai", "success", 1, null));
      interaction.aiSummary =
        "Member reports disruptive behaviour affecting a public channel; moderator review recommended.";
      interaction.aiTags = ["moderation", rand() < 0.5 ? "high-priority" : "spam"];
    }

    interactions.push(interaction);
  }

  return {
    user: { id: "usr_admin", email: "admin@commandhub.dev" },
    password: "admin123",
    guilds,
    mirrorSecrets: { "912440311220": "configured" },
    commands,
    interactions,
    inviteUrl:
      "https://discord.com/oauth2/authorize?client_id=1180000000000000000&scope=bot+applications.commands&permissions=277025508352",
  };
}

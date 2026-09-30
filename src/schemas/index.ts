import { z } from "zod";
import { WEBHOOK_PREFIXES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "At least 6 characters"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const commandRuleSchema = z.object({
  enabled: z.boolean(),
  replyTemplate: z
    .string()
    .min(1, "A reply template is required")
    .max(400, "Keep the template under 400 characters"),
  mirror: z.boolean(),
  flagKeywords: z.array(z.string().min(1)).max(20, "Up to 20 keywords"),
  useAiTriage: z.boolean(),
});
export type CommandRuleValues = z.infer<typeof commandRuleSchema>;

export const guildSettingsSchema = z.object({
  channelId: z.string().min(1, "Choose a channel"),
  mirrorWebhook: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || WEBHOOK_PREFIXES.some((prefix) => value.startsWith(prefix)),
      "Must start with https://discord.com/api/webhooks/ or https://hooks.slack.com/",
    ),
});
export type GuildSettingsValues = z.infer<typeof guildSettingsSchema>;

import { z } from "zod";
import { WEBHOOK_PREFIXES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const commandFormSchema = z.object({
  enabled: z.boolean(),
  replyTemplate: z
    .string()
    .trim()
    .min(1, "A reply template is required")
    .max(1000, "Keep the template under 1000 characters"),
  mirror: z.boolean(),
  flagKeywords: z.array(z.string().min(1)).max(25, "Up to 25 keywords"),
  useAiTriage: z.boolean(),
});
export type CommandFormValues = z.infer<typeof commandFormSchema>;

export const guildFormSchema = z.object({
  name: z.string().trim().min(1, "Guild name is required").max(100, "Up to 100 characters"),
  channelId: z.string().min(1, "Choose a channel"),
  channels: z
    .array(z.object({ id: z.string().min(1), name: z.string().min(1) }))
    .min(1, "Add at least one channel"),
  mirrorWebhook: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || WEBHOOK_PREFIXES.some((prefix) => value.startsWith(prefix)),
      "Use a Discord webhook (https://discord.com/api/webhooks/…) or Slack incoming webhook (https://hooks.slack.com/…)",
    ),
});
export type GuildFormValues = z.infer<typeof guildFormSchema>;

/** Flattens zod issues into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

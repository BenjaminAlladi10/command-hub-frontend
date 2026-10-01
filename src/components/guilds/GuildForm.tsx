import { Loader2, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { CopyableId } from "@/components/common/CopyableId";
import { Panel } from "@/components/common/PageIntro";
import { FieldError, OnOff } from "@/components/common/Toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateGuild } from "@/hooks/useGuilds";
import { toMessage } from "@/lib/api-error";
import { fieldErrors, guildFormSchema, type GuildFormValues } from "@/schemas";
import type { Guild } from "@/types";

export function GuildForm({ guild }: { guild: Guild }) {
  // The stored webhook is never returned; the field always starts empty.
  const initial: GuildFormValues = {
    name: guild.name,
    channelId: guild.channelId,
    channels: structuredClone(guild.channels),
    mirrorWebhook: "",
  };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newChannel, setNewChannel] = useState({ id: "", name: "" });
  const mutation = useUpdateGuild();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  function addChannel() {
    const id = newChannel.id.trim();
    const name = newChannel.name.trim();
    if (!id || !name || values.channels.some((c) => c.id === id)) return;
    setValues((v) => ({ ...v, channels: [...v.channels, { id, name: name.startsWith("#") ? name : `#${name}` }] }));
    setNewChannel({ id: "", name: "" });
  }

  function removeChannel(id: string) {
    setValues((v) => ({
      ...v,
      channels: v.channels.filter((c) => c.id !== id),
      channelId: v.channelId === id ? "" : v.channelId,
    }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = guildFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const { mirrorWebhook, ...rest } = parsed.data;
    mutation.mutate(
      { guildId: guild.guildId, ...rest, ...(mirrorWebhook ? { mirrorWebhook } : {}) },
      {
        onSuccess: () => {
          setValues((v) => ({ ...v, mirrorWebhook: "" }));
          toast.success("Guild updated");
        },
        onError: (error) => toast.error("Update failed", { description: toMessage(error) }),
      },
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Panel title="General">
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Guild name</Label>
            <Input
              id="name"
              className="mt-1.5"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              aria-invalid={Boolean(errors.name)}
              aria-describedby="name-error"
            />
            <FieldError id="name-error" message={errors.name} />
          </div>
          <div>
            <p className="text-sm font-medium">Guild ID</p>
            <CopyableId value={guild.guildId} className="mt-2.5" />
          </div>
        </div>
      </Panel>

      <Panel title="Channels" description="Replies and notifications are posted to the selected channel.">
        <div className="space-y-4 p-4">
          <div>
            <Label htmlFor="channelId">Selected channel</Label>
            <Select value={values.channelId} onValueChange={(v) => setValues((s) => ({ ...s, channelId: v }))}>
              <SelectTrigger id="channelId" className="mt-1.5 sm:w-72" aria-invalid={Boolean(errors.channelId)} aria-describedby="channelId-error">
                <SelectValue placeholder="Choose a channel" />
              </SelectTrigger>
              <SelectContent>
                {values.channels.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="channelId-error" message={errors.channelId} />
          </div>

          <div>
            <p className="text-sm font-medium">Available channels</p>
            <ul className="mt-2 divide-y divide-border rounded-md border border-border">
              {values.channels.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-mono text-[13px]">{c.name}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{c.id}</span>
                  </span>
                  <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => removeChannel(c.id)} aria-label={`Remove ${c.name}`}>
                    <X className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
            <FieldError id="channels-error" message={errors.channels} />
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input aria-label="New channel name" placeholder="#channel-name" value={newChannel.name} onChange={(e) => setNewChannel((n) => ({ ...n, name: e.target.value }))} />
              <Input aria-label="New channel ID" placeholder="Channel ID" className="font-mono" value={newChannel.id} onChange={(e) => setNewChannel((n) => ({ ...n, id: e.target.value }))} />
              <Button type="button" variant="outline" onClick={addChannel} disabled={!newChannel.id.trim() || !newChannel.name.trim()}>
                <Plus className="size-4" aria-hidden="true" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Mirror webhook"
        description="Discord webhook or Slack incoming webhook."
        actions={<OnOff on={guild.mirrorConfigured} onLabel="Mirror configured" offLabel="Mirror not configured" />}
      >
        <div className="p-4">
          <Label htmlFor="mirrorWebhook">{guild.mirrorConfigured ? "Replace webhook URL" : "Webhook URL"}</Label>
          <Input
            id="mirrorWebhook"
            type="password"
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 font-mono"
            placeholder={guild.mirrorConfigured ? "Leave blank to keep the current webhook" : "https://discord.com/api/webhooks/…"}
            value={values.mirrorWebhook}
            onChange={(e) => setValues((v) => ({ ...v, mirrorWebhook: e.target.value }))}
            aria-invalid={Boolean(errors.mirrorWebhook)}
            aria-describedby="mirrorWebhook-help mirrorWebhook-error"
          />
          <FieldError id="mirrorWebhook-error" message={errors.mirrorWebhook} />
          <p id="mirrorWebhook-help" className="mt-1.5 text-xs text-muted-foreground">
            For security, a saved webhook URL is never shown again.
          </p>
        </div>
      </Panel>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <Button type="button" variant="outline" disabled={!dirty || mutation.isPending} onClick={() => { setValues(initial); setErrors({}); }}>
          Reset
        </Button>
        <Button type="submit" disabled={!dirty || mutation.isPending}>
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {mutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

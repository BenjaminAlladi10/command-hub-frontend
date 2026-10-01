import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { KeywordInput } from "@/components/commands/KeywordInput";
import { Panel } from "@/components/common/PageIntro";
import { FieldError, ToggleField } from "@/components/common/Toggle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCommand } from "@/hooks/useCommands";
import { toMessage } from "@/lib/api-error";
import { commandFormSchema, fieldErrors, type CommandFormValues } from "@/schemas";
import type { CommandConfig } from "@/types";

function toValues(c: CommandConfig): CommandFormValues {
  return { enabled: c.enabled, ...c.rule, flagKeywords: [...c.rule.flagKeywords] };
}

export function CommandForm({ command }: { command: CommandConfig }) {
  const initial = toValues(command);
  const [values, setValues] = useState<CommandFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mutation = useUpdateCommand();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  const set = <K extends keyof CommandFormValues>(key: K, value: CommandFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const preview = values.replyTemplate.replaceAll("{{text}}", "the server is down");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = commandFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    const { enabled, ...rule } = parsed.data;
    mutation.mutate(
      { guildId: command.guildId, name: command.name, enabled, rule },
      {
        onSuccess: () => toast.success("Configuration saved", { description: `${command.name} updated.` }),
        onError: (error) => toast.error("Configuration failed", { description: toMessage(error) }),
      },
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Panel title="Availability">
        <div className="p-4">
          <ToggleField
            id="enabled"
            label="Enabled"
            description="When disabled, Command Hub ignores this command in the guild."
            checked={values.enabled}
            onChange={(v) => set("enabled", v)}
          />
        </div>
      </Panel>

      <Panel title="Reply">
        <div className="space-y-2 p-4">
          <Label htmlFor="replyTemplate">Reply template</Label>
          <Textarea
            id="replyTemplate"
            rows={4}
            className="font-mono text-[13px]"
            value={values.replyTemplate}
            onChange={(e) => set("replyTemplate", e.target.value)}
            aria-invalid={Boolean(errors.replyTemplate)}
            aria-describedby="replyTemplate-help replyTemplate-error"
          />
          <FieldError id="replyTemplate-error" message={errors.replyTemplate} />
          <p id="replyTemplate-help" className="text-xs text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5 font-mono">{"{{text}}"}</code> is replaced with the text the user typed after the command.
          </p>
          {values.replyTemplate.trim() ? (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">Preview</p>
              <p className="mt-0.5 break-words text-sm">{preview}</p>
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel title="Rules">
        <div className="space-y-5 p-4">
          <ToggleField
            id="mirror"
            label="Mirror notifications"
            description="Forward each interaction to the guild's mirror webhook (Discord or Slack)."
            checked={values.mirror}
            onChange={(v) => set("mirror", v)}
          />
          <div>
            <Label htmlFor="flagKeywords">Flag keywords</Label>
            <p id="flagKeywords-help" className="mb-2 mt-0.5 text-sm text-muted-foreground">
              Interactions containing any of these words are flagged.
            </p>
            <KeywordInput
              id="flagKeywords"
              value={values.flagKeywords}
              onChange={(v) => set("flagKeywords", v)}
              describedBy="flagKeywords-help"
            />
            <FieldError id="flagKeywords-error" message={errors.flagKeywords} />
          </div>
          <ToggleField
            id="useAiTriage"
            label="AI triage"
            description="Stored on this command. Command Hub does not run triage yet, so summaries appear only if the backend already has them."
            checked={values.useAiTriage}
            onChange={(v) => set("useAiTriage", v)}
          />
        </div>
      </Panel>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || mutation.isPending}
          onClick={() => {
            setValues(initial);
            setErrors({});
          }}
        >
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

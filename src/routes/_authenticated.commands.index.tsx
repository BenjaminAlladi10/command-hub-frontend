import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { GuildSelect } from "@/components/common/GuildSelect";
import { PageIntro, Panel } from "@/components/common/PageIntro";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/States";
import { OnOff } from "@/components/common/Toggle";
import { useCommands } from "@/hooks/useCommands";
import { useGuilds } from "@/hooks/useGuilds";
import { commandSlug } from "@/lib/constants";
import type { CommandConfig } from "@/types";

export const Route = createFileRoute("/_authenticated/commands/")({
  validateSearch: (search: Record<string, unknown>) => ({
    guildId: typeof search.guildId === "string" && search.guildId ? search.guildId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Commands — Command Hub" },
      { name: "description", content: "Configure Discord slash commands and their rules per guild." },
      { property: "og:title", content: "Commands — Command Hub" },
      { property: "og:description", content: "Configure Discord slash commands and their rules per guild." },
    ],
  }),
  component: CommandsPage,
});

function CommandsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const guilds = useGuilds();
  const guildId = search.guildId ?? guilds.data?.[0]?.guildId;
  const commands = useCommands(guildId);

  return (
    <div className="space-y-6">
      <PageIntro
        title="Commands"
        description="Slash commands are configured per Discord guild."
        actions={
          guilds.data && guilds.data.length > 0 ? (
            <GuildSelect
              guilds={guilds.data}
              value={guildId}
              onChange={(id) => void navigate({ to: ".", search: { guildId: id }, replace: true })}
            />
          ) : null
        }
      />
      <Panel>
        {guilds.isPending || (guildId && commands.isPending) ? (
          <TableSkeleton rows={2} columns={5} />
        ) : guilds.isError ? (
          <ErrorState error={guilds.error} onRetry={() => void guilds.refetch()} />
        ) : !guildId ? (
          <EmptyState title="No guilds connected" description="Connect Command Hub to a Discord guild to configure its commands." />
        ) : commands.isError ? (
          <ErrorState error={commands.error} onRetry={() => void commands.refetch()} />
        ) : commands.data && commands.data.length === 0 ? (
          <EmptyState title="No commands registered" description="This guild has no slash commands registered yet." />
        ) : (
          <CommandList commands={commands.data ?? []} guildId={guildId} />
        )}
      </Panel>
    </div>
  );
}

function CommandList({ commands, guildId }: { commands: CommandConfig[]; guildId: string }) {
  return (
    <ul className="divide-y divide-border">
      {commands.map((c) => (
        <li key={c.name}>
          <Link
            to="/commands/$name"
            params={{ name: commandSlug(c.name) }}
            search={{ guildId }}
            className="group grid gap-3 px-4 py-4 transition-colors hover:bg-muted/60 md:grid-cols-[10rem_repeat(4,1fr)_1.5rem] md:items-center"
          >
            <span className="font-mono text-sm font-medium">{c.name}</span>
            <Cell label="Status"><OnOff on={c.enabled} onLabel="Enabled" offLabel="Disabled" /></Cell>
            <Cell label="Mirror"><OnOff on={c.rule.mirror} /></Cell>
            <Cell label="Keywords">
              {c.rule.flagKeywords.length ? (
                <span className="flex flex-wrap gap-1">
                  {c.rule.flagKeywords.slice(0, 3).map((k) => (
                    <span key={k} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">{k}</span>
                  ))}
                  {c.rule.flagKeywords.length > 3 ? (
                    <span className="text-xs text-muted-foreground">+{c.rule.flagKeywords.length - 3}</span>
                  ) : null}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )}
            </Cell>
            <Cell label="AI triage"><OnOff on={c.rule.useAiTriage} /></Cell>
            <ChevronRight className="hidden size-4 text-muted-foreground group-hover:text-foreground md:block" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 md:block">
      <span className="text-xs text-muted-foreground md:mb-1 md:block">{label}</span>
      {children}
    </div>
  );
}

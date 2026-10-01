import { createFileRoute, Link } from "@tanstack/react-router";

import { CopyableId } from "@/components/common/CopyableId";
import { PageIntro, Panel } from "@/components/common/PageIntro";
import { RelativeTime } from "@/components/common/RelativeTime";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/States";
import { OnOff } from "@/components/common/Toggle";
import { Button } from "@/components/ui/button";
import { useGuilds } from "@/hooks/useGuilds";

export const Route = createFileRoute("/_authenticated/guilds/")({
  head: () => ({
    meta: [
      { title: "Guilds — Command Hub" },
      { name: "description", content: "Connected Discord guilds, channels and mirror configuration." },
      { property: "og:title", content: "Guilds — Command Hub" },
      { property: "og:description", content: "Connected Discord guilds, channels and mirror configuration." },
    ],
  }),
  component: GuildsPage,
});

function GuildsPage() {
  const guilds = useGuilds();

  return (
    <div className="space-y-6">
      <PageIntro title="Guilds" description="Discord guilds connected to Command Hub." />
      {guilds.isPending ? (
        <Panel><TableSkeleton rows={2} columns={4} /></Panel>
      ) : guilds.isError ? (
        <Panel><ErrorState error={guilds.error} onRetry={() => void guilds.refetch()} /></Panel>
      ) : guilds.data.length === 0 ? (
        <Panel><EmptyState title="No guilds connected" description="Guilds appear here once the bot is added to a Discord server." /></Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {guilds.data.map((g) => {
            const channel = g.channels.find((c) => c.id === g.channelId);
            return (
              <article key={g.guildId} className="rounded-lg border border-border bg-card">
                <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{g.name}</h2>
                    <CopyableId value={g.guildId} className="mt-0.5" />
                  </div>
                  <OnOff on onLabel="Connected" />
                </header>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Channel</dt>
                    <dd className="mt-0.5 font-mono text-[13px]">{channel?.name ?? "Not selected"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Available channels</dt>
                    <dd className="mt-0.5 tabular-nums">{g.channels.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Mirror</dt>
                    <dd className="mt-0.5"><OnOff on={g.mirrorConfigured} onLabel="Mirror configured" offLabel="Mirror not configured" /></dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Connected</dt>
                    <dd className="mt-0.5"><RelativeTime iso={g.connectedAt} /></dd>
                  </div>
                </dl>
                <footer className="flex justify-end border-t border-border px-4 py-2.5">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/guilds/$guildId" params={{ guildId: g.guildId }}>Configure</Link>
                  </Button>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

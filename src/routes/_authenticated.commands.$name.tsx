import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { CommandForm } from "@/components/commands/CommandForm";
import { PageIntro, Panel } from "@/components/common/PageIntro";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommands } from "@/hooks/useCommands";
import { useGuilds } from "@/hooks/useGuilds";
import { commandSlug } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/commands/$name")({
  validateSearch: (search: Record<string, unknown>) => ({
    guildId: typeof search.guildId === "string" && search.guildId ? search.guildId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Command configuration — Command Hub" },
      { name: "description", content: "Edit reply template, mirroring and keyword rules for a command." },
      { property: "og:title", content: "Command configuration — Command Hub" },
      { property: "og:description", content: "Edit reply template, mirroring and keyword rules for a command." },
    ],
  }),
  component: CommandConfigPage,
});

function CommandConfigPage() {
  const { name } = Route.useParams();
  const search = Route.useSearch();
  const guilds = useGuilds();
  const guildId = search.guildId ?? guilds.data?.[0]?.guildId;
  const guild = guilds.data?.find((g) => g.guildId === guildId);
  const commands = useCommands(guildId);
  const command = commands.data?.find((c) => commandSlug(c.name) === name);

  const back = (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link to="/commands" search={{ guildId }}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Commands
      </Link>
    </Button>
  );

  if (guilds.isPending || (guildId && commands.isPending)) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-[28rem] w-full" />
      </div>
    );
  }
  const error = guilds.error ?? commands.error;
  if (error) {
    return (
      <div className="space-y-4">
        {back}
        <Panel><ErrorState error={error} onRetry={() => void commands.refetch()} /></Panel>
      </div>
    );
  }
  if (!command || !guildId) {
    return (
      <div className="space-y-4">
        {back}
        <Panel>
          <EmptyState title="Command not found" description={`/${name} isn't registered for this guild.`} />
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {back}
      <PageIntro
        title={command.name}
        description={guild ? `Configuration for ${guild.name}` : undefined}
      />
      <CommandForm key={`${guildId}${command.name}`} command={command} />
    </div>
  );
}

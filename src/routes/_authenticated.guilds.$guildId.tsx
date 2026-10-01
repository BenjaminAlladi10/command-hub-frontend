import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { GuildForm } from "@/components/guilds/GuildForm";
import { PageIntro, Panel } from "@/components/common/PageIntro";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuilds } from "@/hooks/useGuilds";

export const Route = createFileRoute("/_authenticated/guilds/$guildId")({
  head: () => ({
    meta: [
      { title: "Guild configuration — Command Hub" },
      { name: "description", content: "Configure the reply channel and mirror webhook for a guild." },
      { property: "og:title", content: "Guild configuration — Command Hub" },
      { property: "og:description", content: "Configure the reply channel and mirror webhook for a guild." },
    ],
  }),
  component: GuildConfigPage,
});

function GuildConfigPage() {
  const { guildId } = Route.useParams();
  const guilds = useGuilds();
  const guild = guilds.data?.find((g) => g.guildId === guildId);

  const back = (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link to="/guilds">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Guilds
      </Link>
    </Button>
  );

  if (guilds.isPending) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (guilds.isError) {
    return <div className="space-y-4">{back}<Panel><ErrorState error={guilds.error} onRetry={() => void guilds.refetch()} /></Panel></div>;
  }
  if (!guild) {
    return <div className="space-y-4">{back}<Panel><EmptyState title="Guild not found" description="This guild isn't connected to Command Hub." /></Panel></div>;
  }

  return (
    <div className="space-y-6">
      {back}
      <PageIntro title={guild.name} description="Reply channel and notification mirroring." />
      <GuildForm key={guild.guildId} guild={guild} />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";

import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusDistribution } from "@/components/dashboard/StatusDistribution";
import { InteractionsTable } from "@/components/interactions/InteractionsTable";
import { PageIntro, Panel } from "@/components/common/PageIntro";
import { CardSkeleton, EmptyState, ErrorState, TableSkeleton } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { useInteractions } from "@/hooks/useInteractions";
import { useStats } from "@/hooks/useStats";
import { formatPercent } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Command Hub" },
      { name: "description", content: "Discord command activity and action health at a glance." },
      { property: "og:title", content: "Dashboard — Command Hub" },
      { property: "og:description", content: "Discord command activity and action health at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const stats = useStats();
  const recent = useInteractions({}, 5);
  const recentItems = recent.data?.pages[0]?.items ?? [];

  return (
    <div className="space-y-6">
      <PageIntro title="Dashboard" description="Interaction volume and delivery health across all guilds." />

      {stats.isError ? (
        <Panel>
          <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {stats.isPending ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} className="h-[6.5rem] rounded-lg" />)
          ) : (
            <>
              <KpiCard label="Total interactions" value={stats.data.totalInteractions} />
              <KpiCard
                label="Successful"
                value={stats.data.successfulInteractions}
                tone="success"
                hint={
                  stats.data.totalInteractions
                    ? `${formatPercent(stats.data.successfulInteractions / stats.data.totalInteractions)} of total`
                    : undefined
                }
              />
              <KpiCard label="Failed" value={stats.data.failedInteractions} tone="danger" />
              <KpiCard label="Commands" value={stats.data.totalCommands} />
              <KpiCard label="Mirrors" value={stats.data.totalMirrors} hint="Notifications mirrored" />
            </>
          )}
        </div>
      )}

      {stats.data && stats.data.totalInteractions > 0 ? (
        <Panel title="Interaction status" description="Share of all recorded interactions by outcome">
          <StatusDistribution stats={stats.data} />
        </Panel>
      ) : null}

      <Panel
        title="Recent interactions"
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/interactions">View all</Link>
          </Button>
        }
      >
        {recent.isPending ? (
          <TableSkeleton rows={5} />
        ) : recent.isError ? (
          <ErrorState error={recent.error} onRetry={() => void recent.refetch()} />
        ) : recentItems.length === 0 ? (
          <EmptyState
            title="No interactions yet"
            description="Discord commands will appear here once Command Hub receives its first interaction."
          />
        ) : (
          <InteractionsTable items={recentItems} compact />
        )}
      </Panel>
    </div>
  );
}

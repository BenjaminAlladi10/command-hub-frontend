import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";

import { PageIntro, Panel } from "@/components/common/PageIntro";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/States";
import { InteractionFilters, type FilterValues } from "@/components/interactions/InteractionFilters";
import { InteractionsTable } from "@/components/interactions/InteractionsTable";
import { Button } from "@/components/ui/button";
import { useGuilds } from "@/hooks/useGuilds";
import { useInteractions } from "@/hooks/useInteractions";
import { INTERACTION_STATUSES } from "@/lib/constants";
import type { InteractionStatus } from "@/types";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/_authenticated/interactions/")({
  validateSearch: (search: Record<string, unknown>): FilterValues => ({
    status: INTERACTION_STATUSES.includes(search.status as InteractionStatus)
      ? (search.status as InteractionStatus)
      : undefined,
    command: str(search.command),
    guildId: str(search.guildId),
    q: str(search.q),
  }),
  head: () => ({
    meta: [
      { title: "Interactions — Command Hub" },
      { name: "description", content: "Monitor Discord slash-command interactions and their outcomes." },
      { property: "og:title", content: "Interactions — Command Hub" },
      { property: "og:description", content: "Monitor Discord slash-command interactions and their outcomes." },
    ],
  }),
  component: InteractionsPage,
});

function InteractionsPage() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const guilds = useGuilds();
  const query = useInteractions(filters);
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const filtered = Boolean(filters.status || filters.command || filters.guildId || filters.q);

  const setFilters = useCallback(
    (next: FilterValues) => void navigate({ to: ".", search: next, replace: true }),
    [navigate],
  );

  return (
    <div className="space-y-6">
      <PageIntro title="Interactions" description="Every slash command received from Discord, newest first." />
      <Panel>
        <InteractionFilters value={filters} guilds={guilds.data ?? []} onChange={setFilters} />
        {query.isPending ? (
          <TableSkeleton />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          filtered ? (
            <EmptyState
              title="No matching interactions"
              description="Try a different search or clear the filters."
              action={<Button variant="outline" size="sm" onClick={() => setFilters({})}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              title="No interactions yet"
              description="Discord commands will appear here once Command Hub receives its first interaction."
            />
          )
        ) : (
          <>
            <InteractionsTable items={items} />
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Showing {items.length} interaction{items.length === 1 ? "" : "s"}
              </p>
              {query.hasNextPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                  Load more
                </Button>
              ) : null}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

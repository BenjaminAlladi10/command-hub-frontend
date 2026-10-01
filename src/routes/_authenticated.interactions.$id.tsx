import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { CopyableId } from "@/components/common/CopyableId";
import { DetailList, PageIntro, Panel } from "@/components/common/PageIntro";
import { RelativeTime } from "@/components/common/RelativeTime";
import { ErrorState } from "@/components/common/States";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInteraction } from "@/hooks/useInteractions";
import { ApiError } from "@/lib/api-error";
import { ACTION_KIND_LABEL } from "@/lib/constants";
import { formatAbsolute } from "@/lib/formatters";
import type { Action } from "@/types";

export const Route = createFileRoute("/_authenticated/interactions/$id")({
  head: () => ({
    meta: [
      { title: "Interaction detail — Command Hub" },
      { name: "description", content: "Execution details and action results for a single interaction." },
      { property: "og:title", content: "Interaction detail — Command Hub" },
      { property: "og:description", content: "Execution details and action results for a single interaction." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InteractionDetail,
});

const BackLink = () => (
  <Button variant="ghost" size="sm" asChild className="-ml-2">
    <Link to="/interactions">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Interactions
    </Link>
  </Button>
);

function InteractionDetail() {
  const { id } = Route.useParams();
  const query = useInteraction(id);

  if (query.isPending) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <div className="space-y-4">
        <BackLink />
        <Panel>
          <ErrorState
            title={notFound ? "Interaction not found" : "Couldn't load this interaction"}
            error={query.error}
            onRetry={notFound ? undefined : () => void query.refetch()}
          />
        </Panel>
      </div>
    );
  }

  const i = query.data;
  return (
    <div className="space-y-6">
      <BackLink />
      <PageIntro
        title={`${i.command} from ${i.username}`}
        description={<>Received <RelativeTime iso={i.receivedAt} /></>}
        actions={<StatusBadge status={i.status} />}
      />

      <Panel title="Interaction">
        <DetailList
          items={[
            { label: "Interaction ID", value: <CopyableId value={i.id} /> },
            { label: "Command", value: <span className="font-mono text-[13px]">{i.command}</span> },
            { label: "Message", value: i.text || <span className="italic text-muted-foreground">No text</span> },
            { label: "Status", value: <StatusBadge status={i.status} /> },
            { label: "Username", value: i.username },
            { label: "User ID", value: <CopyableId value={i.userId} /> },
            { label: "Guild", value: i.guildName },
            { label: "Guild ID", value: <CopyableId value={i.guildId} /> },
            { label: "Received", value: <span className="tabular-nums">{formatAbsolute(i.receivedAt)}</span> },
          ]}
        />
      </Panel>

      {i.aiSummary || (i.aiTags && i.aiTags.length > 0) ? (
        <Panel title="AI triage">
          <DetailList
            items={[
              ...(i.aiSummary
                ? [{ label: "Summary", value: i.aiSummary }]
                : []),
              ...(i.aiTags && i.aiTags.length > 0
                ? [{
                    label: "Tags",
                    value: (
                      <span className="flex flex-wrap gap-1">
                        {i.aiTags.map((tag) => (
                          <span key={tag} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                            {tag}
                          </span>
                        ))}
                      </span>
                    ),
                  }]
                : []),
            ]}
          />
        </Panel>
      ) : null}

      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="mb-3 text-sm font-semibold">Actions</h2>
        {i.actions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No actions were scheduled for this interaction.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {i.actions.map((a) => <ActionCard key={a.id} action={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  const failed = action.status === "failed";
  return (
    <article
      className={`rounded-lg border bg-card ${failed ? "border-danger/40" : "border-border"}`}
      aria-label={`${ACTION_KIND_LABEL[action.kind]} action`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-medium">{ACTION_KIND_LABEL[action.kind]}</h3>
        <StatusBadge status={action.status} />
      </header>
      <dl className="space-y-2 px-4 py-3 text-sm">
        <Row label="Attempts" value={<span className="tabular-nums">{action.attempts}</span>} />
        <Row label="Next retry" value={action.nextRetryAt ? <RelativeTime iso={action.nextRetryAt} /> : "—"} />
        <Row label="Updated" value={<RelativeTime iso={action.updatedAt} />} />
      </dl>
      {action.lastError ? (
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Last error</p>
          <p className="mt-1 break-words rounded bg-danger-surface px-2 py-1.5 font-mono text-xs text-danger-foreground">
            {action.lastError}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

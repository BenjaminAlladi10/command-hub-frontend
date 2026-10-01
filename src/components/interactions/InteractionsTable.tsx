import { Link, useNavigate } from "@tanstack/react-router";

import { RelativeTime } from "@/components/common/RelativeTime";
import { StatusBadge } from "@/components/common/StatusBadge";
import { truncate } from "@/lib/formatters";
import type { Interaction } from "@/types";

function ActionSummary({ interaction }: { interaction: Interaction }) {
  const failed = interaction.actions.filter((a) => a.status === "failed").length;
  const ok = interaction.actions.filter((a) => a.status === "success").length;
  return (
    <span className="text-sm tabular-nums text-muted-foreground">
      {ok}/{interaction.actions.length} ok
      {failed > 0 ? <span className="ml-1.5 text-danger-foreground">· {failed} failed</span> : null}
    </span>
  );
}

export function InteractionsTable({ items, compact }: { items: Interaction[]; compact?: boolean }) {
  const navigate = useNavigate();
  const open = (id: string) => void navigate({ to: "/interactions/$id", params: { id } });

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th scope="col" className="px-4 py-2.5 font-medium">Command</th>
              <th scope="col" className="px-4 py-2.5 font-medium">User</th>
              {compact ? null : <th scope="col" className="px-4 py-2.5 font-medium">Guild</th>}
              <th scope="col" className="px-4 py-2.5 font-medium">Message</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Received</th>
              {compact ? null : <th scope="col" className="px-4 py-2.5 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((i) => (
              <tr
                key={i.id}
                onClick={() => open(i.id)}
                className="cursor-pointer transition-colors hover:bg-muted/60"
              >
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px]">
                  <Link
                    to="/interactions/$id"
                    params={{ id: i.id }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-sm text-foreground hover:underline"
                  >
                    {i.command}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">{i.username}</td>
                {compact ? null : (
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{i.guildName}</td>
                )}
                <td className="max-w-xs px-4 py-2.5 text-muted-foreground">
                  {i.text ? truncate(i.text, 60) : <span className="italic">No text</span>}
                </td>
                <td className="px-4 py-2.5"><StatusBadge status={i.status} /></td>
                <td className="whitespace-nowrap px-4 py-2.5"><RelativeTime iso={i.receivedAt} /></td>
                {compact ? null : (
                  <td className="whitespace-nowrap px-4 py-2.5"><ActionSummary interaction={i} /></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {items.map((i) => (
          <li key={i.id}>
            <Link
              to="/interactions/$id"
              params={{ id: i.id }}
              className="block px-4 py-3 transition-colors hover:bg-muted/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[13px]">{i.command}</span>
                <StatusBadge status={i.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {i.text ? truncate(i.text, 80) : <span className="italic">No text</span>}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{i.username}</span>
                <span>{i.guildName}</span>
                <RelativeTime iso={i.receivedAt} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

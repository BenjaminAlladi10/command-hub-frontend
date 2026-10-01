import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatNumber, formatPercent } from "@/lib/formatters";
import type { Stats } from "@/types";

/** Derived only from /api/stats totals — no synthetic history. */
export function StatusDistribution({ stats }: { stats: Stats }) {
  const other = Math.max(
    0,
    stats.totalInteractions - stats.successfulInteractions - stats.failedInteractions,
  );
  const data = [
    { name: "Successful", value: stats.successfulInteractions, color: "var(--success)" },
    { name: "Failed", value: stats.failedInteractions, color: "var(--danger)" },
    { name: "Awaiting reply", value: other, color: "var(--warning)" },
  ];
  const total = stats.totalInteractions || 1;

  return (
    <div className="grid gap-6 p-4 md:grid-cols-[1fr_14rem]">
      <div className="h-40" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={14}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 self-center text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2 rounded-sm" style={{ background: d.color }} aria-hidden="true" />
              {d.name}
            </span>
            <span className="tabular-nums text-foreground">
              {formatNumber(d.value)}{" "}
              <span className="text-muted-foreground">({formatPercent(d.value / total)})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

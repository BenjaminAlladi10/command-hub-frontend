import { formatNumber } from "@/lib/formatters";

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "default" | "success" | "danger";
}) {
  const accent =
    tone === "success" ? "bg-success" : tone === "danger" ? "bg-danger" : "bg-muted-foreground/40";
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={`size-1.5 rounded-full ${accent}`} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-card-foreground">
        {formatNumber(value)}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

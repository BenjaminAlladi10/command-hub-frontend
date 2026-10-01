import type { ReactNode } from "react";

export function PageIntro({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-border bg-card ${className ?? ""}`}>
      {title ? (
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
          <dt className="text-xs font-medium text-muted-foreground sm:text-sm">{item.label}</dt>
          <dd className="min-w-0 break-words text-sm text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

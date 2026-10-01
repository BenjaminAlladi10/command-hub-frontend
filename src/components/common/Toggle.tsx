import type { ReactNode } from "react";

import { Switch } from "@/components/ui/switch";

/** Labelled switch row used across configuration forms. */
export function ToggleField({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
  badge,
}: {
  id: string;
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
          {badge}
        </div>
        {description ? (
          <p id={`${id}-desc`} className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-desc` : undefined}
      />
    </div>
  );
}

export function OnOff({ on, onLabel = "On", offLabel = "Off" }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${on ? "bg-success" : "bg-muted-foreground/50"}`}
      />
      <span className={on ? "text-foreground" : "text-muted-foreground"}>{on ? onLabel : offLabel}</span>
    </span>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-danger-foreground">
      {message}
    </p>
  );
}

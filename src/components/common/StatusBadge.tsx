import { CheckCircle2, CircleDashed, Clock, RotateCw, XCircle } from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";
import type { ActionStatus, InteractionStatus } from "@/types";

type AnyStatus = InteractionStatus | ActionStatus;

const CONFIG: Record<
  AnyStatus,
  { label: string; className: string; Icon: ComponentType<{ className?: string }> }
> = {
  received: {
    label: "Received",
    className: "bg-neutral-status-surface text-neutral-status",
    Icon: CircleDashed,
  },
  replied: {
    label: "Replied",
    className: "bg-success-surface text-success-foreground",
    Icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "bg-danger-surface text-danger-foreground",
    Icon: XCircle,
  },
  success: {
    label: "Success",
    className: "bg-success-surface text-success-foreground",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "bg-warning-surface text-warning-foreground",
    Icon: Clock,
  },
  retrying: {
    label: "Retrying",
    className: "bg-warning-surface text-warning-foreground",
    Icon: RotateCw,
  },
};

export function StatusBadge({ status, className }: { status: AnyStatus; className?: string }) {
  const { label, className: tone, Icon } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

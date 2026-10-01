import { Activity, LayoutDashboard, Server, Terminal } from "lucide-react";

export const NAV_ITEMS = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard },
  { title: "Interactions", to: "/interactions", icon: Activity },
  { title: "Commands", to: "/commands", icon: Terminal },
  { title: "Guilds", to: "/guilds", icon: Server },
] as const;

export interface Crumb {
  label: string;
  to?: string;
}

/** Breadcrumbs derived from the pathname so the header stays route-agnostic. */
export function breadcrumbsFor(pathname: string): Crumb[] {
  const [section, detail] = pathname.split("/").filter(Boolean);
  if (!section) return [{ label: "Dashboard" }];
  const labels: Record<string, string> = {
    interactions: "Interactions",
    commands: "Commands",
    guilds: "Guilds",
    settings: "Settings",
  };
  const label = labels[section] ?? "Not found";
  if (!detail) return [{ label }];
  const detailLabel = section === "commands" ? `/${decodeURIComponent(detail)}` : decodeURIComponent(detail);
  return [{ label, to: `/${section}` }, { label: detailLabel }];
}

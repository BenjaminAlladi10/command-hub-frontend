import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronRight, LogOut, Moon, Settings, Sun } from "lucide-react";
import { Fragment } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { breadcrumbsFor } from "@/lib/nav";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = breadcrumbsFor(pathname);
  const { user, signOut } = useAuth();
  const { resolved, toggle } = useTheme();
  const navigate = useNavigate();
  const initial = user?.email.charAt(0).toUpperCase() ?? "?";

  async function handleLogout() {
    await signOut();
    toast.success("Signed out");
    void navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-5">
      <SidebarTrigger aria-label="Toggle navigation" />
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.label}>
              {index > 0 ? (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              ) : null}
              <li className="min-w-0 truncate">
                {crumb.to ? (
                  <Link to={crumb.to} className="text-muted-foreground hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      >
        {resolved === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu">
            <span className="flex size-7 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium">
              {initial}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="truncate text-sm">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_ITEMS } from "@/lib/nav";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const { resolved, toggle } = useTheme();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const close = () => setOpenMobile(false);

  async function handleLogout() {
    await signOut();
    toast.success("Signed out");
    void navigate({ to: "/login" });
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-4 py-4">
        <Link to="/" onClick={close} className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded bg-primary font-mono text-xs font-semibold text-primary-foreground">
            /
          </span>
          <span className="text-sm font-semibold tracking-tight">Command Hub</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link to={item.to} onClick={close}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <Link to="/settings" onClick={close}>
                <Settings aria-hidden="true" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggle}>
              {resolved === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              <span>{resolved === "dark" ? "Light theme" : "Dark theme"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings" onClick={close} title={user?.email}>
                <User aria-hidden="true" />
                <span className="truncate">{user?.email ?? "Account"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut aria-hidden="true" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

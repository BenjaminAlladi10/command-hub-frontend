import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/AuthProvider";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) return <ShellSkeleton />;
  if (!user) return <Navigate to="/login" search={{ redirect: pathname }} replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <AppHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
            <div key={pathname} className="page-enter">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-svh w-full" aria-busy="true" aria-label="Loading">
      <div className="hidden w-64 flex-col gap-3 border-r border-border bg-sidebar p-4 md:flex">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="flex-1">
        <div className="h-14 border-b border-border" />
        <div className="mx-auto max-w-6xl space-y-4 p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

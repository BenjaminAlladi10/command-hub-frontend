import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { FieldError } from "@/components/common/Toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, toMessage } from "@/lib/api-error";
import { fieldErrors, loginSchema } from "@/schemas";
import { useAuth } from "@/providers/AuthProvider";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Command Hub" },
      { name: "description", content: "Sign in to the Command Hub admin console." },
      { property: "og:title", content: "Sign in — Command Hub" },
      { property: "og:description", content: "Sign in to the Command Hub admin console." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, signIn } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const target = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
  if (user && !submitting) return <Navigate to={target} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await signIn(parsed.data);
      void navigate({ to: target, replace: true });
    } catch (error) {
      setServerError(
        error instanceof ApiError && error.status === 401
          ? "Incorrect email or password."
          : toMessage(error),
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="page-enter w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded bg-primary font-mono text-sm font-semibold text-primary-foreground">
            /
          </span>
          <span className="text-base font-semibold tracking-tight">Command Hub</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use your administrator account.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {serverError ? (
            <div role="alert" className="rounded-md border border-danger/30 bg-danger-surface px-3 py-2 text-sm text-danger-foreground">
              {serverError}
            </div>
          ) : null}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            <FieldError id="email-error" message={errors.email} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <FieldError id="password-error" message={errors.password} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}

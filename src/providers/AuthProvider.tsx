import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";

import { authApi, setUnauthorizedHandler } from "@/api";
import { ApiError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        return (await authApi.me()).user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  const clearSession = useCallback(() => {
    queryClient.setQueryData(queryKeys.auth.me(), null);
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  const signIn = useCallback(
    async (input: { email: string; password: string }) => {
      const { user } = await authApi.login(input);
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    await authApi.logout();
    queryClient.clear();
    queryClient.setQueryData(queryKeys.auth.me(), null);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{ user: data ?? null, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

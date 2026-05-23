import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const {
    data: user,
    isLoading,
    error,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("local_auth_token");
    window.location.reload();
  }, []);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading,
      error,
      logout,
    }),
    [user, isLoading, error, logout],
  );
}

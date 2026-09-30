import { useQuery } from "@tanstack/react-query";

import { statsApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats.all(),
    queryFn: () => statsApi.getStats(),
    staleTime: 15_000,
  });
}

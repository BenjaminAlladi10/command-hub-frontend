import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { interactionsApi } from "@/api";
import { PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import type { InteractionQuery } from "@/types";

export function useInteractions(
  filters: Omit<InteractionQuery, "cursor" | "limit" | "page">,
  pageSize: number = PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.interactions.list({ ...filters, limit: pageSize }),
    queryFn: ({ pageParam }) =>
      interactionsApi.listInteractions({
        ...filters,
        page: Number(pageParam) || 1,
        limit: pageSize,
      }),
    initialPageParam: "1",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useInteraction(id: string) {
  return useQuery({
    queryKey: queryKeys.interactions.detail(id),
    queryFn: () => interactionsApi.getInteraction(id),
  });
}

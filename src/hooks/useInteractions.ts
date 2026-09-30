import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { interactionsApi } from "@/api";
import { LIVE_REFETCH_MS, PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import type { InteractionQuery } from "@/types";

export function useInteractions(
  filters: Omit<InteractionQuery, "cursor" | "limit">,
  live: boolean,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.interactions.list(filters),
    queryFn: ({ pageParam }) =>
      interactionsApi.listInteractions({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: live ? LIVE_REFETCH_MS : false,
    refetchIntervalInBackground: false,
  });
}

export function useInteraction(id: string | null) {
  return useQuery({
    queryKey: queryKeys.interactions.detail(id ?? "none"),
    queryFn: () => interactionsApi.getInteraction(id as string),
    enabled: Boolean(id),
  });
}

export function useRetryAction(interactionId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) => interactionsApi.retryAction(actionId),
    onSettled: () => {
      if (interactionId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.interactions.detail(interactionId),
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.interactions.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all() });
    },
  });
}

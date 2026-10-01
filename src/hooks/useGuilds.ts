import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { guildsApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";

export function useGuilds() {
  return useQuery({
    queryKey: queryKeys.guilds.list(),
    queryFn: () => guildsApi.listGuilds(),
    staleTime: 60_000,
  });
}

export function useUpdateGuild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: guildsApi.updateGuild,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.guilds.all() });
    },
  });
}

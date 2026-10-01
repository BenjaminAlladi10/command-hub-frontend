import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { commandsApi } from "@/api";
import type { UpdateCommandInput } from "@/api/endpoints/commands";
import { queryKeys } from "@/lib/query-keys";

export function useCommands(guildId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.commands.list(guildId ?? "none"),
    queryFn: () => commandsApi.listCommands(guildId as string),
    enabled: Boolean(guildId),
  });
}

export function useUpdateCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCommandInput) => commandsApi.updateCommand(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.commands.list(input.guildId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all() });
    },
  });
}

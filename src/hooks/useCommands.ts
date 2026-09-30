import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { commandsApi } from "@/api";
import { queryKeys } from "@/lib/query-keys";
import type { CommandConfig } from "@/types";

export function useCommands(guildId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.commands.list(guildId ?? "none"),
    queryFn: () => commandsApi.listCommands(guildId as string),
    enabled: Boolean(guildId),
  });
}

export function useUpdateCommand(guildId: string | undefined) {
  const queryClient = useQueryClient();
  const key = queryKeys.commands.list(guildId ?? "none");

  return useMutation({
    mutationFn: (input: {
      name: string;
      enabled: boolean;
      rule: CommandConfig["rule"];
    }) => commandsApi.updateCommand({ guildId: guildId as string, ...input }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CommandConfig[]>(key);
      queryClient.setQueryData<CommandConfig[]>(key, (current) =>
        current?.map((c) =>
          c.name === input.name ? { ...c, enabled: input.enabled, rule: input.rule } : c,
        ),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

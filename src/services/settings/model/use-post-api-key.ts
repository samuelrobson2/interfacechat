import { useSessionStore } from "@/services/auth";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import type { ProviderTokenSource } from "./settings-connection-providers";
import { settingsQueryOptions } from "./settings-query-options";

export type { ImportSourceProvider, ProviderTokenSource } from "./settings-connection-providers";

export function usePostApiKey() {
  const user = useSessionStore((state) => state.user);
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "post",
    "/users/{id}/settings/api-tokens",
  );

  const postApiKey = (
    data: Omit<ApiSchemas["UpdateUserApiKeysDto"], "provider"> & {
      provider: ProviderTokenSource;
    },
    onSuccess?: () => void,
  ) => {
    if (!user?.user_id) return;

    mutateAsync(
      {
        params: {
          path: {
            id: user.user_id,
          },
        },
        body: data,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(
            settingsQueryOptions.settings(user.user_id),
          );
          onSuccess?.();
        },
      },
    );
  };

  return {
    postApiKey,
    isPending,
    errorMessage: error?.responseMessage,
  };
}

import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import { settingsQueryOptions } from "./settings-query-options";

export function useRevokeApiKey() {
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "delete",
    "/api-keys/{id}",
  );

  const revokeApiKey = async (id: string, onSuccess?: () => void) => {
    await mutateAsync(
      {
        params: {
          path: { id },
        },
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(settingsQueryOptions.apiKeys());
          onSuccess?.();
        },
      },
    );
  };

  return {
    revokeApiKey,
    isPending,
    errorMessage: error ? getApiErrorMessage(error) : undefined,
  };
}

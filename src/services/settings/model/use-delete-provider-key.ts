import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import { settingsQueryOptions } from "./settings-query-options";

export function useDeleteProviderKey() {
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "delete",
    "/users/provider-keys/{provider}",
  );

  const deleteProviderKey = async (provider: string, onSuccess?: () => void) => {
    await mutateAsync(
      {
        params: {
          path: { provider },
        },
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(settingsQueryOptions.providerKeys());
          onSuccess?.();
        },
      },
    );
  };

  return {
    deleteProviderKey,
    isPending,
    errorMessage: error ? getApiErrorMessage(error) : undefined,
  };
}

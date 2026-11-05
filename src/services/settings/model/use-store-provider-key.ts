import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { settingsQueryOptions } from "./settings-query-options";

export function useStoreProviderKey() {
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "post",
    "/users/provider-keys",
  );

  const storeProviderKey = async (
    body: ApiSchemas["StoreProviderKeyDto"],
    onSuccess?: () => void,
  ) => {
    await mutateAsync(
      { body },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(
            settingsQueryOptions.providerKeys(),
          );
          onSuccess?.();
        },
      },
    );
  };

  return {
    storeProviderKey,
    isPending,
    errorMessage: error ? getApiErrorMessage(error) : undefined,
  };
}

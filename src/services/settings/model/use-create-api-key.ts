import { useSessionStore } from "@/services/auth";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { settingsQueryOptions } from "./settings-query-options";

export function useCreateApiKey() {
  const user = useSessionStore((state) => state.user);
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "post",
    "/api-keys",
  );

  const createApiKey = async (
    name: string,
    onSuccess?: (data: ApiSchemas["CreateApiKeyResponseDto"]) => void,
  ) => {
    const organizationId = user?.organizations[0]?.organization_id;
    if (!organizationId) return;

    const data = await mutateAsync(
      {
        body: {
          name,
          organizationId,
        },
      },
    );

    await queryClient.invalidateQueries(settingsQueryOptions.apiKeys());
    onSuccess?.(data);
    return data;
  };

  return {
    createApiKey,
    isPending,
    errorMessage: error ? getApiErrorMessage(error) : undefined,
  };
}

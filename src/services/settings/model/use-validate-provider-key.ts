import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";

export function useValidateProviderKey() {
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "post",
    "/users/provider-keys/{provider}/validate",
  );

  const validateProviderKey = async (args: {
    provider: string;
    body: ApiSchemas["ValidateProviderKeyDto"];
  }) =>
    mutateAsync({
      params: { path: { provider: args.provider } },
      body: args.body,
    });

  return {
    validateProviderKey,
    isPending,
    errorMessage: error ? getApiErrorMessage(error) : undefined,
  };
}

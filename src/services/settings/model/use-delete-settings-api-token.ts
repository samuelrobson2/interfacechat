import { useSessionStore } from "@/services/auth";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import { settingsQueryOptions } from "./settings-query-options";

type SettingsTokenProvider = "huggingface";

export function useDeleteSettingsApiToken() {
  const user = useSessionStore((state) => state.user);
  const { mutateAsync, isPending, error } = rqClient.useMutation(
    "delete",
    "/users/{id}/settings/api-tokens/{provider}",
  );

  const deleteSettingsApiToken = async (
    provider: SettingsTokenProvider,
    onSuccess?: () => void,
  ) => {
    if (!user?.user_id) return;

    await mutateAsync({
      params: {
        path: {
          id: user.user_id,
          provider,
        },
      },
    });
    await queryClient.invalidateQueries(
      settingsQueryOptions.settings(user.user_id),
    );
    onSuccess?.();
  };

  return {
    deleteSettingsApiToken,
    isPending,
    errorMessage: error ? getApiErrorMessage(error) : undefined,
  };
}

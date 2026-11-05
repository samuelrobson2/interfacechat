import { useSessionStore } from "@/services/auth";
import { settingsQueryOptions } from "./settings-query-options";
import type { SettingsApiKeyProvider } from "./settings-connection-providers";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useApiKeysSuspense() {
  const user = useSessionStore((state) => state.user);
  const { data: settings } = useSuspenseQuery(
    settingsQueryOptions.settings(user!.user_id!),
  );
  const { data: apiKeys } = useSuspenseQuery(settingsQueryOptions.apiKeys());

  const isApiKeyExists = (provider: SettingsApiKeyProvider) =>
    settings.apiKeys.find((apiKey) => apiKey.provider === provider)?.exists ??
    false;

  return {
    isApiKeyExists,
    apiKeys,
  };
}

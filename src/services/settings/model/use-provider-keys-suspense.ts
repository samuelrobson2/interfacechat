import { useSuspenseQuery } from "@tanstack/react-query";
import type { ApiSchemas } from "@/shared/api/schema";
import { settingsQueryOptions } from "./settings-query-options";

/** GET /users/provider-keys — body matches `ProviderKeyListDto`. */
export function useProviderKeysSuspense(): ApiSchemas["ProviderKeyListDto"] {
  const { data } = useSuspenseQuery(settingsQueryOptions.providerKeys());
  return data;
}

import { rqClient } from "../../../shared/api/instance";

export const settingsQueryOptions = {
  settings: (user_id: string) =>
    rqClient.queryOptions("get", "/users/{id}/settings", {
      params: {
        path: {
          id: user_id,
        },
      },
    }),
  badges: (user_id: string) =>
    rqClient.queryOptions("get", "/users/{id}/badges", {
      params: {
        path: {
          id: user_id,
        },
      },
    }),
  apiKeys: () => rqClient.queryOptions("get", "/api-keys"),
  providerKeys: () => rqClient.queryOptions("get", "/users/provider-keys"),
} as const;

import { rqClient } from "@/shared/api/instance";

export const internalizationQueryOptions = {
  languages: () => rqClient.queryOptions("get", "/users/languages"),
  countries: () => rqClient.queryOptions("get", "/users/countries"),
  languageCountryPairs: () =>
    rqClient.queryOptions("get", "/users/language-country-pairs"),
  domains: () => rqClient.queryOptions("get", "/users/domains"),
} as const;

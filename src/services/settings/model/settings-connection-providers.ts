/** OAuth connection status in GET /users/{id}/settings → apiKeys[].provider */
export const KAGGLE_OAUTH_PROVIDER = "kaggle_oauth";
export const GOOGLE_SHEETS_PROVIDER = "google_sheets";
export const HUGGINGFACE_PROVIDER = "huggingface";
export const API_KEY_PROVIDER = "api_key";

export type OAuthConnectionProvider =
  | "kaggle_oauth"
  | "google_sheets"

/** Providers shown on Settings → API keys (excludes deprecated legacy `kaggle` token). */
export type SettingsApiKeyProvider =
  | typeof API_KEY_PROVIDER
  | typeof HUGGINGFACE_PROVIDER
  | OAuthConnectionProvider;

/** Dataset import source on the link-import step — not a settings connection provider. */
export type ImportSourceProvider = "huggingface" | "kaggle" | "remote-url";

export type ProviderTokenSource = "huggingface" | "remote-url";

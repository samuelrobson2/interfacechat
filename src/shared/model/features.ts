import { CONFIG } from "./config";

// Runtime feature flags. A single generic entry point (`isFeatureEnabled`) so
// call sites never read env/localStorage directly. Add a flag by extending
// FEATURE_FLAGS and exposing a thin `isXEnabled` wrapper below.

type AppEnv = "dev" | "stage" | "production";

type FeatureFlag = {
  // Per-session override keys so QA can flip a flag without a rebuild.
  storageKey: string;
  queryParam: string;
  // Environments where the flag may be turned on at all.
  enabledEnvs: AppEnv[];
  // Value used inside an allowed env when there is no override.
  defaultValue: boolean;
};

const FEATURE_FLAGS = {
  componentStream: {
    storageKey: "ff.componentStream",
    queryParam: "componentStream",
    enabledEnvs: ["dev"],
    defaultValue: true,
  },
} satisfies Record<string, FeatureFlag>;

type FeatureFlagName = keyof typeof FEATURE_FLAGS;

// A URL param (?flag=1|0) wins and is persisted to localStorage so it survives
// in-app navigation; otherwise the previously stored value, else no override.
const readOverride = (flag: FeatureFlag): boolean | null => {
  if (typeof window === "undefined") return null;

  try {
    const query = new URLSearchParams(window.location.search).get(
      flag.queryParam,
    );
    if (query === "1" || query === "true") {
      window.localStorage.setItem(flag.storageKey, "1");
      return true;
    }
    if (query === "0" || query === "false") {
      window.localStorage.setItem(flag.storageKey, "0");
      return false;
    }

    const stored = window.localStorage.getItem(flag.storageKey);
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // localStorage can throw (private mode / disabled storage) — use default.
  }

  return null;
};

/**
 * Whether a runtime feature flag is on. Each flag is hard-gated to an allow
 * list of environments, so a stray localStorage/URL override can never leak
 * it into an env where it isn't listed. Within an allowed env the default
 * applies unless overridden per session.
 */
export const isFeatureEnabled = (name: FeatureFlagName): boolean => {
  const flag = FEATURE_FLAGS[name];
  const appEnv = CONFIG.APP_ENV as AppEnv | undefined;
  if (!appEnv || !(flag.enabledEnvs as readonly AppEnv[]).includes(appEnv)) {
    return false;
  }
  return readOverride(flag) ?? flag.defaultValue;
};

/** Assistant "component stream" rendering path (dev-only). */
export const isComponentStreamEnabled = (): boolean =>
  isFeatureEnabled("componentStream");

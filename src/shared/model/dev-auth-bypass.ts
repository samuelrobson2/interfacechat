// DEV-ONLY escape hatch. When VITE_AUTH_BYPASS=true (see .env.local), auth gates
// and signin redirects are skipped so the app shell and its links are navigable
// without a working backend. The DEV-gated half can never be true in a real
// production build because import.meta.env.DEV is false there.
//
// VITE_DEMO_MODE is a separate, opt-in escape hatch for the standalone, backend-
// less demo deployment (e.g. Vercel): it enables the mock shell in a production
// build. It defaults off and must NEVER be set on the real, backend-connected
// deployment — it would skip the real auth gates.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export const DEV_AUTH_BYPASS =
  (import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === "true") ||
  DEMO_MODE;

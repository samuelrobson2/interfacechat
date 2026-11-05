const isEnvFlagOn = (value: string | undefined) => value === "true";

/** Vega chart chat at `/chat/visualize` (Pharos feature/charts port). */
export const isChatVisualizeEnabled = (): boolean => {
  const value = import.meta.env.VITE_FF_CHAT_VISUALIZE as string | undefined;
  if (value === "false") return false;
  if (isEnvFlagOn(value)) return true;
  // Enabled by default in local dev so the ported UI is reachable without env setup.
  return import.meta.env.DEV;
};

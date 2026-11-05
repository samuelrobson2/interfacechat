import type { TopLevelSpec } from "vega-lite";

/** Vega-Lite's implicit plot height when a spec omits `height`. */
const VEGA_DEFAULT_HEIGHT = 300;
/** Thread cards sit at ~660px; fullscreen should read clearly larger. */
const FULLSCREEN_HEIGHT_RATIO = 1.6;
/** Cap so the cluster (toolbar + card + composer) still fits a laptop viewport. */
const FULLSCREEN_HEIGHT_CAP = 520;

type SizedSpec = {
  width?: unknown;
  height?: unknown;
};

export const toFullscreenSpec = (spec: TopLevelSpec): TopLevelSpec => {
  const sized = spec as SizedSpec;

  if (sized.height === "container" || typeof sized.height === "object") {
    return spec;
  }

  const base =
    typeof sized.height === "number" ? sized.height : VEGA_DEFAULT_HEIGHT;
  const height = Math.round(
    Math.min(base * FULLSCREEN_HEIGHT_RATIO, FULLSCREEN_HEIGHT_CAP),
  );
  const ratio = height / base;
  const width =
    typeof sized.width === "number"
      ? Math.round(sized.width * ratio)
      : sized.width;

  if (height === sized.height && width === sized.width) return spec;
  return {
    ...spec,
    height,
    ...(width === undefined ? {} : { width }),
  } as TopLevelSpec;
};

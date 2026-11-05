import { authoredValues, editableFor } from "./authored-properties";

export type PlotTarget = {
  /** Vega's own vocabulary: mark, axis-label, axis-grid, legend-symbol, … */
  role: string;
  /** Mark type for data marks: bar, line, point, arc, … */
  markType?: string;
  /** Encoding channel the element belongs to: x, y, color, size, … */
  channel?: string;
  /** JSON Pointer into the Vega-Lite spec — what an edit would patch. */
  pointer: string;
  /** The encoded field, when the element belongs to a channel. */
  field?: string;
  /** Short human label for the hover chip. */
  label: string;
  datum?: Record<string, unknown>;
  /** What is painted on this element right now, after theme + spec merge. */
  currentValues: Record<string, unknown>;
  /** Pixels relative to the chart host. Frontend-only, never sent anywhere. */
  bbox: { x: number; y: number; width: number; height: number };
};

type SceneMark = {
  role?: string;
  marktype?: string;
  name?: string;
  group?: SceneItem;
};

type SceneItem = {
  datum?: unknown;
  mark?: SceneMark;
  [prop: string]: unknown;
};

const sceneItemOf = (node: EventTarget | null): SceneItem | null => {
  const data = (node as { __data__?: unknown } | null)?.__data__;
  const item = Array.isArray(data) ? data[0] : data;
  return item && typeof item === "object" ? (item as SceneItem) : null;
};

const roleFromClass = (el: Element): string | null => {
  const host = el.closest("[class*='role-']");
  const match = /\brole-([\w-]+)/.exec(host?.getAttribute("class") ?? "");
  return match?.[1] ?? null;
};

const MAX_GROUP_DEPTH = 8;

const fromEnclosingDatum = <T>(
  item: SceneItem | null,
  pick: (datum: Record<string, unknown>) => T | undefined,
): T | undefined => {
  let current = item;
  for (let depth = 0; current && depth < MAX_GROUP_DEPTH; depth += 1) {
    const datum = current.datum;
    if (datum && typeof datum === "object") {
      const found = pick(datum as Record<string, unknown>);
      if (found !== undefined) return found;
    }
    current = current.mark?.group ?? null;
  }
  return undefined;
};

const axisScaleName = (item: SceneItem | null): string | undefined =>
  fromEnclosingDatum(item, (datum) =>
    typeof datum.scale === "string" ? datum.scale : undefined,
  );

const legendScaleName = (item: SceneItem | null): string | undefined =>
  fromEnclosingDatum(item, (datum) => {
    if (!datum.scales || typeof datum.scales !== "object") return undefined;
    const names = Object.values(datum.scales as Record<string, unknown>);
    return names.find((name): name is string => typeof name === "string");
  });

const COMPOSITION_KEY = /^(layer|concat|hconcat|vconcat)$/;


const splitBranch = (name: string): string => {
  const tokens = name.split("_");
  let branch = "";
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index] ?? "";
    if (token === "child") {
      branch += "/spec";
      index += 1;
      continue;
    }
    const next = tokens[index + 1] ?? "";
    if (COMPOSITION_KEY.test(token) && /^\d+$/.test(next)) {
      branch += `/${token}/${next}`;
      index += 2;
      continue;
    }
    break;
  }
  return branch;
};

const channelOf = (scaleName: string): string => {
  const branch = splitBranch(scaleName);
  const consumed = branch.split("/").filter(Boolean).length;
  return scaleName.split("_").slice(consumed).join("_");
};

const valueAt = (node: unknown, segments: string[]): unknown => {
  let current = node;
  for (const segment of segments) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
};

const BRANCH_KEYS = ["spec", "layer", "concat", "hconcat", "vconcat"];

const searchBranch = (
  node: unknown,
  container: string[],
  prefix: string,
): string | null => {
  if (!node || typeof node !== "object") return null;
  if (valueAt(node, container) !== undefined) return prefix;

  const record = node as Record<string, unknown>;
  for (const key of BRANCH_KEYS) {
    const child = record[key];
    if (Array.isArray(child)) {
      for (const [index, entry] of child.entries()) {
        const found = searchBranch(
          entry,
          container,
          `${prefix}/${key}/${index}`,
        );
        if (found !== null) return found;
      }
    } else if (child) {
      const found = searchBranch(child, container, `${prefix}/${key}`);
      if (found !== null) return found;
    }
  }
  return null;
};

const locateBranch = (
  spec: Record<string, unknown>,
  guess: string,
  path: string[],
): string | null => {
  const container = path.slice(0, -1);
  const segments = guess ? guess.slice(1).split("/") : [];

  for (let length = segments.length; length >= 0; length -= 1) {
    const branch = segments.slice(0, length);
    if (valueAt(spec, [...branch, ...container]) !== undefined) {
      return branch.length > 0 ? `/${branch.join("/")}` : "";
    }
  }
  return searchBranch(spec, container, "");
};

const AXIS_SUFFIX: Record<string, string[]> = {
  "axis-label": [],
  "axis-title": ["title"],
  "axis-domain": ["domain"],
  "axis-grid": ["grid"],
  "axis-tick": ["ticks"],
};

const AXIS_LABEL: Record<string, string> = {
  "axis-label": "labels",
  "axis-title": "title",
  "axis-domain": "line",
  "axis-grid": "gridlines",
  "axis-tick": "ticks",
};

const LEGEND_ROLES = new Set([
  "legend-symbol",
  "legend-label",
  "legend-entry",
  "legend-band",
  "legend-gradient",
]);

const facetHeaderPath = (
  spec: Record<string, unknown>,
  orientation: "row" | "column",
): string[] => {
  const facet = spec.facet;
  const mapped =
    facet !== null &&
    typeof facet === "object" &&
    orientation in (facet as Record<string, unknown>);
  return mapped ? ["facet", orientation, "header"] : ["facet", "header"];
};

type Resolved = {
  pointer: string;
  label: string;
  channel?: string;
  field?: string;
};

const resolve = (
  role: string,
  item: SceneItem | null,
  spec: Record<string, unknown>,
): Resolved | null => {
  const compose = (branch: string | null, path: string[]): string | null =>
    branch === null ? null : `${branch}/${path.join("/")}`;

  if (role === "mark") {
    const branch = locateBranch(spec, splitBranch(item?.mark?.name ?? ""), [
      "mark",
    ]);
    const pointer = compose(branch, ["mark"]);
    return pointer
      ? { pointer, label: `${item?.mark?.marktype ?? "mark"} mark` }
      : null;
  }

  if (role in AXIS_SUFFIX) {
    const scaleName = axisScaleName(item);
    if (!scaleName) return null;
    const channel = channelOf(scaleName);
    const encoding = ["encoding", channel];
    const branch = locateBranch(spec, splitBranch(scaleName), [
      ...encoding,
      "axis",
    ]);
    const pointer = compose(branch, [
      ...encoding,
      "axis",
      ...(AXIS_SUFFIX[role] ?? []),
    ]);
    if (!pointer) return null;
    return {
      pointer,
      channel,
      field: valueAt(spec, [
        ...(branch ?? "").split("/").filter(Boolean),
        ...encoding,
        "field",
      ]) as string | undefined,
      label: `${channel.toUpperCase()}-axis ${AXIS_LABEL[role]}`,
    };
  }

  if (LEGEND_ROLES.has(role) || role === "legend-title") {
    const scaleName = legendScaleName(item);
    if (!scaleName) return null;
    const channel = channelOf(scaleName);
    const encoding = ["encoding", channel];
    const branch = locateBranch(spec, splitBranch(scaleName), [
      ...encoding,
      "legend",
    ]);
    const suffix = role === "legend-title" ? ["title"] : [];
    const pointer = compose(branch, [...encoding, "legend", ...suffix]);
    if (!pointer) return null;
    return {
      pointer,
      channel,
      field: valueAt(spec, [
        ...(branch ?? "").split("/").filter(Boolean),
        ...encoding,
        "field",
      ]) as string | undefined,
      label: role === "legend-title" ? "legend title" : `${channel} legend`,
    };
  }

  if (role.startsWith("row-") || role.startsWith("column-")) {
    const orientation = role.startsWith("row-") ? "row" : "column";
    const path = facetHeaderPath(spec, orientation);
    return { pointer: `/${path.join("/")}`, label: "facet header" };
  }

  if (role === "title" || role === "title-text") {
    return { pointer: "/title", label: "chart title" };
  }

  return null;
};

const cleanDatum = (datum: unknown): Record<string, unknown> | undefined => {
  if (!datum || typeof datum !== "object") return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(datum as Record<string, unknown>)) {
    if (key.startsWith("_") || key.startsWith("$")) continue;
    if (value !== null && typeof value === "object") continue;
    out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
};

const STYLE_PROPS = [
  "fill",
  "fillOpacity",
  "stroke",
  "strokeWidth",
  "strokeDash",
  "strokeOpacity",
  "opacity",
  "font",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "size",
  "shape",
  "cornerRadius",
  "angle",
  "align",
  "baseline",
  "interpolate",
  "limit",
];

const isSendable = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) {
    return value.every((entry) => typeof entry !== "object");
  }
  if (typeof value === "object") return "gradient" in value;
  return typeof value !== "function";
};

const paintedStyle = (item: SceneItem | null): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (!item) return out;
  for (const prop of STYLE_PROPS) {
    const value = item[prop];
    if (isSendable(value)) out[prop] = value;
  }
  return out;
};

const MIN_HIT_SIZE_PX = 8;

/**
 * Resolves the element under the pointer into something an edit could address.
 * Returns null for chrome that carries no editable meaning (the frame, the
 * background, empty plot space).
 */
export const describeTarget = (
  eventTarget: EventTarget | null,
  hostRect: DOMRect,
  spec: object,
): PlotTarget | null => {
  if (!(eventTarget instanceof Element)) return null;

  const el =
    eventTarget.tagName === "tspan" ? eventTarget.parentElement : eventTarget;
  if (!el) return null;

  const item = sceneItemOf(el);
  const role = item?.mark?.role ?? roleFromClass(el);
  if (!role) return null;

  const resolved = resolve(role, item, spec as Record<string, unknown>);
  if (!resolved) return null;

  const rect = el.getBoundingClientRect();
  const padX = Math.max(0, (MIN_HIT_SIZE_PX - rect.width) / 2);
  const padY = Math.max(0, (MIN_HIT_SIZE_PX - rect.height) / 2);

  return {
    role,
    markType: role === "mark" ? item?.mark?.marktype : undefined,
    channel: resolved.channel,
    pointer: resolved.pointer,
    field: resolved.field,
    label: resolved.label,
    datum: cleanDatum(item?.datum),
    currentValues: paintedStyle(item),
    bbox: {
      x: rect.left - hostRect.left - padX,
      y: rect.top - hostRect.top - padY,
      width: rect.width + padX * 2,
      height: rect.height + padY * 2,
    },
  };
};

/**
 * Identity of one clicked element. The pointer alone is not enough: every bar of
 * a mark shares `/mark`, so the datum is what tells two of them apart, and the
 * position is what tells apart two chrome elements the resolver maps to one node.
 */
export const targetKey = (target: PlotTarget) =>
  [
    target.pointer,
    JSON.stringify(target.datum ?? null),
    Math.round(target.bbox.x),
    Math.round(target.bbox.y),
  ].join("|");

/** The target in the wire vocabulary — snake case, no frontend-only fields. */
export const toTargetPayload = (target: PlotTarget) => ({
  role: target.role,
  pointer: target.pointer,
  mark_type: target.markType,
  channel: target.channel,
  field: target.field,
  datum: target.datum,
  current_values: authoredValues(target.role, target.currentValues),
});

export const buildEditRequest = (target: PlotTarget, instruction = "") => ({
  target: { ...toTargetPayload(target), editable: editableFor(target.role) },
  instruction,
});

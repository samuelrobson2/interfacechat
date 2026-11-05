/**
 * Pattern fills for chart marks. Vega never parses a paint string, so
 * `fill: "url(#id)"` reaches the SVG attribute verbatim — including inside a
 * scale range, which is the one place a gradient cannot go.
 */

export const PATTERN_KINDS = [
  "diagonal",
  "diagonal-reverse",
  "dots",
  "crosshatch",
  "grid",
  "vertical",
  "horizontal",
] as const;

export type PatternKind = (typeof PATTERN_KINDS)[number];

export type PatternShape =
  | {
      shape: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
    }
  | { shape: "circle"; cx: number; cy: number; r: number };

export type PatternGeometry = {
  size: number;
  opacity: number;
  rotate?: number;
  shapes: PatternShape[];
};

export const PATTERN_GEOMETRY: Record<PatternKind, PatternGeometry> = {
  diagonal: {
    size: 7,
    opacity: 0.16,
    rotate: 45,
    shapes: [{ shape: "line", x1: 0, y1: 0, x2: 0, y2: 7, width: 2 }],
  },
  "diagonal-reverse": {
    size: 7,
    opacity: 0.16,
    rotate: -45,
    shapes: [{ shape: "line", x1: 0, y1: 0, x2: 0, y2: 7, width: 2 }],
  },
  dots: {
    size: 9,
    opacity: 0.14,
    shapes: [{ shape: "circle", cx: 4.5, cy: 4.5, r: 1.7 }],
  },
  crosshatch: {
    size: 7,
    opacity: 0.14,
    shapes: [
      { shape: "line", x1: 0, y1: 0, x2: 7, y2: 7, width: 1.3 },
      { shape: "line", x1: 7, y1: 0, x2: 0, y2: 7, width: 1.3 },
    ],
  },
  grid: {
    size: 9,
    opacity: 0.1,
    shapes: [
      { shape: "line", x1: 0, y1: 0, x2: 9, y2: 0, width: 0.75 },
      { shape: "line", x1: 0, y1: 0, x2: 0, y2: 9, width: 0.75 },
    ],
  },
  vertical: {
    size: 7,
    opacity: 0.14,
    shapes: [{ shape: "line", x1: 3.5, y1: 0, x2: 3.5, y2: 7, width: 1.6 }],
  },
  horizontal: {
    size: 7,
    opacity: 0.14,
    shapes: [{ shape: "line", x1: 0, y1: 3.5, x2: 7, y2: 3.5, width: 1.6 }],
  },
};

const ID_PREFIX = "numi-pattern";
const TOKEN = /^var\(\s*--([a-zA-Z][\w-]*)\s*\)$/;
const TOKEN_NAME = /^[a-zA-Z][\w-]*$/;

export const patternFill = (kind: PatternKind, color: string): string => {
  const name = TOKEN.exec(color.trim())?.[1];
  if (!name) {
    throw new Error(
      `patternFill needs a design token like "var(--chart-blue-50)", got "${color}"`,
    );
  }
  return `url(#${ID_PREFIX}--${kind}--${name})`;
};

export type PatternRef = { id: string; kind: PatternKind; color: string };

const isKind = (value: string): value is PatternKind =>
  (PATTERN_KINDS as readonly string[]).includes(value);

export const parsePatternId = (id: string): PatternRef | null => {
  if (!id.startsWith(`${ID_PREFIX}--`)) return null;
  const [kind, name, ...rest] = id.slice(ID_PREFIX.length + 2).split("--");
  if (rest.length > 0 || !kind || !name) return null;
  if (!isKind(kind) || !TOKEN_NAME.test(name)) return null;
  return { id, kind, color: `var(--${name})` };
};

const PATTERN_URL = /^url\(#([^)]+)\)$/;

const walkPatterns = <T>(spec: T, rename: (id: string) => string) => {
  const found = new Map<string, PatternRef>();

  const visit = (node: unknown): unknown => {
    if (typeof node === "string") {
      const base = parsePatternId(PATTERN_URL.exec(node.trim())?.[1] ?? "");
      if (!base) return node;
      const ref = { ...base, id: rename(base.id) };
      found.set(ref.id, ref);
      return `url(#${ref.id})`;
    }
    if (Array.isArray(node)) return node.map(visit);
    if (node && typeof node === "object") {
      return Object.fromEntries(
        Object.entries(node).map(([key, value]) => [key, visit(value)]),
      );
    }
    return node;
  };

  return { spec: visit(spec) as T, patterns: [...found.values()] };
};

const SCOPE = /^[a-zA-Z0-9]+$/;

export const scopePatterns = <T>(spec: T, scope: string) => {
  if (!SCOPE.test(scope)) {
    throw new Error(`A pattern scope has to be alphanumeric, got "${scope}"`);
  }

  const scoped = walkPatterns(spec, (id) => `${id}~${scope}`);
  return scoped.patterns.length > 0 ? scoped : { spec, patterns: [] };
};

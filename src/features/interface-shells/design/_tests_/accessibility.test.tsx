import axe from "axe-core";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { InterfaceShell, type InterfaceShellProps } from "../../interface-shell";
import { SHELL_FIXTURES } from "../../model/shell-fixtures";
import { SHELL_KINDS, type ShellKind, type ShellSize, type SuggestedValues } from "../../model/shell-types";
import { primitives, resolveToken, SHELL_TOKENS, sizeTokens, TOKEN_SIZES } from "../shell-tokens";

/**
 * The design system's accessibility rules (WCAG 2.2 AA), enforced: these
 * fail the build when an interface breaks one, so they aren't advice. Layout
 * checks that need a browser (contrast of drawn pixels, target spacing,
 * scrolling) are covered by the colour and type tests below and by the
 * Design System page's axe audit.
 */

/* ── Colour ─────────────────────────────────────────────────────────── */

const PALETTE: Record<string, string> = Object.fromEntries(
  [...readFileSync(join(process.cwd(), "src/app/styles/colors.css"), "utf8").matchAll(/--(color-[a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(
    ([, name, hex]) => [name!, hex!.toLowerCase()],
  ),
);
const ROLES: Record<string, string> = { "stroke-tertiary": PALETTE["color-gray-2"]!, "typography-primary": PALETTE["color-gray-5"]! };

/** A colour role's value as RGBA over white: hex, var(--color-…), or color-mix(… var() N%, transparent). */
function rgba(value: string): [number, number, number, number] {
  const hex = (h: string) => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  const named = (v: string) => PALETTE[v.replace(/^--/, "")] ?? ROLES[v.replace(/^--/, "")] ?? null;
  const mix = value.match(/color-mix\(in srgb, var\((--[a-z0-9-]+)\) (\d+)%, transparent\)/);
  if (mix) return [...hex(named(mix[1]!)!), Number(mix[2]) / 100];
  const v = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (v) return [...hex(named(v[1]!)!), 1];
  return [...hex(value), 1];
}
const over = ([r, g, b, a]: number[], base: number[]): number[] => [r! * a! + base[0]! * (1 - a!), g! * a! + base[1]! * (1 - a!), b! * a! + base[2]! * (1 - a!)];
const luminance = (rgb: number[]) =>
  rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i]!, 0);
const contrast = (a: number[], b: number[]) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

const role = (name: string) => String(resolveToken(SHELL_TOKENS, primitives(SHELL_TOKENS, "color").find((r) => r.name === name)!.value));
const WHITE = [255, 255, 255];
const surface = (name: string) => over(rgba(role(name)), WHITE);
const BACKGROUNDS = ["panel", "fill", "frame"] as const;

describe("colour contrast (WCAG 1.4.3, 1.4.11)", () => {
  it.each(BACKGROUNDS)("secondary text is 4.5:1 or better on %s", (bg) => {
    expect(contrast(surface("text-secondary"), surface(bg))).toBeGreaterThanOrEqual(4.5);
  });
  it.each(BACKGROUNDS)("primary text is 4.5:1 or better on %s", (bg) => {
    expect(contrast(over(rgba("var(--typography-primary)"), WHITE), surface(bg))).toBeGreaterThanOrEqual(4.5);
  });
  it.each(BACKGROUNDS)("suggested text is 4.5:1 or better on %s", (bg) => {
    expect(contrast(surface("suggest"), surface(bg))).toBeGreaterThanOrEqual(4.5);
  });
  it.each(["panel", "fill"] as const)("a control's outline is 3:1 or better on %s", (bg) => {
    expect(contrast(surface("control"), surface(bg))).toBeGreaterThanOrEqual(3);
  });
});

/* ── Type ───────────────────────────────────────────────────────────── */

describe("type (no text under 11px where it's read)", () => {
  it.each(TOKEN_SIZES.filter((size) => size !== "medium"))("%s: content, small, reading and tool text are 11px or more", (size) => {
    const tokens = sizeTokens(SHELL_TOKENS, size);
    for (const name of ["body.font-size", "body.reading-size", "meta.font-size", "tools.font-size"]) {
      const px = Number.parseFloat(String(resolveToken(SHELL_TOKENS, tokens[name]!.$value)));
      expect(px, `${size} ${name}`).toBeGreaterThanOrEqual(11);
    }
  });
});

/* ── Every interface, every size, every state ───────────────────────── */

// Checks that need layout or a whole page are left to the browser audit.
const BROWSER_ONLY = ["color-contrast", "target-size", "scrollable-region-focusable", "region", "landmark-one-main", "page-has-heading-one", "document-title", "html-has-lang", "landmark-unique", "landmark-complementary-is-top-level"];
const SIZES: ShellSize[] = ["medium", "medium-plus", "large"];
const KINDS = SHELL_KINDS.filter((kind): kind is Exclude<ShellKind, "chat"> => kind !== "chat");

afterEach(() => {
  document.body.innerHTML = "";
});

describe("every interface passes axe (WCAG 2.2 AA)", () => {
  it.each(KINDS.flatMap((kind) => SIZES.flatMap((size) => (["empty", "history"] as const).map((state) => [kind, size, state] as const))))(
    "%s at %s, %s",
    async (kind, size, state) => {
      const data = SHELL_FIXTURES[kind].states[state];
      document.body.innerHTML = `<main>${renderToString(
        <InterfaceShell {...({ kind, size, data, onChange: () => {} } as InterfaceShellProps)} />,
      )}</main>`;
      const result = await axe.run(document.body, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
        rules: Object.fromEntries(BROWSER_ONLY.map((id) => [id, { enabled: false }])),
        resultTypes: ["violations"],
        // A code block's sandbox is its own page.
        iframes: false,
      });
      const problems = result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes[0]?.html.slice(0, 120)})`);
      expect(problems).toEqual([]);
    },
    20000,
  );
});

/* ── With suggestions in place ──────────────────────────────────────── */

const SUGGESTED: Partial<Record<ShellKind, SuggestedValues>> = {
  document: { text: ["A suggested sentence."], lengths: ["~800 words"] },
  search: { filters: ["Reviews", "Open late"] },
  table: { columns: ["Status", "Owner"] },
  tracker: { items: ["Book catering"] },
  schedule: { constraints: ["Wrap by 7pm"], tasks: ["Pack down"] },
  guide: { steps: ["Serve hot."] },
  generator: { tones: ["Wry"], styles: ["Minimal"], lengths: ["One line"] },
  moodboard: { notes: ["Soft daylight"] },
};

describe("every interface passes axe with suggestions in place", () => {
  it.each(Object.keys(SUGGESTED).flatMap((kind) => (["medium-plus", "large"] as const).map((size) => [kind as ShellKind, size] as const)))(
    "%s at %s",
    async (kind, size) => {
      const data = SHELL_FIXTURES[kind].states.history;
      document.body.innerHTML = `<main>${renderToString(
        <InterfaceShell {...({ kind, size, data, onChange: () => {}, suggested: SUGGESTED[kind], onDismissSuggestion: () => {} } as InterfaceShellProps)} />,
      )}</main>`;
      const result = await axe.run(document.body, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
        rules: Object.fromEntries(BROWSER_ONLY.map((id) => [id, { enabled: false }])),
        resultTypes: ["violations"],
        iframes: false,
      });
      expect(result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes[0]?.html.slice(0, 120)})`)).toEqual([]);
    },
    20000,
  );
});

/* ── What the code may not write ────────────────────────────────────── */

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "_tests_" ? [] : files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}
const SOURCE = files(join(process.cwd(), "src/features/interface-shells")).map((path) => [path.split("interface-shells/")[1]!, readFileSync(path, "utf8")] as const);

describe("source rules", () => {
  it("never writes text in grey 3 or a faded secondary (both under 4.5:1)", () => {
    const bad = SOURCE.flatMap(([path, text]) =>
      [...text.matchAll(/(?<![:\w-])text-(?:gray-3|typography-secondary\/\d+)(?![\w/])/g)].map((m) => `${path}: ${m[0]}`),
    );
    expect(bad).toEqual([]);
  });

  it("labels every file input", () => {
    const bad = SOURCE.flatMap(([path, text]) =>
      [...text.matchAll(/<input[^>]*type="file"[^>]*>/gs)].filter((m) => !/aria-label/.test(m[0])).map(() => path),
    );
    expect(bad).toEqual([]);
  });

  it("keeps disabled tools hoverable, so their tooltips show", () => {
    const toolbar = SOURCE.find(([path]) => path === "ui/shell-toolbar.tsx")![1];
    const tool = toolbar.slice(toolbar.indexOf("const TOOL = cn("), toolbar.indexOf(");", toolbar.indexOf("const TOOL = cn(")));
    expect(tool).not.toContain("pointer-events-none");
    expect(tool).toContain("focus-visible:ring");
  });
});

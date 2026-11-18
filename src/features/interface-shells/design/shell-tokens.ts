import { createContext, useContext } from "react";
import source from "./shell-tokens.json";

/**
 * The interface design system: tokens for every part of an interface at
 * each size, kept in `shell-tokens.json` (W3C Design Tokens format) and
 * turned into CSS variables on the interface's surface, so every part reads
 * `var(--shell-title-padding-x)` and the like instead of its own numbers.
 *
 * The anatomy every interface shares:
 * - frame: the surface itself.
 * - title: glyph and title, on the shared edge.
 * - tools: the standard tools, then the AI tools, on one row.
 * - body: the core interaction area.
 * - meta: the quiet detail line (a count, a length).
 * - suggest: where suggestions sit (chips, choices).
 *
 * Primitives (`space`, `type`, `radius`, `font`, `weight`, `color`) are the raw scales; a shell token
 * may point at one with `{space.4}`. Edit them on the Design System page.
 */

export type TokenValue = string | number | boolean;
export type Token = { $value: TokenValue; $type?: string; $description?: string };
export type TokenGroup = { [key: string]: Token | TokenGroup | string | undefined };
export type ShellTokens = typeof source & TokenGroup;

/** The sizes the spec covers. Small is the glyph on its tile, so it has none. */
export const TOKEN_SIZES = ["medium", "medium-plus", "large", "inline"] as const;
export type TokenSize = (typeof TOKEN_SIZES)[number];

export const PRIMITIVE_GROUPS = ["space", "type", "radius", "font", "weight", "color"] as const;
export type PrimitiveGroup = (typeof PRIMITIVE_GROUPS)[number];

export const PARTS = ["layout", "frame", "title", "tools", "body", "meta", "suggest"] as const;
export type Part = (typeof PARTS)[number];

export const PART_META: Record<Part, { label: string; description: string }> = {
  layout: { label: "Layout", description: "The shared edge every part starts on." },
  frame: { label: "Frame", description: "The surface the interface sits on." },
  title: { label: "Title", description: "The glyph and title, starting on the shared edge." },
  tools: {
    label: "Tools",
    description:
      "Standard tools, then AI tools, on one row. Anything added to the interface (a filter, a fact, a search, a day) is added here; what's been added shows in the body, where it can be changed or removed.",
  },
  body: { label: "Interaction area", description: "The core of the interface: where the work happens." },
  meta: { label: "Detail", description: "The quiet line for a count or a length." },
  suggest: { label: "Suggestions", description: "What the model offers, as the thing itself where it would go: words in the suggestion gradient, the control's outline in violet, drawn content shimmering; generated tools in the toolbar." },
};

/**
 * Which parts each size has, Apple-widget style: a smaller size isn't a
 * shrunk larger one, it shows less. New interfaces follow this table.
 */
export const SIZE_ANATOMY: Record<"small" | "medium" | "medium-plus" | "large" | "inline", { parts: Part[]; rule: string }> = {
  small: { parts: ["frame"], rule: "The glyph on its tile, nothing else." },
  medium: {
    parts: ["layout", "frame", "title", "body"],
    rule: "The glyph and title, then one glance of the content in its panel. No tools, no suggestions, no detail line: a click opens it at medium plus.",
  },
  "medium-plus": {
    parts: ["layout", "frame", "title", "tools", "body", "meta", "suggest"],
    rule: "The editable card, laid out like large: the title alone (no subtitle or description under it), the toolbar (standard tools, then generated tools, in one row that scrolls when the pointer reaches its end), the interaction area in its panel, the detail line, and suggestions in the body.",
  },
  large: {
    parts: ["layout", "frame", "title", "tools", "body", "meta", "suggest"],
    rule: "Everything: title, standard then AI tools on one row, the interaction area, the detail line, suggestions beside what they act on.",
  },
  inline: { parts: ["layout", "title", "body", "suggest"], rule: "In a reply: no frame, no tools; the content reads as part of the message." },
};

const isToken = (value: unknown): value is Token =>
  typeof value === "object" && value !== null && "$value" in (value as Record<string, unknown>);

/** A token at a path ("shell.large.title.gap", "space.3.5"). Groups have no dots in their names; leaves may. */
export function tokenAt(tokens: TokenGroup, path: string): Token | undefined {
  const [group, ...rest] = path.split(".");
  let node: unknown = tokens[group!];
  const parts = rest;
  while (parts.length && node && typeof node === "object" && !isToken(node)) {
    // Prefer the longest key that exists, so "space.3.5" finds "3.5".
    let found = false;
    for (let take = parts.length; take > 0; take--) {
      const key = parts.slice(0, take).join(".");
      if (key in (node as Record<string, unknown>)) {
        node = (node as Record<string, unknown>)[key];
        parts.splice(0, take);
        found = true;
        break;
      }
    }
    if (!found) return undefined;
  }
  return parts.length === 0 && isToken(node) ? node : undefined;
}

const ALIAS = /^\{([^}]+)\}$/;

/** A token's final value, following `{group.name}` references (at most eight deep). */
export function resolveToken(tokens: TokenGroup, value: TokenValue, depth = 0): TokenValue {
  if (typeof value !== "string" || depth > 8) return value;
  const alias = value.match(ALIAS);
  if (!alias) return value;
  const target = tokenAt(tokens, alias[1]!);
  return target ? resolveToken(tokens, target.$value, depth + 1) : value;
}

/** Every token for one size, as `part.property` → token. */
export function sizeTokens(tokens: TokenGroup, size: TokenSize): Record<string, Token> {
  const shell = (tokens.shell as TokenGroup)?.[size] as TokenGroup | undefined;
  const out: Record<string, Token> = {};
  for (const part of PARTS) {
    const group = shell?.[part] as TokenGroup | undefined;
    for (const [property, token] of Object.entries(group ?? {})) {
      if (isToken(token)) out[`${part}.${property}`] = token;
    }
  }
  return out;
}

/** The CSS variables for one size: `--shell-title-padding-x: 16px`, and so on. */
export function shellVars(tokens: TokenGroup, size: string): Record<string, string> {
  if (!(TOKEN_SIZES as readonly string[]).includes(size)) return {};
  const vars: Record<string, string> = {};
  for (const [path, token] of Object.entries(sizeTokens(tokens, size as TokenSize))) {
    // Visibility isn't a style value: it's the `data-hide-parts` attribute (`hiddenParts`).
    if (typeof token.$value === "boolean") continue;
    vars[`--shell-${path.replace(".", "-")}`] = String(resolveToken(tokens, token.$value));
  }
  // The colour roles are the same at every size; set here too so an edit shows live.
  for (const role of primitives(tokens, "color")) vars[`--shell-color-${role.name}`] = String(resolveToken(tokens, role.value));
  return vars;
}

/**
 * An interface's colour at medium and medium plus (the `tint` group): drawn as a
 * border round its card, `width` thick. None when the file has no entry for it.
 */
export function tintOf(tokens: TokenGroup, kind: string): { border: string; width: string } | undefined {
  const border = tokenAt(tokens, `tint.${kind}.border`);
  if (!border) return undefined;
  const width = tokenAt(tokens, "tint.width");
  return {
    border: String(resolveToken(tokens, border.$value)),
    width: String(resolveToken(tokens, width?.$value ?? "2px")),
  };
}

/** The parts that can be removed at a size: everything but the frame and the shared edge. */
export const REMOVABLE_PARTS: Part[] = ["title", "tools", "body", "meta", "suggest"];

/** Whether a part is shown at a size (its `visible` token; shown when it has none). */
export const partShown = (tokens: TokenGroup, size: string, part: Part) =>
  tokenAt(tokens, `shell.${size}.${part}.visible`)?.$value !== false;

/**
 * The parts removed at a size, space-separated, for `data-hide-parts`: the
 * `shell-hide-parts` rules in index.css hide any `data-shell-part` inside.
 */
export function hiddenParts(tokens: TokenGroup, size: string): string | undefined {
  if (!(TOKEN_SIZES as readonly string[]).includes(size)) return undefined;
  const hidden = REMOVABLE_PARTS.filter((part) => !partShown(tokens, size, part));
  return hidden.length ? hidden.join(" ") : undefined;
}

/** The primitives in a group, in order: the choices a shell token can point at. */
export function primitives(tokens: TokenGroup, group: PrimitiveGroup): { name: string; value: TokenValue }[] {
  const node = tokens[group] as TokenGroup | undefined;
  return Object.entries(node ?? {})
    .filter(([, token]) => isToken(token))
    .map(([name, token]) => ({ name, value: (token as Token).$value }));
}

/** A card's width and height at a size, from the tokens (inline's height is 0: it grows with its content). */
export function frameSize(tokens: TokenGroup, size: TokenSize): { width: number; height: number } {
  const read = (name: string) => Number.parseFloat(String(resolveToken(tokens, tokenAt(tokens, `shell.${size}.frame.${name}`)?.$value ?? "0")));
  return { width: read("width"), height: read("height") };
}

/** A copy with one token's value changed, at its path. */
export function withToken(tokens: TokenGroup, path: string, value: TokenValue): TokenGroup {
  const next = structuredClone(tokens) as TokenGroup;
  const token = tokenAt(next, path);
  if (token) token.$value = value;
  return next;
}

export const SHELL_TOKENS = source as unknown as TokenGroup;

/**
 * The decisions worth making per size: the rest are standard (or follow from
 * these, like the title's edge following the layout's) and sit under
 * "Show every token" on the Design System page.
 */
export const PRIMARY_TOKENS: Record<Part, string[]> = {
  layout: ["edge"],
  frame: ["width", "height", "radius"],
  title: ["font-size", "weight", "style", "glyph", "padding-top"],
  tools: ["height", "icon", "font-size"],
  body: ["inset-x", "padding-x", "gap", "radius", "border-width", "border-color", "font-size"],
  meta: ["font-size"],
  suggest: ["chip-height"],
};

/**
 * The rules every interface follows, beyond the tokens: accessibility (WCAG
 * 2.2 AA) and the practices the design system is built on. Shown on the
 * Design System page's Spec tab. They're enforced, not advice:
 * `design/_tests_/accessibility.test.tsx` fails the build when an interface
 * breaks one (contrast of every colour role, type sizes, axe on every
 * interface at every size, and source rules).
 */
export const SPEC_RULES: { group: string; rules: { rule: string; how: string }[] }[] = [
  {
    group: "Accessibility (WCAG 2.2 AA)",
    rules: [
      { rule: "Text contrast 4.5:1 or better", how: "Secondary text uses the text-secondary colour role (#6b6b6b), never grey 3 or a faded secondary; placeholder ink and disabled controls are exempt." },
      { rule: "Icons and control outlines 3:1", how: "Tool icons are text-secondary; the outline of a checkbox, tick or radio is the control role (#8a8a8a). line-strong is for outlines that only help (dashed add chips, quote rules)." },
      { rule: "Targets at least 24 × 24px", how: "Tools are the icon plus 16px; small ticks and checkboxes sit in a 24px button with negative margin, so the look doesn't change." },
      { rule: "Every control has a name", how: "Icon tools have aria-label; fields have a label or aria-label; hidden file inputs too." },
      { rule: "Every tool has a tooltip", how: "Its name, shown on hover after a short pause, at once on keyboard focus, and on disabled tools too (ShellTooltips)." },
      { rule: "Everything works from the keyboard", how: "Tools are buttons; anything that scrolls takes focus (tabIndex 0); focus is always visible (a 2px blue ring)." },
      { rule: "No control inside a control", how: "A card that chooses holds a button for the keyboard rather than being one; a file field sits beside its drop area, not in it." },
      { rule: "No text under 11px where it's read", how: "The type ramp below makes it so; medium's glance can go smaller: it's a picture of the content, and the card opens to medium plus." },
      { rule: "Enforced by a test", how: "accessibility.test.tsx checks contrast for every colour role, type sizes, axe on every interface at medium, medium plus and large, and source rules (no grey-3 or faded text, labelled file inputs, hoverable disabled tools). A new interface must pass it." },
    ],
  },
  {
    group: "Layout",
    rules: [
      { rule: "One left edge", how: "The title's glyph, the first tool and the content start on layout.edge (the Edge toggle draws it). At medium and medium plus that's the panel's inset plus its padding." },
      { rule: "Standard tools are the core few", how: "Only what's used all the time: Document style, bold, italic, link, lists, insert; Search add a filter, type, time; Reader find, open, zoom, highlight, ask; Table add row, add column, download; Schedule new task, add and remove a day; Tracker new item, new list, sort, hide completed; Guide servings (the people icon and a number), add a fact, cook mode, start over; Generator mode, presets, references, generate. Copying, exporting, clearing and bulk adjustments are left to shortcuts and the generated tools." },
      { rule: "Tool text is small", how: "tools.font-size: 11px at medium plus, 13px at large (Tools › Text size on this page). Every tool takes the toolbar's icon and text sizes, including grouped ones like Guide's Serves." },
      { rule: "Tools add, the body shows", how: "Anything added to an interface is added from the toolbar; what's been added shows in the body, where it's changed or removed." },
      { rule: "The title stands alone", how: "No subtitle or description under it at any size." },
      { rule: "Nothing overlaps or overflows its row", how: "Fields beside a glyph take flex-1, never w-full; rows keep one height per size across interfaces (Guides › Rows shows them)." },
      { rule: "Card sizes are locked", how: "Medium 144 × 144, medium plus 346 × 264, large 760 × 540 (frame.width and frame.height); shown in the menu, not edited." },
      { rule: "The layout check passes", how: "Check on the Design System page (layout-check.ts) measures every interface: each row starts on the left keyline (from what's drawn: an icon, a word), nothing runs past the right keyline or hangs out of its part unless something scrolls or clips it, no in-flow siblings overlap, and anything outside the parts (a button row) keeps to the keylines too. It must report nothing at medium, medium plus and large, in every state." },
      { rule: "Tools sit in the panel at medium plus", how: "At its top with a line under them; at large the toolbar runs across the interface. Medium has no tools: the glyph and title say what it is." },
    ],
  },
  {
    group: "Suggestions",
    rules: [
      { rule: "A suggestion is the thing itself", how: "It takes the exact form of what it would become, where it would go: a checklist item is a checklist row, a schedule line is a line with its bar, a column is a header with its cells, a step is a step, writing is writing, a filter is a filter chip. Never a card, a list or a panel of its own." },
      { rule: "It can be whole content, not just a value", how: "A sentence, a step, a line, a row, a column: whatever the interface is made of can be suggested, at the size it would really be." },
      { rule: "Two marks, and only these", how: "Its words are in the suggestion gradient (violet into blue and a deep rose, every stop 4.5:1 or better: text-gradient-suggest). The control it would get, a checkbox, a tick, a chip's edge, is drawn with a violet or AI outline. No + icons in text, no badges, no labels saying 'suggested'." },
      { rule: "What isn't words shimmers", how: "Drawn content (a schedule bar, a table cell, a swatch) shimmers in the suggestion colour where it would go (shell-suggest-shimmer), so it reads as proposed, not real. Still when motion is reduced." },
      { rule: "In an empty list, suggestions fill the placeholders", how: "An empty list's placeholder rows (Step 1, Item 1, Task 1) are where suggestions go: each suggestion takes the next placeholder's place and number as it arrives, and only what isn't suggested yet stays a placeholder (ghostsAfter). Never placeholders above and suggestions numbered again below." },
      { rule: "Chips keep the AI outline", how: "A chip among chips (a filter, a tone, a constraint) is the same chip with violet words, a + and the AI gradient outline: the outline marks the control, the colour the words." },
      { rule: "It goes inside the content, where it belongs", how: "A suggestion names where it goes (Suggestion: after an item by its words, in a group) and is drawn there: a checklist item in its section after the item it follows, a step between steps, a schedule line after its task in the hour after it, a sentence after the paragraph it builds on. One that names nowhere goes at the end of its list. One rule for every interface (suggestionsAfter). At most two or three per list." },
      { rule: "Use it to accept it", how: "Click its words (or Enter); it becomes ordinary content and the violet and shimmer go. × on hover dismisses it, and it isn't offered again. Every suggestion is a real button with a name (\"Suggested: … Add it\")." },
      { rule: "Medium plus and large only", how: "Medium is a glance: no tools, no suggestions." },
      { rule: "What the request says shows in the interface", how: "Typed on the chat home, a request fills the interface's own controls: a time goes in Guide's Time, \"for six\" in Serves, words like vegetarian or quick become facts. Never left only in the prompt." },
      { rule: "Questions are tiny interfaces, light to read", how: "When the model needs something, it asks with a control in its reply (Yes · No, chips, a stepper, time and date chips), never a sentence to type an answer to. As little text as works: the interface's glyph and a question of five words or fewer on one line; options of one or two words; units as icons, not words (a person and 9, not 9 people). The guess is in place in the suggestion gradient, so Use these is one tap, and Skip always leaves it to the model's guesses." },
      { rule: "What it doesn't say is suggested in the control", how: "Numbers and amounts the interface has a control for (how many people, how long) are standard controls, not questions: the guess sits in the control in the suggestion gradient until they set it or the request says. Questions are only for what has no control (who it's for, their level)." },
      { rule: "The request stays as they typed it", how: "Choices picked on the card and edits made on it never rewrite the prompt: edits stay on the card, picks go with the interface as context for the first reply. Choices can be picked and unpicked; none starts picked." },
      { rule: "The interface names itself", how: "Once they pause typing, one small call names the card (a few words: the dish, the subject, not the request) and, for interfaces made of steps, adds its first steps one by one as suggestions. Their own title always wins." },
      { rule: "Every interface shows its icon by its title", how: "At medium, medium plus and large (Search's sits in its query box). A host whose own frame shows the icon can turn it off (ShellMarkContext)." },
      { rule: "Generated tools go in the toolbar, after the standard ones", how: "In the same row as the standard tools, as chips after a divider, at medium plus and large; never folded into a group. A chip is a step smaller than the standard tools (tools.generated-height: 24px at medium plus, 28px at large) and has no shadow: the AI outline is what marks it. When the row is longer than the toolbar it scrolls: move the pointer towards either end and it glides that way, with a fade showing there's more (wheel, trackpad and Tab work too)." },
      { rule: "Or beside what they act on", how: "A tool with a place sits in that part instead: Schedule's pace by the day settings, Generator's prompt tools in the prompt box. Never in Document's word count. At most three per place (PER_PLACE)." },
      { rule: "Accessible like everything else", how: "Violet text is 6:1 on panel and 5.4:1 on fill; the tests enforce it, and axe runs on every interface with suggestions in place." },
    ],
  },
  {
    group: "Colour and type",
    rules: [
      { rule: "Colours by role", how: "panel, frame, fill, line, line-strong, outline, ink-faint, ink-soft, text-secondary; status and category colours keep their own values." },
      { rule: "One family, named weights", how: "STK Bureau Sans; titles take their weight (Book at large) and style from the title tokens." },
      { rule: "A type ramp per size", how: "Content (body.font-size: 12 medium plus, 13 large), small (meta.font-size: 11, 12) and reading (body.reading-size: 15 at large, for a document's prose). Any size written into an interface snaps to these; bigger display type (stat figures, headings) stays." },
      { rule: "One toolbar font per size", how: "tools.font-size (12 medium plus, 13 large), Regular, for every tool's words in every interface." },
    ],
  },
];

/** The tokens in force: the file's, or the Design System page's edits while it's open. */
export const ShellTokensContext = createContext<TokenGroup>(SHELL_TOKENS);
export const useShellTokens = () => useContext(ShellTokensContext);

/** The CSS variables for a size, as a style: for a part drawn outside ShellSurface (inline in a reply). */
export function useShellVars(size: string): React.CSSProperties {
  return shellVars(useShellTokens(), size) as React.CSSProperties;
}

/** The parts removed at a size, for `data-hide-parts` on whatever draws that size. */
export function useHiddenParts(size: string): string | undefined {
  return hiddenParts(useShellTokens(), size);
}

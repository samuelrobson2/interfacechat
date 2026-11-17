import { Lock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import { InterfaceShell, type InterfaceShellProps } from "./interface-shell";
import { InlineShell } from "./inline/inline-shell";
import { InlineSmall } from "./inline/inline-small";
import { hasInline } from "./inline/inline-summary";
import { SHELL_FIXTURES } from "./model/shell-fixtures";
import { SHELL_META, STATE_META } from "./model/shell-meta";
import { isP0Kind, SHELL_KINDS, type ShellKind, type ShellSuggestions, type SuggestedGroup, type SuggestedValues } from "./model/shell-types";
import { generateTools, GenerativeToolbar, PER_PLACE, placeOf, suggestValues, TOOLBAR_KINDS, type GeneratedTool, type ToolbarDataByKind, type ToolbarKind } from "@/features/generative-toolbar";
import {
  PART_META,
  PARTS,
  PRIMARY_TOKENS,
  partShown,
  REMOVABLE_PARTS,
  primitives,
  PRIMITIVE_GROUPS,
  SPEC_RULES,
  resolveToken,
  SHELL_TOKENS,
  ShellTokensContext,
  SIZE_ANATOMY,
  sizeTokens,
  frameSize,
  useShellTokens,
  TOKEN_SIZES,
  tokenAt,
  withToken,
  type Part,
  type PrimitiveGroup,
  type TokenGroup,
  type TokenSize,
  type TokenValue,
} from "./design/shell-tokens";
import { PaddingInspector } from "./design/padding-inspector";
import { GUIDE_KINDS, LayoutGuides, type GuideKind } from "./design/layout-guides";
import { checkAll } from "./design/layout-check";
import { LayoutCheckOverlay } from "./design/layout-check-overlay";

const NO_GUIDES = new Set<GuideKind>();

/**
 * The interface design system, edited against the real interfaces. Pick a
 * size and a part from the menu, change its tokens, and every P0 interface
 * below updates as you go; Save writes `design/shell-tokens.json` (dev only),
 * after showing what changed. The Spec tab is the reference new interfaces
 * build to: the anatomy, what each size shows, and every token's value.
 */

const KINDS = SHELL_KINDS.filter((kind) => kind !== "chat" && isP0Kind(kind));
/**
 * The page's states. Generative is the filled interface with what the model
 * would offer on it: generated tools in the toolbar and beside the parts they
 * act on, and suggested values in place (a filter among the filters, a column
 * among the columns, a sentence where the writing stops).
 */
type PageState = "empty" | "generative" | "history";
const STATES: PageState[] = ["empty", "generative", "history"];
const STATE_LABEL: Record<PageState, string> = { empty: STATE_META.empty.label, generative: "Generative", history: STATE_META.history.label };

/** Suggestions for interfaces the toolbar rules don't cover yet. */
const LOCAL_SUGGESTED: Partial<Record<ShellKind, SuggestedValues>> = {
  guide: { steps: [{ value: "Taste the broth and season before the fish goes in.", after: "Add the tomatoes" }] },
};
const isToolbarKind = (kind: ShellKind): kind is ToolbarKind => (TOOLBAR_KINDS as readonly string[]).includes(kind);

/** What the model would offer on an interface: the same generators the home page and the toolbar lab use. */
function useGenerative(kind: ShellKind, size: TokenSize, data: unknown, setData: (data: never) => void, on: boolean) {
  const [dismissedTools, setDismissedTools] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<Partial<Record<SuggestedGroup, string[]>>>({});
  const tools = useMemo(
    () => (on && isToolbarKind(kind) ? generateTools(kind, data as ToolbarDataByKind[typeof kind], { selection: null }) : []),
    [on, kind, data],
  ).filter((tool) => !dismissedTools.includes(tool.id));
  if (!on || size === "medium" || size === "inline") return {};
  const run = (tool: GeneratedTool<never>, value: unknown) => {
    if (tool.apply) setData((tool.apply as (d: unknown, v: unknown) => never)(data, value));
  };
  const dismissTool = (tool: GeneratedTool<never>) => setDismissedTools((ids) => [...ids, tool.id]);
  const chips = (set: GeneratedTool<never>[], label: string, className?: string) => (
    <GenerativeToolbar
      ariaLabel={label}
      tools={set}
      status="ready"
      style="chip"
      direction="row"
      size="sm"
      count={set.length}
      popoverSide="bottom"
      onRun={run as never}
      onDismiss={dismissTool}
      wrap={!className}
      className={className}
    />
  );
  const inToolbar = tools.filter((tool) => placeOf(kind as ToolbarKind, tool) === "toolbar").slice(0, 5) as GeneratedTool<never>[];
  const places = new Map<string, GeneratedTool<never>[]>();
  for (const tool of tools) {
    const place = placeOf(kind as ToolbarKind, tool);
    if (place === "toolbar") continue;
    places.set(place, [...(places.get(place) ?? []), tool as GeneratedTool<never>].slice(0, PER_PLACE));
  }
  const local = LOCAL_SUGGESTED[kind] ?? {};
  const suggested: SuggestedValues = {
    ...(isToolbarKind(kind) ? suggestValues(kind, data as ToolbarDataByKind[typeof kind], dismissed) : {}),
    ...Object.fromEntries(Object.entries(local).map(([group, list]) => [group, list.filter((value) => !dismissed[group as SuggestedGroup]?.includes(typeof value === "string" ? value : value.value))])),
  };
  return {
    // Chips after the standard tools, in the same row; the toolbar scrolls when the pointer reaches its end.
    tools: inToolbar.length ? chips(inToolbar, "Suggested tools", "flex-nowrap") : undefined,
    suggestions: Object.fromEntries([...places].map(([place, set]) => [place, chips(set, `Suggested for ${place}`)])) as ShellSuggestions,
    suggested,
    onDismissSuggestion: (group: SuggestedGroup, value: string) => setDismissed((d) => ({ ...d, [group]: [...(d[group] ?? []), value] })),
  };
}
const SIZE_LABEL: Record<TokenSize, string> = { medium: "Medium", "medium-plus": "Medium plus", large: "Large", inline: "Inline" };
/** Inline sits in a reply, at a reply's width. */
type View = "interfaces" | "compare" | "spec";

/** Plain names for token properties, so the menu reads without cutting words off. */
const PROPERTY_LABEL: Record<string, string> = {
  radius: "Corner radius",
  edge: "Edge",
  "padding-x": "Padding, sides",
  "padding-top": "Space above",
  "padding-bottom": "Space below",
  gap: "Gap",
  glyph: "Glyph",
  "font-size": "Text size",
  "line-height": "Line height",
  family: "Font",
  weight: "Weight",
  style: "Style",
  tracking: "Tracking",
  height: "Height",
  icon: "Icon",
  "inset-x": "Inset, sides",
  "inset-top": "Inset, top",
  "inset-bottom": "Inset, bottom",
  width: "Width",
  "border-width": "Outline",
  "border-color": "Outline colour",
  "chip-height": "Chip height",
  "chip-font-size": "Chip text",
};

const px = (value: TokenValue) => (typeof value === "string" ? Number.parseFloat(value) : Number(value));

/** Which primitive scale a shell token draws from. */
function scaleFor(property: string): PrimitiveGroup | null {
  if (property === "font-size" || property === "chip-font-size") return "type";
  if (property === "radius") return "radius";
  if (property === "weight") return "weight";
  if (property === "family") return "font";
  if (["line-height", "style", "border-width", "border-color", "tracking", "glyph", "icon", "width", "height"].includes(property)) return null;
  return "space";
}

/** Every token whose value differs between two token files, by path. */
function changes(before: TokenGroup, after: TokenGroup, path = ""): { path: string; from: TokenValue; to: TokenValue }[] {
  const out: { path: string; from: TokenValue; to: TokenValue }[] = [];
  for (const [key, node] of Object.entries(after)) {
    if (key.startsWith("$") || typeof node !== "object" || node === null) continue;
    const here = path ? `${path}.${key}` : key;
    if ("$value" in node) {
      const was = tokenAt(before, here)?.$value;
      if (was !== (node as { $value: TokenValue }).$value) out.push({ path: here, from: was ?? "", to: (node as { $value: TokenValue }).$value });
    } else out.push(...changes(before, node as TokenGroup, here));
  }
  return out;
}

function Segmented<T extends string>({ value, options, label, onChange }: { value: T; options: { id: T; label: string }[]; label: string; onChange: (id: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-fit rounded-full bg-gray-6 p-0.5">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={option.id === value}
          onClick={() => onChange(option.id)}
          className={cn(
            "cursor-pointer rounded-full px-3 py-1 font-bureau text-[12px] transition-colors",
            option.id === value ? "bg-background-primary text-typography-primary shadow-[0_1px_3px_rgba(26,23,24,0.12)]" : "text-typography-secondary hover:text-typography-primary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const FIELD = "h-7 rounded-[8px] bg-gray-6 px-2 font-bureau text-[12px] text-typography-primary outline-none focus:ring-1 focus:ring-gray-3/40";

/** One token's control: a step on its scale, or its own value. */
function TokenControl({ tokens, path, property, onChange }: { tokens: TokenGroup; path: string; property: string; onChange: (value: TokenValue) => void }) {
  const token = tokenAt(tokens, path)!;
  const value = token.$value;
  const scale = scaleFor(property);
  const resolved = resolveToken(tokens, value);
  const alias = typeof value === "string" && value.startsWith("{") ? value.slice(1, -1) : null;

  if (token.$type === "fontWeight" || token.$type === "fontFamily") {
    // A named style on the scale ("Book · 450"), or a value of its own.
    const group = token.$type === "fontWeight" ? "weight" : "font";
    const steps = primitives(tokens, group);
    const named = alias ?? steps.find((step) => step.value === value)?.name;
    return (
      <select
        aria-label={path}
        value={alias ?? (named ? `${group}.${named}` : "custom")}
        onChange={(event) => onChange(`{${event.target.value}}`)}
        className={FIELD}
      >
        {steps.map((step) => (
          <option key={step.name} value={`${group}.${step.name}`}>
            {step.name[0]!.toUpperCase() + step.name.slice(1)} · {String(step.value)}
          </option>
        ))}
        {!named && !alias && <option value="custom">{String(resolved)}</option>}
      </select>
    );
  }
  if (token.$type === "color") {
    const roles = primitives(tokens, "color");
    return (
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="size-4 shrink-0 rounded-[4px] border border-shell-line-strong" style={{ background: String(resolved) }} />
        <select
          aria-label={`${path} role`}
          value={alias ?? "custom"}
          onChange={(event) => onChange(event.target.value === "custom" ? String(resolved) : `{${event.target.value}}`)}
          className={FIELD}
        >
          {roles.map((role) => (
            <option key={role.name} value={`color.${role.name}`}>
              {role.name}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        {!alias && <input
        aria-label={path}
        value={String(value)}
        title={String(value)}
        onChange={(event) => onChange(event.target.value)}
        className={cn(FIELD, "w-28 font-mono text-[11px]")}
      />}
      </div>
    );
  }
  if (token.$type === "fontStyle") {
    return (
      <select aria-label={path} value={String(value)} onChange={(event) => onChange(event.target.value)} className={FIELD}>
        <option value="normal">Normal</option>
        <option value="italic">Italic</option>
      </select>
    );
  }
  if (token.$type === "number") {
    return (
      <input aria-label={path} type="number" step={0.05} min={0.8} max={2.4} value={Number(value)} onChange={(event) => onChange(Number(event.target.value))} className={cn(FIELD, "w-20")} />
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {scale && (
        <select
          aria-label={`${path} scale`}
          value={alias ?? "custom"}
          onChange={(event) => onChange(event.target.value === "custom" ? String(resolved) : `{${event.target.value}}`)}
          className={FIELD}
        >
          {primitives(tokens, scale).map((step) => (
            <option key={step.name} value={`${scale}.${step.name}`}>
              {step.name} · {String(step.value)}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      )}
      {(!alias || !scale) && (
        <input
          aria-label={path}
          type="number"
          step={property === "tracking" || property === "border-width" ? 0.1 : 1}
          value={px(resolved)}
          onChange={(event) => onChange(`${event.target.value}px`)}
          className={cn(FIELD, "w-16")}
        />
      )}

    </div>
  );
}

/**
 * Card sizes are decided (medium 144 × 144, medium plus 346 × 264, large
 * 760 × 540), so they're locked: shown in the menu, not edited, and the
 * corner handles are off. Empty this list (or set CARD_SIZES_LOCKED to false)
 * to resize again.
 */
const CARD_SIZES_LOCKED = true;
const LOCKED: string[] = CARD_SIZES_LOCKED ? ["frame.width", "frame.height"] : [];

/** The smallest a card can be dragged to at each size: below this the parts no longer fit. */
const MIN_FRAME: Record<TokenSize, { width: number; height: number }> = {
  medium: { width: 96, height: 96 },
  "medium-plus": { width: 220, height: 160 },
  large: { width: 480, height: 360 },
  inline: { width: 320, height: 0 },
};

/**
 * Drag a card's corner to resize it: width and height snap to 2px, every
 * interface at the size follows, and the size shows while you drag. Saving
 * (Review changes) writes it to the tokens, which the app reads.
 */
function ResizeHandle({ size, width, height, onResize }: { size: TokenSize; width: number; height: number; onResize: (width: number, height: number) => void }) {
  const [drag, setDrag] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const tall = size !== "inline";
  return (
    <>
      <span
        role="slider"
        tabIndex={0}
        aria-label={`Resize ${size} cards`}
        aria-valuetext={tall ? `${width} by ${height}` : `${width} wide`}
        aria-valuenow={width}
        title="Drag to resize every card at this size; arrow keys nudge it"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          setDrag({ x: event.clientX, y: event.clientY, width, height });
        }}
        onPointerMove={(event) => {
          if (!drag) return;
          const snap = (n: number) => Math.round(n / 2) * 2;
          onResize(
            Math.max(MIN_FRAME[size].width, snap(drag.width + event.clientX - drag.x)),
            tall ? Math.max(MIN_FRAME[size].height, snap(drag.height + event.clientY - drag.y)) : 0,
          );
        }}
        onPointerUp={() => setDrag(null)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 10 : 2;
          const dx = event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0;
          const dy = tall ? (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0) : 0;
          if (!dx && !dy) return;
          event.preventDefault();
          onResize(Math.max(MIN_FRAME[size].width, width + dx), tall ? Math.max(MIN_FRAME[size].height, height + dy) : 0);
        }}
        className="absolute -right-2 -bottom-2 z-20 grid size-5 cursor-nwse-resize place-items-center rounded-full bg-background-primary shadow-[0_1px_4px_rgba(26,23,24,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-blue-4/50"
      >
        <span aria-hidden className="size-1.5 rounded-full bg-[#4986b4]" />
      </span>
      {drag && (
        <span className="absolute right-0 -bottom-8 z-20 rounded-[6px] bg-gray-5 px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-white">
          {tall ? `${width} × ${height}` : `${width} wide`}
        </span>
      )}
    </>
  );
}

/** A real interface on its stage, editable, at the size's dimensions from the tokens being edited. */
function LiveShell({
  kind,
  size,
  state,
  onResize,
}: {
  kind: ShellKind;
  size: TokenSize;
  state: PageState;
  onResize?: (width: number, height: number) => void;
}) {
  const [data, setData] = useState(() => SHELL_FIXTURES[kind].states[state === "generative" ? "history" : state]);
  const generative = useGenerative(kind, size, data, setData as (data: never) => void, state === "generative");
  const { width, height } = frameSize(useShellTokens(), size);
  if (size === "inline") {
    if (!hasInline(kind)) return null;
    return (
      <figure className="flex flex-col gap-2">
        <figcaption className="font-bureau text-[12px] text-typography-secondary">{SHELL_META[kind].label}</figcaption>
        <div style={{ width }} className="relative flex flex-col gap-3">
          <InlineShell kind={kind} data={data} onChange={setData} selected={false} />
          <InlineSmall kind={kind} data={data} />
          {onResize && <ResizeHandle size={size} width={width} height={0} onResize={onResize} />}
        </div>
      </figure>
    );
  }
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-bureau text-[12px] text-typography-secondary">{SHELL_META[kind].label}</figcaption>
      <div style={{ width, height }} className="relative shrink-0">
        <InterfaceShell {...({ kind, size, data, status: "idle", onChange: setData, ...generative } as InterfaceShellProps)} />
        {onResize && <ResizeHandle size={size} width={width} height={height} onResize={onResize} />}
      </div>
    </figure>
  );
}

function Spec({ tokens }: { tokens: TokenGroup }) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Text variant="h3" as="h2">Anatomy</Text>
        <p className="max-w-[680px] font-bureau text-[14px] leading-[1.5] text-typography-secondary">
          Every interface is the same object, built from the same parts. The surface owns the spacing; an interface fills the parts and never sets its own padding, type or radius.
        </p>
        <ul className="grid max-w-[880px] grid-cols-1 gap-2 md:grid-cols-2">
          {PARTS.map((part) => (
            <li key={part} className="rounded-[12px] bg-gray-6/60 px-3.5 py-2.5 font-bureau text-[13px]">
              <span className="text-typography-primary">{PART_META[part].label}</span>
              <span className="text-typography-secondary"> · {PART_META[part].description}</span>
            </li>
          ))}
        </ul>
      </section>
      {SPEC_RULES.map(({ group, rules }) => (
        <section key={group} className="flex flex-col gap-3">
          <Text variant="h3" as="h2">{group}</Text>
          <ul className="flex max-w-[880px] flex-col">
            {rules.map(({ rule, how }) => (
              <li key={rule} className="grid grid-cols-1 gap-1 border-t border-shell-line py-2.5 font-bureau text-[13px] md:grid-cols-[260px_1fr] md:gap-4">
                <span className="text-typography-primary">{rule}</span>
                <span className="text-typography-secondary">{how}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="flex flex-col gap-3">
        <Text variant="h3" as="h2">What each size shows</Text>
        <table className="max-w-[980px] border-separate border-spacing-0 font-bureau text-[13px]">
          <thead>
            <tr className="text-left text-typography-secondary">
              <th className="py-2 pr-4 font-normal">Size</th>
              {PARTS.map((part) => (
                <th key={part} className="py-2 pr-4 font-normal">{PART_META[part].label}</th>
              ))}
              <th className="py-2 font-normal">Rule</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(SIZE_ANATOMY).map(([size, anatomy]) => (
              <tr key={size} className="align-top">
                <td className="border-t border-gray-3/15 py-2 pr-4 whitespace-nowrap text-typography-primary">{size}</td>
                {PARTS.map((part) => {
                  // The sizes with tokens read their visibility tokens; small is the glyph alone.
                  const shown =
                    (TOKEN_SIZES as readonly string[]).includes(size) && REMOVABLE_PARTS.includes(part as Part)
                      ? partShown(tokens, size, part as Part)
                      : anatomy.parts.includes(part as Part);
                  return (
                    <td key={part} className="border-t border-gray-3/15 py-2 pr-4 text-typography-secondary">{shown ? "●" : "–"}</td>
                  );
                })}
                <td className="border-t border-gray-3/15 py-2 text-typography-secondary">{anatomy.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="flex flex-col gap-3">
        <Text variant="h3" as="h2">Tokens</Text>
        <table className="max-w-[880px] border-separate border-spacing-0 font-bureau text-[13px]">
          <thead>
            <tr className="text-left text-typography-secondary">
              <th className="py-2 pr-4 font-normal">Token</th>
              {TOKEN_SIZES.map((size) => (
                <th key={size} className="py-2 pr-4 font-normal">{SIZE_LABEL[size]}</th>
              ))}
              <th className="py-2 font-normal">CSS variable</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sizeTokens(tokens, "large")).map((path) => (
              <tr key={path}>
                <td className="border-t border-gray-3/15 py-1.5 pr-4 text-typography-primary">{path}</td>
                {TOKEN_SIZES.map((size) => {
                  const token = sizeTokens(tokens, size)[path];
                  return (
                    <td key={size} className="border-t border-gray-3/15 py-1.5 pr-4 text-typography-secondary tabular-nums">
                      {token ? String(resolveToken(tokens, token.$value)) : "–"}
                      {token && typeof token.$value === "string" && token.$value.startsWith("{") && (
                        <span className="text-typography-secondary"> · {token.$value.slice(1, -1)}</span>
                      )}
                    </td>
                  );
                })}
                <td className="border-t border-gray-3/15 py-1.5 font-mono text-[11px] text-typography-secondary">--shell-{path.replace(".", "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function DesignSystemPage() {
  const [draft, setDraft] = useState<TokenGroup>(SHELL_TOKENS);
  const [size, setSize] = useState<TokenSize>("medium-plus");
  const [state, setState] = useState<PageState>("history");
  const [view, setView] = useState<View>("interfaces");
  const [focus, setFocus] = useState<Part | null>(null);
  const [compareKind, setCompareKind] = useState<ShellKind>("document");
  const [review, setReview] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  // The main decisions only, unless asked: the rest are standard, or follow from these.
  const [everything, setEverything] = useState(false);
  // Inspect with the mouse: hover shows padding and margins, drag changes them, click opens the part's controls.
  const [inspecting, setInspecting] = useState(true);
  // The layout check, for audits run from outside the page (a browser script).
  useEffect(() => {
    const w = window as unknown as { __checkLayout?: () => unknown };
    w.__checkLayout = () =>
      stage.current
        ? checkAll(stage.current).map(({ title, issues }) => ({ title, issues: issues.map(({ kind, part, detail }) => ({ kind, part, detail })) }))
        : [];
    return () => {
      delete w.__checkLayout;
    };
  }, []);
  // Layout guides over every interface: margins and panel by default, rows, readable width and the 4px grid on demand.
  const [guidesOn, setGuidesOn] = useState(false);
  const [guideKinds, setGuideKinds] = useState<Set<GuideKind>>(() => new Set<GuideKind>(["margins", "panel"]));
  const guides = guidesOn ? guideKinds : NO_GUIDES;
  // The layout checker, drawn live: anything off the guides, spilling or overlapping, outlined.
  const [checking, setChecking] = useState(false);
  const [picked, setPicked] = useState<Part | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pick = (part: Part, at: string) => {
    if ((TOKEN_SIZES as readonly string[]).includes(at)) setSize(at as TokenSize);
    setPicked(part);
    requestAnimationFrame(() => document.getElementById(`part-${part}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const changed = useMemo(() => changes(SHELL_TOKENS, draft), [draft]);
  const tokens = sizeTokens(draft, size);
  // Undo and redo, for every token edit. Steps on the same token within a moment (a drag, typing a number) are one.
  const [past, setPast] = useState<TokenGroup[]>([]);
  const [future, setFuture] = useState<TokenGroup[]>([]);
  const lastEdit = useRef<{ path: string; at: number } | null>(null);
  /** One edit to the draft; edits to the same thing within 800ms (a drag, typing) are one undo step. */
  const edit = (key: string, apply: (tokens: TokenGroup) => TokenGroup) => {
    const same = lastEdit.current?.path === key;
    if (lastEdit.current) window.clearTimeout(lastEdit.current.at);
    // The run ends 800ms after its last edit.
    lastEdit.current = { path: key, at: window.setTimeout(() => (lastEdit.current = null), 800) };
    if (!same) setPast((list) => [...list.slice(-99), draft]);
    setFuture([]);
    setDraft(apply);
  };
  const set = (path: string, value: TokenValue) => edit(path, (current) => withToken(current, path, value));
  /** Resize every card at a size: width and height as one edit. */
  const resize = (at: TokenSize, width: number, height: number) =>
    edit(`frame:${at}`, (current) => withToken(withToken(current, `shell.${at}.frame.width`, `${width}px`), `shell.${at}.frame.height`, `${height}px`));
  const undo = () => {
    const previous = past.at(-1);
    if (!previous) return;
    setPast((list) => list.slice(0, -1));
    setFuture((list) => [draft, ...list]);
    setDraft(previous);
    lastEdit.current = null;
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setFuture((list) => list.slice(1));
    setPast((list) => [...list, draft]);
    setDraft(next);
    lastEdit.current = null;
  };
  const undoRef = useRef({ undo, redo });
  useEffect(() => {
    undoRef.current = { undo, redo };
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      // Typing inside an interface in the previews: that's its own undo.
      const active = document.activeElement;
      if (active && stage.current?.contains(active) && active.matches("input, textarea, [contenteditable]")) return;
      event.preventDefault();
      if (event.shiftKey) undoRef.current.redo();
      else undoRef.current.undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  /** Remove a part at this size, or bring it back. */
  const toggle = (part: Part, at: string = size) => set(`shell.${at}.${part}.visible`, !partShown(draft, at, part));

  const save = async () => {
    const response = await fetch("/__design-tokens", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    const result = await response.json().catch(() => ({}));
    setNote(response.ok ? `Saved ${changed.length} change${changed.length === 1 ? "" : "s"} to ${result.saved}` : `Couldn't save: ${result.error ?? response.status}`);
    if (response.ok) setReview(false);
  };

  return (
    <ShellTokensContext.Provider value={draft}>
      {/* Pointing at a part outlines it in every interface below. */}
      <style>{focus ? `[data-shell-part="${focus}"] { outline: 1.5px dashed #6b86ad; outline-offset: 2px; }` : ""}</style>
      <LayoutGuides container={stage} on={guides} />
      <LayoutCheckOverlay container={stage} on={checking} />
      <PaddingInspector
        container={stage}
        tokens={draft}
        enabled={inspecting && view !== "spec"}
        onSet={set}
        onSelect={pick}
        onRemove={(part, at) => toggle(part, at)}
      />
      <div className="flex h-dvh w-full overflow-hidden bg-background-primary font-bureau md:h-screen">

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-3/15 py-4 pr-8 pl-8 md:pl-[136px]">
            <Segmented
              label="View"
              value={view}
              options={[
                { id: "interfaces", label: "All interfaces" },
                { id: "compare", label: "Compare sizes" },
                { id: "spec", label: "Spec" },
              ]}
              onChange={setView}
            />
            {view === "interfaces" && <Segmented label="State" value={state} options={STATES.map((id) => ({ id, label: STATE_LABEL[id] }))} onChange={setState} />}
            {view === "compare" && (
              <select aria-label="Interface" value={compareKind} onChange={(event) => setCompareKind(event.target.value as ShellKind)} className={FIELD}>
                {KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {SHELL_META[kind].label}
                  </option>
                ))}
              </select>
            )}
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-typography-secondary">
              <input type="checkbox" checked={inspecting} onChange={(event) => setInspecting(event.target.checked)} />
              Inspect
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-typography-secondary" title="Find anything off the guides, spilling out of its part, or overlapping">
              <input type="checkbox" checked={checking} onChange={(event) => setChecking(event.target.checked)} />
              Check
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-typography-secondary" title="Draw layout guides over every interface">
              <input type="checkbox" checked={guidesOn} onChange={(event) => setGuidesOn(event.target.checked)} />
              Guides
            </label>
            {guidesOn && (
              <div role="group" aria-label="Which guides" className="flex items-center gap-0.5 rounded-full bg-gray-6 p-0.5">
                {GUIDE_KINDS.map((kind) => {
                  const pressed = guideKinds.has(kind.id);
                  return (
                    <button
                      key={kind.id}
                      type="button"
                      aria-pressed={pressed}
                      title={kind.title}
                      onClick={() =>
                        setGuideKinds((current) => {
                          const next = new Set(current);
                          if (pressed) next.delete(kind.id);
                          else next.add(kind.id);
                          return next;
                        })
                      }
                      className={cn(
                        "h-6 cursor-pointer rounded-full px-2.5 text-[11px] transition-colors",
                        pressed ? "bg-background-primary text-typography-primary shadow-[0_1px_3px_rgba(26,23,24,0.12)]" : "text-typography-secondary hover:text-typography-primary",
                      )}
                    >
                      {kind.label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button type="button" disabled={!past.length} onClick={undo} title="Undo (⌘Z)" className="h-8 cursor-pointer rounded-full px-3 text-[13px] text-typography-secondary hover:bg-gray-6 disabled:opacity-40">
                Undo
              </button>
              <button type="button" disabled={!future.length} onClick={redo} title="Redo (⇧⌘Z)" className="h-8 cursor-pointer rounded-full px-3 text-[13px] text-typography-secondary hover:bg-gray-6 disabled:opacity-40">
                Redo
              </button>
              {note && <span className="text-[12px] text-typography-secondary">{note}</span>}
              <button
                type="button"
                disabled={!changed.length}
                onClick={() => {
                  setPast((list) => [...list, draft]);
                  setFuture([]);
                  setDraft(SHELL_TOKENS);
                  setReview(false);
                }}
                className="h-8 cursor-pointer rounded-full px-3 text-[13px] text-typography-secondary hover:bg-gray-6 disabled:opacity-40">
                Reset
              </button>
              <button
                type="button"
                disabled={!changed.length}
                onClick={() => setReview((open) => !open)}
                className="h-8 cursor-pointer rounded-full bg-gray-5 px-3.5 text-[13px] text-white disabled:opacity-40"
              >
                Review {changed.length || ""} change{changed.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>

          {review && changed.length > 0 && (
            <div className="shrink-0 border-b border-gray-3/15 bg-gray-6/40 py-3 pr-8 pl-8 md:pl-[136px]">
              <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto font-mono text-[12px]">
                {changed.map((change) => (
                  <li key={change.path}>
                    <span className="text-typography-primary">{change.path}</span>{" "}
                    <span className="text-typography-secondary">
                      {String(change.from)} → {String(change.to)}
                    </span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => void save()} className="mt-2 h-8 cursor-pointer rounded-full bg-gray-5 px-3.5 text-[13px] text-white">
                Save to shell-tokens.json
              </button>
            </div>
          )}

          <div ref={stage} className="min-h-0 flex-1 overflow-auto py-8 pr-8 pl-8 md:pl-[136px]">
            {view === "spec" ? (
              <Spec tokens={draft} />
            ) : view === "compare" ? (
              <div className="flex flex-wrap items-start gap-10">
                {TOKEN_SIZES.map((each) => (
                  <div key={each} className="flex flex-col gap-2">
                    <span className="text-[12px] text-typography-secondary">{SIZE_LABEL[each]}</span>
                    <LiveShell key={`${compareKind}-${each}`} kind={compareKind} size={each} state="history" onResize={CARD_SIZES_LOCKED ? undefined : (w, h) => resize(each, w, h)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn("flex flex-wrap gap-8", (size === "large" || size === "inline") && "flex-col")}>
                {KINDS.map((kind) => (
                  <LiveShell key={`${kind}-${size}-${state}`} kind={kind} size={size} state={state} onResize={CARD_SIZES_LOCKED ? undefined : (w, h) => resize(size, w, h)} />
                ))}
              </div>
            )}
          </div>
        </main>
        <aside aria-label="Design system menu" className="flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-3/15 px-5 pt-8 pb-10">
          <div className="flex flex-col gap-1">
            <Text variant="h3" as="h1">Design System</Text>
            <span className="text-[12px] text-typography-secondary">Interface tokens, edited against the real interfaces.</span>
          </div>
          <Segmented label="Size" value={size} options={TOKEN_SIZES.map((id) => ({ id, label: SIZE_LABEL[id] }))} onChange={setSize} />
          {PARTS.map((part) => {
            const entries = Object.keys(tokens).filter(
              (path) =>
                path.startsWith(`${part}.`) &&
                path.split(".")[1] !== "visible" &&
                (everything || PRIMARY_TOKENS[part].includes(path.split(".")[1]!)),
            );
            const shown = partShown(draft, size, part);
            if (!entries.length) return null;
            return (
              <section
                key={part}
                id={`part-${part}`}
                onMouseEnter={() => setFocus(part)}
                onMouseLeave={() => setFocus(null)}
                className={cn("flex scroll-mt-4 flex-col gap-1.5 rounded-[12px] p-2 hover:bg-gray-6/50", picked === part && "bg-[#eaf1f8] ring-1 ring-[#a9bad1]")}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-typography-primary">{PART_META[part].label}</span>
                  {REMOVABLE_PARTS.includes(part) ? (
                    <button
                      type="button"
                      onClick={() => toggle(part)}
                      className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] text-typography-secondary hover:bg-gray-6 hover:text-typography-primary"
                    >
                      {shown ? "Remove" : "Removed · Restore"}
                    </button>
                  ) : null}
                </div>
                {entries.map((entry) => (
                  <label key={entry} className="flex items-center justify-between gap-3">
                    <span className="text-[12px] whitespace-nowrap text-typography-secondary">{PROPERTY_LABEL[entry.split(".")[1]!] ?? entry.split(".")[1]}</span>
                    {LOCKED.includes(entry) ? (
                      // Decided: shown, not edited here.
                      <span title="Locked: card sizes are decided" className="flex items-center gap-1 font-mono text-[12px] text-typography-secondary">
                        <Lock className="size-3" aria-hidden />
                        {String(resolveToken(draft, tokenAt(draft, `shell.${size}.${entry}`)?.$value ?? ""))}
                      </span>
                    ) : (
                      <TokenControl tokens={draft} path={`shell.${size}.${entry}`} property={entry.split(".")[1]!} onChange={(value) => set(`shell.${size}.${entry}`, value)} />
                    )}
                  </label>
                ))}
              </section>
            );
          })}
          <label className="flex cursor-pointer items-center gap-2 px-2 text-[12px] text-typography-secondary">
            <input type="checkbox" checked={everything} onChange={(event) => setEverything(event.target.checked)} />
            Show every token
          </label>
          <details className="rounded-[12px] p-2">
            <summary className="cursor-pointer text-[13px] text-typography-primary">Scales (every size)</summary>
            {PRIMITIVE_GROUPS.map((group) => (
              <div key={group} className="mt-2 flex flex-col gap-1">
                <span className="text-[11px] text-typography-secondary uppercase">{group}</span>
                {primitives(draft, group).map((step) => (
                  <label key={step.name} className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-typography-secondary">{group}.{step.name}</span>
                    {group === "color" ? (
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden className="size-4 shrink-0 rounded-[4px] border border-shell-line-strong" style={{ background: String(step.value) }} />
                        <input
                          aria-label={`${group}.${step.name}`}
                          value={String(step.value)}
                          title={String(step.value)}
                          onChange={(event) => set(`${group}.${step.name}`, event.target.value)}
                          className={cn(FIELD, "w-36 font-mono text-[11px]")}
                        />
                      </span>
                    ) : group === "font" ? (
                      <input
                        aria-label={`${group}.${step.name}`}
                        value={String(step.value)}
                        onChange={(event) => set(`${group}.${step.name}`, event.target.value)}
                        className={cn(FIELD, "w-36")}
                      />
                    ) : (
                      <input
                        aria-label={`${group}.${step.name}`}
                        type="number"
                        step={group === "weight" ? 50 : 1}
                        value={px(step.value)}
                        onChange={(event) => set(`${group}.${step.name}`, group === "weight" ? Number(event.target.value) : `${event.target.value}px`)}
                        className={cn(FIELD, "w-16")}
                      />
                    )}
                  </label>
                ))}
              </div>
            ))}
          </details>
        </aside>
      </div>
    </ShellTokensContext.Provider>
  );
}

export const Component = DesignSystemPage;

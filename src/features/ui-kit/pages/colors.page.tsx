import { useEffect, useRef, useState } from "react";
import { Separator, Text } from "@/shared/ui/kit";
import { Check } from "lucide-react";
import { GalleryPage } from "../ui-kit-parts";

// The Colors tab — the raw Figma palette (from `colors.css`) and the semantic
// design tokens (from `index.css`, theme-aware). Each swatch resolves its own
// live computed value at runtime so the grid never drifts from the CSS, and
// copies the token name on click.

type Token = {
  /** The CSS custom property, e.g. "--color-gray-0" or "--background-primary". */
  varName: string;
  /** Short display label, e.g. "gray-0" or "background-primary". */
  label: string;
};

/** Figma step beside the token, matching the palette sheet (10, 20, … 60). */
const step = (token: string, figma: string): Token => ({
  varName: `--color-${token}`,
  label: `${figma}  ·  ${token}`,
});

const PALETTE: { title: string; tokens: Token[] }[] = [
  {
    title: "Gray",
    tokens: ["gray-0", "gray-1", "gray-2", "gray-3", "gray-4", "gray-5", "gray-6"].map(
      (n) => ({ varName: `--color-${n}`, label: n }),
    ),
  },
  {
    title: "Blue",
    tokens: [
      step("blue-1", "10"),
      step("blue-2", "20"),
      step("blue-3", "30"),
      step("blue-4", "40"),
      step("blue-5", "50"),
      step("blue-6", "60"),
    ],
  },
  {
    title: "Mint",
    tokens: [step("mint-1", "10"), step("mint-2", "20"), step("mint-3", "30")],
  },
  {
    title: "Rose",
    tokens: [step("rose-1", "10"), step("rose-2", "20"), step("rose-3", "30")],
  },
  {
    title: "Accents",
    tokens: [
      step("red-1", "red-10"),
      step("red-5", "red-50"),
      step("orange-1", "orange-10"),
      step("orange-5", "orange-50"),
      step("yellow-1", "yellow-10"),
      step("yellow-5", "yellow-50"),
      step("green-1", "green-10"),
      step("green-5", "green-50"),
    ],
  },
  {
    title: "Category · light / highlight",
    tokens: [
      "seafoam-light",
      "seafoam-highlight",
      "pink-light",
      "pink-highlight",
      "indigo-light",
      "indigo-highlight",
      "red-light",
      "red-highlight",
      "yellow-light",
      "yellow-highlight",
      "chartreuse-light",
      "chartreuse-highlight",
      "blue-light",
      "blue-highlight",
      "orange-light",
      "orange-highlight",
    ].map((n) => ({ varName: `--color-${n}`, label: n })),
  },
];

const SEMANTIC: { title: string; tokens: Token[] }[] = [
  {
    title: "Backgrounds",
    tokens: [
      "background-primary",
      "background-primary-inverse",
      "background-secondary",
      "background-secondary-inverse",
      "background-blue",
    ].map((n) => ({ varName: `--${n}`, label: n })),
  },
  {
    title: "Typography",
    tokens: ["typography-primary", "typography-secondary", "typography-inverse"].map(
      (n) => ({ varName: `--${n}`, label: n }),
    ),
  },
  {
    title: "Stroke & icon",
    tokens: [
      "stroke-primary",
      "stroke-secondary",
      "icon-primary",
      "icon-secondary",
      "icon-inverse",
    ].map((n) => ({ varName: `--${n}`, label: n })),
  },
];

/** Resolve a CSS var to a normalized hex/rgb string via the browser. */
function useResolvedColor(varName: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  useEffect(() => {
    if (ref.current) {
      setValue(getComputedStyle(ref.current).backgroundColor);
    }
  }, [varName]);
  return { ref, value };
}

/** rgb(a) → #rrggbb(aa) for display. Falls back to the raw string. */
function toHex(rgb: string): string {
  const m = rgb.match(/rgba?\(([^)]+)\)/);
  if (!m?.[1]) return rgb;
  const parts = m[1].split(",").map((p) => p.trim());
  if (parts.length < 3) return rgb;
  const [r, g, b, a] = parts as [string, string, string, string?];
  const h = (n: string) =>
    Math.round(Number(n)).toString(16).padStart(2, "0");
  const base = `#${h(r)}${h(g)}${h(b)}`;
  if (a !== undefined && Number(a) < 1) {
    return `${base}${h(String(Number(a) * 255))}`;
  }
  return base;
}

function Swatch({
  token,
  copiedId,
  onCopy,
}: {
  token: Token;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  const { ref, value } = useResolvedColor(token.varName);
  const isCopied = copiedId === token.varName;
  const hex = value ? toHex(value) : "";
  return (
    <button
      type="button"
      onClick={() => onCopy(token.varName, token.varName)}
      title={`Copy ${token.varName}`}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-stroke-secondary/60 text-left transition-colors hover:border-stroke-primary"
    >
      <div
        ref={ref}
        style={{ backgroundColor: `var(${token.varName})` }}
        className="relative h-16 w-full border-b border-stroke-secondary/40"
      >
        {isCopied && (
          <span className="absolute inset-0 flex items-center justify-center gap-1 bg-background-primary-inverse/90 text-[11px] font-light text-typography-inverse">
            <Check className="size-3" /> Copied
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-2.5 py-2">
        <span className="line-clamp-1 font-bureau text-[12px] text-typography-primary">
          {token.label}
        </span>
        <span className="font-bureau text-[11px] uppercase text-typography-secondary">
          {hex || "—"}
        </span>
      </div>
    </button>
  );
}

function ColorSection({
  title,
  tokens,
  copiedId,
  onCopy,
}: {
  title: string;
  tokens: Token[];
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Text variant="title" weight="bold">
          {title}
        </Text>
        <Separator className="flex-1" color="secondary" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {tokens.map((token) => (
          <Swatch
            key={token.varName}
            token={token}
            copiedId={copiedId}
            onCopy={onCopy}
          />
        ))}
      </div>
    </section>
  );
}

function ColorsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onCopy = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedId(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopiedId(null), 1400);
  };

  return (
    <GalleryPage>
      <Text variant="body" color="secondary">
        The raw palette lives in{" "}
        <span className="font-bureau">colors.css</span>; the semantic tokens in{" "}
        <span className="font-bureau">index.css</span>. Hex values are resolved
        live, so semantic tokens reflect the current light/dark theme. Click a
        swatch to copy its CSS variable.
      </Text>

      <div className="flex flex-col gap-4">
        <Text variant="h3" as="h2">
          Palette
        </Text>
        {PALETTE.map((g) => (
          <ColorSection
            key={g.title}
            title={g.title}
            tokens={g.tokens}
            copiedId={copiedId}
            onCopy={onCopy}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Text variant="h3" as="h2">
          Semantic tokens
        </Text>
        {SEMANTIC.map((g) => (
          <ColorSection
            key={g.title}
            title={g.title}
            tokens={g.tokens}
            copiedId={copiedId}
            onCopy={onCopy}
          />
        ))}
      </div>
    </GalleryPage>
  );
}

export const Component = ColorsPage;

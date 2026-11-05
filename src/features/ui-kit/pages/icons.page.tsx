import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { Input } from "@/shared/ui/kit";
import { Text } from "@/shared/ui/kit/text";
import { Separator } from "@/shared/ui/kit";
import { cn } from "@/shared/lib/css";
import type { CustomIconProps } from "@/shared/model/icon";
import { Check, Search } from "lucide-react";
import { GalleryPage } from "../ui-kit-parts";

// The Icons tab — every custom SVG icon component under
// `@/shared/assets/icons`, discovered at build time with import.meta.glob so
// the grid stays in sync as icons are added or removed. Each tile copies the
// exact import statement to the clipboard on click (radix-ui/icons style).

type IconComponent = ComponentType<CustomIconProps>;

type IconEntry = {
  /** Exported component name, e.g. "ArrowRightIcon". */
  name: string;
  /** Import path, e.g. "@/shared/assets/icons/outlined/ArrowRight". */
  importPath: string;
  /** Grouping folder, e.g. "outlined" (or "root" for top-level icons). */
  group: string;
  Component: IconComponent;
};

type ColorizedEntry = { name: string; group: string; src: string };

// Eagerly pull in every icon component module. Keys look like
// "../../../shared/assets/icons/general/AiStars.tsx".
const iconModules = import.meta.glob(
  "../../../shared/assets/icons/**/*.tsx",
  { eager: true },
) as Record<string, Record<string, unknown>>;

// The domain-colorized icons are PNGs, imported as URLs.
const colorizedUrls = import.meta.glob(
  "../../../shared/assets/icons/domain-colorized/*.png",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const ICONS_ROOT = "shared/assets/icons/";

/** Turn a glob key into the "@/shared/..." import path (no extension). */
function toImportPath(key: string): string {
  const from = key.indexOf(ICONS_ROOT);
  const rel = key.slice(from).replace(/\.tsx$/, "");
  return `@/${rel}`;
}

/** The folder segment right under icons/ ("general", "outlined", … or "root"). */
function toGroup(key: string): string {
  const from = key.indexOf(ICONS_ROOT) + ICONS_ROOT.length;
  const rest = key.slice(from); // e.g. "general/AiStars.tsx" or "Logo.tsx"
  const slash = rest.indexOf("/");
  return slash === -1 ? "root" : rest.slice(0, slash);
}

/** A human label for a raw filename, e.g. "AcademicEducation" → "Academic Education". */
function humanize(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
}

const ICONS: IconEntry[] = Object.entries(iconModules)
  .flatMap(([key, mod]) => {
    const importPath = toImportPath(key);
    const group = toGroup(key);
    return Object.entries(mod)
      .filter(
        ([name, value]) =>
          typeof value === "function" && /^[A-Z]/.test(name),
      )
      .map(([name, value]) => ({
        name,
        importPath,
        group,
        Component: value as IconComponent,
      }));
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const COLORIZED: ColorizedEntry[] = Object.entries(colorizedUrls)
  .map(([key, src]) => {
    const file = key.split("/").pop() ?? key;
    return { name: file.replace(/\.png$/, ""), group: "domain-colorized", src };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Group label + display order for the component-icon sections.
const GROUP_LABELS: Record<string, string> = {
  general: "General",
  outlined: "Outlined",
  domain: "Domain",
  size: "Size",
  root: "Brand & misc",
};
const GROUP_ORDER = ["general", "outlined", "domain", "size", "root"];

function useCopyFeedback() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1400);
  };
  return { copied, copy };
}

/** A single clickable icon tile. */
function IconTile({
  label,
  copiedLabel,
  isCopied,
  onCopy,
  children,
}: {
  label: string;
  copiedLabel: string;
  isCopied: boolean;
  onCopy: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      title={copiedLabel}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-[10px] border border-stroke-secondary/60 p-2 transition-colors hover:border-stroke-primary hover:bg-gray-6",
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-[8px] bg-gray-0">
        {children}
      </span>
      <span className="line-clamp-1 w-full text-center font-bureau text-[10px] leading-tight text-typography-secondary">
        {label}
      </span>
      {isCopied && (
        <span className="absolute inset-0 flex items-center justify-center gap-1 rounded-[10px] bg-background-primary-inverse/90 text-[11px] font-light text-typography-inverse">
          <Check className="size-3" /> Copied
        </span>
      )}
    </button>
  );
}

const GRID =
  "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10";

function IconsPage() {
  const [query, setQuery] = useState("");
  const { copied, copy } = useCopyFeedback();

  const q = query.trim().toLowerCase();
  const matches = (name: string) => !q || name.toLowerCase().includes(q);

  const grouped = useMemo(() => {
    const byGroup = new Map<string, IconEntry[]>();
    for (const icon of ICONS) {
      if (!matches(icon.name)) continue;
      const list = byGroup.get(icon.group) ?? [];
      list.push(icon);
      byGroup.set(icon.group, list);
    }
    return byGroup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const colorized = COLORIZED.filter((c) => matches(c.name));

  const orderedGroups = [
    ...GROUP_ORDER.filter((g) => grouped.has(g)),
    ...[...grouped.keys()].filter((g) => !GROUP_ORDER.includes(g)),
  ];

  const totalHits =
    orderedGroups.reduce((n, g) => n + (grouped.get(g)?.length ?? 0), 0) +
    colorized.length;

  return (
    <GalleryPage>
      <div className="flex flex-col gap-3">
        <Text variant="body" color="secondary">
          Custom SVG icons from{" "}
          <span className="font-bureau">@/shared/assets/icons</span>. Click any
          icon to copy its import statement.
        </Text>
        <Input
          variant="plain"
          fill="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${ICONS.length} icons…`}
          leftElement={<Search className="size-5 text-icon-secondary" />}
          className="w-full max-w-[360px]"
        />
      </div>

      {totalHits === 0 && (
        <Text variant="body" color="secondary">
          No icons match “{query}”.
        </Text>
      )}

      {orderedGroups.map((group) => {
        const icons = grouped.get(group) ?? [];
        if (icons.length === 0) return null;
        return (
          <section key={group} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Text variant="title" weight="bold">
                {GROUP_LABELS[group] ?? humanize(group)}
              </Text>
              <Text variant="label" color="secondary" className="font-bureau">
                {icons.length}
              </Text>
              <Separator className="flex-1" color="secondary" />
            </div>
            <div className={GRID}>
              {icons.map((icon) => {
                const id = `${icon.importPath}#${icon.name}`;
                const statement = `import { ${icon.name} } from "${icon.importPath}";`;
                return (
                  <IconTile
                    key={id}
                    label={icon.name.replace(/Icon$/, "")}
                    copiedLabel={statement}
                    isCopied={copied === id}
                    onCopy={() => copy(id, statement)}
                  >
                    <icon.Component svgClasses="size-6" />
                  </IconTile>
                );
              })}
            </div>
          </section>
        );
      })}

      {colorized.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Text variant="title" weight="bold">
              Domain (colorized)
            </Text>
            <Text variant="label" color="secondary" className="font-bureau">
              {colorized.length}
            </Text>
            <Separator className="flex-1" color="secondary" />
          </div>
          <Text variant="label" color="secondary">
            PNG assets in{" "}
            <span className="font-bureau">
              @/shared/assets/icons/domain-colorized
            </span>
            . Click to copy the file path.
          </Text>
          <div className={GRID}>
            {colorized.map((c) => {
              const path = `@/shared/assets/icons/domain-colorized/${c.name}.png`;
              const id = `png#${c.name}`;
              return (
                <IconTile
                  key={id}
                  label={humanize(c.name)}
                  copiedLabel={path}
                  isCopied={copied === id}
                  onCopy={() => copy(id, path)}
                >
                  <img
                    src={c.src}
                    alt={c.name}
                    className="size-6 object-contain"
                  />
                </IconTile>
              );
            })}
          </div>
        </section>
      )}
    </GalleryPage>
  );
}

export const Component = IconsPage;

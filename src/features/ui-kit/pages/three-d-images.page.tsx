import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/shared/ui/kit";
import { Text } from "@/shared/ui/kit/text";
import { Separator } from "@/shared/ui/kit";
import { cn } from "@/shared/lib/css";
import { Check, Search } from "lucide-react";
import { GalleryPage } from "../ui-kit-parts";

// The 3D Images tab — the purple/blue glassmorphic 3D renders that live under
// `@/shared/assets/images/3d`, discovered at build time with import.meta.glob so
// the grid stays in sync as renders are added or removed. Each tile copies the
// exact import path to the clipboard on click (same interaction as the Icons tab).

type ImageEntry = { name: string; src: string };

// Eagerly pull in every 3D render as a URL. Keys look like
// "../../../shared/assets/images/3d/adapt-data.png".
const imageUrls = import.meta.glob(
  "../../../shared/assets/images/3d/*.png",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const IMAGES: ImageEntry[] = Object.entries(imageUrls)
  .map(([key, src]) => {
    const file = key.split("/").pop() ?? key;
    return { name: file.replace(/\.png$/, ""), src };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/** A human label for a raw filename, e.g. "adapt-data" → "Adapt Data". */
function humanize(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

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

const GRID =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

const pathFor = (name: string) => `@/shared/assets/images/3d/${name}.png`;

function ThreeDImagesPage() {
  const [query, setQuery] = useState("");
  const { copied, copy } = useCopyFeedback();
  // Names selected via shift-click, for copying several import paths at once.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCopied, setBulkCopied] = useState(false);
  const bulkTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(bulkTimer.current), []);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      IMAGES.filter(
        (img) => !q || img.name.toLowerCase().includes(q),
      ),
    [q],
  );

  const toggleSelected = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Shift-click accumulates a selection; a plain click copies that one path.
  const onTileClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    name: string,
    id: string,
  ) => {
    if (e.shiftKey) {
      e.preventDefault();
      toggleSelected(name);
      return;
    }
    copy(id, pathFor(name));
  };

  const copySelected = () => {
    // Copy in the same (alphabetical) order the grid shows them.
    const paths = IMAGES.filter((img) => selected.has(img.name)).map((img) =>
      pathFor(img.name),
    );
    if (paths.length === 0) return;
    void navigator.clipboard?.writeText(paths.join("\n"));
    setBulkCopied(true);
    window.clearTimeout(bulkTimer.current);
    bulkTimer.current = window.setTimeout(() => setBulkCopied(false), 1400);
  };

  const clearSelection = () => {
    setSelected(new Set());
    setBulkCopied(false);
  };

  return (
    <GalleryPage>
      <div className="flex flex-col gap-3">
        <Text variant="body" color="secondary">
          Purple 3D glass renders from{" "}
          <span className="font-bureau">@/shared/assets/images/3d</span>. Click
          any image to copy its import path, or{" "}
          <span className="font-bureau">shift-click</span> to select several and
          copy them together.
        </Text>
        <Input
          variant="plain"
          fill="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${IMAGES.length} images…`}
          leftElement={<Search className="size-5 text-icon-secondary" />}
          className="w-full max-w-[360px]"
        />
      </div>

      {matches.length === 0 && (
        <Text variant="body" color="secondary">
          No images match “{query}”.
        </Text>
      )}

      {matches.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Text variant="title" weight="bold">
              3D Images
            </Text>
            <Text variant="label" color="secondary" className="font-bureau">
              {matches.length}
            </Text>
            <Separator className="flex-1" color="secondary" />
          </div>
          <div className={GRID}>
            {matches.map((img) => {
              const path = pathFor(img.name);
              const id = `img#${img.name}`;
              const isCopied = copied === id;
              const isSelected = selected.has(img.name);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={(e) => onTileClick(e, img.name, id)}
                  title={path}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-[12px] border p-3 transition-colors select-none",
                    isSelected
                      ? "border-stroke-primary bg-gray-6 ring-2 ring-stroke-primary"
                      : "border-stroke-secondary/60 hover:border-stroke-primary hover:bg-gray-6",
                  )}
                >
                  <span className="flex flex-1 items-center justify-center">
                    <img
                      src={img.src}
                      alt={img.name}
                      loading="lazy"
                      draggable={false}
                      className="max-h-[92px] w-auto object-contain"
                    />
                  </span>
                  <span className="line-clamp-1 w-full text-center font-bureau text-[11px] leading-tight text-typography-secondary">
                    {humanize(img.name)}
                  </span>
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-background-primary-inverse text-typography-inverse">
                      <Check className="size-3" />
                    </span>
                  )}
                  {isCopied && (
                    <span className="absolute inset-0 flex items-center justify-center gap-1 rounded-[12px] bg-background-primary-inverse/90 text-[12px] font-light text-typography-inverse">
                      <Check className="size-3.5" /> Copied
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-stroke-secondary/60 bg-background-primary p-1.5 pl-4 shadow-lg">
          <Text variant="label" color="secondary" className="font-bureau">
            {selected.size} selected
          </Text>
          <button
            type="button"
            onClick={copySelected}
            className="flex h-8 items-center gap-1.5 rounded-full bg-background-primary-inverse px-4 font-bureau text-[13px] font-light text-typography-inverse transition-opacity hover:opacity-90"
          >
            {bulkCopied ? (
              <>
                <Check className="size-3.5" /> Copied {selected.size} paths
              </>
            ) : (
              <>Copy {selected.size} paths</>
            )}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="flex h-8 items-center rounded-full px-3 font-bureau text-[13px] font-light text-typography-secondary transition-colors hover:text-typography-primary"
          >
            Clear
          </button>
        </div>
      )}
    </GalleryPage>
  );
}

export const Component = ThreeDImagesPage;

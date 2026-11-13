import { ImagePlus, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type MoodboardImage, type MoodboardShellData, type ShellProps, type ShellSize } from "../model/shell-types";
import {
  ChipList,
  PreviewBody,
  PreviewHead,
  ShellBody,
  ShellTitle,
} from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { MoodboardCanvas } from "./moodboard-canvas";
import { editCanvasLists } from "../model/canvas-layout";
import { CanvasMini } from "../ui/canvas-mini";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

/** Readable ink on a swatch: dark on light colours, white on dark ones. */
function inkOn(hex: string) {
  const n = Number.parseInt(hex.replace("#", "").slice(0, 6), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "text-[#1a1718]/70" : "text-white/85";
}

/**
 * The palette. On medium it's a strip. On medium plus and large every colour is
 * its own swatch: click it to change it, hover for × to remove it. Blank swatches
 * fill the row up to a few; clicking one adds a colour. Once they're used, + adds more.
 */
function Palette({
  colours,
  size,
  onChange,
}: {
  colours: string[];
  size: "medium" | ShellSize;
  onChange?: (colours: string[]) => void;
}) {
  const picker = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<number>(-1);

  if (size === "medium") {
    if (colours.length === 0) return null;
    return (
      <div className="flex h-2 shrink-0 overflow-hidden rounded-[3px]">
        {colours.map((colour) => (
          <span key={colour} className="flex-1" style={{ backgroundColor: colour }} />
        ))}
      </div>
    );
  }

  const large = size === "large";
  const blanks = Math.max(0, (large ? 5 : 3) - colours.length);
  const pick = (index: number, current: string) => {
    setEditing(index);
    if (!picker.current) return;
    picker.current.value = current;
    picker.current.click();
  };

  return (
    <div className={cn("flex shrink-0 items-stretch", large ? "gap-2" : "gap-1.5")}>
      {colours.map((colour, index) => (
        <div key={`${colour}-${index}`} className={cn("group relative", large ? "flex-1" : "")}>
          <button
            type="button"
            aria-label={`Change ${colour}`}
            title={onChange ? `${colour}. Click to change.` : colour}
            disabled={!onChange}
            {...fieldEvents}
            onClick={(event) => {
              stopFieldEvent(event);
              pick(index, colour);
            }}
            className={cn(
              "block shadow-[inset_0_0_0_1px_rgba(26,23,24,0.08)] transition-transform active:scale-[0.96]",
              large ? "h-12 w-full rounded-[10px]" : "size-6 rounded-full",
            )}
            style={{ backgroundColor: colour }}
          >
            {large && (
              <span className={cn("absolute bottom-1.5 left-2 font-mono text-[10px] uppercase", inkOn(colour))}>
                {colour.replace("#", "")}
              </span>
            )}
          </button>
          {onChange && (
            <button
              type="button"
              aria-label={`Remove ${colour}`}
              {...fieldEvents}
              onClick={(event) => {
                stopFieldEvent(event);
                onChange(colours.filter((_, i) => i !== index));
              }}
              className={cn(
                "absolute grid place-items-center rounded-full bg-white text-typography-secondary shadow-[0_1px_3px_rgba(26,23,24,0.2)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-typography-primary focus-visible:opacity-100",
                large ? "-top-1.5 -right-1.5 size-5" : "-top-1 -right-1 size-4",
              )}
            >
              <X className={large ? "size-3" : "size-2.5"} />
            </button>
          )}
        </div>
      ))}
      {Array.from({ length: blanks }, (_, i) => {
        // Only the first blank on an empty palette says what to do; the rest show + on hover.
        const label = colours.length === 0 && i === 0 && large ? "Add a colour" : null;
        const blankClass = cn(
          "group/blank grid place-items-center border border-dashed border-gray-3/40 font-bureau font-light text-typography-secondary",
          large ? "h-12 flex-1 rounded-[10px] text-[11px]" : "size-6 rounded-full",
        );
        return onChange ? (
          <button
            key={`blank-${i}`}
            type="button"
            aria-label="Add a colour"
            title="Add a colour"
            {...fieldEvents}
            onClick={(event) => {
              stopFieldEvent(event);
              pick(-1, colours.at(-1) ?? "#b9b2a5");
            }}
            className={cn(blankClass, "transition-colors hover:border-gray-3 hover:text-typography-primary active:scale-[0.96]")}
          >
            {label ?? <Plus className="size-3.5 opacity-0 transition-opacity group-hover/blank:opacity-100" />}
          </button>
        ) : (
          <span key={`blank-${i}`} className={blankClass}>
            {label}
          </span>
        );
      })}
      {onChange && blanks === 0 && (
        <button
          type="button"
          aria-label="Add a colour"
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            pick(-1, colours.at(-1) ?? "#b9b2a5");
          }}
          className={cn(
            "grid shrink-0 place-items-center border border-dashed border-gray-3/50 text-typography-secondary transition-colors hover:border-gray-3 hover:text-typography-primary",
            large ? "h-12 w-12 rounded-[10px]" : "size-6 rounded-full",
          )}
        >
          <Plus className="size-3.5" />
        </button>
      )}
      {onChange && (
        <input
          ref={picker}
          type="color"
          aria-hidden
          tabIndex={-1}
          className="pointer-events-none absolute size-0 opacity-0"
          onChange={(event) => {
            const colour = event.target.value;
            if (editing < 0) {
              if (!colours.includes(colour)) onChange([...colours, colour]);
              setEditing(colours.length);
            } else {
              onChange(colours.map((c, i) => (i === editing ? colour : c)));
            }
          }}
        />
      )}
    </div>
  );
}

/** Upload images or paste a link. */
function AddImages({ large, onAdd }: { large: boolean; onAdd: (images: MoodboardImage[]) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [over, setOver] = useState(false);
  const fromFiles = (files: FileList | null) => {
    if (!files) return;
    onAdd(
      Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => ({ id: shellId("img"), src: URL.createObjectURL(f), caption: f.name.replace(/\.[^.]+$/, "") })),
    );
  };
  return (
    <div
      {...fieldEvents}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        fromFiles(event.dataTransfer.files);
      }}
      className={cn(
        "flex items-center gap-2 rounded-[12px] border border-dashed font-bureau text-typography-secondary transition-colors",
        over ? "border-[#e956a1] bg-[#e956a1]/5" : "border-gray-3/40",
        large ? "px-3 py-2 text-[13px]" : "px-2 py-1.5 text-[11px]",
      )}
    >
      <button
        type="button"
        {...fieldEvents}
        onClick={(event) => {
          stopFieldEvent(event);
          file.current?.click();
        }}
        className="flex shrink-0 items-center gap-1.5 hover:text-typography-primary"
      >
        <ImagePlus className="size-4" />
        {large ? "Upload or drop images" : "Add images"}
      </button>
      {large && (
        <input
          value={url}
          placeholder="or paste an image link"
          aria-label="Image link"
          {...fieldEvents}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            stopFieldEvent(event);
            if (event.key === "Enter" && /^https?:\/\//.test(url.trim())) {
              onAdd([{ id: shellId("img"), src: url.trim() }]);
              setUrl("");
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-typography-primary outline-none placeholder:text-typography-secondary"
        />
      )}
      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          fromFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function MoodboardShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
  ...rest
}: ShellProps<MoodboardShellData>) {
  if (size === "small") return <ShellAppIcon kind="moodboard" className={className} />;
  // Large is a freeform, AI-enabled canvas.
  if (size === "large")
    return <MoodboardCanvas size={size} data={data} onChange={onChange} onSubmit={onSubmit} surface={surface} className={className} {...rest} />;

  if (size === "medium") {
    // The canvas in miniature, as it's laid out at large.
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="moodboard" title={data.title} />
        <PreviewBody className="p-0">
          <CanvasMini data={data} className="min-h-0 flex-1 rounded-[10px]" />
        </PreviewBody>
      </ShellSurface>
    );
  }

  // Medium plus: the canvas in miniature, and its words, colours and pictures to edit. Large is the canvas itself.
  const update = onChange ? (patch: Partial<MoodboardShellData>) => onChange(editCanvasLists(data, patch)) : undefined;
  const addImages = update && ((images: MoodboardImage[]) => update({ images: [...data.images, ...images] }));

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle
        kind="moodboard"
        size={size}
        value={data.title}
        onChange={onChange && ((title) => onChange({ ...data, title }))}
        onSubmit={onSubmit}
      />
      <ShellBody size={size}>
        <CanvasMini data={data} className="h-28 shrink-0" />
        <ChipList
          size={size}
          items={data.keywords}
          addLabel="Add a note"
          onChange={update && ((keywords) => update({ keywords }))}
        />
        <Palette colours={data.palette} size={size} onChange={update && ((palette) => update({ palette }))} />
        {addImages && <AddImages large={false} onAdd={addImages} />}
      </ShellBody>
    </ShellSurface>
  );
}

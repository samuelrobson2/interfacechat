import {
  Code,
  Copy,
  Download,
  ImagePlus,
  LayoutGrid,
  LayoutTemplate,
  Link2,
  ListPlus,
  Loader2,
  MessageSquareText,
  Palette as PaletteIcon,
  PenTool,
  Shuffle,
  Sparkles,
  StickyNote,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { askCanvas, componentDoc, svgUrl, type CanvasMake } from "../model/canvas-ai";
import {
  boardItems,
  COMPONENT_W,
  DRAWING_W,
  freeSpot,
  GAP,
  heightOf,
  IMAGE_W,
  NOTE_W,
  SWATCH,
  tidied,
  withItems,
} from "../model/canvas-layout";
import { shellId, type MoodboardItem, type MoodboardShellData, type ShellColour, type ShellProps } from "../model/shell-types";
import { CanvasBoard, canvasColour, SelectionBar, tint } from "../ui/canvas-board";
import { ShellTitle } from "../ui/shell-kit";
import { AutoTextarea, fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";
import {
  copyText,
  downloadText,
  ShellToolbar,
  ShellToolButton,
  ShellToolDivider,
  ShellToolField,
  ShellToolFile,
  ShellToolPopover,
} from "../ui/shell-toolbar";
import { SuggestedChip, unusedSuggestions } from "../ui/suggested-chip";

/*
 * Canvas at large: a freeform, AI-enabled board. Images, notes, colours,
 * drawings and live components sit anywhere and drag about. The prompt bar
 * asks the model for any of them; whatever is selected becomes what it works
 * from (an image as a reference, a note's words as context) or, for a drawing
 * or component, what it revises. Each selected thing also has its own AI
 * actions in the bar above it.
 */

const MARGIN = 160;

const MAKES: { id: CanvasMake; label: string; icon: LucideIcon; count: number; width: number }[] = [
  { id: "image", label: "Image", icon: ImagePlus, count: 3, width: IMAGE_W },
  { id: "note", label: "Note", icon: StickyNote, count: 3, width: NOTE_W },
  { id: "drawing", label: "Draw", icon: PenTool, count: 2, width: DRAWING_W },
  { id: "component", label: "Component", icon: LayoutTemplate, count: 1, width: COMPONENT_W },
];
const makeOf = (id: CanvasMake) => MAKES.find((make) => make.id === id)!;

const PLACEHOLDER: Record<CanvasMake, string> = {
  image: "Generate images: a dusk harbour, a linen texture, a logo idea…",
  note: "Generate notes: words for the look, a line of copy, a name…",
  drawing: "Draw anything: an icon, a map, a diagram, a sketch of the set…",
  component: "Build a component: a pricing card, a login form, a ticket…",
};

const noteFill = (item: MoodboardItem) => tint(canvasColour(item.tone ?? "orange-5"), 22);

/** A colour picker and a hex field: Milanote's Add colour. */
function AddColour({ onAdd }: { onAdd: (hex: string) => void }) {
  const [hex, setHex] = useState("#b9b2a5");
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Pick a colour"
        value={hex}
        onChange={(event) => setHex(event.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
      />
      <ShellToolField key={hex} label="Hex" initial={hex} apply="Add" onApply={(value) => onAdd(value.startsWith("#") ? value : `#${value}`)} />
    </div>
  );
}

/**
 * A live component, in a frame that never runs scripts. It sizes itself to
 * its content once loaded; while not selected the board can drag it.
 */
function ComponentFrame({ code, interactive, onHeight }: { code: string; interactive: boolean; onHeight: (height: number) => void }) {
  return (
    <iframe
      title="Component"
      sandbox="allow-same-origin"
      srcDoc={componentDoc(code)}
      onLoad={(event) => {
        const body = event.currentTarget.contentDocument?.body;
        if (body) onHeight(Math.min(900, Math.max(60, body.scrollHeight)));
      }}
      className={cn("block h-full w-full rounded-[12px] border-0 bg-transparent", !interactive && "pointer-events-none")}
    />
  );
}

type Pending = { id: string; make: CanvasMake; x: number; y: number; w: number };
type Ask = { make: CanvasMake; prompt: string; references?: string[]; context?: string; source?: string; count?: number; replace?: string };

export function MoodboardCanvas({
  data,
  onChange,
  onSubmit,
  surface = true,
  tools,
  actions,
  suggestions,
  suggested,
  onDismissSuggestion,
  className,
}: ShellProps<MoodboardShellData>) {
  const items = boardItems(data);
  const [selected, setSelected] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [make, setMake] = useState<CanvasMake>("image");
  const [pending, setPending] = useState<Pending[]>([]);
  const [revising, setRevising] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Components measure their own height once loaded; kept here so it isn't an undo step.
  const [heights, setHeights] = useState<Record<string, number>>({});
  // Moving an item: shown live, written once on release, so one drag is one undo.
  const [moving, setMoving] = useState<{ id: string; x: number; y: number } | null>(null);
  const drag = useRef<{ id: string; startX: number; startY: number; x: number; y: number; scale: number; moved: boolean } | null>(null);
  const promptField = useRef<HTMLInputElement>(null);
  const latest = useRef(data);
  latest.current = data;

  const editable = Boolean(onChange);
  const setItems = onChange && ((next: MoodboardItem[]) => onChange(withItems(latest.current, next)));
  const current = () => boardItems(latest.current);
  const add = (next: MoodboardItem[]) => setItems?.([...current(), ...next]);
  const patch = (id: string, change: Partial<MoodboardItem>) =>
    setItems?.(current().map((item) => (item.id === id ? { ...item, ...change } : item)));
  const remove = (id: string) => {
    setItems?.(current().filter((item) => item.id !== id));
    setSelected(null);
  };

  const measured = (item: MoodboardItem) => (item.kind === "component" && heights[item.id] ? { ...item, h: heights[item.id] } : item);
  const shown = items.map((item) => measured(moving?.id === item.id ? { ...item, x: moving.x, y: moving.y } : item));
  const width = Math.max(1400, ...shown.map((item) => item.x + item.w + MARGIN), ...pending.map((p) => p.x + p.w + MARGIN));
  const height = Math.max(900, ...shown.map((item) => item.y + heightOf(item) + MARGIN), ...pending.map((p) => p.y + 360 + MARGIN));
  const selectedItem = items.find((item) => item.id === selected);

  /**
   * Ask the model for something and put it on the board: new things in free
   * space to the right, or, with `replace`, a revised drawing or component in place.
   */
  const ask = async ({ make: kind, prompt: words, references = [], context, source, count, replace }: Ask) => {
    if (!setItems || (!words.trim() && !references.length && !context && !source)) return;
    setError(null);
    const spec = makeOf(kind);
    const n = count ?? spec.count;
    const at = freeSpot([...current(), ...pending.map((p) => ({ ...p, kind: "image" as const }))]);
    const slots: Pending[] = replace
      ? []
      : Array.from({ length: n }, (_, i) => ({ id: shellId("pending"), make: kind, x: at.x + i * (spec.width + GAP), y: at.y, w: spec.width }));
    setPending((list) => [...list, ...slots]);
    if (replace) setRevising((list) => [...list, replace]);
    try {
      const results = await askCanvas({ make: kind, prompt: words.trim(), references, context, source, count: n });
      if (replace) {
        const code = results[0]?.code;
        if (code) patch(replace, { code });
        return;
      }
      add(
        results.slice(0, n).map((result, i) => {
          const slot = slots[i]!;
          const base = { x: slot.x, y: slot.y, w: slot.w };
          if (kind === "image") return { id: shellId("img"), kind: "image" as const, src: result.src, text: words.trim() || undefined, ...base };
          if (kind === "note") return { id: shellId("note"), kind: "note" as const, text: result.text, ...base };
          return { id: shellId(kind), kind, code: result.code, text: words.trim() || undefined, ...base };
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending((list) => list.filter((p) => !slots.includes(p)));
      if (replace) setRevising((list) => list.filter((id) => id !== replace));
    }
  };

  const busy = pending.length > 0 || revising.length > 0;
  // What the prompt bar works from: a selected drawing or component of the same kind is revised;
  // a selected image is a reference; a selected note's words are context.
  const revisingSelected = selectedItem && selectedItem.kind === make && (make === "drawing" || make === "component") && selectedItem.code;
  const reference = selectedItem?.kind === "image" && selectedItem.src ? [selectedItem.src] : [];
  const context = selectedItem?.kind === "note" ? selectedItem.text : undefined;
  const submit = () =>
    void ask(
      revisingSelected
        ? { make, prompt, source: selectedItem!.code, count: 1, replace: selectedItem!.id }
        : { make, prompt, references: reference, context },
    );
  const editWithAi = (kind: CanvasMake) => {
    setMake(kind);
    setPrompt("");
    promptField.current?.focus();
  };

  const onItemDown = (event: React.PointerEvent, item: MoodboardItem) => {
    if (event.button !== 0) return;
    setSelected(item.id);
    if (!editable) return;
    const node = event.currentTarget as HTMLElement;
    // The board is zoomed: screen pixels per board unit.
    const scale = node.getBoundingClientRect().width / node.offsetWidth || 1;
    drag.current = { id: item.id, startX: event.clientX, startY: event.clientY, x: item.x, y: item.y, scale, moved: false };
    node.setPointerCapture(event.pointerId);
  };
  const onItemMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (event.clientX - d.startX) / d.scale;
    const dy = (event.clientY - d.startY) / d.scale;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    d.moved = true;
    setMoving({ id: d.id, x: Math.max(0, d.x + dx), y: Math.max(0, d.y + dy) });
  };
  const onItemUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved && moving) patch(d.id, { x: moving.x, y: moving.y });
    setMoving(null);
  };

  const notes = unusedSuggestions(suggested?.notes, items.flatMap((item) => (item.kind === "note" && item.text ? [item.text] : [])));
  const boardSuggestions =
    notes.length || suggestions?.board ? (
      <div className="flex flex-wrap items-center gap-2">
        {notes.map((text) => (
          <SuggestedChip
            key={text}
            label={text}
            onAccept={editable ? () => add([{ id: shellId("note"), kind: "note", text, ...freeSpot(current()), w: NOTE_W }]) : undefined}
            onDismiss={onDismissSuggestion && (() => onDismissSuggestion("notes", text))}
          />
        ))}
        {suggestions?.board}
      </div>
    ) : undefined;

  // Each kind's AI actions, in the bar over the selection.
  const selectionBar = selectedItem && editable && (
    <SelectionBar>
      {selectedItem.kind === "image" && selectedItem.src && (
        <>
          <SelectionBar.Button
            icon={Sparkles}
            label="More like this"
            onClick={() => void ask({ make: "image", prompt: prompt || selectedItem.text || "Variations of this image", references: [selectedItem.src!] })}
          />
          <SelectionBar.Button
            icon={MessageSquareText}
            label="Describe it as a note"
            onClick={() => void ask({ make: "note", prompt: "In one short line, name what gives this image its look", references: [selectedItem.src!], count: 1 })}
          />
          <SelectionBar.Button
            icon={PenTool}
            label="Draw it"
            onClick={() => void ask({ make: "drawing", prompt: "A clean vector drawing of this image", references: [selectedItem.src!], count: 1 })}
          />
        </>
      )}
      {selectedItem.kind === "note" && (
        <>
          <SelectionBar.Colours value={selectedItem.tone} onChange={(tone: ShellColour) => patch(selectedItem.id, { tone })} />
          <SelectionBar.Divider />
          <SelectionBar.Button icon={Wand2} label="Turn into images" onClick={() => selectedItem.text?.trim() && void ask({ make: "image", prompt: selectedItem.text })} />
          <SelectionBar.Button
            icon={ListPlus}
            label="Expand into more notes"
            onClick={() => selectedItem.text?.trim() && void ask({ make: "note", prompt: "Three related ideas that build on this note", context: selectedItem.text })}
          />
          <SelectionBar.Button icon={PenTool} label="Draw it" onClick={() => selectedItem.text?.trim() && void ask({ make: "drawing", prompt: selectedItem.text, count: 1 })} />
          <SelectionBar.Button icon={LayoutTemplate} label="Build it as a component" onClick={() => selectedItem.text?.trim() && void ask({ make: "component", prompt: selectedItem.text })} />
        </>
      )}
      {(selectedItem.kind === "drawing" || selectedItem.kind === "component") && selectedItem.code && (
        <>
          <SelectionBar.Button icon={Wand2} label="Edit with AI" onClick={() => editWithAi(selectedItem.kind as CanvasMake)} />
          <SelectionBar.Button
            icon={Shuffle}
            label="Another take"
            onClick={() =>
              void ask({ make: selectedItem.kind as CanvasMake, prompt: "A different take on this", source: selectedItem.code, count: 1 })
            }
          />
          {selectedItem.kind === "drawing" ? (
            <SelectionBar.Button icon={Download} label="Download SVG" onClick={() => downloadText("drawing.svg", selectedItem.code!, "image/svg+xml")} />
          ) : (
            <SelectionBar.Button icon={Code} label="Copy the HTML" onClick={() => copyText(selectedItem.code!)} />
          )}
        </>
      )}
      {selectedItem.kind === "colour" && (
        <label title="Change the colour" className="relative grid size-7 cursor-pointer place-items-center rounded-[8px] hover:bg-gray-6" {...fieldEvents}>
          <span className="size-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: selectedItem.colour }} />
          <input
            type="color"
            aria-label="Change the colour"
            value={selectedItem.colour ?? "#cccccc"}
            onChange={(event) => patch(selectedItem.id, { colour: event.target.value })}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      )}
      <SelectionBar.Divider />
      <SelectionBar.Delete onClick={() => remove(selectedItem.id)} />
    </SelectionBar>
  );

  const palette = items.filter((item) => item.kind === "colour" && item.colour).map((item) => item.colour!);
  const newNote = () => {
    const note: MoodboardItem = { id: shellId("note"), kind: "note", text: "", ...freeSpot(current()), w: NOTE_W };
    add([note]);
    setSelected(note.id);
  };
  const addColour = (hex: string) => add([{ id: shellId("colour"), kind: "colour", colour: hex, ...freeSpot(current()), w: SWATCH }]);

  // What the prompt bar is about to do, in words, when it isn't plain generating.
  const working = revisingSelected
    ? `Editing the selected ${make}`
    : reference.length && make !== "note"
      ? "From the selected image"
      : context
        ? "From the selected note"
        : reference.length
          ? "About the selected image"
          : null;

  return (
    <ShellSurface size="large" surface={surface} className={className}>
      <ShellTitle kind="moodboard" size="large" value={data.title} onChange={onChange && ((title) => onChange({ ...data, title }))} onSubmit={onSubmit} />
      <ShellToolbar tools={tools} actions={actions}>
        <ShellToolFile
          label="Upload images"
          accept="image/*"
          multiple
          disabled={!editable}
          onFiles={(files) => {
            const at = freeSpot(current());
            add(
              files
                .filter((f) => f.type.startsWith("image/"))
                .map((f, i) => ({ id: shellId("img"), kind: "image" as const, src: URL.createObjectURL(f), text: f.name.replace(/\.[^.]+$/, ""), x: at.x + i * (IMAGE_W + GAP), y: at.y, w: IMAGE_W })),
            );
          }}
        >
          <ImagePlus />
        </ShellToolFile>
        <ShellToolPopover label="Add an image from a link" icon={<Link2 />} disabled={!editable}>
          {(close) => (
            <ShellToolField
              label="Image link"
              placeholder="https://…"
              apply="Add"
              onApply={(url) => {
                if (/^https?:\/\//.test(url)) add([{ id: shellId("img"), kind: "image", src: url, ...freeSpot(current()), w: IMAGE_W }]);
                close();
              }}
            />
          )}
        </ShellToolPopover>
        <ShellToolButton label="Add a note" disabled={!editable} onPress={newNote}>
          <StickyNote />
        </ShellToolButton>
        <ShellToolPopover label="Add a colour" icon={<PaletteIcon />} disabled={!editable}>
          {(close) => (
            <AddColour
              onAdd={(hex) => {
                if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) addColour(hex);
                close();
              }}
            />
          )}
        </ShellToolPopover>
        <ShellToolDivider />
        <ShellToolButton label="Tidy up" disabled={!editable || items.length < 2} onPress={() => setItems?.(tidied(current()))}>
          <LayoutGrid />
        </ShellToolButton>
        <ShellToolButton label="Copy the palette" disabled={palette.length === 0} onPress={() => copyText(palette.join(" "))}>
          <Copy />
        </ShellToolButton>
      </ShellToolbar>

      {/* The prompt bar: ask the model for an image, a note, a drawing or a component. */}
      {editable && (
        <form
          className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-3/15 px-6 py-2.5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <span role="radiogroup" aria-label="Make" className="inline-flex h-8 shrink-0 rounded-full bg-gray-6 p-0.5">
            {MAKES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={make === id}
                title={label}
                {...fieldEvents}
                onClick={(event) => {
                  stopFieldEvent(event);
                  setMake(id);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 font-bureau text-[13px] transition-colors",
                  make === id ? "bg-white text-typography-primary shadow-[0_1px_2px_rgba(26,23,24,0.12)]" : "text-typography-secondary hover:text-typography-primary",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </span>
          <div className="flex min-w-[220px] flex-1 items-center gap-2">
            {working && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-1 py-0.5 pr-1 pl-2 font-bureau text-[12px] text-blue-5">
                {working}
                <button
                  type="button"
                  aria-label="Clear the selection"
                  {...fieldEvents}
                  onClick={(event) => {
                    stopFieldEvent(event);
                    setSelected(null);
                  }}
                  className="grid size-4 place-items-center rounded-full hover:bg-white"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            <input
              ref={promptField}
              value={prompt}
              placeholder={revisingSelected ? `Describe the change to the ${make}` : PLACEHOLDER[make]}
              aria-label="What to make"
              {...fieldEvents}
              onKeyDown={stopFieldEvent}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-w-0 flex-1 bg-transparent font-bureau text-[14px] text-typography-primary outline-none placeholder:font-light placeholder:text-typography-secondary"
            />
          </div>
          <button
            type="submit"
            disabled={busy || (!prompt.trim() && !reference.length && !context && !revisingSelected)}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-gradient-black-blue px-3.5 font-bureau text-[13px] text-typography-inverse disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            {busy ? "Working" : revisingSelected ? "Revise" : "Generate"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="mx-6 mt-2 rounded-[10px] bg-red-1 px-3 py-2 font-bureau text-[13px] text-red-5">
          {error}
        </p>
      )}

      <CanvasBoard
        width={width}
        height={height}
        editable={editable}
        suggestions={boardSuggestions}
        tools={[
          { id: "note", icon: StickyNote, label: "Add a note", onClick: newNote },
          { id: "colour", icon: PaletteIcon, label: "Add a colour", onClick: () => addColour("#b9b2a5") },
          { id: "draw", icon: PenTool, label: "Draw with AI", onClick: () => editWithAi("drawing") },
          { id: "component", icon: LayoutTemplate, label: "Build a component with AI", onClick: () => editWithAi("component") },
        ]}
        selection={selectedItem && !moving ? { anchor: selectedItem.id, bar: selectionBar } : null}
        onClearSelection={() => setSelected(null)}
        onDelete={() => selected && remove(selected)}
      >
        {shown.map((item) => {
          const isSelected = item.id === selected;
          const isRevising = revising.includes(item.id);
          return (
            <div
              key={item.id}
              data-canvas-item=""
              data-canvas-id={item.id}
              onPointerDown={(event) => onItemDown(event, item)}
              onPointerMove={onItemMove}
              onPointerUp={onItemUp}
              onPointerCancel={onItemUp}
              className={cn(
                "absolute rounded-[12px] transition-shadow",
                editable && "cursor-grab active:cursor-grabbing",
                isSelected ? "ring-2 ring-blue-4 ring-offset-2" : "hover:ring-1 hover:ring-gray-3/40 hover:ring-offset-2",
                moving?.id === item.id && "shadow-[0_12px_32px_-8px_rgba(26,23,24,0.35)]",
                isRevising && "animate-pulse",
              )}
              style={{ left: item.x, top: item.y, width: item.w }}
            >
              {item.kind === "image" ? (
                <figure className="flex flex-col gap-1.5">
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.text ?? ""}
                      draggable={false}
                      // Until it loads (or if it can't), it holds a portrait-shaped grey space.
                      className="block min-h-24 w-full rounded-[12px] bg-gray-6 object-cover [&:not([data-loaded])]:aspect-[4/5]"
                      onLoad={(event) => event.currentTarget.setAttribute("data-loaded", "")}
                    />
                  ) : (
                    <span className="block aspect-square rounded-[12px] bg-gray-6" />
                  )}
                  {item.text && <figcaption className="truncate px-1 font-bureau text-[12px] text-typography-secondary">{item.text}</figcaption>}
                </figure>
              ) : item.kind === "note" ? (
                <div className="min-h-[96px] rounded-[12px] p-3.5 shadow-[0_2px_6px_rgba(26,23,24,0.08)]" style={{ backgroundColor: noteFill(item) }}>
                  <AutoTextarea
                    value={item.text ?? ""}
                    placeholder="Write something"
                    aria-label="Note"
                    readOnly={!editable || !isSelected}
                    // Selected, the words take the pointer for typing; otherwise the note drags.
                    onPointerDown={(event) => isSelected && event.stopPropagation()}
                    onKeyDown={stopFieldEvent}
                    onChange={(event) => patch(item.id, { text: event.target.value })}
                    className={cn(
                      "font-bureau text-[15px] leading-[1.4] text-typography-primary placeholder:text-typography-secondary",
                      !isSelected && "pointer-events-none",
                    )}
                  />
                </div>
              ) : item.kind === "drawing" ? (
                <div className="overflow-hidden rounded-[12px] bg-white p-2 shadow-[0_2px_6px_rgba(26,23,24,0.08)]">
                  {item.code && <img src={svgUrl(item.code)} alt={item.text ?? "Drawing"} draggable={false} className="block w-full" />}
                </div>
              ) : item.kind === "component" ? (
                <div className="rounded-[12px] bg-white p-3 shadow-[0_2px_6px_rgba(26,23,24,0.08)]" style={{ height: (heights[item.id] ?? 260) + 24 }}>
                  {item.code && (
                    <ComponentFrame
                      code={item.code}
                      interactive={isSelected}
                      onHeight={(h) => setHeights((all) => (all[item.id] === h ? all : { ...all, [item.id]: h }))}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="block aspect-square w-full rounded-[12px] ring-1 ring-black/5" style={{ backgroundColor: item.colour }} />
                  <span className="px-0.5 font-bureau text-[11px] text-typography-secondary uppercase tabular-nums">{item.colour}</span>
                </div>
              )}
            </div>
          );
        })}
        {pending.map((slot) => (
          <div
            key={slot.id}
            className={cn(
              "absolute flex animate-pulse items-center justify-center rounded-[12px] bg-gray-6",
              slot.make === "image" ? "aspect-square" : slot.make === "note" ? "h-28" : slot.make === "drawing" ? "aspect-[4/3]" : "h-56",
            )}
            style={{ left: slot.x, top: slot.y, width: slot.w }}
          >
            <Loader2 className="size-5 animate-spin text-typography-secondary" />
          </div>
        ))}
        {items.length === 0 && pending.length === 0 && (
          <div className="absolute top-10 left-10 flex max-w-[460px] flex-col gap-2 font-bureau">
            <span className="text-[15px] text-typography-primary">An open canvas</span>
            <span className="text-[13px] font-light text-typography-secondary">
              Ask for images, notes, drawings or working components from the bar above, or drop in your own pictures. Select anything to
              build on it with AI. Drag anything anywhere.
            </span>
          </div>
        )}
      </CanvasBoard>
    </ShellSurface>
  );
}

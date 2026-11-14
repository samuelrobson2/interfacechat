import { Bookmark, Check, Copy, Download, ImageOff, ImagePlus, Loader2, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import {
  ASPECT_CLASS,
  canGenerate,
  generateVariations,
  GENERATOR_ASPECTS,
  GENERATOR_LENGTHS,
  GENERATOR_STYLES,
  GENERATOR_TONES,
  readReferenceFile,
  BUILT_IN_PRESETS,
  isPreset,
  loadPresets,
  storePresets,
  type GeneratorPreset,
} from "../model/generator";
import {
  GENERATOR_MODES,
  shellId,
  type GeneratorControls,
  type GeneratorMode,
  type GeneratorOptions,
  type SuggestedValues,
  type GeneratorReference,
  type GeneratorShellData,
  type GeneratorVariation,
  type ShellProps,
  type ShellSize,
} from "../model/shell-types";
import { ghostLabels } from "../ui/shell-accents";
import { PreviewBody, PreviewHead, ShellBody, ShellTitle } from "../ui/shell-kit";
import { copyText, ShellToolbar, ShellToolButton, ShellToolDivider, ShellToolField, ShellToolFile, ShellToolPopover } from "../ui/shell-toolbar";
import { AddChip } from "../ui/shell-fields";
import { SuggestedChip, unusedSuggestions } from "../ui/suggested-chip";
import { ShellAppIcon } from "../ui/shell-icons";
import { AutoTextarea, Bar, fieldEvents, isSubmitShortcut, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const MODE_LABEL: Record<GeneratorMode, string> = { text: "Text", image: "Image" };
const MAX_REFERENCES = 4;

/** A button that keeps its click inside the field, so a clickable card doesn't open. */
function FieldButton({
  onPress,
  className,
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & { onPress: () => void }) {
  return (
    <button
      type="button"
      {...props}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onPress();
      }}
      className={className}
    >
      {children}
    </button>
  );
}

/** Text | Image, or Short | Medium | Long: one choice from a few. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange?: (value: T) => void;
  label: string;
  size: ShellSize;
}) {
  const large = size === "large";
  return (
    <span role="radiogroup" aria-label={label} className={cn("inline-flex shrink-0 rounded-full bg-gray-6 p-0.5", large ? "h-8" : "h-6")}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <FieldButton
            key={option.value}
            role="radio"
            aria-checked={on}
            disabled={!onChange}
            onPress={() => onChange?.(option.value)}
            className={cn(
              "rounded-full font-bureau transition-colors",
              large ? "px-3 text-[13px]" : "px-2 text-[11px]",
              on ? "bg-white text-typography-primary shadow-[0_1px_2px_rgba(26,23,24,0.12)]" : "text-typography-secondary enabled:hover:text-typography-primary",
            )}
          >
            {option.label}
          </FieldButton>
        );
      })}
    </span>
  );
}

/** One of a few named choices, as chips. */
type Choice = { value: string; label: string; custom?: boolean };

/**
 * One of a few named choices, as chips: the built-in ones, the person's own
 * (removable), the model's suggestions (outlined), and a chip to add another.
 */
function ChoiceChips({
  options,
  value,
  onChange,
  label,
  noun,
  suggested = [],
  onAdd,
  onRemove,
  onDismissSuggested,
}: {
  options: Choice[];
  value: string;
  onChange?: (value: string) => void;
  label: string;
  /** What one choice is, for "Add a tone". */
  noun: string;
  suggested?: string[];
  /** Add one of the person's own, and pick it. */
  onAdd?: (value: string) => void;
  onRemove?: (value: string) => void;
  onDismissSuggested?: (value: string) => void;
}) {
  const shown = unusedSuggestions(suggested, options.flatMap((option) => [option.value, option.label]));
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const on = option.value === value;
        return (
          <span key={option.value} className="group/choice relative inline-flex">
            <FieldButton
              role="radio"
              aria-checked={on}
              disabled={!onChange}
              onPress={() => onChange?.(option.value)}
              className={cn(
                "h-7 rounded-full px-2.5 font-bureau text-[13px] transition-colors",
                on ? "bg-gray-5 text-typography-inverse" : "bg-gray-6 text-typography-primary enabled:hover:bg-gray-3/20",
              )}
            >
              {option.label}
            </FieldButton>
            {option.custom && onRemove && (
              <FieldButton
                aria-label={`Remove ${option.label}`}
                onPress={() => onRemove(option.value)}
                className="absolute -top-1 -right-1 hidden size-4 place-items-center rounded-full bg-gray-5 text-white group-hover/choice:grid"
              >
                <X className="size-2.5" />
              </FieldButton>
            )}
          </span>
        );
      })}
      {onAdd &&
        shown.map((suggestion) => (
          <SuggestedChip
            key={suggestion}
            label={suggestion}
            onAccept={() => onAdd(suggestion)}
            onDismiss={onDismissSuggested && (() => onDismissSuggested(suggestion))}
          />
        ))}
      {onAdd && (
        <AddChip size="md" placeholder={`Your own ${noun}`} onSubmitValue={(next) => onAdd(next.trim())}>
          Add
        </AddChip>
      )}
    </div>
  );
}

function ControlLabel({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <span className="flex items-baseline justify-between font-bureau text-[12px] text-typography-secondary">
      {children}
      {aside}
    </span>
  );
}

function creativityWord(value: number) {
  return value < 34 ? "Faithful" : value < 67 ? "Balanced" : "Free";
}

const LENGTH_LABEL: Record<string, string> = Object.fromEntries(GENERATOR_LENGTHS.map((length) => [length.value, length.label]));

/**
 * Tone and length for text, style and aspect for images, creativity for both.
 * Each choice takes the person's own values and shows the model's suggestions.
 */
function Controls({
  mode,
  controls,
  options = {},
  suggested,
  onChange,
  onOptions,
  onDismissSuggested,
}: {
  mode: GeneratorMode;
  controls: GeneratorControls;
  options?: GeneratorOptions;
  suggested?: SuggestedValues;
  onChange?: (controls: GeneratorControls) => void;
  onOptions?: (options: GeneratorOptions, controls: GeneratorControls) => void;
  onDismissSuggested?: (group: "tones" | "styles" | "lengths", value: string) => void;
}) {
  const set = onChange && ((patch: Partial<GeneratorControls>) => onChange({ ...controls, ...patch }));
  const choices = (builtIn: string[], own: string[] = [], label = (value: string) => value): Choice[] => [
    ...builtIn.map((value) => ({ value, label: label(value) })),
    ...own.filter((value) => !builtIn.includes(value)).map((value) => ({ value, label: label(value), custom: true })),
  ];
  // Adding one of your own keeps it on the list and picks it; removing one falls back to the first built-in.
  const group = (key: "tones" | "styles" | "lengths", control: "tone" | "style" | "length", fallback: string) => ({
    onAdd:
      onOptions &&
      ((value: string) => {
        if (!value) return;
        const own = options[key] ?? [];
        onOptions({ ...options, [key]: own.includes(value) ? own : [...own, value] }, { ...controls, [control]: value });
      }),
    onRemove:
      onOptions &&
      ((value: string) =>
        onOptions(
          { ...options, [key]: (options[key] ?? []).filter((own) => own !== value) },
          controls[control] === value ? { ...controls, [control]: fallback } : controls,
        )),
    onDismissSuggested: onDismissSuggested && ((value: string) => onDismissSuggested(key, value)),
    suggested: suggested?.[key],
  });
  return (
    <div className="flex flex-col gap-5">
      {mode === "text" ? (
        <>
          <div className="flex flex-col gap-2">
            <ControlLabel>Tone</ControlLabel>
            <ChoiceChips
              label="Tone"
              noun="tone"
              options={choices(GENERATOR_TONES, options.tones)}
              value={controls.tone}
              onChange={set && ((tone) => set({ tone }))}
              {...group("tones", "tone", GENERATOR_TONES[0]!)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <ControlLabel>Length</ControlLabel>
            <ChoiceChips
              label="Length"
              noun="length"
              options={choices(GENERATOR_LENGTHS.map((length) => length.value), options.lengths, (value) => LENGTH_LABEL[value] ?? value)}
              value={controls.length}
              onChange={set && ((length) => set({ length }))}
              {...group("lengths", "length", "short")}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <ControlLabel>Style</ControlLabel>
            <ChoiceChips
              label="Style"
              noun="style"
              options={choices(GENERATOR_STYLES, options.styles)}
              value={controls.style}
              onChange={set && ((style) => set({ style }))}
              {...group("styles", "style", GENERATOR_STYLES[0]!)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <ControlLabel>Aspect</ControlLabel>
            <Segmented<GeneratorControls["aspect"]> label="Aspect" size="large" options={GENERATOR_ASPECTS} value={controls.aspect} onChange={set && ((aspect) => set({ aspect }))} />
          </div>
        </>
      )}
      <label className="flex flex-col gap-2" {...fieldEvents}>
        <ControlLabel aside={<span className="text-typography-primary">{creativityWord(controls.creativity)}</span>}>Creativity</ControlLabel>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={controls.creativity}
          disabled={!set}
          onKeyDown={stopFieldEvent}
          onChange={(event) => set?.({ creativity: Number(event.target.value) })}
          className="h-1 w-full cursor-pointer accent-gray-5"
        />
        <span className="flex justify-between font-bureau text-[11px] text-typography-secondary">
          <span>Close to the prompt</span>
          <span>Free</span>
        </span>
      </label>
    </div>
  );
}

/** Reference thumbnails, with a button to add more by picking or dropping files. */
function References({
  references,
  onChange,
  large,
}: {
  references: GeneratorReference[];
  onChange?: (references: GeneratorReference[]) => void;
  large: boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const room = MAX_REFERENCES - references.length;
  const add = async (files: FileList | null) => {
    if (!onChange || !files) return;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (!picked.length) return;
    setReading(true);
    try {
      const read = await Promise.all(
        picked.map(async (f) => ({ id: shellId("ref"), src: await readReferenceFile(f), name: f.name.replace(/\.[^.]+$/, "") })),
      );
      onChange([...references, ...read]);
    } finally {
      setReading(false);
    }
  };
  const thumb = large ? "size-12 rounded-[10px]" : "size-8 rounded-[7px]";
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      onDragOver={(event) => onChange && event.preventDefault()}
      onDrop={(event) => {
        if (!onChange) return;
        event.preventDefault();
        void add(event.dataTransfer.files);
      }}
    >
      {references.map((reference) => (
        <span key={reference.id} className="group relative shrink-0">
          <img src={reference.src} alt={reference.name ?? "Reference"} draggable={false} className={cn(thumb, "object-cover")} />
          {onChange && (
            <FieldButton
              aria-label={`Remove ${reference.name || "reference"}`}
              onPress={() => onChange(references.filter((other) => other.id !== reference.id))}
              className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-gray-5 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <X className="size-2.5" />
            </FieldButton>
          )}
        </span>
      ))}
      {onChange && room > 0 && (
        <FieldButton
          onPress={() => file.current?.click()}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full font-bureau text-typography-secondary hover:bg-gray-3/15 hover:text-typography-primary",
            large ? "h-8 px-2.5 text-[13px]" : "h-6 px-1.5 text-[11px]",
          )}
        >
          {reading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
          {references.length ? "Add" : large ? "Add reference images" : "References"}
        </FieldButton>
      )}
      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          void add(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function download(src: string, name: string) {
  const link = document.createElement("a");
  link.href = src;
  link.download = name;
  link.click();
}

function VariationAction({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) {
  return (
    <FieldButton
      aria-label={label}
      title={label}
      onPress={onPress}
      className="grid size-7 place-items-center rounded-full bg-white/90 text-typography-primary shadow-[0_1px_3px_rgba(26,23,24,0.16)] hover:bg-white"
    >
      {icon}
    </FieldButton>
  );
}

/** One of the three outputs: pick it, and copy, download or reuse it. */
function VariationCard({
  variation,
  index,
  aspect,
  chosen,
  onChoose,
  onEdit,
  onReference,
}: {
  variation: GeneratorVariation;
  index: number;
  aspect: GeneratorControls["aspect"];
  chosen: boolean;
  onChoose?: () => void;
  onEdit?: (text: string) => void;
  onReference?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const label = `Variation ${index + 1}`;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={chosen}
      aria-label={chosen ? `${label}, chosen` : `Choose ${label.toLowerCase()}`}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onChoose?.();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        stopFieldEvent(event);
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onChoose?.();
        }
      }}
      className={cn(
        "group relative flex min-w-0 cursor-pointer flex-col rounded-[14px] transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-blue-4",
        chosen ? "ring-2 ring-blue-4 ring-offset-2" : "hover:ring-1 hover:ring-gray-3/40 hover:ring-offset-2",
      )}
    >
      {variation.src ? (
        <img src={variation.src} alt={label} draggable={false} className={cn("w-full rounded-[14px] bg-gray-6 object-cover", ASPECT_CLASS[aspect])} />
      ) : (
        <div className="flex min-h-40 flex-col rounded-[14px] bg-white p-4 shadow-[0_1px_3px_rgba(26,23,24,0.08)] hairline [--hairline-radius:14px] [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.25]">
          <AutoTextarea
            value={variation.text ?? ""}
            aria-label={label}
            readOnly={!onEdit}
            onKeyDown={stopFieldEvent}
            // Clicking into the words chooses the card too, and never un-chooses it.
            onClick={(event) => {
              event.stopPropagation();
              if (!chosen) onChoose?.();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onChange={(event) => onEdit?.(event.target.value)}
            className="cursor-text font-bureau text-[15px] leading-[1.5] font-light text-typography-primary"
          />
        </div>
      )}
      <span className="flex items-center justify-between px-1 pt-2 font-bureau text-[12px] text-typography-secondary">
        <span>{label}</span>
        {chosen && (
          <span className="flex items-center gap-1 text-blue-5">
            <Check className="size-3.5" strokeWidth={2.5} />
            Chosen
          </span>
        )}
      </span>
      <span className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {variation.src ? (
          <>
            {onReference && <VariationAction label="Use as a reference" icon={<ImagePlus className="size-3.5" />} onPress={onReference} />}
            <VariationAction label="Download" icon={<Download className="size-3.5" />} onPress={() => download(variation.src!, `variation-${index + 1}.webp`)} />
          </>
        ) : (
          <VariationAction
            label={copied ? "Copied" : "Copy"}
            icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            onPress={() => {
              void navigator.clipboard?.writeText(variation.text ?? "");
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            }}
          />
        )}
      </span>
    </div>
  );
}

function PendingCard({ mode, aspect, index, loading }: { mode: GeneratorMode; aspect: GeneratorControls["aspect"]; index: number; loading: boolean }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div
        className={cn(
          "grid place-items-center rounded-[14px] bg-gray-6 font-bureau text-[13px] font-light text-typography-secondary",
          mode === "image" ? ASPECT_CLASS[aspect] : "min-h-40",
          loading && "animate-pulse",
        )}
        style={loading ? { animationDelay: `${index * 160}ms` } : undefined}
      >
        {!loading && ghostLabels("Variation")[index]}
      </div>
      <span className="px-1 pt-2 font-bureau text-[12px] text-typography-secondary">{loading ? "Generating…" : " "}</span>
    </div>
  );
}

/**
 * Presets: the ready-made ones and the person's own, saved in this browser.
 * Picking one sets the mode and every control; the current one is ticked.
 */
function Presets({
  data,
  onApply,
}: {
  data: GeneratorShellData;
  onApply?: (preset: GeneratorPreset) => void;
}) {
  const [own, setOwn] = useState(loadPresets);
  const save = (next: GeneratorPreset[]) => {
    setOwn(next);
    storePresets(next);
  };
  const all = [...BUILT_IN_PRESETS, ...own];
  const current = all.find((preset) => isPreset(preset, data.mode, data.controls));
  const summary = (preset: GeneratorPreset) =>
    preset.mode === "text"
      ? `Text · ${preset.controls.tone} · ${preset.controls.length}`
      : `Image · ${preset.controls.style} · ${preset.controls.aspect}`;
  return (
    <ShellToolPopover label="Presets" icon={<Bookmark />} text={current?.name ?? "Presets"} disabled={!onApply}>
      {(close) => (
        <div className="flex w-[300px] flex-col gap-2">
          <ul className="flex flex-col">
            {all.map((preset) => {
              const mine = own.some((saved) => saved.id === preset.id);
              const on = preset === current;
              return (
                <li key={preset.id} className="group/preset flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onApply?.(preset);
                      close();
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-[9px] px-2 py-1.5 text-left hover:bg-gray-6"
                  >
                    <Check className={cn("size-3.5 shrink-0", !on && "invisible")} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-bureau text-[13px] text-typography-primary">{preset.name}</span>
                      <span className="truncate font-bureau text-[11px] text-typography-secondary">{summary(preset)}</span>
                    </span>
                  </button>
                  {mine && (
                    <button
                      type="button"
                      aria-label={`Delete ${preset.name}`}
                      onClick={() => save(own.filter((saved) => saved.id !== preset.id))}
                      className="grid size-7 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover/preset:opacity-100 hover:bg-gray-6 hover:text-typography-primary focus-visible:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <span aria-hidden className="h-px bg-gray-3/20" />
          <span className="px-1 font-bureau text-[11px] text-typography-secondary">
            {current ? `Settings match ${current.name}` : "Save these settings"}
          </span>
          <ShellToolField
            label="Preset name"
            placeholder="Name this preset"
            apply="Save"
            onApply={(name) => {
              const preset: GeneratorPreset = { id: shellId("preset"), name, mode: data.mode, controls: { ...data.controls } };
              save([...own.filter((saved) => saved.name !== name), preset]);
              close();
            }}
          />
        </div>
      )}
    </ShellToolPopover>
  );
}

export function GeneratorShell({
  size,
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
}: ShellProps<GeneratorShellData>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Results land on whatever the card holds by then, not what it held when the run began.
  const latest = useRef(data);
  latest.current = data;

  if (size === "small") return <ShellAppIcon kind="generator" className={className} />;

  if (size === "medium") {
    const images = data.variations.filter((v) => v.src).slice(0, 3);
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="generator" title={data.title} />
        {/* Shapes, not words: a prompt line, then three variations side by side. */}
        <PreviewBody className="gap-2 pt-2">
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-gray-6 px-2 py-1.5">
            <Sparkles className="size-2.5 shrink-0 text-typography-secondary" />
            <Bar width="70%" className="h-1" />
          </span>
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-1">
            {images.length === 3
              ? images.map((v) => <img key={v.id} src={v.src} alt="" draggable={false} className="size-full min-h-0 rounded-[5px] object-cover" />)
              : [0, 1, 2].map((i) => <span key={i} className={cn("rounded-[5px]", i === 0 ? "bg-gray-3/25" : "bg-gray-6")} />)}
          </div>
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<GeneratorShellData>) => onChange({ ...latest.current, ...patch }) : undefined;
  const ready = canGenerate(data);

  const run = async () => {
    if (!update || loading || !canGenerate(latest.current)) return;
    setLoading(true);
    setError(null);
    try {
      const variations = await generateVariations(latest.current);
      update({ variations, chosen: undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const modes = GENERATOR_MODES.map((mode) => ({ value: mode, label: MODE_LABEL[mode] }));
  const modeToggle = (
    <Segmented<GeneratorMode> label="Generate" size={size} options={modes} value={data.mode} onChange={update && ((mode) => update({ mode }))} />
  );

  if (!large) {
    // Medium plus: the prompt is the title; the rest is set up, ready to run once open.
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <ShellTitle
          kind="generator"
          size={size}
          value={data.title}
          placeholder="Describe what to make"
          onChange={update && ((title) => update({ title }))}
          onSubmit={onSubmit}
        />
        <ShellBody size={size} className="gap-2.5">
          <div className="flex items-center justify-between gap-2">
            {modeToggle}
            <span className="truncate font-bureau text-[11px] text-typography-secondary">
              {data.mode === "text" ? `${data.controls.tone} · ${data.controls.length}` : `${data.controls.style} · ${data.controls.aspect}`}
            </span>
          </div>
          {/* On the chat home: what the request leaves open. */}
          {suggestions?.brief}
          <References large={false} references={data.references} onChange={update && ((references) => update({ references }))} />
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => {
              const v = data.variations[i];
              if (v?.src) return <img key={v.id} src={v.src} alt="" draggable={false} className={cn("w-full rounded-[8px] bg-gray-6 object-cover", ASPECT_CLASS[data.controls.aspect], data.chosen === v.id && "ring-2 ring-blue-4")} />;
              if (v?.text) return <span key={v.id} className={cn("line-clamp-4 rounded-[8px] bg-gray-6 p-1.5 font-bureau text-[10px] leading-[1.35]", data.chosen === v.id && "ring-2 ring-blue-4")}>{v.text}</span>;
              return <span key={i} className={cn("rounded-[8px] bg-gray-6", data.mode === "image" ? ASPECT_CLASS[data.controls.aspect] : "h-14")} />;
            })}
          </div>
        </ShellBody>
      </ShellSurface>
    );
  }

  const shown = loading ? [] : data.variations;
  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle kind="generator" size={size} value="Generator" />
      <ShellToolbar tools={tools} actions={actions}>
        {modeToggle}
        <Presets
          data={data}
          onApply={
            update &&
            ((preset) => {
              // A preset with a tone, style or length of someone's own brings it onto the lists.
              const own = (list: string[] | undefined, value: string, builtIn: string[]) =>
                builtIn.includes(value) || list?.includes(value) ? list : [...(list ?? []), value];
              const options = data.options ?? {};
              update({
                mode: preset.mode,
                controls: { ...preset.controls },
                options: {
                  tones: own(options.tones, preset.controls.tone, GENERATOR_TONES),
                  styles: own(options.styles, preset.controls.style, GENERATOR_STYLES),
                  lengths: own(options.lengths, preset.controls.length, GENERATOR_LENGTHS.map((length) => length.value)),
                },
              });
            })
          }
        />
        <ShellToolDivider />
        <ShellToolFile
          label="Add reference images"
          accept="image/*"
          multiple
          disabled={!update || data.references.length >= MAX_REFERENCES}
          onFiles={async (files) => {
            const room = MAX_REFERENCES - latest.current.references.length;
            const read = await Promise.all(
              files
                .filter((f) => f.type.startsWith("image/"))
                .slice(0, room)
                .map(async (f) => ({ id: shellId("ref"), src: await readReferenceFile(f), name: f.name.replace(/\.[^.]+$/, "") })),
            );
            update?.({ references: [...latest.current.references, ...read] });
          }}
        >
          <ImagePlus />
        </ShellToolFile>
        <ShellToolButton
          label="Clear references"
          disabled={!update || data.references.length === 0}
          onPress={() => update?.({ references: [] })}
        >
          <ImageOff />
        </ShellToolButton>
        <ShellToolDivider />
        <ShellToolButton label={data.variations.length ? "Generate again (⌘↵)" : "Generate (⌘↵)"} disabled={!update || !ready || loading} onPress={() => void run()}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        </ShellToolButton>
        {data.variations.some((v) => v.src) ? (
          <ShellToolButton
            label="Download all"
            disabled={loading}
            onPress={() => data.variations.forEach((v, i) => v.src && download(v.src, `variation-${i + 1}.webp`))}
          >
            <Download />
          </ShellToolButton>
        ) : (
          <ShellToolButton
            label="Copy all"
            disabled={loading || !data.variations.some((v) => v.text)}
            onPress={() => copyText(data.variations.flatMap((v) => (v.text ? [v.text] : [])).join("\n\n"))}
          >
            <Copy />
          </ShellToolButton>
        )}
        <ShellToolButton label="Clear results" disabled={!update || loading || data.variations.length === 0} onPress={() => update?.({ variations: [], chosen: undefined })}>
          <Trash2 />
        </ShellToolButton>
      </ShellToolbar>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pt-4 pb-6">
        {/* The prompt box: what to make, the pictures to work from, and Generate. */}
        <div className="flex shrink-0 flex-col gap-3 rounded-[16px] bg-gray-6 px-4 pt-3.5 pb-3">
          <AutoTextarea
            value={data.title}
            placeholder={data.mode === "text" ? "Describe what to write: taglines for a coffee brand…" : "Describe the image: a lighthouse at dusk…"}
            aria-label="Prompt"
            readOnly={!update}
            {...fieldEvents}
            onKeyDown={(event) => {
              stopFieldEvent(event);
              if (isSubmitShortcut(event)) {
                event.preventDefault();
                void run();
              }
            }}
            onChange={(event) => update?.({ title: event.target.value })}
            className="min-h-12 font-bureau text-[16px] leading-[1.45] font-light text-typography-primary placeholder:text-typography-secondary"
          />
          <div className="flex items-end justify-between gap-3">
            {/* Suggestions about the prompt sit in its own row, by the references. */}
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <References large references={data.references} onChange={update && ((references) => update({ references }))} />
              {suggestions?.prompt}
            </div>
            {update && (
              <FieldButton
                disabled={!ready || loading}
                onPress={() => void run()}
                className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-gradient-black-blue px-4 font-bureau text-[14px] text-typography-inverse transition-opacity disabled:opacity-40"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : data.variations.length ? <RotateCcw className="size-4" /> : <Sparkles className="size-4" />}
                {loading ? "Generating" : data.variations.length ? "Generate again" : "Generate"}
              </FieldButton>
            )}
          </div>
        </div>

        <div className="flex min-h-0 gap-6">
          <aside className="flex w-60 shrink-0 flex-col gap-5">
            <Controls
              mode={data.mode}
              controls={data.controls}
              options={data.options}
              suggested={suggested}
              onChange={update && ((controls) => update({ controls }))}
              onOptions={update && ((options, controls) => update({ options, controls }))}
              onDismissSuggested={onDismissSuggestion}
            />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {error && (
              <p role="alert" className="rounded-[10px] bg-red-1 px-3 py-2 font-bureau text-[13px] text-red-5">
                {error}
              </p>
            )}
            <div className="grid grid-cols-3 items-start gap-4">
              {shown.length
                ? shown.slice(0, 3).map((variation, i) => (
                    <VariationCard
                      key={variation.id}
                      variation={variation}
                      index={i}
                      aspect={data.controls.aspect}
                      chosen={data.chosen === variation.id}
                      onChoose={update && (() => update({ chosen: data.chosen === variation.id ? undefined : variation.id }))}
                      onEdit={
                        update &&
                        ((text) =>
                          update({ variations: latest.current.variations.map((v) => (v.id === variation.id ? { ...v, text } : v)) }))
                      }
                      onReference={
                        update && data.references.length < MAX_REFERENCES && variation.src
                          ? () => update({ references: [...latest.current.references, { id: shellId("ref"), src: variation.src!, name: `Variation ${i + 1}` }] })
                          : undefined
                      }
                    />
                  ))
                : [0, 1, 2].map((i) => <PendingCard key={i} index={i} mode={data.mode} aspect={data.controls.aspect} loading={loading} />)}
            </div>
            {!loading && shown.length > 0 && (
              <p className="font-bureau text-[12px] text-typography-secondary">
                {data.chosen ? "Chosen. Generate again to explore further from the same prompt." : "Click a variation to choose it."}
              </p>
            )}
          </div>
        </div>
      </div>
    </ShellSurface>
  );
}

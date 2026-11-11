import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { SHELL_PART_TYPE_HINT, shellPartValue, type ShellPart } from "../model/shell-parts";
import type { ShellRetrieval } from "../model/shell-retrieval";
import type { ShellDataByKind, ShellKind } from "../model/shell-types";

const fieldClass =
  "field-sizing-content w-full resize-none rounded-[14px] bg-gray-6 px-3 py-2 font-bureau text-[13px] leading-[1.45] text-typography-primary outline-none placeholder:text-typography-secondary focus:ring-2 focus:ring-blue-4/30";

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-bureau text-[12px] text-typography-secondary">{children}</span>
);

function TriggerChips({
  triggers,
  onChange,
  noun = "trigger",
}: {
  triggers: string[];
  onChange: (triggers: string[]) => void;
  noun?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const word = draft.trim().toLowerCase();
    if (word && !triggers.includes(word)) onChange([...triggers, word]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap items-center gap-1">
      {triggers.map((trigger) => (
        <span
          key={trigger}
          className="flex items-center gap-0.5 rounded-full bg-gray-6 py-0.5 pr-1 pl-2 font-bureau text-[12px] text-typography-primary"
        >
          {trigger}
          <button
            type="button"
            aria-label={`Remove ${noun} ${trigger}`}
            onClick={() => onChange(triggers.filter((t) => t !== trigger))}
            className="grid size-4 place-items-center rounded-full text-typography-secondary hover:text-typography-primary"
          >
            <X className="size-2.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Add a word"
        aria-label={`Add a ${noun} word`}
        className="h-6 w-24 bg-transparent px-1 font-bureau text-[12px] text-typography-primary outline-none placeholder:text-typography-secondary"
      />
    </div>
  );
}

/** When to choose this interface, what it is not for, and the words that pull it in. */
export function DescriptionCell({
  profile,
  onChange,
}: {
  profile: ShellRetrieval;
  onChange: (next: ShellRetrieval) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <textarea
        value={profile.description}
        onChange={(event) => onChange({ ...profile, description: event.target.value })}
        aria-label="When to use this interface"
        rows={4}
        className={fieldClass}
      />
      <div className="flex flex-col gap-1.5">
        <Label>Not for</Label>
        <textarea
          value={profile.notFor}
          onChange={(event) => onChange({ ...profile, notFor: event.target.value })}
          aria-label="What this interface is not for"
          rows={2}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Trigger words</Label>
        <TriggerChips
          triggers={profile.triggers}
          onChange={(triggers) => onChange({ ...profile, triggers })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Related words</Label>
        <TriggerChips
          noun="related"
          triggers={profile.hints ?? []}
          onChange={(hints) => onChange({ ...profile, hints })}
        />
      </div>
    </div>
  );
}

function PartValue({ value }: { value: string | string[] }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-typography-secondary">Empty</span>;
    return (
      <span className="flex flex-wrap gap-1">
        {value.slice(0, 6).map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="max-w-full truncate rounded-full bg-gray-6 px-2 py-0.5 text-[12px]"
          >
            {item}
          </span>
        ))}
        {value.length > 6 && (
          <span className="text-[12px] text-typography-secondary">+{value.length - 6}</span>
        )}
      </span>
    );
  }
  return value ? (
    <span className="line-clamp-2">{value}</span>
  ) : (
    <span className="text-typography-secondary">Empty</span>
  );
}

/** The typed parts the interface is made of, with what each holds in the content shown. */
export function PartsCell({
  kind,
  parts,
  data,
  readValue,
}: {
  kind: ShellKind;
  parts: ShellPart[];
  data: unknown;
  /** Read a part's value another way, as chat formats do. */
  readValue?: (key: string) => string | string[];
}) {
  return (
    <ul className="flex min-w-0 flex-col divide-y divide-gray-3/15">
      {parts.map((part) => (
        <li key={part.key} className="flex flex-col gap-1 py-2.5 first:pt-0">
          <div className="flex items-center gap-1.5" title={part.description}>
            <span className="font-bureau text-[13px] text-typography-primary">
              {part.label}
              {part.required && <span className="text-typography-secondary">*</span>}
            </span>
            <span
              className="rounded-full bg-gray-6 px-1.5 py-px font-mono text-[11px] text-typography-secondary"
              title={SHELL_PART_TYPE_HINT[part.type]}
            >
              {part.type}
            </span>
          </div>
          <div className="font-bureau text-[13px] leading-[1.4] text-typography-primary">
            <PartValue value={readValue ? readValue(part.key) : shellPartValue(kind, data as ShellDataByKind[ShellKind], part.key)} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ExampleList({
  items,
  placeholder,
  onChange,
}: {
  items: string[];
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  const update = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));

  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((query, index) => (
        <li key={index} className="group flex items-start gap-1">
          <textarea
            value={query}
            onChange={(event) => update(index, event.target.value)}
            aria-label={`${placeholder} ${index + 1}`}
            placeholder={placeholder}
            rows={1}
            className={cn(fieldClass, "py-1.5")}
          />
          <button
            type="button"
            aria-label={`Remove ${query || "example"}`}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="mt-1 grid size-6 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-6 hover:text-typography-primary focus-visible:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          aria-label={`Add: ${placeholder}`}
          className="grid size-6 place-items-center rounded-full text-typography-secondary hover:bg-gray-6 hover:text-typography-primary"
        >
          <Plus className="size-3.5" />
        </button>
      </li>
    </ul>
  );
}

/** Prompts that should open it, then near misses that shouldn't. */
export function QueriesCell({
  profile,
  onChange,
}: {
  profile: ShellRetrieval;
  onChange: (next: ShellRetrieval) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ExampleList
        items={profile.queries}
        placeholder="A prompt that should open this"
        onChange={(queries) => onChange({ ...profile, queries })}
      />
      <div className="flex flex-col gap-1.5">
        <Label>Should not open</Label>
        <ExampleList
          items={profile.avoidQueries}
          placeholder="A prompt that shouldn't open this"
          onChange={(avoidQueries) => onChange({ ...profile, avoidQueries })}
        />
      </div>
    </div>
  );
}

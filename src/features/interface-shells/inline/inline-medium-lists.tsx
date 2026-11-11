import { Search } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { numberedIndices, parseBlocks, plainText, serializeBlocks } from "../model/markdown-blocks";
import type {
  CalendarShellData,
  DocumentShellData,
  GuideShellData,
  ReaderShellData,
  SearchShellData,
  TableShellData,
  TrackerShellData,
} from "../model/shell-types";
import { InlineRemove, InlineText, InlineToggle } from "./inline-edit";
import { InlineChip, InlineGhostLines, InlineMore, InlineProgress } from "./inline-kit";
import { INLINE_META, INLINE_TEXT } from "./inline-styles";

/**
 * Inline medium designs for the list-shaped interfaces. Each takes an
 * optional `onChange`: with it, what's on screen can be edited where it
 * stands (text takes a caret, ticks can be pressed), without changing size.
 */

type Editable<D> = { data: D; onChange?: (data: D) => void };

/** Long content fades out instead of ending on a hard edge. */
const FADE = "[mask-image:linear-gradient(to_bottom,black_72%,transparent)]";

/** The opening of the document: headings, paragraphs and lists, as text. */
export function DocumentInline({ data, onChange }: Editable<DocumentShellData>) {
  const blocks = parseBlocks(data.body);
  const visible = blocks.map((block, index) => ({ block, index })).filter(({ block }) => block.text.trim());
  if (!visible.length) return <InlineGhostLines count={4} />;
  const shown = visible.slice(0, 6);
  const numbers = numberedIndices(blocks);
  // Blocks are re-parsed each render, so they're keyed and edited by position.
  const edit = (index: number) =>
    onChange
      ? (text: string) =>
          onChange({ ...data, body: serializeBlocks(blocks.map((block, i) => (i === index ? { ...block, text } : block))) })
      : undefined;
  return (
    <div className={cn("flex max-h-[216px] flex-col gap-1.5 overflow-hidden", visible.length > 4 && FADE)}>
      {shown.map(({ block, index }) => {
        const text = <InlineText value={block.text} display={plainText(block.text)} onChange={edit(index)} />;
        if (block.type === "heading1" || block.type === "heading2") {
          return (
            <p key={index} className="mt-1 font-bureau text-[14px] leading-[1.4] text-typography-primary first:mt-0">
              {text}
            </p>
          );
        }
        if (block.type === "bullet" || block.type === "numbered") {
          return (
            <p key={index} className={cn(INLINE_TEXT, "flex gap-2 font-light")}>
              <span className="w-3 shrink-0 text-typography-secondary">
                {block.type === "bullet" ? "•" : `${numbers.get(block.id) ?? 1}.`}
              </span>
              <span className="line-clamp-2 min-w-0 flex-1">{text}</span>
            </p>
          );
        }
        if (block.type === "quote") {
          return (
            <p key={index} className={cn(INLINE_TEXT, "line-clamp-2 border-l-2 border-gray-3/30 pl-3 font-light")}>
              {text}
            </p>
          );
        }
        return (
          <p key={index} className={cn(INLINE_TEXT, "line-clamp-3 font-light")}>
            {text}
          </p>
        );
      })}
    </div>
  );
}

const domainOf = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/** Filters, then the top results; before results, the searches it's running. */
export function SearchInline({ data, onChange, selected }: Editable<SearchShellData> & { selected?: boolean }) {
  const results = data.results.slice(0, 3);
  return (
    <div className="flex flex-col gap-3">
      {data.filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.filters.slice(0, 4).map((filter) => (
            <InlineChip key={filter}>
              {filter}
              {onChange && selected && (
                <InlineRemove
                  label={filter}
                  onRemove={() => onChange({ ...data, filters: data.filters.filter((item) => item !== filter) })}
                />
              )}
            </InlineChip>
          ))}
        </div>
      )}
      {results.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {results.map((result) => {
            const domain = domainOf(result.url);
            return (
              <div key={result.id} className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-bureau text-[13.5px] leading-[1.4] text-blue-5">{result.title}</span>
                <span className={cn(INLINE_META, "line-clamp-1")}>
                  {domain && <span className="text-typography-primary">{domain} · </span>}
                  {result.snippet}
                </span>
              </div>
            );
          })}
          <InlineMore count={data.results.length - results.length} noun="results" />
        </div>
      ) : data.queries.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {data.queries.slice(0, 3).map((query, index) => (
            <span key={index} className={cn(INLINE_TEXT, "flex items-center gap-2 font-light")}>
              <Search className="size-3.5 shrink-0 text-typography-secondary" />
              <InlineText
                value={query}
                onChange={
                  onChange &&
                  ((text) => onChange({ ...data, queries: data.queries.map((item, i) => (i === index ? text : item)) }))
                }
                className="min-w-0 truncate"
              />
            </span>
          ))}
        </div>
      ) : (
        <InlineGhostLines />
      )}
    </div>
  );
}

/** The first few columns and rows, on hairlines. */
export function TableInline({ data, onChange }: Editable<TableShellData>) {
  const columns = data.columns.slice(0, 4);
  const rows = data.rows.slice(0, 4);
  const setCell = (rowId: string, columnId: string) =>
    onChange
      ? (value: string) =>
          onChange({
            ...data,
            rows: data.rows.map((row) => (row.id === rowId ? { ...row, cells: { ...row.cells, [columnId]: value } } : row)),
          })
      : undefined;
  const setLabel = (columnId: string) =>
    onChange
      ? (label: string) =>
          onChange({ ...data, columns: data.columns.map((column) => (column.id === columnId ? { ...column, label } : column)) })
      : undefined;
  return (
    <div className="flex flex-col gap-2">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                className={cn(INLINE_META, "truncate border-b border-gray-3/25 pr-3 pb-1.5 text-left font-normal")}
              >
                <InlineText value={column.label} onChange={setLabel(column.id)} placeholder="Untitled" className="block truncate" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0
            ? rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => {
                    const value = row.cells[column.id] ?? "";
                    return (
                      <td key={column.id} className="border-b border-gray-3/10 py-1.5 pr-3 align-middle">
                        {column.type === "image" && value ? (
                          <img src={value} alt="" className="h-7 w-10 rounded-[6px] bg-gray-6 object-cover" />
                        ) : column.type === "tag" && value ? (
                          <InlineChip>
                            <InlineText value={value} onChange={setCell(row.id, column.id)} />
                          </InlineChip>
                        ) : (
                          <InlineText
                            value={value}
                            onChange={setCell(row.id, column.id)}
                            className={cn(INLINE_TEXT, "block truncate text-[13px]")}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            : [0, 1, 2].map((index) => (
                <tr key={index} aria-hidden>
                  {columns.map((column) => (
                    <td key={column.id} className="border-b border-gray-3/10 py-2.5 pr-3">
                      <span className="block h-2 rounded-full bg-gray-6" style={{ width: `${[70, 52, 84][index]}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      <InlineMore count={data.rows.length - rows.length} noun="rows" />
    </div>
  );
}

/** How far along, then the first items with who and when. */
export function TrackerInline({ data, onChange }: Editable<TrackerShellData>) {
  const items = data.items.slice(0, 5);
  const done = data.items.filter((item) => item.done).length;
  if (!items.length) return <InlineGhostLines />;
  const update = (id: string, patch: Partial<TrackerShellData["items"][number]>) =>
    onChange?.({ ...data, items: data.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  return (
    <div className="flex flex-col gap-2.5">
      <InlineProgress done={done} total={data.items.length} />
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex min-w-0 items-center gap-2.5">
            <InlineToggle
              done={item.done}
              label={item.label}
              onToggle={onChange && (() => update(item.id, { done: !item.done }))}
            />
            <InlineText
              value={item.label}
              onChange={onChange && ((label) => update(item.id, { label }))}
              className={cn(INLINE_TEXT, "min-w-0 flex-1 truncate", item.done && "text-typography-secondary line-through")}
            />
            {(item.owner || item.due) && (
              <span className={cn(INLINE_META, "shrink-0")}>{[item.owner, item.due].filter(Boolean).join(" · ")}</span>
            )}
          </div>
        ))}
      </div>
      <InlineMore count={data.items.length - items.length} noun="items" />
    </div>
  );
}

const dayOf = (date: string) => new Date(`${date}T00:00:00`);

/** What's coming up, as an agenda: day, what, and when. */
export function CalendarInline({ data, onChange }: Editable<CalendarShellData>) {
  const events = [...data.events].sort((a, b) => a.date.localeCompare(b.date));
  const shown = events.slice(0, 4);
  if (!shown.length) return <InlineGhostLines />;
  const update = (id: string, patch: Partial<CalendarShellData["events"][number]>) =>
    onChange?.({ ...data, events: data.events.map((event) => (event.id === id ? { ...event, ...patch } : event)) });
  return (
    <div className="flex flex-col">
      {shown.map((event) => {
        const day = dayOf(event.date);
        return (
          <div key={event.id} className="flex min-w-0 items-center gap-3 border-b border-gray-3/10 py-1.5 last:border-b-0">
            <span className="flex w-8 shrink-0 flex-col items-center leading-none">
              <span className="font-bureau text-[10px] tracking-wide text-typography-secondary uppercase">
                {day.toLocaleDateString("en-GB", { weekday: "short" })}
              </span>
              <span className="mt-0.5 font-bureau text-[16px] text-typography-primary tabular-nums">{day.getDate()}</span>
            </span>
            <InlineText
              value={event.title}
              onChange={onChange && ((title) => update(event.id, { title }))}
              className={cn(INLINE_TEXT, "min-w-0 flex-1 truncate")}
            />
            {(event.time || onChange) && (
              <InlineText
                value={event.time ?? ""}
                onChange={onChange && ((time) => update(event.id, { time }))}
                placeholder={onChange ? "Time" : undefined}
                className={cn(INLINE_META, "shrink-0")}
              />
            )}
          </div>
        );
      })}
      <span className="pt-1.5">
        <InlineMore count={events.length - shown.length} noun="events" />
      </span>
    </div>
  );
}

/** What was asked, and the passages marked in answer. */
export function ReaderInline({ data, onChange }: Editable<ReaderShellData>) {
  const highlights = data.highlights.slice(0, 2);
  const passage = data.passages[0];
  if (!data.source && !passage) return <InlineGhostLines />;
  return (
    <div className="flex flex-col gap-2.5">
      {(data.query || onChange) && (
        <span className={INLINE_META}>
          Asked about “
          <InlineText
            value={data.query}
            onChange={onChange && ((query) => onChange({ ...data, query }))}
            placeholder="a question"
          />
          ”
        </span>
      )}
      {highlights.length > 0
        ? highlights.map((highlight) => (
            <div key={highlight.id} className="flex flex-col gap-1 border-l-2 border-blue-4 pl-3">
              <p className={cn(INLINE_TEXT, "line-clamp-3 font-light")}>
                <mark className="rounded-[3px] bg-blue-1 px-0.5 text-typography-primary">{highlight.quote}</mark>
              </p>
              {highlight.note && <span className={INLINE_META}>{highlight.note}</span>}
            </div>
          ))
        : passage && <p className={cn(INLINE_TEXT, "line-clamp-4 font-light", FADE)}>{passage}</p>}
    </div>
  );
}

/** What's needed, then the first steps with their timers. */
export function GuideInline({ data, onChange }: Editable<GuideShellData>) {
  const steps = data.steps.slice(0, 4);
  const needs = data.needs.filter((need) => need.text.trim());
  if (!steps.length && !needs.length) return <InlineGhostLines />;
  const update = (id: string, patch: Partial<GuideShellData["steps"][number]>) =>
    onChange?.({ ...data, steps: data.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)) });
  return (
    <div className="flex flex-col gap-2.5">
      {needs.length > 0 && (
        <p className={cn(INLINE_META, "line-clamp-1")}>
          <span className="text-typography-primary">You need </span>
          {needs
            .slice(0, 4)
            .map((need) => need.text)
            .join(", ")}
          {needs.length > 4 && ` and ${needs.length - 4} more`}
        </p>
      )}
      <ol className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <li key={step.id} className="flex min-w-0 items-start gap-2.5">
            <InlineToggle
              done={step.done}
              label={`Step ${index + 1}`}
              onToggle={onChange && (() => update(step.id, { done: !step.done }))}
              className={cn("mt-px font-bureau text-[10px] tabular-nums", !step.done && "text-typography-secondary")}
            >
              {index + 1}
            </InlineToggle>
            <InlineText
              value={step.text}
              onChange={onChange && ((text) => update(step.id, { text }))}
              multiline
              className={cn(INLINE_TEXT, "line-clamp-2 min-w-0 flex-1 font-light", step.done && "text-typography-secondary")}
            />
            {step.minutes ? <span className={cn(INLINE_META, "shrink-0 pt-px")}>{step.minutes} min</span> : null}
          </li>
        ))}
      </ol>
      <InlineMore count={data.steps.length - steps.length} noun="steps" />
    </div>
  );
}

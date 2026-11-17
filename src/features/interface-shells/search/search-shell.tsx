import {
  Clock,
  Database,
  File,
  FileText,
  Layers,
  ListFilterPlus,
  Globe,
  ImageIcon,
  Newspaper,
  Search as SearchIcon,
  Tag,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { CONTENT_PANEL, PreviewBody, PreviewHead, SHELL_BODY_BOX, SHELL_BODY_PAD, SHELL_EDGE_X, SHELL_TITLE_GLYPH, SHELL_TITLE_ROW } from "../ui/shell-kit";
import { ShellToolbar, ShellToolField, ShellToolMenu, ShellToolPopover } from "../ui/shell-toolbar";
import { resultDomain } from "../model/search-results";
import type { SearchShellData, ShellProps } from "../model/shell-types";
import { SearchAppIcon, ShellGlyph } from "../ui/shell-icons";
import { SuggestedChip, unusedSuggestions } from "../ui/suggested-chip";
import { useShellMark } from "../ui/shell-mark";
import { ActionPill, Kbd, ShellField, SoftChip } from "../ui/shell-fields";
import {
  AutoTextarea,
  Bar,
  fieldEvents,
  ShellSurface,
  stopFieldEvent,
} from "../ui/shell-surface";

/** Offered while typing a filter. Anything else can still be added as free text. */
const FILTER_SUGGESTIONS = [
  "Web",
  "News",
  "Papers",
  "Images",
  "Document",
  "Paper",
  "Dataset",
  "Video",
  "Page",
  "nature.com",
  "scholar.google.com",
  "wikipedia.org",
  "arxiv.org",
] as const;

const FILTER_ICON: Record<string, LucideIcon> = {
  web: Globe,
  news: Newspaper,
  papers: Newspaper,
  images: ImageIcon,
  document: FileText,
  paper: FileText,
  dataset: Database,
  image: ImageIcon,
  video: Video,
  page: File,
};

const filterIcon = (chip: string) => FILTER_ICON[chip.toLowerCase()] ?? Tag;

/** Google's result types, under Tools: one at a time, as a filter chip. */
const SEARCH_TYPES = [
  { label: "News", icon: Newspaper },
  { label: "Images", icon: ImageIcon },
  { label: "Videos", icon: Video },
  { label: "Papers", icon: FileText },
  { label: "Datasets", icon: Database },
] as const;

/** Google's time ranges, also one at a time. `tbs` is Google's own code for each. */
const TIME_RANGES = [
  { label: "Past 24 hours", tbs: "qdr:d" },
  { label: "Past week", tbs: "qdr:w" },
  { label: "Past month", tbs: "qdr:m" },
  { label: "Past year", tbs: "qdr:y" },
] as const;

const lower = (value: string) => value.toLowerCase();
const isTypeChip = (chip: string) => SEARCH_TYPES.some((type) => lower(type.label) === lower(chip));
const isTimeChip = (chip: string) => TIME_RANGES.some((range) => lower(range.label) === lower(chip));


type SearchShellProps = ShellProps<SearchShellData> & {
  /** Run (or re-run) the search; falls back to onSubmit. */
  onSearch?: (data: SearchShellData) => void;
};

const sameChip = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const cleanDomain = (value: string) =>
  value
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

/** "pubmed.ncbi.nlm.nih.gov" → "pubmed", "nature.com" → "nature". */
const shortDomain = (domain: string) => domain.split(".")[0] ?? domain;

function Favicon({ url, size }: { url?: string; size: number }) {
  const domain = resultDomain(url);
  const [failed, setFailed] = useState(false);
  if (!domain || failed) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-shell-fill text-typography-secondary"
        style={{ width: size, height: size }}
      >
        <Globe style={{ width: size * 0.62, height: size * 0.62 }} />
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full bg-shell-panel object-contain"
    />
  );
}

function QueryField({
  value,
  large,
  editable,
  loading,
  onChange,
  onSubmit,
}: {
  value: string;
  large: boolean;
  editable: boolean;
  loading: boolean;
  onChange: (query: string) => void;
  onSubmit: () => void;
}) {
  const mark = useShellMark(large ? "large" : "medium-plus");
  // The query is the title: the title's type and glyph from the tokens.
  const textClass = "font-bureau text-typography-primary";
  return (
    <div className="shell-title-type flex min-w-0 flex-1 items-start gap-[var(--shell-title-gap)]">
      {mark && <ShellGlyph kind="search" className={cn(SHELL_TITLE_GLYPH, large ? "mt-0.5" : "mt-px")} />}
      {editable ? (
        <AutoTextarea
          value={value}
          placeholder={large ? "Search the web…" : "Search…"}
          aria-label="Search query"
          disabled={loading && large}
          {...fieldEvents}
          onChange={(event) => onChange(event.target.value.replace(/\s*\n\s*/g, " "))}
          onKeyDown={(event) => {
            stopFieldEvent(event);
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              onSubmit();
            }
          }}
          style={{ overflowY: "auto" }}
          className={cn(
            textClass,
            "no-scrollbar placeholder:font-light placeholder:text-typography-secondary disabled:opacity-60",
            large ? "max-h-[108px]" : "max-h-[61px]",
          )}
        />
      ) : (
        <p className={cn(textClass, "line-clamp-3", !value && "font-light text-typography-secondary")}>
          {value || "Search…"}
        </p>
      )}
      {loading && (
        <span
          className={cn(
            "shrink-0 animate-spin rounded-full border-[1.5px] border-shell-line-strong border-t-blue-5",
            large ? "mt-[5px] size-4" : "mt-[3px] size-3.5",
          )}
        />
      )}
    </div>
  );
}

const looksLikeDomain = (value: string) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value.trim());

/**
 * Applied filters: they show what shapes the search, and come off with their
 * ×. They're added from the toolbar ("Add a filter", Type, Time, a site).
 */
function FilterBar({
  data,
  size,
  editable,
  onToggle,
  onSources,
  children,
}: {
  data: SearchShellData;
  size: "sm" | "md";
  editable: boolean;
  onToggle: (chip: string) => void;
  onSources: (sources: string[]) => void;
  /** Suggested filters, after the real ones in the same row. */
  children?: React.ReactNode;
}) {
  const sources = data.sources ?? [];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {data.filters.map((chip) => (
        <SoftChip
          key={chip}
          icon={filterIcon(chip)}
          size={size}
          onRemove={editable ? () => onToggle(chip) : undefined}
          removeLabel={`Remove ${chip}`}
        >
          {chip}
        </SoftChip>
      ))}
      {sources.map((domain) => (
        <SoftChip
          key={domain}
          size={size}
          leading={<Favicon url={`https://${domain}`} size={size === "sm" ? 12 : 14} />}
          onRemove={editable ? () => onSources(sources.filter((item) => item !== domain)) : undefined}
          removeLabel={`Remove ${domain}`}
        >
          {size === "sm" ? shortDomain(domain) : domain}
        </SoftChip>
      ))}
      {data.filters.length === 0 && sources.length === 0 && (
        <SoftChip icon={Globe} size={size}>
          All sources
        </SoftChip>
      )}
      {children}
    </div>
  );
}

/** Medium: the same head as every card, then shapes, not words: a search bar, filters, results. */
function SearchPreview({ data }: { data: SearchShellData }) {
  return (
    <>
      <PreviewHead kind="search" title={data.query} />
      <PreviewBody>
        <span className="flex h-4 shrink-0 items-center gap-1 rounded-full bg-shell-fill px-1.5">
          <SearchIcon className="size-2.5 text-typography-secondary" />
          <Bar width="45%" className="h-1" />
        </span>
        <span className="flex shrink-0 gap-1">
          {[34, 26].map((width) => (
            <span key={width} className="h-3 rounded-full bg-shell-fill" style={{ width }} />
          ))}
        </span>
        <ResultShapes className="mt-auto" />
      </PreviewBody>
    </>
  );
}

/** Rows standing for results not yet read. */
function ResultShapes({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-1.5", className)}>
      {[86, 64, 74, 58].slice(0, rows).map((width, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-shell-ink-soft" />
          <Bar width={`${width}%`} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}

type StepStatus = "done" | "running" | "queued";

function StepMark({ status, large }: { status: StepStatus; large: boolean }) {
  const size = large ? "size-4" : "size-3.5";
  if (status === "running")
    return <span className={cn("shrink-0 animate-spin rounded-full border-[1.5px] border-shell-line-strong border-t-orange-5", size)} />;
  if (status === "done")
    return (
      <span className={cn("grid shrink-0 place-items-center rounded-full bg-orange-5 text-white", size)}>
        <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
          <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  return <span className={cn("shrink-0 rounded-full border border-dashed border-shell-line-strong", size)} />;
}

/**
 * The searches it runs: the query first, then the follow-ups that cover the
 * rest of the question. Each shows whether it's done, running or still to go.
 */
function Steps({
  data,
  large,
  loading,
  editable,
  onQueries,
}: {
  data: SearchShellData;
  large: boolean;
  loading: boolean;
  editable: boolean;
  onQueries: (queries: string[]) => void;
}) {
  const ran = data.results.length > 0;
  const steps = [data.query, ...data.queries].map((text, i) => ({
    text,
    i,
    status: (ran ? "done" : loading ? (i === 0 ? "running" : "queued") : "queued") as StepStatus,
  }));
  const ghost = !data.query.trim() && data.queries.length === 0;
  return (
    <div className={cn("flex flex-col", large ? "gap-2" : "gap-1")}>
      <ol className={cn("flex flex-col", large ? "gap-1.5" : "gap-1")}>
        {ghost
          ? ["Search 1", "Search 2", "Search 3"].map((label) => (
              <li key={label} className="flex items-center gap-2">
                <StepMark status="queued" large={large} />
                <span className={cn("font-bureau font-light text-typography-secondary", large ? "text-[14px]" : "text-[12px]")}>{label}</span>
              </li>
            ))
          : steps.slice(0, large ? undefined : 3).map((step) => (
              <li key={step.i} className="group flex min-w-0 items-center gap-2">
                <StepMark status={step.status} large={large} />
                {step.i === 0 ? (
                  <span className={cn("min-w-0 flex-1 truncate font-bureau text-typography-primary", large ? "text-[14px]" : "text-[12px]")}>
                    {step.text || <span className="font-light text-typography-secondary">The query</span>}
                  </span>
                ) : (
                  <input
                    value={step.text}
                    readOnly={!editable}
                    placeholder="A follow-up search"
                    aria-label={`Follow-up search ${step.i}`}
                    {...fieldEvents}
                    onKeyDown={stopFieldEvent}
                    onChange={(event) => onQueries(data.queries.map((q, j) => (j === step.i - 1 ? event.target.value : q)))}
                    className={cn("min-w-0 flex-1 rounded-[6px] bg-transparent font-bureau text-typography-primary outline-none focus:bg-shell-fill", large ? "text-[14px]" : "text-[12px]")}
                  />
                )}
                {editable && step.i > 0 && large && (
                  <button
                    type="button"
                    aria-label="Remove this search"
                    {...fieldEvents}
                    onClick={(event) => {
                      stopFieldEvent(event);
                      onQueries(data.queries.filter((_, j) => j !== step.i - 1));
                    }}
                    className="grid size-5 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-shell-fill focus-visible:opacity-100"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
      </ol>
    </div>
  );
}

/** The sources it's going through. What they say goes in the chat reply. */
function Reading({ data, large }: { data: SearchShellData; large: boolean }) {
  if (data.results.length === 0) return null;
  const sources = new Set(data.results.map((r) => resultDomain(r.url)).filter(Boolean));
  return (
    <div className={cn("flex min-h-0 flex-col", large ? "gap-2" : "gap-1")}>
      <span className={cn("font-bureau text-typography-secondary tabular-nums", large ? "text-[12px]" : "text-[11px]")}>
        Read {data.results.length} {data.results.length === 1 ? "page" : "pages"} from {sources.size} {sources.size === 1 ? "site" : "sites"}
      </span>
      <ul className={cn("flex flex-col", large ? "gap-1" : "gap-0.5")}>
        {data.results.slice(0, large ? undefined : 2).map((result) => (
          <li key={result.id} className="flex min-w-0 items-center gap-2">
            <Favicon url={result.url} size={large ? 16 : 12} />
            <span className={cn("shrink-0 font-bureau text-typography-secondary", large ? "w-36 truncate text-[12px]" : "text-[10px]")}>
              {resultDomain(result.url)}
            </span>
            <span className={cn("min-w-0 flex-1 truncate font-bureau text-typography-primary", large ? "text-[13px]" : "text-[11px]")}>
              {result.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SearchShell({
  size,
  data,
  onChange,
  onSubmit,
  onSearch,
  status = "idle",
  surface = true,
  actions,
  tools,
  suggested,
  onDismissSuggestion,
  suggestions,
  className,
}: SearchShellProps) {
  const editable = Boolean(onChange);

  if (size === "small") return <SearchAppIcon className={className} />;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <SearchPreview data={data} />
      </ShellSurface>
    );
  }

  const large = size === "large";
  const loading = status === "loading";
  const update = (patch: Partial<SearchShellData>) => onChange?.({ ...data, ...patch });

  const run = (next: SearchShellData) => {
    if (!next.query.trim()) return;
    if (onSearch) onSearch(next);
    else onSubmit?.();
  };
  const toggleFilter = (chip: string) => {
    const exists = data.filters.some((filter) => sameChip(filter, chip));
    onChange?.({
      ...data,
      filters: exists ? data.filters.filter((filter) => !sameChip(filter, chip)) : [...data.filters, chip],
    });
  };

  const query = (
    <QueryField
      value={data.query}
      large={large}
      editable={editable}
      loading={loading}
      onChange={(next) => update({ query: next })}
      onSubmit={() => run(data)}
    />
  );
  const action = (
    <ActionPill
      label={loading ? "Searching…" : data.results.length ? "Search again" : "Search"}
      shortcut="↵"
      size={large ? "md" : "sm"}
      disabled={!data.query.trim() || loading || (!onSearch && !onSubmit)}
      onPress={() => run(data)}
    />
  );

  // The standard tools, the same at medium plus and large.
  const addFilter = (value: string) => {
    const text = value.trim();
    const taken = [...data.filters, ...(data.sources ?? [])].map(lower);
    if (!text || taken.includes(lower(text))) return;
    if (looksLikeDomain(text)) {
      const domain = cleanDomain(text);
      if (domain) update({ sources: [...(data.sources ?? []), domain] });
    } else toggleFilter(text);
  };
  const standardTools = (
    <>
      <ShellToolPopover label="Add a filter" icon={<ListFilterPlus />} disabled={!editable}>
        {(close) => (
          <ShellToolField
            label="Filter"
            placeholder="e.g. Open now, or a site"
            apply="Add"
            suggestions={FILTER_SUGGESTIONS.filter((item) => !isTypeChip(item) && !data.filters.some((chip) => sameChip(chip, item)))}
            onApply={(value) => {
              addFilter(value);
              close();
            }}
          />
        )}
      </ShellToolPopover>
      <ShellToolMenu
        label="Type"
        icon={<Layers />}
        text={data.filters.find(isTypeChip) ?? "All results"}
        active={data.filters.some(isTypeChip)}
        disabled={!editable}
        items={[
          { id: "all", label: "All results", icon: <Globe />, checked: !data.filters.some(isTypeChip), onSelect: () => update({ filters: data.filters.filter((chip) => !isTypeChip(chip)) }) },
          ...SEARCH_TYPES.map(({ label, icon: Icon }) => ({
            id: label,
            label,
            icon: <Icon />,
            checked: data.filters.some((chip) => lower(chip) === lower(label)),
            onSelect: () => update({ filters: [...data.filters.filter((chip) => !isTypeChip(chip)), label] }),
          })),
        ]}
      />
      <ShellToolMenu
        label="Time"
        icon={<Clock />}
        text={data.filters.find(isTimeChip) ?? "Any time"}
        active={data.filters.some(isTimeChip)}
        disabled={!editable}
        items={[
          { id: "any", label: "Any time", checked: !data.filters.some(isTimeChip), onSelect: () => update({ filters: data.filters.filter((chip) => !isTimeChip(chip)) }) },
          ...TIME_RANGES.map(({ label }) => ({
            id: label,
            label,
            checked: data.filters.some((chip) => lower(chip) === lower(label)),
            onSelect: () => update({ filters: [...data.filters.filter((chip) => !isTimeChip(chip)), label] }),
          })),
        ]}
      />
    </>
  );

  if (!large) {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        {/* Like every card: the query is the title on the grey, the work sits in the panel. */}
        <div data-shell-part="title" className={SHELL_TITLE_ROW}>
          <ShellField index={0}>{query}</ShellField>
        </div>
        <ShellToolbar tools={tools} actions={actions}>{standardTools}</ShellToolbar>
        {/* The panel holds the work and its action, like every card: the results scroll, Search stays at its foot. */}
        <div data-shell-part="body" className={cn("flex min-h-0 flex-1 flex-col", SHELL_BODY_BOX, CONTENT_PANEL)}>
          <div
            tabIndex={0}
            className="no-scrollbar flex min-h-0 flex-1 flex-col gap-[var(--shell-body-gap)] overflow-y-auto outline-none focus-visible:ring-2 focus-visible:ring-blue-4/50"
          >
            <ShellField index={1}>
              {/* Suggested filters, outlined, in the same row as the real ones: one click adds it. */}
              <FilterBar
                data={data}
                size="sm"
                editable={editable}
                onToggle={toggleFilter}
                onSources={(next) => update({ sources: next })}
              >
                {editable &&
                  unusedSuggestions(suggested?.filters, data.filters)
                    .slice(0, 4)
                    .map((chip) => (
                      <SuggestedChip
                        key={chip}
                        label={chip}
                        size="sm"
                        onAccept={() => toggleFilter(chip)}
                        onDismiss={onDismissSuggestion && (() => onDismissSuggestion("filters", chip))}
                      />
                    ))}
              </FilterBar>
            </ShellField>
            <ShellField index={2}>
              {data.results.length > 0 ? (
                <Reading data={data} large={false} />
              ) : (
                // On the chat home: what the search leaves open, where the empty results would be.
                (suggestions?.brief ?? <ResultShapes rows={4} />)
              )}
            </ShellField>
          </div>
          <div className="flex shrink-0 items-center justify-end">{action}</div>
        </div>
      </ShellSurface>
    );
  }

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <div className={cn("flex shrink-0 items-start gap-2 pt-3", SHELL_EDGE_X)}>
        {/* The query in an outlined box, not a filled one: the page stays light. */}
        <div className="flex min-w-0 flex-1 rounded-[16px] border border-shell-line-strong px-4 py-3">{query}</div>
      </div>
      <ShellToolbar tools={tools} actions={actions} className="mt-3 border-t">
        {standardTools}
      </ShellToolbar>
      {/* Suggested filters sit among the real ones, outlined, until added or dismissed. */}
      <div className={cn("shrink-0 pt-4", SHELL_EDGE_X)}>
        <FilterBar data={data} size="md" editable={editable} onToggle={toggleFilter} onSources={(next) => update({ sources: next })}>
          {unusedSuggestions(suggested?.filters, data.filters).map((chip) => (
            <SuggestedChip
              key={chip}
              label={chip}
              onAccept={editable ? () => toggleFilter(chip) : undefined}
              onDismiss={onDismissSuggestion && (() => onDismissSuggestion("filters", chip))}
            />
          ))}
        </FilterBar>
      </div>
      <div data-shell-part="body" className={cn("no-scrollbar grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]", SHELL_BODY_PAD)}>
        <Steps data={data} large loading={loading} editable={editable} onQueries={(queries) => update({ queries })} />
        <div className="flex min-w-0 flex-col gap-5">
          <Reading data={data} large />
        </div>
      </div>
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-t border-shell-line px-6">
        <span className="flex items-center gap-1.5 font-bureau text-[12px] text-typography-secondary">
          <Kbd>↵</Kbd>
          {data.results.length ? "to search again" : "to search"}
        </span>
        {action}
      </div>
    </ShellSurface>
  );
}

import {
  Database,
  File,
  FileText,
  Globe,
  ImageIcon,
  Newspaper,
  Tag,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@/shared/ui/kit/popover";
import { cn } from "@/shared/lib/css";
import { resultDomain } from "../model/search-results";
import type { SearchShellData, ShellProps } from "../model/shell-types";
import { SearchAppIcon, ShellGlyph } from "../ui/shell-icons";
import { ActionPill, AddChip, Kbd, ShellField, SoftChip } from "../ui/shell-fields";
import { ShellFooter } from "../ui/shell-meta";
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
        className="flex shrink-0 items-center justify-center rounded-full bg-gray-6 text-typography-secondary"
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
      className="shrink-0 rounded-full bg-white object-contain"
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
  const textClass = cn(
    "font-bureau font-normal text-typography-primary",
    large ? "text-[20px] leading-[1.35] tracking-[-0.2px]" : "text-[15px] leading-[1.35]",
  );
  return (
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <ShellGlyph
        kind="search"
        className={large ? "mt-0.5 size-6" : "mt-0.5 size-5"}
      />
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
            "shrink-0 animate-spin rounded-full border-[1.5px] border-gray-3/30 border-t-blue-5",
            large ? "mt-[5px] size-4" : "mt-[3px] size-3.5",
          )}
        />
      )}
    </div>
  );
}

const looksLikeDomain = (value: string) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value.trim());

/** Applied filters, plus a free-text field that offers a few suggestions. */
function FilterBar({
  data,
  size,
  editable,
  onToggle,
  onSources,
}: {
  data: SearchShellData;
  size: "sm" | "md";
  editable: boolean;
  onToggle: (chip: string) => void;
  onSources: (sources: string[]) => void;
}) {
  const sources = data.sources ?? [];
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const taken = new Set(
    [...data.filters, ...sources].map((item) => item.toLowerCase()),
  );
  const query = draft.trim().toLowerCase();
  const matches = FILTER_SUGGESTIONS.filter(
    (item) => !taken.has(item.toLowerCase()) && (!query || item.toLowerCase().includes(query)),
  );
  const custom =
    query && !taken.has(query) && !matches.some((item) => item.toLowerCase() === query)
      ? draft.trim()
      : null;
  const options = custom ? [custom, ...matches] : matches;

  const add = (value: string) => {
    const text = value.trim();
    if (!text || taken.has(text.toLowerCase())) return;
    if (looksLikeDomain(text)) {
      const domain = cleanDomain(text);
      if (domain && !sources.includes(domain)) onSources([...sources, domain]);
    } else {
      onToggle(text);
    }
    setDraft("");
    setActive(0);
    setOpen(false);
  };

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
      {data.filters.length === 0 && sources.length === 0 && !editable && (
        <SoftChip icon={Globe} size={size}>
          All sources
        </SoftChip>
      )}
      {editable && (
        <Popover open={open && options.length > 0}>
          <PopoverAnchor asChild>
            <input
              value={draft}
              placeholder="Add a filter"
              aria-label="Add a filter"
              aria-autocomplete="list"
              aria-expanded={open && options.length > 0}
              {...fieldEvents}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onChange={(event) => {
                setDraft(event.target.value);
                setActive(0);
                setOpen(true);
              }}
              onKeyDown={(event) => {
                stopFieldEvent(event);
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((current) => Math.min(current + 1, options.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((current) => Math.max(current - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  const pick = options[active] ?? draft;
                  if (pick) add(pick);
                } else if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              className={cn(
                "min-w-[7rem] flex-1 bg-transparent font-bureau font-light text-typography-primary outline-none placeholder:text-typography-secondary",
                size === "sm" ? "h-6 text-[11px]" : "h-7 text-[13px]",
              )}
            />
          </PopoverAnchor>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-52 p-1"
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            {options.map((option, index) => {
              const Icon = filterIcon(option);
              const isCustom = option === custom;
              return (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => add(option)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left font-bureau text-[13px] text-typography-primary",
                    index === active && "bg-gray-6",
                  )}
                >
                  {looksLikeDomain(option) ? (
                    <Favicon url={`https://${cleanDomain(option)}`} size={14} />
                  ) : (
                    <Icon className="size-3.5 text-typography-secondary" />
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {isCustom ? `Add “${option}”` : option}
                  </span>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

function SearchPreview({ data }: { data: SearchShellData }) {
  const hasQuery = Boolean(data.query.trim());
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-2.5">
      <div className="flex shrink-0 items-center gap-1.5 rounded-[12px] bg-gray-6 px-2 py-1.5">
        <ShellGlyph kind="search" className="size-3.5" />
        <span
          className={cn(
            "min-w-0 flex-1 font-bureau text-[12px] leading-[1.3]",
            hasQuery
              ? "line-clamp-2 font-normal text-typography-primary"
              : "truncate font-light text-typography-secondary",
          )}
        >
          {hasQuery ? data.query : "Search…"}
        </span>
      </div>
      <div className="flex h-4 shrink-0 gap-1 overflow-hidden">
        {data.filters.length > 0 ? (
          <>
            <span className="flex min-w-0 items-center gap-1 rounded-full bg-gray-6 px-1.5 font-bureau text-[10px] leading-4 font-normal text-typography-primary">
              {(() => {
                const Icon = filterIcon(data.filters[0] ?? "");
                return <Icon className="size-2.5 shrink-0 text-typography-secondary" />;
              })()}
              <span className="truncate">{data.filters[0]}</span>
            </span>
            {data.filters.length > 1 && (
              <span className="shrink-0 rounded-full bg-gray-6 px-1.5 font-bureau text-[10px] leading-4 font-normal text-typography-secondary tabular-nums">
                +{data.filters.length - 1}
              </span>
            )}
          </>
        ) : (
          [40, 28].map((width) => (
            <span key={width} className="h-4 rounded-full bg-gray-6" style={{ width }} />
          ))
        )}
      </div>
      {data.results.length > 0 ? (
        <div className="mt-auto flex flex-col gap-1.5">
          {data.results.slice(0, 3).map((result) => (
            <div key={result.id} className="flex items-center gap-1.5">
              <Favicon url={result.url} size={11} />
              <span className="min-w-0 flex-1 truncate font-bureau text-[11px] leading-[1.3] text-typography-primary">
                {result.title}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-1.5">
          {[88, 64, 76].map((width, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  hasQuery ? "bg-blue-5/60" : "bg-gray-3/35",
                )}
              />
              <Bar width={width} className={hasQuery ? "h-1.5 bg-gray-3/30" : "h-1.5"} />
            </div>
          ))}
        </div>
      )}
      <ShellFooter compact />
    </div>
  );
}

type StepStatus = "done" | "running" | "queued";

function StepMark({ status, large }: { status: StepStatus; large: boolean }) {
  const size = large ? "size-4" : "size-3.5";
  if (status === "running")
    return <span className={cn("shrink-0 animate-spin rounded-full border-[1.5px] border-gray-3/30 border-t-orange-5", size)} />;
  if (status === "done")
    return (
      <span className={cn("grid shrink-0 place-items-center rounded-full bg-orange-5 text-white", size)}>
        <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
          <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  return <span className={cn("shrink-0 rounded-full border border-dashed border-gray-3/60", size)} />;
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
      <span className={cn("font-bureau text-typography-secondary", large ? "text-[12px]" : "text-[11px]")}>Searching</span>
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
                    className={cn("min-w-0 flex-1 rounded-[6px] bg-transparent font-bureau text-typography-primary outline-none focus:bg-gray-6", large ? "text-[14px]" : "text-[12px]")}
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
                    className="grid size-5 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-gray-6 focus-visible:opacity-100"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
      </ol>
      {editable && large && (
        <AddChip size="md" placeholder="Another search" onSubmitValue={(value) => onQueries([...data.queries, value])}>
          Add a search
        </AddChip>
      )}
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
  const filters = (
    <FilterBar
      data={data}
      size={large ? "md" : "sm"}
      editable={editable}
      onToggle={toggleFilter}
      onSources={(next) => update({ sources: next })}
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

  if (!large) {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <ShellField index={0}>
            <div className="flex rounded-[14px] bg-gray-6 px-3 py-2">{query}</div>
          </ShellField>
          <ShellField index={1}>{filters}</ShellField>
          <ShellField index={2}>
            <Steps data={data} large={false} loading={loading} editable={editable} onQueries={(queries) => update({ queries })} />
          </ShellField>
          <div className="mt-auto flex shrink-0 items-center justify-between gap-2">
            <span />
            {action}
          </div>
        </div>
      </ShellSurface>
    );
  }

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <div className="flex shrink-0 items-start gap-2 px-6 pt-6">
        <div className="flex min-w-0 flex-1 rounded-[16px] bg-gray-6 px-4 py-3">{query}</div>
        {actions}
      </div>
      <div className="shrink-0 px-6 pt-4">{filters}</div>
      <div className="no-scrollbar grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 pt-5 pb-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Steps data={data} large loading={loading} editable={editable} onQueries={(queries) => update({ queries })} />
        <div className="flex min-w-0 flex-col gap-5">
          <Reading data={data} large />
        </div>
      </div>
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-t border-gray-3/15 px-6">
        <span className="flex items-center gap-1.5 font-bureau text-[12px] text-typography-secondary">
          <Kbd>↵</Kbd>
          {data.results.length ? "to search again" : "to search"}
        </span>
        {action}
      </div>
    </ShellSurface>
  );
}

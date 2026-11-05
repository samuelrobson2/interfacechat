import { motion, useReducedMotion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { Text } from "@/shared/ui/kit/text";
import { DescriptionCell, PartsCell, QueriesCell } from "./compose/shell-library-columns";
import { InterfaceShell, type InterfaceShellProps } from "./interface-shell";
import { SHELL_FIXTURES } from "./model/shell-fixtures";
import { SHELL_META, SIZE_META, STATE_META, STATEFUL_SIZES } from "./model/shell-meta";
import { shellParts } from "./model/shell-parts";
import {
  copyShellRetrieval,
  setShellRetrieval,
  shellRetrieval,
  type ShellRetrieval,
} from "./model/shell-retrieval";
import {
  SHELL_DIMENSIONS,
  SHELL_KINDS,
  SHELL_SIZES,
  SHELL_STATES,
  shellId,
  type SearchResult,
  type SearchShellData,
  type ShellDataByKind,
  type ShellKind,
  type ShellSize,
  type ShellState,
} from "./model/shell-types";
import { ShellAppIcon } from "./ui/shell-icons";
import { SHELL_MORPH_SPRING, ShellMorph, type ShellMorphOrigin } from "./ui/shell-morph";

const STAGE_HEIGHT: Record<ShellSize, number> = {
  small: 150,
  medium: 200,
  "medium-plus": 320,
  large: 600,
};

/** Short labels for the size buttons in a table cell. */
const SIZE_SHORT: Record<ShellSize, string> = {
  small: "S",
  medium: "M",
  "medium-plus": "M+",
  large: "L",
};

/** Interface · Parts · Description · Example queries. */
const ROW_GRID =
  "grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-[320px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]";

const COLUMNS = ["Interface", "Parts", "Description", "Example queries"];


type ShellLibraryData = { [K in ShellKind]: Record<ShellState, ShellDataByKind[K]> };

const initialData = (): ShellLibraryData =>
  Object.fromEntries(
    SHELL_KINDS.map((kind) => [kind, { ...SHELL_FIXTURES[kind].states }]),
  ) as ShellLibraryData;

/** Which content a size shows: small and medium are blank, large is the docked chat. */
function contentFor(size: ShellSize, state: ShellState): ShellState {
  if (STATEFUL_SIZES.includes(size)) return state;
  return size === "large" ? "history" : "empty";
}

/** Clicking a medium card opens it; ⌘↵ on medium plus docks it. */
const NEXT_SIZE: Partial<Record<ShellSize, ShellSize>> = {
  medium: "medium-plus",
  "medium-plus": "large",
};

/** Stand-in for the model's web search: real links to search the query elsewhere. */
function demoResults(data: SearchShellData): SearchResult[] {
  const q = data.query.trim();
  const encoded = encodeURIComponent(q);
  const results: SearchResult[] = [
    {
      id: shellId("result"),
      title: `${q} on Wikipedia`,
      snippet: `Background, history and references for ${q}.`,
      url: `https://en.wikipedia.org/w/index.php?search=${encoded}`,
    },
    {
      id: shellId("result"),
      title: `${q} in the news`,
      snippet: `Recent coverage and reporting on ${q}.`,
      url: `https://news.google.com/search?q=${encoded}`,
    },
    {
      id: shellId("result"),
      title: `Research on ${q}`,
      snippet: `Peer-reviewed papers and citations about ${q}.`,
      url: `https://scholar.google.com/scholar?q=${encoded}`,
    },
    {
      id: shellId("result"),
      title: `What people say about ${q}`,
      snippet: `Discussion threads and first-hand experiences.`,
      url: `https://www.reddit.com/search/?q=${encoded}`,
    },
  ];
  const wantsPapers = data.filters.some((filter) => /paper/i.test(filter));
  return wantsPapers
    ? [...results.slice(2, 3), ...results.slice(0, 2), ...results.slice(3)]
    : results;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function ShellRow({
  kind,
  globalSize,
  state,
  data,
  onDataChange,
  onReset,
  profile,
  onProfileChange,
}: {
  kind: ShellKind;
  globalSize: ShellSize;
  state: ShellState;
  data: ShellLibraryData[ShellKind];
  onDataChange: (state: ShellState, next: ShellDataByKind[ShellKind]) => void;
  onReset: () => void;
  profile: ShellRetrieval;
  onProfileChange: (next: ShellRetrieval) => void;
}) {
  // A row can be opened a size up on its own; changing the toolbar size clears that.
  const [override, setOverride] = useState<{ base: ShellSize; size: ShellSize } | null>(null);
  const size = override && override.base === globalSize ? override.size : globalSize;
  const [stageRef, stageWidth] = useWidth<HTMLDivElement>();
  const [searching, setSearching] = useState(false);

  const dims = (s: ShellSize) => {
    const natural = SHELL_DIMENSIONS[s];
    const width =
      s === "large" && stageWidth > 0 ? Math.min(natural.width, stageWidth - 48) : natural.width;
    return { width, height: natural.height };
  };
  const { width, height } = dims(size);

  // Morph from whatever size was showing before, whether the toolbar or the row changed it.
  const [shown, setShown] = useState(size);
  const [origin, setOrigin] = useState<ShellMorphOrigin | null>(null);
  if (shown !== size) {
    setOrigin({ size: shown, ...dims(shown) });
    setShown(size);
  }

  const dataState = contentFor(size, state);
  const shellData = data[dataState];
  const wide = size === "large";
  const reduced = useReducedMotion() === true;

  const openNext = () => {
    const next = NEXT_SIZE[size];
    if (!next) return;
    if (next === "large" && kind === "search") {
      const search = shellData as SearchShellData;
      if (search.query.trim() && search.results.length === 0) runSearch(search);
    }
    setOverride({ base: globalSize, size: next });
  };

  const runSearch = (next: SearchShellData) => {
    setSearching(true);
    onDataChange(dataState, { ...next, results: [] });
    window.setTimeout(() => {
      onDataChange(dataState, { ...next, results: demoResults(next) });
      setSearching(false);
    }, 900);
  };

  const shellProps = {
    kind,
    size,
    data: shellData,
    status: searching ? ("loading" as const) : ("idle" as const),
    onSubmit: size === "medium-plus" ? openNext : undefined,
    onChange: size === "medium" || size === "small" ? undefined : (next: ShellDataByKind[ShellKind]) => onDataChange(dataState, next),
    ...(kind === "search" && wide ? { onSearch: runSearch } : {}),
  } as InterfaceShellProps;

  const interfaceCell = (
    <div className={cn("flex min-w-0 flex-col gap-3", wide && "md:col-span-2 xl:col-span-4")}>
      <div className="flex items-center gap-2.5">
        <span className="size-8 shrink-0">
          <ShellAppIcon kind={kind} />
        </span>
        <Text variant="title" className="text-[20px]">
          {SHELL_META[kind].label}
        </Text>
        <button
          type="button"
          onClick={onReset}
          title="Reset content"
          aria-label={`Reset ${SHELL_META[kind].label} content`}
          className="ml-auto grid size-7 place-items-center rounded-full text-typography-secondary transition-colors hover:bg-gray-6 hover:text-typography-primary active:scale-[0.95]"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <motion.div
        ref={stageRef}
        className="relative flex items-center justify-center overflow-hidden rounded-[22px] bg-gray-6"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(26,23,24,0.07) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
        initial={false}
        animate={{ height: STAGE_HEIGHT[size] }}
        transition={reduced ? { duration: 0 } : SHELL_MORPH_SPRING}
      >
        <ShellMorph
          kind={kind}
          size={size}
          width={width}
          height={height}
          origin={origin}
          signal={dataState}
          className={cn(size === "medium" && "cursor-pointer")}
          title={size === "medium" ? "Click to open as medium plus" : undefined}
          onClick={size === "medium" ? openNext : undefined}
        >
          <InterfaceShell {...shellProps} />
        </ShellMorph>
        {size === "small" && (
          <span className="pointer-events-none absolute top-1/2 left-1/2 mt-10 -translate-x-1/2 font-bureau text-[12px] whitespace-nowrap text-typography-primary">
            {SHELL_META[kind].label}
          </span>
        )}
      </motion.div>
    </div>
  );

  return (
    <section
      aria-label={SHELL_META[kind].label}
      className={cn(ROW_GRID, "border-t border-gray-3/20 py-8 first:border-t-0")}
    >
      {interfaceCell}
      <PartsCell kind={kind} parts={shellParts(kind)} data={shellData} />
      <DescriptionCell profile={profile} onChange={onProfileChange} />
      <QueriesCell profile={profile} onChange={onProfileChange} />
    </section>
  );
}

/** The frozen top row: column names, and the size and content for every interface. */
function LibraryToolbar({
  size,
  state,
  onSize,
  onState,
}: {
  size: ShellSize;
  state: ShellState;
  onSize: (size: ShellSize) => void;
  onState: (state: ShellState) => void;
}) {
  const stateful = STATEFUL_SIZES.includes(size);
  const controls = (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tabs value={size} onValueChange={(value) => onSize(value as ShellSize)}>
        <TabsList variant="segment" aria-label="Size of every interface">
          {SHELL_SIZES.map((option) => (
            <TabsTrigger key={option} value={option} title={SIZE_META[option].label} className="px-2.5 text-[13px]">
              {SIZE_SHORT[option]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Tabs value={state} onValueChange={(value) => onState(value as ShellState)}>
        <TabsList variant="segment" aria-label="Content of every interface">
          {SHELL_STATES.map((option) => (
            <TabsTrigger key={option} value={option} disabled={!stateful} className="px-2.5 text-[13px]">
              {STATE_META[option].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
  return (
    <div className="sticky top-0 z-20 -mx-6 border-b border-gray-3/20 bg-background-primary/90 px-6 py-3 backdrop-blur-md md:-mr-10 md:-ml-24 md:pr-10 md:pl-24">
      <div className={cn(ROW_GRID, "items-center gap-y-2")}>
        {controls}
        {COLUMNS.slice(1).map((column) => (
          <span key={column} className="hidden font-bureau text-[13px] text-typography-primary xl:block">
            {column}
          </span>
        ))}
      </div>
    </div>
  );
}

function InterfaceLibraryPage() {
  const [library, setLibrary] = useState(initialData);
  const [size, setSize] = useState<ShellSize>("medium");
  const [state, setState] = useState<ShellState>("suggestion");
  const [profiles, setProfiles] = useState(
    () =>
      Object.fromEntries(
        SHELL_KINDS.map((kind) => [kind, copyShellRetrieval(shellRetrieval(kind))]),
      ) as Record<ShellKind, ShellRetrieval>,
  );

  const updateData = (kind: ShellKind, state: ShellState, next: ShellDataByKind[ShellKind]) =>
    setLibrary((current) => ({
      ...current,
      [kind]: { ...current[kind], [state]: next },
    }));

  const updateProfile = (kind: ShellKind, next: ShellRetrieval) => {
    setShellRetrieval(kind, next);
    setProfiles((current) => ({ ...current, [kind]: next }));
  };

  const reset = (kind: ShellKind) =>
    setLibrary((current) => ({ ...current, [kind]: initialData()[kind] }));

  return (
    <div className="h-dvh w-full overflow-y-auto bg-background-primary font-bureau md:h-screen">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col px-6 pb-10 md:pr-10 md:pb-14 md:pl-24">
        <header className="pt-10 pb-6 md:pt-14">
          <Text variant="h1" as="h1" className="max-md:text-[32px]">
            Interface library
          </Text>
        </header>

        <LibraryToolbar size={size} state={state} onSize={setSize} onState={setState} />

        {SHELL_KINDS.map((kind) => (
          <div key={kind}>
            <ShellRow
              kind={kind}
              globalSize={size}
              state={state}
              data={library[kind]}
              onDataChange={(rowState, next) => updateData(kind, rowState, next)}
              onReset={() => reset(kind)}
              profile={profiles[kind]}
              onProfileChange={(next) => updateProfile(kind, next)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const Component = InterfaceLibraryPage;

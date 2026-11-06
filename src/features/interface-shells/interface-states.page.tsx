import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import { EditOverlay } from "./compose/edit-overlay";
import { InterfaceShell, type InterfaceShellProps } from "./interface-shell";
import { SHELL_FIXTURES } from "./model/shell-fixtures";
import { contentFor, hasSize, SHELL_META, SIZE_META, STATE_META, STATEFUL_SIZES } from "./model/shell-meta";
import {
  SHELL_DIMENSIONS,
  SHELL_KINDS,
  SHELL_SIZES,
  SHELL_STATES,
  type ShellKind,
  type ShellSize,
  type ShellState,
} from "./model/shell-types";
import { ShellAppIcon } from "./ui/shell-icons";
import { ShellMorph } from "./ui/shell-morph";

/**
 * Every interface in every size and state, side by side, with nothing else on
 * the row, for copying into Figma. Rows, columns and content all come from the
 * same registry, components and fixtures as the library, so this page follows
 * them without edits.
 */

/** Room around a shell inside its stage. */
const STAGE_PADDING = 40;
const MIN_STAGE_WIDTH = 120;
/** Sizes up to this wide share one stage height; bigger ones get their own. */
const COMPACT_UP_TO = 480;

type Column = { size: ShellSize; state: ShellState; label: string };

/** One column per size, and one per state where the size shows states. */
const COLUMNS: Column[] = SHELL_SIZES.flatMap((size) =>
  STATEFUL_SIZES.includes(size)
    ? SHELL_STATES.map((state) => ({
        size,
        state,
        label: `${SIZE_META[size].label} · ${STATE_META[state].label}`,
      }))
    : [{ size, state: contentFor(size, "empty"), label: SIZE_META[size].label }],
);

/** The library's order, with Chat last: it's the conversation, not a surface. */
const ROW_KINDS: ShellKind[] = [
  ...SHELL_KINDS.filter((kind) => kind !== "chat"),
  ...SHELL_KINDS.filter((kind) => kind === "chat"),
];

const stageWidth = (size: ShellSize) =>
  Math.max(MIN_STAGE_WIDTH, SHELL_DIMENSIONS[size].width + STAGE_PADDING);

/** Compact sizes share the tallest compact height so they line up; larger ones fit themselves. */
const COMPACT_HEIGHT =
  Math.max(
    ...SHELL_SIZES.filter((size) => SHELL_DIMENSIONS[size].width <= COMPACT_UP_TO).map(
      (size) => SHELL_DIMENSIONS[size].height,
    ),
  ) + STAGE_PADDING;
const stageHeight = (size: ShellSize) =>
  Math.max(COMPACT_HEIGHT, SHELL_DIMENSIONS[size].height + STAGE_PADDING);

const GRID_TEMPLATE = COLUMNS.map((column) => `${stageWidth(column.size)}px`).join(" ");

const DOTS = {
  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,23,24,0.07) 1px, transparent 0)",
  backgroundSize: "20px 20px",
};

function Stage({ kind, column }: { kind: ShellKind; column: Column }) {
  // A size the interface doesn't come in leaves its cell empty, so the columns still line up.
  if (!hasSize(kind, column.size)) return <div aria-hidden />;
  const { width, height: shellHeight } = SHELL_DIMENSIONS[column.size];
  const props = {
    kind,
    size: column.size,
    data: SHELL_FIXTURES[kind].states[column.state],
    status: "idle",
  } as InterfaceShellProps;

  return (
    <div
      aria-label={`${SHELL_META[kind].label}, ${column.label}`}
      data-edit-kind={kind}
      data-edit-size={column.size}
      data-edit-state={column.state}
      data-edit-label={`${SHELL_META[kind].label} · ${column.label}`}
      className="flex items-center justify-center overflow-hidden rounded-[22px] bg-gray-6"
      style={{ ...DOTS, height: stageHeight(column.size) }}
    >
      <ShellMorph kind={kind} size={column.size} width={width} height={shellHeight} origin={null}>
        <InterfaceShell {...props} />
      </ShellMorph>
    </div>
  );
}

function StatesRow({ kind }: { kind: ShellKind }) {
  return (
    <section
      aria-label={SHELL_META[kind].label}
      className="flex flex-col gap-3 border-t border-gray-3/20 py-8 first:border-t-0"
    >
      {/* Stays at the left edge while the row scrolls sideways. */}
      <div className="sticky left-6 flex w-fit items-center gap-2.5 md:left-24">
        <span className="size-8 shrink-0">
          <ShellAppIcon kind={kind} />
        </span>
        <Text variant="title" className="text-[20px]">
          {SHELL_META[kind].label}
        </Text>
      </div>
      <div className="grid items-start gap-x-6" style={{ gridTemplateColumns: GRID_TEMPLATE }}>
        {COLUMNS.map((column) => (
          <Stage key={`${column.size}-${column.state}`} kind={kind} column={column} />
        ))}
      </div>
    </section>
  );
}

function InterfaceStatesPage() {
  return (
    <div className="h-dvh w-full overflow-auto bg-background-primary font-bureau md:h-screen">
      <div className={cn("flex w-max flex-col px-6 pb-10 md:pr-10 md:pb-14 md:pl-24", import.meta.env.DEV && "pb-56 md:pb-56")}>
        <header className="pt-10 pb-6 md:pt-14">
          <Text variant="h1" as="h1" className="max-md:text-[32px]">
            Interface State
          </Text>
        </header>

        <div className="sticky top-0 z-20 -mx-6 border-b border-gray-3/20 bg-background-primary/90 px-6 py-3 backdrop-blur-md md:-mr-10 md:-ml-24 md:pr-10 md:pl-24">
          <div className="grid items-center gap-x-6" style={{ gridTemplateColumns: GRID_TEMPLATE }}>
            {COLUMNS.map((column) => (
              <span
                key={`${column.size}-${column.state}`}
                className="font-bureau text-[13px] text-typography-primary"
              >
                {column.label}
              </span>
            ))}
          </div>
        </div>

        {ROW_KINDS.map((kind) => (
          <StatesRow key={kind} kind={kind} />
        ))}
      </div>
      {import.meta.env.DEV && <EditOverlay />}
    </div>
  );
}

export const Component = InterfaceStatesPage;

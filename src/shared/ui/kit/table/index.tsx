import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/css";
import { textVariants } from "../text";

const MIN_COL_PERCENT = 15;
const MIN_AVG_CHARS = 10;

/**
 * Rounds floats to integers summing to exactly 100 (largest remainder method).
 */
const toExact100 = (values: number[]): number[] => {
  const floors = values.map(Math.floor);
  const remainder = 100 - floors.reduce((a, b) => a + b, 0);

  values
    .map((v, i) => ({ i, frac: v % 1 }))
    .sort((a, b) => b.frac - a.frac)
    .slice(0, remainder)
    .forEach(({ i }) => { floors[i] = (floors[i] ?? 0) + 1; });

  return floors;
};

/**
 * Computes proportional column widths (integers summing to 100) from average content lengths.
 * Columns below minPercent are locked at minPercent; the rest are scaled proportionally.
 * Single pass is sufficient: locking small columns only increases free columns' share.
 */
const computeColWidths = (keys: string[], rows: Record<string, unknown>[]): number[] => {
  const avgLengths = keys.map((key) => {
    const total = rows.reduce((sum, row) => sum + String(row[key] ?? "").length, 0);
    return Math.max(total / rows.length, MIN_AVG_CHARS);
  });

  const n = avgLengths.length;
  // Cap effectiveMin so n columns can always sum to 100
  const effectiveMin = Math.min(MIN_COL_PERCENT, Math.floor(100 / n));

  const total = avgLengths.reduce((a, b) => a + b, 0);
  const raw = avgLengths.map((len) => (len / total) * 100);

  const isLocked = raw.map((p) => p < effectiveMin);
  const lockedSum = isLocked.filter(Boolean).length * effectiveMin;
  const freeTotal = raw.reduce((sum, p, i) => (isLocked[i] ? sum : sum + p), 0);

  return toExact100(
    raw.map((p, i) => (isLocked[i] ? effectiveMin : (p / freeTotal) * (100 - lockedSum))),
  );
};

/** Integer percents summing to 100 so each column gets equal width in the table layout. */
function equalColumnPercents(columnCount: number): number[] {
  if (columnCount <= 0) return [];
  const base = Math.floor(100 / columnCount);
  const remainder = 100 - base * columnCount;
  return Array.from(
    { length: columnCount },
    (_, i) => base + (i < remainder ? 1 : 0),
  );
}

type TableSize = "default" | "compact";

const TableSizeContext = React.createContext<TableSize>("default");

function Table({
  className,
  wrapperClassName,
  size = "default",
  ...props
}: React.ComponentProps<"table"> & {
  wrapperClassName?: string;
  size?: TableSize;
}) {
  const tableRef = React.useRef<HTMLDivElement>(null);

  const observe = React.useCallback(
    (element: HTMLElement, cssVariable: string) => {
      const update = (node: HTMLElement) => {
        const height = node?.clientHeight || 0;
        tableRef.current?.style.setProperty(cssVariable, `${height + 3}px`);
      };

      update(element);

      const resizeObserver = new ResizeObserver(() => update(element));
      resizeObserver.observe(element);

      return () => {
        resizeObserver.disconnect();
      };
    },
    [],
  );

  // Handle header height changes for scrollbar margin-top
  React.useEffect(() => {
    if (!tableRef.current) return;

    const header = tableRef.current.querySelector(
      '[data-slot="table-header"]',
    ) as HTMLElement;
    if (!header) return;

    return observe(header, "--scrollbar-margin-top");
  }, [observe]);

  return (
    <div
      ref={tableRef}
      data-slot="table-container"
      className={cn("relative w-full overflow-hidden", wrapperClassName)}
    >
      <div
        className={cn(
          "w-full h-full overflow-x-auto overflow-y-auto",
          // Scroll bar
          "[&::-webkit-scrollbar]:w-[19px] [&::-webkit-scrollbar:horizontal]:h-[19px]",
          // Scroll bar track
          "[&::-webkit-scrollbar-track]:border-transparent [&::-webkit-scrollbar-track]:bg-clip-content",
          "[&::-webkit-scrollbar-track]:border-l-9 [&::-webkit-scrollbar-track]:border-r-9",
          "[&::-webkit-scrollbar-track:horizontal]:border-t-9 [&::-webkit-scrollbar-track:horizontal]:border-b-9",
          "[&::-webkit-scrollbar-track]:bg-gray-2",
          // Scroll bar track margin
          "[&::-webkit-scrollbar-track]:mt-(--scrollbar-margin-top,0px)",
          // Scroll bar thumb
          "[&::-webkit-scrollbar-thumb]:bg-gray-2 [&::-webkit-scrollbar-thumb]:rounded-[32px]",
          "[&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-content",
          "[&::-webkit-scrollbar-thumb]:border-l-5 [&::-webkit-scrollbar-thumb]:border-r-5",
          "[&::-webkit-scrollbar-thumb:horizontal]:border-t-5 [&::-webkit-scrollbar-thumb:horizontal]:border-b-5",
        )}
      >
        <TableSizeContext.Provider value={size}>
          <table
            data-slot="table"
            data-size={size}
            className={cn("w-full h-full caption-bottom pr-5", className)}
            {...props}
          />
        </TableSizeContext.Provider>
      </div>
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:[--hairline-color:var(--color-stroke-secondary)] bg-background-primary",
        "sticky top-0 z-10",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:after:hidden", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <div
      data-slot="table-footer"
      className={cn(
        "hairline-t [--hairline-color:var(--color-gray-2)] font-medium [&>tr:last-child]:after:hidden",
        "sticky bottom-0 bg-background-primary z-10",
        className,
      )}
      {...props}
    ></div>
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "data-[state=selected]:bg-muted hairline-b [--hairline-color:var(--color-gray-2)] transition-colors",
        className,
      )}
      {...props}
    />
  );
}

const cellVariants = cva(
  "text-left align-top wrap-break-word overflow-hidden [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px]",
  {
    variants: {
      size: {
        default: "px-3 py-4",
        compact: "px-2 py-2",
      },
    },
    defaultVariants: { size: "default" },
  },
);

const cellTextVariantBySize: Record<TableSize, "body" | "label"> = {
  default: "body",
  compact: "label",
};

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const size = React.useContext(TableSizeContext);
  return (
    <th
      data-slot="table-head"
      className={cn(
        textVariants({ variant: cellTextVariantBySize[size], color: "secondary" }),
        cellVariants({ size }),
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const size = React.useContext(TableSizeContext);
  return (
    <td
      data-slot="table-cell"
      className={cn(
        textVariants({ variant: cellTextVariantBySize[size] }),
        cellVariants({ size }),
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        textVariants({ variant: "label", color: "secondary" }),
        "mt-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  computeColWidths,
  equalColumnPercents,
};

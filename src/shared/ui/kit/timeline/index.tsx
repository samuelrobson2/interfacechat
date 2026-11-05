import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/css";
import { Card } from "../card";
import { textVariants } from "../text";
import { TruncatedText } from "../truncated-text";

interface TimelineColumn {
  key: string;
  label: string;
}

type TimelineBarColor = NonNullable<
  VariantProps<typeof timelineBarVariants>["color"]
>;

interface TimelineSegment {
  key: string;
  label: string;
  /** Start position as percentage (0–100) */
  start: number;
  /** End position as percentage (0–100) */
  end: number;
  color?: TimelineBarColor;
}

interface TimelineRowData {
  key: string;
  label: string;
  segments: TimelineSegment[];
}

interface TimelineContextValue {
  columns: TimelineColumn[];
  rows: TimelineRowData[];
}

const TimelineContext = React.createContext<TimelineContextValue | undefined>(
  undefined,
);

const useTimeline = () => {
  const ctx = React.useContext(TimelineContext);
  if (!ctx) throw new Error("useTimeline must be used within a Timeline");
  return ctx;
};

interface TimelineProps extends React.ComponentProps<"div"> {
  columns: TimelineColumn[];
  rows: TimelineRowData[];
}

function Timeline({
  columns,
  rows,
  children,
  className,
  ...props
}: TimelineProps) {
  const contextValue = React.useMemo<TimelineContextValue>(
    () => ({ columns, rows }),
    [columns, rows],
  );

  return (
    <TimelineContext.Provider value={contextValue}>
      <Card
        data-slot="timeline"
        shape="rounded"
        className={cn("p-8", className)}
        {...props}
      >
        {children}
      </Card>
    </TimelineContext.Provider>
  );
}

function TimelineHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-header"
      className={cn("relative flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-title"
      className={cn(
        textVariants({ variant: "title", color: "primary" }),
        className,
      )}
      {...props}
    />
  );
}

function TimelineDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-description"
      className={cn(
        textVariants({ variant: "label", color: "secondary" }),
        className,
      )}
      {...props}
    />
  );
}

type TimelineBodyRenderFn = (
  row: TimelineRowData,
  index: number,
) => React.ReactNode;

interface TimelineBodyProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  children?: TimelineBodyRenderFn;
}

function TimelineBody({ className, children, ...props }: TimelineBodyProps) {
  const { columns, rows } = useTimeline();

  return (
    <div
      data-slot="timeline-body"
      className={cn("grid gap-x-4 gap-y-2", className)}
      style={{ gridTemplateColumns: "auto 1fr" }}
      {...props}
    >
      {/* Header: empty label cell + evenly distributed column headers */}
      <div />
      <div className="flex gap-1">
        {columns.map((col) => (
          <div
            key={col.key}
            className={cn(
              timelineBarVariants({ color: "header" }),
              "min-w-0 flex-1",
            )}
          >
            <TruncatedText variant="label" color="none" className="min-w-0">
              {col.label}
            </TruncatedText>
          </div>
        ))}
      </div>

      {/* Data rows — each TimelineRow outputs 2 grid cells (label + content) */}
      {rows.map((row, index) =>
        typeof children === "function" ? (
          <React.Fragment key={row.key}>{children(row, index)}</React.Fragment>
        ) : (
          <TimelineRow key={row.key} label={row.label}>
            {row.segments.map((seg) => (
              <TimelineBar
                key={seg.key}
                start={seg.start}
                end={seg.end}
                color={seg.color}
              >
                {seg.label}
              </TimelineBar>
            ))}
          </TimelineRow>
        ),
      )}
    </div>
  );
}

interface TimelineRowProps extends React.ComponentProps<"div"> {
  label?: React.ReactNode;
}

/**
 * Renders 2 sibling grid cells (label + content) via Fragment
 * so they participate directly in the parent body grid.
 */
function TimelineRow({
  label,
  className,
  children,
  ...props
}: TimelineRowProps) {
  return (
    <>
      <div
        data-slot="timeline-row-label"
        className={cn(
          textVariants({ variant: "label", color: "primary" }),
          "flex items-center rounded-[8px] px-2 py-1",
        )}
      >
        {label}
      </div>
      <div
        data-slot="timeline-row"
        className={cn("relative min-h-[40px]", className)}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

const timelineBarVariants = cva(
  [
    textVariants({ variant: "label" }),
    "flex min-h-[40px] items-center rounded-[8px] px-2 py-1 whitespace-nowrap",
  ],
  {
    variants: {
      color: {
        header: "bg-background-secondary-inverse text-gray-0",
        rose: "bg-rose-1 text-gray-5",
        blue: "bg-blue-1 text-gray-5",
        orange: "bg-orange-1 text-gray-5",
        green: "bg-green-1 text-gray-5",
        mint: "bg-mint-1 text-gray-5",
        red: "bg-red-1 text-gray-5",
        yellow: "bg-yellow-1 text-gray-5",
      },
    },
    defaultVariants: {
      color: "blue",
    },
  },
);

type TimelineBarProps = React.ComponentProps<"div"> &
  Pick<TimelineSegment, "start" | "end" | "color">;

function TimelineBar({
  className,
  color,
  start,
  end,
  children,
  style,
  ...props
}: TimelineBarProps) {
  return (
    <div
      data-slot="timeline-bar"
      className={cn(
        timelineBarVariants({ color }),
        "absolute inset-y-0 min-w-0 overflow-hidden",
        className,
      )}
      style={{ left: `${start}%`, width: `${end - start}%`, ...style }}
      {...props}
    >
      <TruncatedText variant="label" color="none" className="min-w-0">
        {children}
      </TruncatedText>
    </div>
  );
}

export {
  Timeline,
  TimelineHeader,
  TimelineTitle,
  TimelineDescription,
  TimelineBody,
  TimelineRow,
  TimelineBar,
  timelineBarVariants,
  useTimeline,
  type TimelineProps,
  type TimelineBodyProps,
  type TimelineRowProps,
  type TimelineBarProps,
  type TimelineBarColor,
  type TimelineColumn,
  type TimelineSegment,
  type TimelineRowData,
};

import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import {
  customizationFilters,
  type VisualInterfaceKind,
} from "../model/visual-interfaces";

const BLUE = "#1a84ae";
const GREEN = "#64b48f";
const PURPLE = "#7c6fda";
const ROSE = "#c87b9a";
const AMBER = "#d4a35c";

export type PreviewProps = {
  filled: boolean;
  topic: string;
};

function TopicLine({
  filled,
  topic,
  className,
}: PreviewProps & { className?: string }) {
  if (!filled) {
    return <div className={cn("h-2 w-3/5 rounded-full bg-gray-3/35", className)} />;
  }
  return (
    <Text
      variant="label"
      className={cn(
        "min-w-0 truncate text-[13px] font-medium text-typography-primary",
        className,
      )}
    >
      {topic}
    </Text>
  );
}

export function DocumentPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-3">
      <div className="flex h-full w-[78%] flex-col gap-1.5 rounded-[8px] bg-white p-3 shadow-[0_1px_3px_rgba(26,23,24,0.08)]">
        <div className="flex items-center gap-1.5">
          <div className="size-2 shrink-0 rounded-[3px] bg-blue-5/70" />
          <TopicLine filled={filled} topic={topic} className="flex-1" />
        </div>
        <div className="h-px w-full bg-gray-3/20" />
        {[1, 0.92, 0.78, 0.88, 0.6, 0.7].map((w, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full",
              filled && i === 0 ? "bg-blue-5/40" : "bg-gray-3/25",
            )}
            style={{ width: `${w * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MoodboardPreview({ filled, topic }: PreviewProps) {
  const tiles = [
    { className: "col-span-2 row-span-2", color: PURPLE },
    { className: "col-span-1 row-span-1", color: BLUE },
    { className: "col-span-1 row-span-1", color: ROSE },
    { className: "col-span-1 row-span-1", color: GREEN },
    { className: "col-span-2 row-span-1", color: BLUE },
  ];
  return (
    <div className="relative h-full w-full p-2">
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-0.5">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={cn(
              "rounded-[4px]",
              tile.className,
              filled ? "opacity-90" : "opacity-45",
            )}
            style={{ backgroundColor: tile.color }}
          />
        ))}
      </div>
      {filled && (
        <span className="absolute bottom-2.5 left-2.5 max-w-[80%] truncate rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-medium shadow-sm">
          {topic}
        </span>
      )}
    </div>
  );
}

export function BlogPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <div
        className={cn("h-6 w-full rounded-[5px]", filled ? "opacity-90" : "opacity-45")}
        style={{ background: `linear-gradient(120deg, ${PURPLE}99, ${BLUE}99)` }}
      />
      <TopicLine filled={filled} topic={topic} />
      <div className="h-1 w-full rounded-full bg-gray-3/25" />
      <div className="h-1 w-5/6 rounded-full bg-gray-3/25" />
      <div className="h-1 w-2/3 rounded-full bg-gray-3/25" />
    </div>
  );
}

export function SearchPreview({ filled, topic }: PreviewProps) {
  const filters = filled ? customizationFilters(topic) : [];
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <div className="hairline flex h-5 items-center gap-1 rounded-full bg-white/85 px-1.5">
        <div className="size-2 shrink-0 rounded-full border border-gray-3/50" />
        <TopicLine filled={filled} topic={topic} className="flex-1" />
      </div>
      <div className="flex min-h-[12px] flex-wrap gap-0.5">
        {filled
          ? filters.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-blue-1 px-1 py-px text-[8px] font-medium text-blue-5"
              >
                {chip}
              </span>
            ))
          : [1, 2].map((i) => (
              <span key={i} className="h-2.5 w-6 rounded-full bg-gray-3/25" />
            ))}
      </div>
      <div className="mt-auto flex flex-col gap-0.5">
        {[0.9, 0.7].map((w, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className={cn(
                "size-1 shrink-0 rounded-full",
                filled ? "bg-blue-5/70" : "bg-gray-3/30",
              )}
            />
            <div
              className={cn(
                "h-1 rounded-full",
                filled ? "bg-gray-3/40" : "bg-gray-3/20",
              )}
              style={{ width: `${w * 100}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmailPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <div className="flex items-center gap-1">
        <div className="size-3 shrink-0 rounded-full bg-blue-5/50" />
        <div className="h-1 flex-1 rounded-full bg-gray-3/25" />
      </div>
      <TopicLine filled={filled} topic={topic} />
      <div className="hairline mt-0.5 flex-1 rounded-[5px] bg-white/80 p-1.5">
        <div className="h-1 w-full rounded-full bg-gray-3/25" />
        <div className="mt-1 h-1 w-4/5 rounded-full bg-gray-3/25" />
        <div className="mt-1 h-1 w-3/5 rounded-full bg-gray-3/25" />
      </div>
    </div>
  );
}

export function SpreadsheetPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <TopicLine filled={filled} topic={topic} />
      <div className="grid flex-1 grid-cols-3 grid-rows-3 gap-px overflow-hidden rounded-[4px] bg-gray-3/20">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-white/80",
              filled && i === 0 && "bg-blue-1",
              filled && i === 4 && "bg-blue-1/60",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function ChartPreview({ filled, topic }: PreviewProps) {
  const bars = [0.45, 0.7, 0.4, 0.9, 0.55];
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <TopicLine filled={filled} topic={topic} />
      <div className="flex flex-1 items-end gap-1 px-0.5 pb-0.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h * 100}%`,
              backgroundColor: filled ? BLUE : "#c5c2c4",
              opacity: filled ? 0.85 : 0.45,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function CalendarPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <TopicLine filled={filled} topic={topic} />
      <div className="grid flex-1 grid-cols-4 grid-rows-3 gap-0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-[3px] bg-gray-3/20",
              filled && (i === 2 || i === 7) && "bg-blue-5/50",
              filled && i === 5 && "bg-green-5/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function CodePreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <div className="flex gap-0.5">
        <div className="size-1.5 rounded-full bg-rose-2/80" />
        <div className="size-1.5 rounded-full" style={{ backgroundColor: AMBER }} />
        <div className="size-1.5 rounded-full bg-green-5/70" />
      </div>
      <TopicLine filled={filled} topic={topic} />
      {[0.55, 0.8, 0.4, 0.7].map((w, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className="h-1 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: i % 2 ? PURPLE : GREEN, opacity: 0.7 }}
          />
          <div
            className="h-1 rounded-full bg-gray-3/30"
            style={{ width: `${w * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function SlidesPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-1 p-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "hairline flex h-full flex-col gap-1 rounded-[4px] bg-white/85 p-1.5",
            i === 1 ? "w-[42%]" : "w-[26%] opacity-50",
          )}
        >
          {i === 1 && <TopicLine filled={filled} topic={topic} />}
          <div
            className="mt-auto h-4 w-full rounded-[3px]"
            style={{
              background: filled && i === 1 ? `${BLUE}55` : "#e8e6e7",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function ChecklistPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5 p-2.5">
      <TopicLine filled={filled} topic={topic} />
      {[true, true, false, false].map((done, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className={cn(
              "size-2 shrink-0 rounded-[3px]",
              done ? "bg-blue-5/80" : "hairline bg-white/70",
            )}
          />
          <div
            className={cn(
              "h-1 flex-1 rounded-full",
              filled && i === 2 ? "bg-blue-5/40" : "bg-gray-3/30",
            )}
          />
        </div>
      ))}
    </div>
  );
}

export function OutlinePreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2.5">
      <TopicLine filled={filled} topic={topic} />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-1 rounded-full bg-gray-3/30"
          style={{
            width: `${90 - i * 12}%`,
            marginLeft: i === 0 ? 0 : i === 3 ? 16 : 8,
          }}
        />
      ))}
    </div>
  );
}

export function ImagePreview({ filled, topic }: PreviewProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <div
        className={cn(
          "flex h-full w-full items-end rounded-[6px] p-1.5",
          filled ? "opacity-95" : "opacity-50",
        )}
        style={{
          background: `linear-gradient(145deg, ${PURPLE}66, ${ROSE}55, ${AMBER}44)`,
        }}
      >
        {filled ? (
          <span className="max-w-full truncate rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium">
            {topic}
          </span>
        ) : (
          <div className="h-1.5 w-1/2 rounded-full bg-white/50" />
        )}
      </div>
    </div>
  );
}

export function MapPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="relative h-full w-full p-2">
      <div className="h-full w-full overflow-hidden rounded-[6px] bg-[#dfe8e4]">
        <svg viewBox="0 0 80 56" className="h-full w-full">
          <path
            d="M8 40 C20 28, 28 44, 40 30 S60 18, 72 28"
            fill="none"
            stroke={BLUE}
            strokeWidth="2"
            opacity="0.45"
          />
          <circle cx="40" cy="30" r="4" fill={ROSE} opacity={filled ? 0.9 : 0.4} />
          <circle cx="22" cy="36" r="2.5" fill={PURPLE} opacity="0.5" />
          <circle cx="58" cy="24" r="2.5" fill={GREEN} opacity="0.5" />
        </svg>
      </div>
      {filled && (
        <span className="absolute bottom-3 left-3 max-w-[75%] truncate rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium shadow-sm">
          {topic}
        </span>
      )}
    </div>
  );
}

export function SocialPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <div className="flex items-center gap-1">
        <div className="size-3 shrink-0 rounded-full bg-blue-5/60" />
        <div className="h-1 w-1/3 rounded-full bg-gray-3/30" />
      </div>
      <TopicLine filled={filled} topic={topic} />
      <div className="h-1 w-full rounded-full bg-gray-3/25" />
      <div className="h-1 w-4/5 rounded-full bg-gray-3/25" />
      <div className="mt-auto flex gap-2">
        <div className="h-1 w-4 rounded-full bg-gray-3/25" />
        <div className="h-1 w-4 rounded-full bg-gray-3/25" />
        <div className="h-1 w-4 rounded-full bg-gray-3/25" />
      </div>
    </div>
  );
}

export function TimelinePreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <TopicLine filled={filled} topic={topic} />
      <div className="relative mt-1 flex flex-1 flex-col justify-between py-0.5 pl-3">
        <div className="absolute top-1 bottom-1 left-[7px] w-px bg-gray-3/30" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative flex items-center gap-1.5">
            <div
              className={cn(
                "absolute -left-3 size-2 rounded-full",
                filled && i === 1 ? "bg-blue-5" : "bg-gray-3/50",
              )}
            />
            <div
              className={cn(
                "h-1 rounded-full",
                filled && i === 1 ? "w-4/5 bg-blue-5/40" : "w-3/5 bg-gray-3/30",
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function KanbanPreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <TopicLine filled={filled} topic={topic} />
      <div className="grid flex-1 grid-cols-3 gap-1">
        {[BLUE, PURPLE, GREEN].map((color, col) => (
          <div key={col} className="flex flex-col gap-0.5 rounded-[4px] bg-gray-3/15 p-0.5">
            {[0, 1].map((row) => (
              <div
                key={row}
                className="h-2.5 rounded-[3px] bg-white/80"
                style={{
                  boxShadow:
                    filled && col === 1 && row === 0
                      ? `inset 0 0 0 1px ${color}`
                      : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TablePreview({ filled, topic }: PreviewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <TopicLine filled={filled} topic={topic} />
      <div className="flex flex-1 flex-col gap-px overflow-hidden rounded-[4px] bg-gray-3/20">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="grid flex-1 grid-cols-3 gap-px">
            {[0, 1, 2].map((col) => (
              <div
                key={col}
                className={cn(
                  "bg-white/80",
                  row === 0 && "bg-gray-3/15",
                  filled && row === 1 && col === 0 && "bg-blue-1",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const VISUAL_PREVIEWS: Record<
  VisualInterfaceKind,
  (props: PreviewProps) => React.ReactNode
> = {
  document: DocumentPreview,
  moodboard: MoodboardPreview,
  blog: BlogPreview,
  search: SearchPreview,
  email: EmailPreview,
  spreadsheet: SpreadsheetPreview,
  chart: ChartPreview,
  calendar: CalendarPreview,
  code: CodePreview,
  slides: SlidesPreview,
  checklist: ChecklistPreview,
  outline: OutlinePreview,
  image: ImagePreview,
  map: MapPreview,
  social: SocialPreview,
  timeline: TimelinePreview,
  kanban: KanbanPreview,
  // The old chat previews have no reader; a document is the closest.
  reader: DocumentPreview,
  schedule: TimelinePreview,
  explainer: BlogPreview,
  proscons: ChecklistPreview,
  ranked: ChecklistPreview,
  flowchart: OutlinePreview,
  mindmap: OutlinePreview,
  guide: ChecklistPreview,
  table: TablePreview,
};

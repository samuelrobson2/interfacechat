import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { CHART_TYPE_META, chartAsFlowchart, chartAsMindmap, chartAsTimeline } from "../model/chart";
import { CHART_TYPES, type ChartShellData, type ChartType, type ShellProps } from "../model/shell-types";
import { ChartTypeGlyph, ShellAppIcon } from "../ui/shell-icons";
import { fieldEvents } from "../ui/shell-surface";
import { ShellTitleAside } from "../ui/shell-title-aside";
import { DiagramTools, DiagramToolsContext } from "./diagram-toolbar";
import { FlowchartShell } from "./flowchart-shell";
import { MindmapShell } from "./mindmap-shell";
import { TimelineShell } from "./timeline-shell";

/** Which chart this is: the model's choice, and the person's to change. */
function ChartTypePicker({
  value,
  large,
  onChange,
}: {
  value: ChartType;
  large: boolean;
  onChange?: (type: ChartType) => void;
}) {
  const [open, setOpen] = useState(false);
  const chip = (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full font-bureau text-typography-secondary",
        large ? "px-2.5 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]",
        onChange && "cursor-pointer transition-colors hover:bg-gray-6 hover:text-typography-primary",
        open && "bg-gray-6 text-typography-primary",
      )}
    >
      <ChartTypeGlyph type={value} className={large ? "size-4" : "size-3"} />
      {CHART_TYPE_META[value].label}
      {onChange && <ChevronDown className={large ? "size-3.5" : "size-3"} />}
    </span>
  );
  if (!onChange) return chip;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Diagram type: ${CHART_TYPE_META[value].label}. Change`} {...fieldEvents}>
          {chip}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-auto border-0 bg-transparent p-0 shadow-none" {...fieldEvents}>
        <div
          role="menu"
          className="flex w-[248px] flex-col rounded-[16px] border-[0.5px] border-gray-2 bg-gray-1 p-1.5 shadow-[0_4px_6px_rgba(26,23,24,0.15)]"
        >
          {CHART_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="menuitemradio"
              aria-checked={type === value}
              onClick={() => {
                onChange(type);
                setOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-start gap-2.5 rounded-[10px] px-2 py-1.5 text-left transition-colors hover:bg-gray-6",
                type === value && "bg-gray-6",
              )}
            >
              <ChartTypeGlyph type={type} className="mt-0.5 size-4" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-bureau text-[14px] text-typography-primary">{CHART_TYPE_META[type].label}</span>
                <span className="font-bureau text-[12px] text-typography-secondary">{CHART_TYPE_META[type].description}</span>
              </span>
              <Check className={cn("mt-0.5 size-4 shrink-0 text-icon-primary", type !== value && "invisible")} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Diagram (kind "chart"): one interface for a mind map, a timeline or a flowchart. The model
 * picks the type from what's asked, as one of its parts, and the person
 * can switch it from the title row. Each type is drawn by its own design and
 * keeps its own content, so switching back loses nothing.
 */
export function ChartShell(props: ShellProps<ChartShellData>) {
  const { size, data, onChange, className } = props;
  if (size === "small") return <ShellAppIcon kind="chart" className={className} />;

  // Large switches type from its toolbar; medium plus from the title row.
  const picker =
    size === "medium-plus" ? (
      <ChartTypePicker
        value={data.type}
        large={false}
        onChange={onChange && ((type) => onChange({ ...data, type }))}
      />
    ) : null;

  const shell = (() => {
    switch (data.type) {
      case "mindmap":
        return (
          <MindmapShell
            {...props}
            data={chartAsMindmap(data)}
            onChange={onChange && ((next) => onChange({ ...data, title: next.title, branches: next.branches }))}
          />
        );
      case "timeline":
        return (
          <TimelineShell
            {...props}
            data={chartAsTimeline(data)}
            onChange={onChange && ((next) => onChange({ ...data, title: next.title, events: next.events }))}
          />
        );
      case "flowchart":
        return (
          <FlowchartShell
            {...props}
            data={chartAsFlowchart(data)}
            onChange={onChange && ((next) => onChange({ ...data, title: next.title, nodes: next.nodes, edges: next.edges }))}
          />
        );
    }
  })();

  return (
    <DiagramToolsContext.Provider value={size === "large" ? <DiagramTools data={data} onChange={onChange} /> : null}>
      <ShellTitleAside value={picker}>{shell}</ShellTitleAside>
    </DiagramToolsContext.Provider>
  );
}

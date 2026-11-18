import { LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { layoutGeometry } from "../model/workbench-geometry";
import type { LayoutEntry, Placement, WorkspaceLayout } from "../model/workbench-layout";
import { DEFAULT_LAYOUT_RULES, LAYOUT_RULE_META, useLayoutRules, withLayoutRules, type LayoutRules } from "../model/workbench-rules";
import { MenuCard } from "./workbench-menus";

/** A sample arrangement for each rule, to draw what it allows. Chat is "chat"; the interfaces are "a" and "b". */
const CASES: Record<keyof LayoutRules, { entries: Record<string, Placement & { chat?: boolean }>; stacked?: boolean }> = {
  rightStack: {
    entries: {
      chat: { presentation: "sidebar", region: "left", order: 0, chat: true },
      a: { presentation: "medium", region: "right", order: 0 },
      b: { presentation: "medium", region: "right", order: 1 },
    },
  },
  leftStack: {
    entries: {
      chat: { presentation: "sidebar", region: "right", order: 0, chat: true },
      a: { presentation: "medium", region: "left", order: 0 },
      b: { presentation: "medium", region: "left", order: 1 },
    },
  },
  mediumAloneFills: {
    entries: {
      chat: { presentation: "sidebar", region: "left", order: 0, chat: true },
      a: { presentation: "medium", region: "right", order: 0 },
    },
  },
  extended: {
    entries: {
      chat: { presentation: "sidebar", region: "left", order: 0, chat: true },
      a: { presentation: "extended", region: "right", order: 0 },
    },
  },
  extendedPair: {
    entries: {
      chat: { presentation: "sidebar", region: "left", order: 0, chat: true },
      a: { presentation: "extended", region: "right", order: 0 },
      b: { presentation: "extended", region: "right", order: 1 },
    },
  },
  largeSideBySide: {
    entries: {
      chat: { presentation: "sidebar", region: "left", order: 0, chat: true },
      a: { presentation: "large", region: "main", order: 0 },
      b: { presentation: "large", region: "main", order: 1 },
    },
  },
  largeStacked: {
    stacked: true,
    entries: {
      chat: { presentation: "sidebar", region: "left", order: 0, chat: true },
      a: { presentation: "large", region: "main", order: 0 },
      b: { presentation: "large", region: "main", order: 1 },
    },
  },
};

const PREVIEW = { width: 64, height: 40 };

/** A rule's case drawn with the same geometry the workbench uses, as if the rule were on: Chat tinted, interfaces white. */
function CasePreview({ rule, rules, on }: { rule: keyof LayoutRules; rules: LayoutRules; on: boolean }) {
  const sample = CASES[rule];
  const entries: Record<string, LayoutEntry> = Object.fromEntries(
    Object.entries(sample.entries).map(([id, { chat, ...placement }]) => [id, { id, chat: !!chat, lastInteraction: 0, ...placement }]),
  );
  const layout: WorkspaceLayout = { entries, divider: 0.5, stacked: sample.stacked };
  const geometry = withLayoutRules({ ...rules, [rule]: true }, () =>
    layoutGeometry(layout, { width: 1280, height: 860 }, { insetLeft: 12 }),
  );
  const { content } = geometry;
  const sx = (PREVIEW.width - 4) / content.width;
  const sy = (PREVIEW.height - 4) / content.height;
  return (
    <svg
      width={PREVIEW.width}
      height={PREVIEW.height}
      viewBox={`0 0 ${PREVIEW.width} ${PREVIEW.height}`}
      aria-hidden
      className={cn("shrink-0 transition-opacity", !on && "opacity-35")}
    >
      <rect x={0.5} y={0.5} width={PREVIEW.width - 1} height={PREVIEW.height - 1} rx={6} className="fill-gray-6 stroke-gray-3/40" />
      {Object.entries(geometry.frames).map(([id, rect]) => (
        <rect
          key={id}
          x={2 + (rect.x - content.x) * sx + 0.5}
          y={2 + (rect.y - content.y) * sy + 0.5}
          width={Math.max(1, rect.width * sx - 1)}
          height={Math.max(1, rect.height * sy - 1)}
          rx={2.5}
          className={entries[id]?.chat ? "fill-[#dfe8f4] stroke-[#a9bad1]" : "fill-white stroke-gray-3/70"}
          strokeWidth={0.75}
        />
      ))}
    </svg>
  );
}

/**
 * The workbench's layout rules, in a menu in its top bar: each arrangement it
 * can take, drawn, with a switch. Switching one changes the workbench at once
 * (what the size menus offer, where drops land, how windows are drawn), and
 * is kept in this browser.
 */
export function LayoutRulesMenu() {
  const [open, setOpen] = useState(false);
  const { rules, set, reset } = useLayoutRules();
  const changed = LAYOUT_RULE_META.some(({ key }) => rules[key] !== DEFAULT_LAYOUT_RULES[key]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Layout rules"
          title="Layout rules"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-icon-primary transition-colors hover:bg-gray-6"
        >
          <LayoutDashboard className="size-4" strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-auto border-0 bg-transparent p-0 shadow-none">
        <MenuCard title="Layout rules" className="w-[340px]">
          <ul className="flex flex-col">
            {LAYOUT_RULE_META.map(({ key, label, description }) => {
              const on = rules[key];
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => set(key, !on)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-2 py-1.5 text-left transition-colors hover:bg-gray-6"
                  >
                    <CasePreview rule={key} rules={rules} on={on} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className={cn("font-bureau text-[13px]", on ? "text-typography-primary" : "text-typography-secondary")}>{label}</span>
                      <span className="font-bureau text-[11px] leading-[1.35] text-typography-secondary">{description}</span>
                    </span>
                    {/* The switch. */}
                    <span
                      aria-hidden
                      className={cn("relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors", on ? "bg-gray-5" : "bg-gray-3/30")}
                    >
                      <span
                        className={cn(
                          "absolute top-[2px] size-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-[left]",
                          on ? "left-[14px]" : "left-[2px]",
                        )}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 flex items-center justify-between border-t border-gray-3/15 px-2 pt-1.5 pb-0.5">
            <span className="font-bureau text-[11px] text-typography-secondary">Kept in this browser.</span>
            <button
              type="button"
              disabled={!changed}
              onClick={reset}
              className="cursor-pointer rounded-full px-2 py-0.5 font-bureau text-[12px] text-typography-secondary hover:bg-gray-6 hover:text-typography-primary disabled:cursor-default disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        </MenuCard>
      </PopoverContent>
    </Popover>
  );
}

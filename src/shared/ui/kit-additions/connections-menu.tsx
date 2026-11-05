import type { ComponentType } from "react";

import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

/** One thing this interface reads from. */
export type ConnectionItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  kind: string;
};

/** One action row for wiring up a new connection. */
export type ConnectionAction = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
};

/**
 * The popover behind the Connections button: what an interface currently reads
 * from, and the ways to add more.
 *
 * Presentational — takes its rows as props rather than the demo's canned list —
 * so the same component backs the editor's own control and this gallery
 * specimen without the two drifting apart.
 */
export function ConnectionsMenu({
  items,
  actions,
  title = "Connected to this interface",
  className,
}: {
  items: ConnectionItem[];
  actions: ConnectionAction[];
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-[300px] rounded-[16px] border-[0.5px] border-gray-2 bg-gray-1 p-2",
        "shadow-[0_4px_6px_rgba(26,23,24,0.15)]",
        className,
      )}
    >
      <Text variant="caption" color="secondary" className="px-2 pt-1 pb-2">
        {title}
      </Text>
      <div className="flex flex-col">
        {items.map(({ id, icon: Icon, label, kind }) => (
          <div key={id} className="flex items-center gap-2 rounded-[10px] px-2 py-2">
            <Icon className="size-4 shrink-0 text-gray-3" />
            <Text variant="label" className="min-w-0 flex-1 truncate">
              {label}
            </Text>
            <Text variant="caption" color="secondary" className="shrink-0">
              {kind}
            </Text>
          </div>
        ))}
      </div>

      <div aria-hidden className="mx-2 my-1.5 h-px bg-gray-2/50" />

      {actions.map(({ id, icon: Icon, label, onClick }) => (
        <button
          key={id}
          type="button"
          onClick={onClick}
          className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-gray-6"
        >
          <Icon className="size-4 shrink-0 text-gray-3" />
          <Text variant="label">{label}</Text>
        </button>
      ))}
    </div>
  );
}

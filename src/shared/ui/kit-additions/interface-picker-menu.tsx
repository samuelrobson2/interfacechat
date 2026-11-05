import { PlusIcon } from "@/shared/assets/icons/general/Plus";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

/** A saved interface offered by the menu. `meta` is its age, or "Open". */
export type InterfacePickerItem = {
  id: string;
  title: string;
  meta?: string;
};

/**
 * The small popout behind "New Interface": build a new one, or reopen one you
 * built before.
 *
 * Brings its own surface, so a Popover hosting it wants a bare
 * `PopoverContent` (`border-0 bg-transparent p-0 shadow-none`) rather than one
 * that draws a second card underneath.
 *
 * Presentational on purpose — it takes its items and its callbacks — so the same
 * component serves the editor's chrome and the UI-kit gallery.
 */
export function InterfacePickerMenu({
  items,
  onNew,
  onSelect,
  newLabel = "New interface",
  newDescription = "Describe what you want built",
  listLabel = "Or one you've built before",
  className,
}: {
  items: InterfacePickerItem[];
  onNew?: () => void;
  onSelect?: (item: InterfacePickerItem) => void;
  newLabel?: string;
  newDescription?: string;
  listLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-[320px] flex-col rounded-[16px] border-[0.5px] border-gray-2 bg-gray-1 p-2",
        "shadow-[0_4px_6px_rgba(26,23,24,0.15)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onNew}
        className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-gray-6"
      >
        <PlusIcon
          svgClasses="size-4 shrink-0"
          pathProps={{ strokeWidth: 2.5, stroke: "currentColor" }}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text variant="label">{newLabel}</Text>
          <Text variant="caption" color="secondary">
            {newDescription}
          </Text>
        </div>
      </button>

      <div aria-hidden className="mx-2 my-1.5 h-px bg-gray-2/50" />

      <Text variant="caption" color="secondary" className="px-2 pt-1 pb-2">
        {listLabel}
      </Text>

      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item)}
          className="flex w-full cursor-pointer items-baseline justify-between gap-2 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-gray-6"
        >
          <Text variant="label" className="min-w-0 truncate">
            {item.title}
          </Text>
          {item.meta && (
            <Text variant="caption" color="secondary" className="shrink-0">
              {item.meta}
            </Text>
          )}
        </button>
      ))}
    </div>
  );
}

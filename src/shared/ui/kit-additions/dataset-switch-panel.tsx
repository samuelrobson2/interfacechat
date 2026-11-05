import { AnimatePresence, motion } from "framer-motion";

import { LinkIcon } from "@/shared/assets/icons/general/Link";
import { AttachmentIcon } from "@/shared/assets/icons/outlined/Attachment";
import { CheckIcon } from "@/shared/assets/icons/outlined/Check";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

// The dataset the composer is pointed at, and the panel for repointing it.
// Distinct from `chat-dataset-picker` (the AutoScientist attach flow, which is
// additive): this one is a single-select switch that slides down from under the
// composer as a continuation of it, not a card of its own.

/** One selectable dataset. */
export type DatasetSwitchOption = {
  id: string;
  label: string;
};

// 32x32 with 8px of padding, per the design's icon-button spec — used by both the
// paperclip and the chip's trailing link, so the two line up in the action row.
const iconBoxClassName =
  "flex size-8 shrink-0 items-center justify-center rounded-[18px] p-2";

/**
 * The paperclip that opens the dataset panel. Its own component only so the
 * open state can drive the tint without every caller restating it.
 */
export function DatasetSwitchTrigger({
  open = false,
  className,
  ...props
}: React.ComponentProps<"button"> & { open?: boolean }) {
  return (
    <button
      type="button"
      data-slot="dataset-switch-trigger"
      aria-expanded={open}
      aria-label="Choose dataset"
      title="Choose dataset"
      className={cn(
        iconBoxClassName,
        "cursor-pointer transition-colors hover:bg-gray-6",
        open && "bg-gray-6",
        className,
      )}
      {...props}
    >
      <AttachmentIcon svgClasses="size-4" pathClasses="stroke-icon-secondary" />
    </button>
  );
}

/**
 * The pill in the composer's action row naming the attached dataset. Clicking it
 * opens the same panel the paperclip does.
 *
 * Padded on the left only — the trailing link sits in its own 32px box, which is
 * what provides the right-hand inset.
 */
export function DatasetSwitchChip({
  label,
  className,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      data-slot="dataset-switch-chip"
      className={cn(
        "flex h-8 min-w-0 max-w-[240px] cursor-pointer items-center gap-2 rounded-[16px]",
        "bg-gray-6 pl-3 transition-colors hover:bg-gray-2",
        className,
      )}
      title={label}
      {...props}
    >
      <Text variant="label" className="min-w-0 truncate">
        {label}
      </Text>
      <span className={iconBoxClassName}>
        <LinkIcon svgClasses="size-4" pathClasses="stroke-icon-secondary" />
      </span>
    </button>
  );
}

/**
 * One row of a switch list: the active option held in a filled row with a check,
 * the rest as secondary text. Exported so other trays can build the same list
 * without nesting a whole DatasetSwitchPanel inside themselves.
 */
export function DatasetSwitchOptionRow({
  label,
  active = false,
  className,
  ...props
}: React.ComponentProps<"button"> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "flex h-10 w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 text-left",
        "transition-colors",
        active ? "bg-gray-6" : "hover:bg-gray-6/60",
        className,
      )}
      {...props}
    >
      <Text
        variant="label"
        color={active ? "primary" : "secondary"}
        className="min-w-0 flex-1 truncate"
      >
        {label}
      </Text>
      {active && (
        <CheckIcon
          svgClasses="size-3 shrink-0"
          pathClasses="stroke-icon-primary"
        />
      )}
    </button>
  );
}

/**
 * The "Switch dataset" list: the active dataset held in a filled row with a
 * check, the rest beneath it as secondary text.
 *
 * Slides down from behind the composer rather than appearing as a second card —
 * hence the negative top margin (tucking it under the composer's rounded bottom,
 * which keeps its own `z-10`), the square top corners, and the extra top padding
 * to clear the overlap. The height tween is what makes it read as unfolding; the
 * content below is pushed down with it.
 */
export function DatasetSwitchPanel({
  open,
  label = "Switch dataset",
  options,
  activeId,
  onSelect,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
  open: boolean;
  label?: string;
  options: DatasetSwitchOption[];
  activeId?: string | null;
  onSelect?: (option: DatasetSwitchOption) => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          data-slot="dataset-switch-panel"
          // The composer's bottom 16px overlaps this, so the two read as one
          // surface. `overflow-hidden` is what clips the content during the
          // height tween.
          className="relative z-0 -mt-4 overflow-hidden"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
        >
          <div
            className={cn(
              "flex w-full flex-col gap-1 rounded-b-[16px] px-3 pt-7 pb-3",
              "border-x-[0.5px] border-b-[0.5px] border-gray-2 bg-gray-0",
              className,
            )}
            {...props}
          >
            <Text variant="label" color="secondary" className="px-3 pb-1">
              {label}
            </Text>
            {options.map((option) => (
              <DatasetSwitchOptionRow
                key={option.id}
                label={option.label}
                active={option.id === activeId}
                onClick={() => onSelect?.(option)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

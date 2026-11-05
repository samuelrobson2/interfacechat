import { AutoScientistIcon } from "@/shared/assets/icons/outlined/AutoScientist";
import { ChevronLeftIcon } from "@/shared/assets/icons/outlined/ChevronLeft";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

// The "Add an AutoScientist" dataset picker — the dropdown that expands above
// the chat composer when attaching a dataset/AutoScientist to a conversation.
// Not a pharos primitive; built for this app, so it lives in kit-additions
// alongside the other interface-editor chrome.

export function ChatDatasetPickerHeader({
  label,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  label: string;
}) {
  return (
    <button
      type="button"
      data-slot="dataset-picker-header"
      className={cn(
        "flex h-5 w-full items-center gap-2.5 px-1 text-left",
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon svgClasses="size-3 shrink-0" pathClasses="stroke-gray-3" />
      <Text variant="label" color="secondary" className="flex-1 truncate">
        {label}
      </Text>
    </button>
  );
}

export function ChatDatasetPickerItem({
  label,
  icon: Icon = AutoScientistIcon,
  active = false,
  onAdd,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  label: string;
  icon?: React.ComponentType<{ svgClasses?: string; pathClasses?: string }>;
  /** Highlights the row with the pill fill and reveals the add action (hover/focus state from Figma). */
  active?: boolean;
  onAdd?: () => void;
}) {
  return (
    <div
      data-slot="dataset-picker-item"
      className={cn(
        "group flex h-8 w-full items-center gap-2 rounded-[16px]",
        active && "bg-gray-6",
        className,
      )}
      {...props}
    >
      <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full shadow-[0_0_6px_var(--color-rose-1)]">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-ai-frame p-px gradient-ring"
        />
        <span className="relative flex size-full items-center justify-center rounded-full bg-[#F5F5F5]">
          <Icon svgClasses="size-5" pathClasses="stroke-gray-3" />
        </span>
      </span>
      <Text
        variant="label"
        className="flex-1 truncate text-left"
        title={label}
      >
        {label}
      </Text>
      {onAdd && (
        <button
          type="button"
          aria-label={`Add ${label}`}
          onClick={onAdd}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-[18px]",
            "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            active && "opacity-100",
            "drop-shadow-[0_0_6px_var(--color-rose-1)]",
          )}
        >
          <PlusSmallIcon svgClasses="size-4" pathClasses="stroke-gray-5" />
        </button>
      )}
    </div>
  );
}

export function ChatDatasetPickerPanel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dataset-picker-panel"
      className={cn(
        "flex w-full flex-col items-center gap-2 rounded-b-[16px] bg-gray-1 pt-[30px] pb-3 px-3",
        "border-x-[0.5px] border-b-[0.5px] border-gray-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

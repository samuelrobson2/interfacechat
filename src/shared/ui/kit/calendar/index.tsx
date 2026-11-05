import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker";

import { cn } from "@/shared/lib/css";
import { Button, buttonVariants } from "@/shared/ui/kit/button";
import { textVariants } from "@/shared/ui/kit/text";
import { ChevronLeftIcon } from "@/shared/assets/icons/outlined/ChevronLeft";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { ChevronDownIcon } from "@/shared/assets/icons/outlined/ChevronDown";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background-primary p-6 [--cell-size:40px]",
        "rounded-[4px] border border-stroke-secondary",
        "in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute h-8 inset-x-0 top-0 flex w-full items-center justify-between",
          defaultClassNames.nav,
          captionLayout === "label" && "h-auto",
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-5 p-0 select-none aria-disabled:opacity-30 hover:bg-transparent hover:opacity-60 transition-opacity",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-5 p-0 select-none aria-disabled:opacity-30 hover:bg-transparent hover:opacity-60 transition-opacity",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex w-full items-center justify-center px-5",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex w-full items-center justify-center gap-1.5",
          textVariants({ variant: "label" }),
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-[4px] border border-stroke-secondary has-focus:border-ring has-focus:ring-2 has-focus:ring-ring/50",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          textVariants({ variant: "body", color: "primary" }),
          "select-none",
          captionLayout !== "label" &&
            "flex h-8 items-center gap-1 rounded-[4px] pr-1 pl-2 [&>svg]:size-3.5 [&>svg]:text-typography-secondary",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 h-8 px-[2.5px] py-0 flex items-center justify-center select-none",
          "first:pl-0 last:pr-0",
          textVariants({ variant: "label", color: "secondary" }),
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          textVariants({ variant: "label", color: "secondary" }),
          "select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative h-full w-full px-[2.5px] py-0 text-center select-none",
          "first:pl-0 last:pr-0",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-[60px]"
            : "[&:first-child[data-selected=true]_button]:rounded-l-[60px]",
          "[&:last-child[data-selected=true]_button]:rounded-r-[60px]",
          defaultClassNames.day,
        ),
        range_start: cn(
          "rounded-none relative",
          "before:absolute before:inset-y-0 before:left-1/2 before:right-0 before:bg-blue-1 before:z-0",
          defaultClassNames.range_start,
        ),
        range_middle: cn(
          "rounded-none bg-blue-1",
          defaultClassNames.range_middle,
        ),
        range_end: cn(
          "rounded-none relative",
          "before:absolute before:inset-y-0 before:left-0 before:right-1/2 before:bg-blue-1 before:z-0",
          defaultClassNames.range_end,
        ),
        disabled: cn(
          "text-typography-secondary opacity-40",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-5", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-5", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isRange =
    modifiers.range_start || modifiers.range_end || modifiers.range_middle;

  const isSelectedSingle = modifiers.selected && !isRange;

  const isHighlighted = modifiers.range_start || modifiers.range_end;

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSelectedSingle}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={modifiers.today}
      className={cn(
        // Base layout
        "relative flex aspect-square size-auto w-full min-w-(--cell-size)",
        "items-center justify-center transition-colors rounded-[60px]",
        textVariants(),
        // Focus ring
        // "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10",
        // "group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-ring",
        // Outside month days
        modifiers.outside && "text-gray-2",
        // modifiers.outside && "hover:bg-transparent",
        // Today highlight (always shown)
        // modifiers.today && "bg-gray-4 text-typography-inverse",
        // Selected single day
        "data-[selected-single=true]:bg-gray-4 data-[selected-single=true]:text-typography-inverse",
        // Range start
        "data-[range-start=true]:bg-gray-4 data-[range-start=true]:text-typography-inverse",
        // Range end
        "data-[range-end=true]:bg-gray-4 data-[range-end=true]:text-typography-inverse",
        // Range middle (blue tint, no rounded corners)
        "data-[range-middle=true]:bg-blue-1 data-[range-middle=true]:text-typography-primary",
        // Default hover only for non-special days
        !isHighlighted && "hover:bg-blue-1",
        defaultClassNames.day,
        className,
      )}
      {...props}
    >
      {props.children}
      {modifiers.today && (
        <span
          className={cn(
            "absolute size-1 rounded-full left-1/2 -translate-x-1/2 bottom-1.5",
            (modifiers.today || modifiers.range_middle) && "bg-icon-primary",
            (modifiers.selected ||
              modifiers.range_end ||
              modifiers.range_start) &&
              !modifiers.range_middle &&
              "bg-icon-inverse",
          )}
        />
      )}
    </button>
  );
}

export { Calendar, CalendarDayButton };

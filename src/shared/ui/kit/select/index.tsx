import * as SelectPrimitive from "@radix-ui/react-select";
import * as React from "react";

import { CheckmarkIcon } from "@/shared/assets/icons/outlined/Checkmark";
import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { cn } from "@/shared/lib/css";
import { cva, type VariantProps } from "class-variance-authority";
import { Text, textVariants } from "../text";
import { commandItemBase } from "../command";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

const selectTriggerVariants = cva(
  [
    textVariants({ variant: "body" }),
    "flex items-center justify-between transition-all w-full",
    "hairline",
    "whitespace-nowrap outline-none",
    "data-placeholder:text-typography-secondary",
    "focus:outline-none focus:[--hairline-scale:1] focus:[--hairline-color:var(--color-stroke-primary)]",
    "disabled:cursor-not-allowed disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "data-[state=open]:[&_svg]:rotate-180",
  ],
  {
    variants: {
      variant: {
        default: "rounded-[4px] [--hairline-radius:4px] bg-background-primary shadow-inset-default",
        outline: "rounded-[8px] [--hairline-radius:8px] bg-transparent",
        pill: "rounded-[56px] [--hairline-radius:56px] bg-background-primary",
        rounded:
          "rounded-md [--hairline-radius:6px] [--hairline-color:var(--color-blue-4)] [--hairline-scale:1] bg-background-primary shadow-inset-default h-[60px]",
      },
      size: {
        default: "h-16 gap-2 px-4 py-5",
        sm: "h-9 gap-3 px-3 py-1.5",
        pill: "gap-2 px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SelectTrigger({
  className,
  size = "default",
  variant = "default",
  children,
  error,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants> & {
    error?: string;
  }) {
  return (
    <div className="flex flex-col gap-1">
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={cn(
          selectTriggerVariants({ size, variant }),
          className,
          error && "[--hairline-scale:1] [--hairline-color:var(--color-red-5)] focus:[--hairline-color:var(--color-red-5)]",
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronBottomIcon
            className={cn(
              "transition-transform",
              size === "sm" && "size-4",
              size === "pill" && "size-4",
              size === "default" && "size-6",
            )}
            pathClasses="stroke-icon-primary"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      {error && (
        <Text variant="label" color="error">
          {error}
        </Text>
      )}
    </div>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Base styles similar to PopoverContent
          "bg-background-secondary z-50 origin-(--radix-select-content-transform-origin)",
          // Animation styles
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          // Size and positioning
          "max-h-[360px] min-w-(--radix-select-trigger-width)",
          // Styling similar to popover
          "rounded-[4px] border border-stroke-secondary outline-hidden",
          // Scrolling
          "overflow-y-auto no-scrollbar",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-4", // Similar padding to popover content
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        textVariants({ variant: "body", color: "secondary" }),
        "px-2 py-1.5",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(commandItemBase(), "min-w-16 focus:bg-blue-1", className)}
      {...props}
      data-disabled={props.disabled}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <CheckmarkIcon className="size-4" pathClasses="stroke-icon-primary" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronBottomIcon
        className="size-4 rotate-180"
        pathClasses="stroke-current"
      />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronBottomIcon className="size-4" pathClasses="stroke-current" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

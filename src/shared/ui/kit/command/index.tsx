import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { SearchIcon } from "@/shared/assets/icons/general/Search";
import { CheckmarkIcon } from "@/shared/assets/icons/outlined/Checkmark";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { cn } from "@/shared/lib/css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { cva } from "class-variance-authority";
import { textVariants } from "../text";
import { Skeleton } from "../skeleton";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col rounded-[4px]",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-2 border-b px-2 pb-2 shrink-0"
    >
      <SearchIcon
        className="size-6 shrink-0"
        pathClasses="stroke-icon-primary"
      />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          textVariants({ variant: "body" }),
          "placeholder:text-typography-secondary flex w-full rounded-md bg-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("flex-1 min-h-0 overflow-y-auto no-scrollbar", className)}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-2 text-center text-base leading-6", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  isLoading,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group> & {
  isLoading?: boolean;
}) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        // Base styles
        "text-typography-primary overflow-hidden",
        // Group heading styles
        "**:[[cmdk-group-heading]]:text-typography-secondary **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-6 w-full" key={index} />
          ))}
        </div>
      ) : (
        children
      )}
    </CommandPrimitive.Group>
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-stroke-primary -mx-1 h-px", className)}
      {...props}
    />
  );
}

const commandItemBase = cva([
  textVariants({ variant: "body" }),
  "flex items-center justify-between gap-2 rounded-[8px] p-2",
  "cursor-pointer outline-hidden select-none transition-colors",
  "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
]);

function CommandItem({
  className,
  children,
  isSelected,
  selectable = true,
  closable = false,
  onClose,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> & {
  isSelected?: boolean;
  selectable?: boolean;
  closable?: boolean;
  onClose?: () => void;
}) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        commandItemBase(),
        "relative pl-2 pr-8 py-2",
        selectable && "data-[selected=true]:bg-blue-1",
        !selectable && "cursor-default",
        className,
      )}
      {...props}
    >
      {children}
      {isSelected && (
        <CheckmarkIcon
          className="absolute right-2 size-4"
          pathClasses="stroke-icon-primary"
        />
      )}
      {closable && (
        <button className="absolute right-2 cursor-pointer" onClick={onClose}>
          <CrossLargeIcon
            className="size-4"
            pathClasses="stroke-icon-primary"
          />
        </button>
      )}
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-typography-secondary ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  commandItemBase,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};

"use client";

import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { cn } from "@/shared/lib/css";
import { Badge, type BadgeColors } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/kit/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/kit/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { Text, textVariants } from "../text";
import { Skeleton } from "../skeleton";
import { debounce } from "@/shared/lib/js";

type MultiSelectContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValues: Set<string>;
  toggleValue: (value: string) => void;
  items: Map<string, ReactNode>;
  onItemAdded: (value: string, label: ReactNode) => void;
};
const MultiSelectContext = createContext<MultiSelectContextType | null>(null);

export function MultiSelect({
  children,
  values,
  defaultValues,
  onValuesChange,
  closeOnSelect = false,
}: {
  children: ReactNode;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
  closeOnSelect?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [internalValues, setInternalValues] = useState(
    new Set<string>(values ?? defaultValues),
  );
  const selectedValues = values ? new Set(values) : internalValues;
  const [items, setItems] = useState<Map<string, ReactNode>>(new Map());

  function toggleValue(value: string) {
    const getNewSet = (prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    };
    setInternalValues(getNewSet);
    onValuesChange?.([...getNewSet(selectedValues)]);
    if (closeOnSelect) {
      setOpen(false);
    }
  }

  const onItemAdded = useCallback((value: string, label: ReactNode) => {
    setItems((prev) => {
      if (prev.get(value) === label) return prev;
      return new Map(prev).set(value, label);
    });
  }, []);

  return (
    <MultiSelectContext
      value={{
        open,
        setOpen,
        selectedValues,
        toggleValue,
        items,
        onItemAdded,
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        {children}
      </Popover>
    </MultiSelectContext>
  );
}

export function MultiSelectTrigger({
  className,
  children,
  error,
  ...props
}: {
  className?: string;
  children?: ReactNode;
  error?: string;
} & ComponentPropsWithoutRef<typeof Button>) {
  const { open } = useMultiSelectContext();

  return (
    <div className="flex flex-col gap-1">
      <PopoverTrigger asChild>
        <button
          {...props}
          role={props.role ?? "combobox"}
          aria-expanded={props["aria-expanded"] ?? open}
          className={cn(
            textVariants({ variant: "body" }),
            "relative bg-background-primary flex h-16 w-full items-center gap-2 overflow-hidden pl-4 pr-14",
            "rounded-[4px] hairline [--hairline-radius:4px] shadow-inset-default",
            "whitespace-nowrap outline-none",
            "data-placeholder:text-typography-secondary",

            "focus:outline-none focus:[--hairline-scale:1] focus:[--hairline-color:var(--color-stroke-primary)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0",
            error && "[--hairline-scale:1] [--hairline-color:var(--color-red-5)] focus:[--hairline-color:var(--color-red-5)]",
            className,
          )}
        >
          {children}
          <div className="absolute right-4 grid place-items-center size-10">
            <ChevronBottomIcon
              className={cn(
                "transition-transform duration-200",
                open && "rotate-180",
              )}
              pathClasses="stroke-icon-primary"
            />
          </div>
        </button>
      </PopoverTrigger>

      {error && (
        <Text variant="label" color="error">
          {error}
        </Text>
      )}
    </div>
  );
}

export function MultiSelectValue({
  placeholder,
  clickToRemove = true,
  className,
  badgeColor = "default",
  isLoading = false,
  ...props
}: {
  placeholder?: string;
  clickToRemove?: boolean;
  badgeColor?: BadgeColors;
  isLoading?: boolean;
} & Omit<ComponentPropsWithoutRef<"div">, "children">) {
  const { selectedValues, toggleValue, items } = useMultiSelectContext();
  const [overflowAmount, setOverflowAmount] = useState(0);
  const [hiddenValues, setHiddenValues] = useState<string[]>([]);
  const valueRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Check overflow and calculate hidden items - never wrap, always show cutoff
  const checkOverflow = useCallback(() => {
    if (valueRef.current == null) return;

    const containerElement = valueRef.current;
    const overflowElement = overflowRef.current;
    const itemElements = containerElement.querySelectorAll<HTMLElement>(
      "[data-selected-item]",
    );

    if (overflowElement != null) overflowElement.style.display = "none";
    itemElements.forEach((child) => child.style.removeProperty("display"));

    const hidden: string[] = [];
    let amount = 0;

    for (let i = itemElements.length - 1; i >= 0; i--) {
      const child = itemElements[i]!;
      if (containerElement.scrollWidth <= containerElement.clientWidth) {
        break;
      }
      amount = itemElements.length - i;
      const value = child.getAttribute("data-value");
      if (value) hidden.unshift(value);
      child.style.display = "none";
      overflowElement?.style.removeProperty("display");
    }

    setOverflowAmount(amount);
    setHiddenValues(hidden);
  }, []);

  const handleResize = useCallback(
    (node: HTMLDivElement) => {
      valueRef.current = node;

      const mutationObserver = new MutationObserver(checkOverflow);
      const observer = new ResizeObserver(debounce(checkOverflow, 100));

      mutationObserver.observe(node, {
        childList: true,
        attributes: true,
        attributeFilter: ["class", "style"],
      });
      observer.observe(node);

      return () => {
        observer.disconnect();
        mutationObserver.disconnect();
        valueRef.current = null;
      };
    },
    [checkOverflow],
  );

  if (isLoading) return <Skeleton className="w-full h-6" />;

  if (selectedValues.size === 0 && placeholder) {
    return <Text color="secondary">{placeholder}</Text>;
  }

  return (
    <div
      {...props}
      ref={handleResize}
      className={cn("flex w-full gap-1.5 overflow-hidden", className)}
    >
      {[...selectedValues]
        .filter((value) => items.has(value))
        .map((value) => (
          <Badge
            color={badgeColor ?? "default"}
            data-selected-item
            data-value={value}
            key={value}
            closable={clickToRemove}
            onClose={() => toggleValue(value)}
          >
            {items.get(value)}
          </Badge>
        ))}
      {overflowAmount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge ref={overflowRef} color={badgeColor ?? "default"}>
              +{overflowAmount}
            </Badge>
          </TooltipTrigger>
          <TooltipContent
            showArrow={false}
            align="start"
            sideOffset={14}
            className="flex flex-col gap-2 min-w-40 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Command>
              <CommandGroup>
                <CommandList>
                  {hiddenValues.map((value) => (
                    <CommandItem
                      key={value}
                      selectable={false}
                      closable
                      onClose={() => toggleValue(value)}
                    >
                      {items.get(value)}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function MultiSelectContent({
  search = true,
  children,
  ...props
}: {
  search?: boolean | { placeholder?: string; emptyMessage?: string };
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Command>, "children">) {
  const canSearch = typeof search === "object" ? true : search;

  return (
    <>
      <div style={{ display: "none" }}>
        <Command>
          <CommandList>{children}</CommandList>
        </Command>
      </div>
      <PopoverContent className={cn("max-h-[360px] flex flex-col")}>
        <Command className="gap-2 min-h-0" {...props}>
          {canSearch ? (
            <CommandInput
              placeholder={
                typeof search === "object" ? search.placeholder : undefined
              }
            />
          ) : (
            <button autoFocus className="sr-only" />
          )}
          <CommandList>
            {canSearch && (
              <CommandEmpty>
                {typeof search === "object" ? search.emptyMessage : undefined}
              </CommandEmpty>
            )}
            {children}
          </CommandList>
        </Command>
      </PopoverContent>
    </>
  );
}

export function MultiSelectItem({
  value,
  children,
  badgeLabel,
  onSelect,
  ...props
}: {
  badgeLabel?: ReactNode;
  value: string;
} & Omit<ComponentPropsWithoutRef<typeof CommandItem>, "value">) {
  const { toggleValue, selectedValues, onItemAdded } = useMultiSelectContext();
  const isSelected = selectedValues.has(value);

  useEffect(() => {
    onItemAdded(value, badgeLabel ?? children);
  }, [value, children, onItemAdded, badgeLabel]);

  return (
    <CommandItem
      isSelected={isSelected}
      className={cn(props.className)}
      onSelect={() => {
        toggleValue(value);
        onSelect?.(value);
      }}
      {...props}
    >
      {children}
    </CommandItem>
  );
}

export function MultiSelectGroup(
  props: ComponentPropsWithoutRef<typeof CommandGroup>,
) {
  return <CommandGroup {...props} />;
}

export function MultiSelectSeparator(
  props: ComponentPropsWithoutRef<typeof CommandSeparator>,
) {
  return <CommandSeparator {...props} />;
}

function useMultiSelectContext() {
  const context = useContext(MultiSelectContext);
  if (context == null) {
    throw new Error(
      "useMultiSelectContext must be used within a MultiSelectContext",
    );
  }
  return context;
}

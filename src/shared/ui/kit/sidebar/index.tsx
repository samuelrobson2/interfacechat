import { cn } from "@/shared/lib/css";
import { Slot } from "@radix-ui/react-slot";
import { Card } from "../card";
import { cva, type VariantProps } from "class-variance-authority";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { textVariants } from "../text";

type SidebarContextValue = {
  isHovered: boolean;
  setHovered: (hovered: boolean) => void;
  setPinned: (pinned: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Publishes the rail's expanded state to the page beside it.
 *
 * The rail itself is `fixed`, so it can't push content the way Studio's and
 * Vision's in-flow panels do — instead this wrapper stamps `data-sidebar-expanded`
 * on a `group/app`, and pages that opt in swap their left gutter off it (see
 * `sidebarGutter` in shared/ui/sidebar-gutter). `contents` means the wrapper
 * adds no box of its own, so dropping it around existing trees changes nothing.
 *
 * Wrap wherever an `AppSidebar` is rendered. Without it the rail still works —
 * it just falls back to owning its hover state alone and nothing reflows.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isHovered, setHovered] = useState(false);
  // Pinned open by something other than the pointer — today only the user menu,
  // which holds the rail open while its popover is up.
  const [isPinned, setPinned] = useState(false);
  const value = useMemo(
    () => ({ isHovered, setHovered, setPinned }),
    [isHovered],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        className="group/app contents"
        data-sidebar-expanded={isHovered || isPinned}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarLayout({
  className,
  expanded,
  onMouseEnter,
  onMouseLeave,
  ...props
}: React.ComponentProps<"div"> & {
  expanded?: boolean;
}) {
  // Hover lives in the provider when there is one, so the content gutter and the
  // rail widen off the same state. Standalone (no provider) it stays local.
  const context = useContext(SidebarContext);
  const [localHovered, setLocalHovered] = useState(false);
  const isHovered = context ? context.isHovered : localHovered;
  const setHovered = context ? context.setHovered : setLocalHovered;
  const isExpanded = isHovered || !!expanded;

  // Mirror the pinned-open prop up so the page gutter follows it too.
  const setPinned = context?.setPinned;
  useEffect(() => {
    setPinned?.(!!expanded);
    return () => setPinned?.(false);
  }, [expanded, setPinned]);

  return (
    <div
      data-slot="sidebar"
      data-expanded={isExpanded}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
      }}
      onMouseOver={(event) => {
        const overLiveThread =
          event.target instanceof Element &&
          Boolean(event.target.closest("[data-sidebar-quiet]"));
        setHovered(!overLiveThread);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      className={cn(
        "group/sidebar fixed z-40 top-12 left-4 md:left-12 flex md:flex-col gap-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Card
      data-slot="sidebar-card"
      shape="rounded"
      className={cn(
        "flex-col gap-0 overflow-hidden transition-[width] duration-200 ease-out",
        "[--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.2]",
        "md:w-12 md:group-data-[expanded=true]/sidebar:w-[172px]",
        className,
      )}
      {...props}
    />
  );
}

const sidebarItemVariants = cva(
  [
    "group/item flex w-full items-end justify-center gap-2 rounded-[18px] p-2 cursor-pointer transition-colors",
    "[&_svg]:shrink-0 group-data-[expanded=true]/sidebar:justify-start",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      isActive: {
        true: [
          "bg-blue-1 [&_path[stroke]]:stroke-blue-4 [&_path[fill]]:fill-blue-4",
        ],
        false: [
          "bg-gray-1/25 [&_path[stroke]]:stroke-icon-primary [&_path[fill]]:fill-icon-primary",
          "hover:bg-gray-5/25 hover:[&_path[stroke]]:stroke-icon-inverse hover:[&_path[fill]]:fill-icon-inverse",
          "hover:[&_[data-slot=sidebar-item-label]]:text-typography-inverse",
        ],
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

export function SidebarItem({
  className,
  isActive = false,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof sidebarItemVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-item"
      data-active={isActive ? "true" : undefined}
      className={cn(sidebarItemVariants({ isActive }), className)}
      {...props}
    />
  );
}

export function SidebarItemLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="sidebar-item-label"
      className={cn(
        textVariants({ variant: "label" }),
        "hidden min-w-0 truncate whitespace-nowrap",
        "group-data-[active=true]/item:text-blue-4",
        "group-data-[expanded=true]/sidebar:block",
        className,
      )}
      {...props}
    />
  );
}

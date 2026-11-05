import type { ReactNode } from "react";

import { cn } from "@/shared/lib/css";
import { SidebarItem, SidebarItemLabel } from "@/shared/ui/kit/sidebar";

type ToolbarButtonProps = Omit<React.ComponentProps<"button">, "children"> & {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  expanded?: boolean;
  pressed?: boolean;
};

export function ToolbarButton({
  icon,
  label,
  shortcut,
  active = false,
  expanded = false,
  pressed = false,
  className,
  type = "button",
  ...props
}: ToolbarButtonProps) {
  return (
    <SidebarItem
      asChild
      isActive={active}
      className={cn(
        "h-9 w-auto items-center justify-center gap-0 px-2.5",
        // Frosted-glass fill: translucent surface + backdrop blur so the
        // canvas behind shows through (matches the "Glass" material spec).
        "backdrop-blur-md backdrop-saturate-150",
        "transition-[color,background-color,fill,stroke,transform] duration-200",
        "data-[pressed=true]:scale-90",
        className,
      )}
    >
      <button
        {...props}
        type={type}
        aria-label={label}
        data-pressed={pressed ? "true" : undefined}
      >
        {icon}
        {/* The `pl-2` gap lives on the innermost node so it stays clipped (no
            phantom padding) while the label is collapsed. */}
        <span
          className={cn(
            "grid transition-[grid-template-columns] duration-200 ease-out",
            expanded ? "grid-cols-[1fr]" : "grid-cols-[0fr]",
          )}
        >
          <span className="min-w-0 overflow-hidden">
            <SidebarItemLabel className="block pl-2">
              {shortcut ? `${label} (${shortcut})` : label}
            </SidebarItemLabel>
          </span>
        </span>
      </button>
    </SidebarItem>
  );
}

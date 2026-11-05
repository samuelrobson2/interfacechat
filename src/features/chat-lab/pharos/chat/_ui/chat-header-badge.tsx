import { Slot, Slottable } from "@radix-ui/react-slot";

import { cn } from "@/shared/lib/css";
import { SidebarCard, SidebarItem } from "@/shared/ui/kit/sidebar";
import { Text } from "@/shared/ui/kit/text";

export function ChatHeaderBadge({
  icon,
  endIcon,
  label,
  isActive = false,
  asChild = false,
  className,
  itemClassName,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  icon: React.ReactNode;
  endIcon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  asChild?: boolean;
  itemClassName?: string;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <SidebarCard
      className={cn(
        "h-8 w-auto min-w-0 max-w-full flex-row items-center p-1 md:h-10 md:w-auto",
        className,
      )}
    >
      <SidebarItem
        asChild
        isActive={isActive}
        className={cn(
          "h-6 w-full min-w-0 max-w-full items-center justify-center gap-2 overflow-hidden px-1 py-0 md:h-8 md:px-2",
          itemClassName,
        )}
      >
        <Comp type={asChild ? undefined : "button"} title={label} {...props}>
          {icon}
          <Slottable>{children}</Slottable>
          <Text
            as="span"
            variant="label"
            className="block pt-0.5 min-w-0 max-w-45 flex-1 truncate leading-none transition-colors group-hover/item:text-typography-inverse group-data-[active=true]/item:text-blue-6"
          >
            {label}
          </Text>
          {endIcon}
        </Comp>
      </SidebarItem>
    </SidebarCard>
  );
}

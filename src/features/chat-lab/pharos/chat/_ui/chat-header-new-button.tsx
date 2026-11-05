import { Link } from "react-router-dom";

import { PlusBigIcon } from "@/shared/assets/icons/general/PlusBig";
import { SidebarCard, SidebarItem } from "@/shared/ui/kit/sidebar";
import { Text } from "@/shared/ui/kit/text";

export function ChatHeaderNewButton({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <SidebarCard className="group/new-chat h-8 w-auto min-w-8 shrink-0 flex-row items-center p-1 md:h-10 md:min-w-10 md:w-auto">
      <SidebarItem
        asChild
        className="h-6 w-auto items-center justify-center gap-0 overflow-hidden px-1 py-0 md:h-8 md:px-2"
      >
        <Link to={to} aria-label={label}>
          <PlusBigIcon svgClasses="size-4" />
          <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-200 ease-out md:group-hover/new-chat:grid-cols-[1fr] md:group-focus-within/new-chat:grid-cols-[1fr]">
            <span className="min-w-0 overflow-hidden">
              <Text
                as="span"
                variant="label"
                className="block pl-1.5 pt-0.5 leading-none whitespace-nowrap transition-colors group-hover/item:text-typography-inverse"
              >
                {label}
              </Text>
            </span>
          </span>
        </Link>
      </SidebarItem>
    </SidebarCard>
  );
}

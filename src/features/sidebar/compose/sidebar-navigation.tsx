import { LogoIcon } from "@/shared/assets/icons/Logo";
import { LogoTextIcon } from "@/shared/assets/icons/LogoText";
import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model/routes";
import {
  SidebarCard,
  SidebarItem,
  SidebarItemLabel,
} from "@/shared/ui/kit/sidebar";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { To } from "react-router-dom";
import {
  Link,
  matchPath,
  useLocation,
  useSearchParams,
} from "react-router-dom";

export type SidebarPathPattern =
  | string
  | {
      path: string;
      end?: boolean;
    };

// Optional search-param matcher: an item is active only when the current value
// of `param` (falling back to `defaultValue`) equals `value`.
export interface SidebarSearchMatch {
  param: string;
  value: string;
  defaultValue?: string;
}

export interface MenuItem {
  title?: string;
  url: To;
  matchPaths: SidebarPathPattern[];
  // Wins over `matchPaths`, for routes swallowed by a broader pattern of another item.
  excludePaths?: SidebarPathPattern[];
  searchMatch?: SidebarSearchMatch;
  icon: React.ReactNode;
}

// A collapsible grouping: a header row (icon + label + chevron) that toggles
// the visibility of its nested items. Used for the "Archive" section.
export interface SidebarSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  defaultOpen?: boolean;
}

export type SidebarEntry = MenuItem | SidebarSection;

function isSection(entry: SidebarEntry): entry is SidebarSection {
  return "items" in entry;
}

function SidebarItemLink({
  item,
  isActive,
  className,
}: {
  item: MenuItem;
  isActive: boolean;
  className?: string;
}) {
  return (
    <SidebarItem
      className={cn(
        "size-9 group-data-[expanded=true]/sidebar:size-auto",
        className,
      )}
      asChild
      isActive={isActive}
    >
      <Link to={item.url}>
        {item.icon}
        <SidebarItemLabel>{item.title}</SidebarItemLabel>
      </Link>
    </SidebarItem>
  );
}

function SidebarSectionGroup({
  section,
  isItemActive,
}: {
  section: SidebarSection;
  isItemActive: (item: MenuItem) => boolean;
}) {
  const [open, setOpen] = useState(section.defaultOpen ?? true);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <SidebarItem
        className="size-9 group-data-[expanded=true]/sidebar:size-auto"
        asChild
      >
        <button type="button" onClick={() => setOpen((prev) => !prev)}>
          {section.icon}
          <SidebarItemLabel>{section.title}</SidebarItemLabel>
          <ChevronDown
            className={cn(
              "ml-auto hidden size-4 shrink-0 transition-transform",
              "group-data-[expanded=true]/sidebar:block",
              !open && "-rotate-90",
            )}
          />
        </button>
      </SidebarItem>

      {open &&
        section.items.map((item, index) => (
          <SidebarItemLink
            key={index}
            item={item}
            isActive={isItemActive(item)}
            className="group-data-[expanded=true]/sidebar:pl-4"
          />
        ))}
    </div>
  );
}

export function SidebarNavigation({
  logoLink = ROUTES.HOME,
  menuItems,
  showLogo = true,
  className,
}: {
  logoLink?: string;
  menuItems: SidebarEntry[];
  /** Only the first bubble carries the logo; grouped bubbles below omit it. */
  showLogo?: boolean;
  className?: string;
}) {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isItemActive = (item: MenuItem) => {
    const isExcluded = item.excludePaths?.some(
      (route) => !!matchPath(route, location.pathname),
    );
    if (isExcluded) return false;

    const pathMatches = item.matchPaths.some(
      (route) => !!matchPath(route, location.pathname),
    );

    if (!pathMatches) return false;
    if (!item.searchMatch) return true;

    // The search-param check only disambiguates items that share the home
    // route (the Build/Chat/History tabs). On any other matched path the item
    // is active outright — e.g. History stays active on dataset/chat pages.
    const onHome = !!matchPath({ path: ROUTES.HOME, end: true }, location.pathname);
    if (!onHome) return true;

    const { param, value, defaultValue } = item.searchMatch;
    const current = searchParams.get(param) ?? defaultValue;
    return current === value;
  };

  return (
    <SidebarCard className={cn("p-1 md:px-1.5 md:py-2", className)}>
      {showLogo && (
        <Link
          to={logoLink}
          className="flex w-full gap-2 rounded-[18px] p-2 md:p-2.5 relative"
          aria-label="adaption home"
        >
          <LogoIcon svgClasses="size-4 md:size-auto shrink-0" />
          <LogoTextIcon svgClasses="absolute left-[35px] hidden md:group-data-[expanded=true]/sidebar:block shrink-0" />
        </Link>
      )}

      <div
        className={cn(
          "flex w-full flex-col gap-1.5",
          showLogo && "md:mt-1.5",
        )}
      >
        {menuItems.map((entry, index) =>
          isSection(entry) ? (
            <SidebarSectionGroup
              key={index}
              section={entry}
              isItemActive={isItemActive}
            />
          ) : (
            <SidebarItemLink
              key={index}
              item={entry}
              isActive={isItemActive(entry)}
            />
          ),
        )}
      </div>
    </SidebarCard>
  );
}

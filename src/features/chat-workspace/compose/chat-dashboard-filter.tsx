import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  chatDropdownMenuItemClasses,
  ChatDropdownMenu,
  ChatDropdownMenuContent,
  ChatDropdownMenuItem,
  ChatDropdownMenuSub,
  ChatDropdownMenuSubContent,
  ChatDropdownMenuSubTrigger,
  ChatDropdownMenuTrigger,
  ChatPillButton,
} from "@/services/chat";
import { AcademicEducationIcon } from "@/shared/assets/icons/domain/AcademicEducation";
import { ArtIcon } from "@/shared/assets/icons/domain/Art";
import { CultureIcon } from "@/shared/assets/icons/domain/Culture";
import { DesignIcon } from "@/shared/assets/icons/domain/Design";
import { MedicalIcon } from "@/shared/assets/icons/domain/Medical";
import { NewsIcon } from "@/shared/assets/icons/domain/News";
import { PersonalFinanceIcon } from "@/shared/assets/icons/domain/PersonalFinance";
import { TechnologyIcon } from "@/shared/assets/icons/domain/Technology";
import { FileIcon } from "@/shared/assets/icons/general/File";
import { FilterConeIcon } from "@/shared/assets/icons/general/FilterCone";
import { CheckIcon } from "@/shared/assets/icons/outlined/Check";
import { cn } from "@/shared/lib/css";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import type { CustomIconProps } from "@/shared/model/icon";
import { DATE_FILTER_PRESETS } from "../lib/date-filter-presets";
import { useDashboardFiltersStore } from "../model/dashboard-filters-store";
import { useChatDomainGroups } from "../model/use-chat-domain-groups";

type DomainIcon = (props: CustomIconProps) => React.ReactElement;

// Representative domain icon per backend group id (GET /chat/domain-groups).
const GROUP_ICON_BY_ID: Record<string, DomainIcon> = {
  arts: ArtIcon,
  finance: PersonalFinanceIcon,
  health: MedicalIcon,
  industry: DesignIcon,
  info: NewsIcon,
  learn: AcademicEducationIcon,
  life: CultureIcon,
  tech: TechnologyIcon,
};

const getDomainGroupIcon = (id: string): DomainIcon =>
  GROUP_ICON_BY_ID[id] ?? FileIcon;

const itemContentClasses = "flex w-full items-center gap-2";

function MobileFilterSubmenu({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <ChatDropdownMenu modal={false}>
      <ChatDropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            chatDropdownMenuItemClasses,
            itemContentClasses,
            "outline-hidden data-[state=open]:bg-gray-6",
          )}
        >
          <FileIcon
            svgClasses="size-4 shrink-0"
            pathClasses="stroke-icon-primary"
          />
          <span className="truncate">{label}</span>
          <ChevronRightIcon className="ml-auto size-4 shrink-0" />
        </button>
      </ChatDropdownMenuTrigger>
      <ChatDropdownMenuContent
        side="bottom"
        align="start"
        frameClassName="w-[240px]"
      >
        {children}
      </ChatDropdownMenuContent>
    </ChatDropdownMenu>
  );
}

export function ChatDashboardFilter() {
  const isMobile = useIsMobile();
  const { groups } = useChatDomainGroups();
  const filters = useDashboardFiltersStore((state) => state.filters);
  const toggleDomainGroup = useDashboardFiltersStore(
    (state) => state.toggleDomainGroup,
  );
  const toggleDatePreset = useDashboardFiltersStore(
    (state) => state.toggleDatePreset,
  );
  const clearFilters = useDashboardFiltersStore((state) => state.clear);

  const hasActiveFilter = Boolean(filters.domainGroup || filters.datePreset);

  const categoryItems = groups.map((group) => {
    const Icon = getDomainGroupIcon(group.id);
    const isActive = filters.domainGroup === group.id;

    return (
      <ChatDropdownMenuItem
        key={group.id}
        className={itemContentClasses}
        onSelect={() => toggleDomainGroup(group.id)}
      >
        <Icon svgClasses="size-4 shrink-0" pathClasses="stroke-icon-primary" />
        <span className="truncate">{group.title}</span>
        {isActive && (
          <CheckIcon
            svgClasses="ml-auto size-3 shrink-0"
            pathClasses="stroke-icon-primary"
          />
        )}
      </ChatDropdownMenuItem>
    );
  });

  const dateItems = DATE_FILTER_PRESETS.map((preset) => {
    const isActive = filters.datePreset === preset.id;

    return (
      <ChatDropdownMenuItem
        key={preset.id}
        className={itemContentClasses}
        onSelect={() => toggleDatePreset(preset.id)}
      >
        <span className="truncate">{preset.label}</span>
        {isActive && (
          <CheckIcon
            svgClasses="ml-auto size-3 shrink-0"
            pathClasses="stroke-icon-primary"
          />
        )}
      </ChatDropdownMenuItem>
    );
  });

  return (
    <ChatDropdownMenu>
      <ChatDropdownMenuTrigger asChild>
        <ChatPillButton
          shape="icon-sm"
          active={hasActiveFilter}
          aria-label="Filter folders"
          className="size-10 [--hairline-color:var(--color-gray-2)] [--hairline-opacity:1] [--hairline-scale:0.5]"
        >
          <FilterConeIcon className="w-3! h-2.5!" />
        </ChatPillButton>
      </ChatDropdownMenuTrigger>
      <ChatDropdownMenuContent
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
        frameClassName={isMobile ? "w-[240px]" : "w-[180px]"}
      >
        {isMobile ? (
          <>
            <MobileFilterSubmenu label="Category">
              {categoryItems}
            </MobileFilterSubmenu>
            <MobileFilterSubmenu label="Date Added">
              {dateItems}
            </MobileFilterSubmenu>
          </>
        ) : (
          <>
            <ChatDropdownMenuSub>
              <ChatDropdownMenuSubTrigger>
                <FileIcon
                  svgClasses="size-4 shrink-0"
                  pathClasses="stroke-icon-primary"
                />
                Category
              </ChatDropdownMenuSubTrigger>
              <ChatDropdownMenuSubContent frameClassName="w-[230px]">
                {categoryItems}
              </ChatDropdownMenuSubContent>
            </ChatDropdownMenuSub>

            <ChatDropdownMenuSub>
              <ChatDropdownMenuSubTrigger>
                <FileIcon
                  svgClasses="size-4 shrink-0"
                  pathClasses="stroke-icon-primary"
                />
                Date Added
              </ChatDropdownMenuSubTrigger>
              <ChatDropdownMenuSubContent frameClassName="w-[200px]">
                {dateItems}
              </ChatDropdownMenuSubContent>
            </ChatDropdownMenuSub>
          </>
        )}

        {hasActiveFilter && (
          <ChatDropdownMenuItem
            className={cn(itemContentClasses, "text-typography-secondary")}
            onSelect={clearFilters}
          >
            Clear filters
          </ChatDropdownMenuItem>
        )}
      </ChatDropdownMenuContent>
    </ChatDropdownMenu>
  );
}

import { Suspense, useMemo, useState } from "react";
import { useSessionStore } from "@/services/auth";
import { LocationWeatherWidget } from "@/services/internalization";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { isChatVisualizeEnabled } from "@/shared/model/feature-flag";
import { useSearchParamsTabs } from "@/shared/lib/react/use-search-params-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { Text } from "@/shared/ui/kit/text";
import { GradientText } from "@/shared/ui/gradient-text";
import { getCreatedAfterFromPreset } from "./lib/date-filter-presets";
import { useDashboardFiltersStore } from "./model/dashboard-filters-store";
import { ChatDashboardFilter } from "./compose/chat-dashboard-filter";
import {
  ChatDashboardFolders,
  ChatDashboardFolderCells,
} from "./compose/chat-dashboard-folders";
import {
  ChatFolderContent,
  ChatFolderContentCells,
} from "./compose/chat-folder-content";
import {
  ChatDashboardInterfaces,
  ChatDashboardInterfaceCells,
} from "./compose/chat-dashboard-interfaces";
import {
  DashboardVisualizationCells,
  DashboardVisualizationsGrid,
} from "./compose/chat-dashboard-visualizations";
import { ChatFolderSearch } from "./ui/chat-folder-search";
import {
  ChatFolderDashboardSkeletonCells,
  ChatInterfaceSkeletonCells,
  ChatSessionSkeletonCells,
  VisualizationSkeletonCells,
} from "./ui/dashboard-skeletons";

const CHAT_DASHBOARD_TAB_PARAM = "view";
const CHAT_DASHBOARD_TABS = {
  CONVERSATIONS: "conversations",
  INTERFACES: "interfaces",
  VISUALIZATIONS: "visualizations",
} as const;

function ChatDashboardPage() {
  const user = useSessionStore((state) => state.user);
  const displayName = user?.profile?.name ?? "Samuel";
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const datePreset = useDashboardFiltersStore(
    (state) => state.filters.datePreset,
  );
  const domainGroup = useDashboardFiltersStore(
    (state) => state.filters.domainGroup,
  );

  const isVisualizeEnabled = isChatVisualizeEnabled();
  const dashboardTabs = isVisualizeEnabled
    ? [
        CHAT_DASHBOARD_TABS.CONVERSATIONS,
        CHAT_DASHBOARD_TABS.INTERFACES,
        CHAT_DASHBOARD_TABS.VISUALIZATIONS,
      ]
    : [CHAT_DASHBOARD_TABS.CONVERSATIONS, CHAT_DASHBOARD_TABS.INTERFACES];

  const createdAfter = useMemo(
    () => (datePreset ? getCreatedAfterFromPreset(datePreset) : undefined),
    [datePreset],
  );
  const showSessions = search.trim().length > 0 || Boolean(createdAfter);

  const { tab, handleTabChange } = useSearchParamsTabs(
    dashboardTabs,
    CHAT_DASHBOARD_TABS.INTERFACES,
    CHAT_DASHBOARD_TAB_PARAM,
  );

  const hasFilters = tab !== CHAT_DASHBOARD_TABS.VISUALIZATIONS;

  const handleDashboardTabChange = (value: string) => {
    if (value === CHAT_DASHBOARD_TABS.VISUALIZATIONS) setSearch("");
    handleTabChange(value);
  };

  return (
    <div className="relative flex h-dvh w-full flex-col px-6.5 pb-12 pt-24 md:pt-[46px] md:h-screen md:px-[var(--sidebar-gutter)]">
      {!isMobile && <LocationWeatherWidget />}

      <Text variant="h1" as="h1" className="shrink-0 max-md:text-[32px]">
        Welcome back, <GradientText>{displayName}!</GradientText>
      </Text>

      <Tabs
        value={tab}
        onValueChange={handleDashboardTabChange}
        className="mx-auto flex w-full flex-1 flex-col items-center gap-7 overflow-hidden pt-12 md:w-[777px] md:pt-16"
      >
        <div className="flex w-full shrink-0 flex-wrap items-center justify-center gap-3">
          <TabsList variant="segment" size="md">
            <TabsTrigger value={CHAT_DASHBOARD_TABS.CONVERSATIONS}>
              Conversations
            </TabsTrigger>
            <TabsTrigger value={CHAT_DASHBOARD_TABS.INTERFACES}>
              Interfaces
            </TabsTrigger>
            {isVisualizeEnabled && (
              <TabsTrigger value={CHAT_DASHBOARD_TABS.VISUALIZATIONS}>
                Visualizations
              </TabsTrigger>
            )}
          </TabsList>

          {hasFilters && (
            <div className="flex h-10 items-center gap-3 md:gap-2">
              <ChatFolderSearch
                onSearch={setSearch}
                wrapperClassName="w-[200px] max-md:w-[160px]"
              />
              <ChatDashboardFilter />
            </div>
          )}
        </div>

        <TabsContent
          value={CHAT_DASHBOARD_TABS.CONVERSATIONS}
          className="w-full"
        >
          {showSessions ? (
            <ChatFolderContent>
              <Suspense fallback={<ChatSessionSkeletonCells />}>
                <ChatFolderContentCells q={search} createdAfter={createdAfter} />
              </Suspense>
            </ChatFolderContent>
          ) : (
            <ChatDashboardFolders>
              <Suspense fallback={<ChatFolderDashboardSkeletonCells />}>
                <ChatDashboardFolderCells />
              </Suspense>
            </ChatDashboardFolders>
          )}
        </TabsContent>

        <TabsContent value={CHAT_DASHBOARD_TABS.INTERFACES} className="w-full">
          <ChatDashboardInterfaces>
            <Suspense fallback={<ChatInterfaceSkeletonCells />}>
              <ChatDashboardInterfaceCells
                q={search}
                domainGroup={domainGroup}
                createdAfter={createdAfter}
              />
            </Suspense>
          </ChatDashboardInterfaces>
        </TabsContent>

        {isVisualizeEnabled && (
          <TabsContent
            value={CHAT_DASHBOARD_TABS.VISUALIZATIONS}
            className="w-full"
          >
            <DashboardVisualizationsGrid>
              <Suspense fallback={<VisualizationSkeletonCells />}>
                <DashboardVisualizationCells />
              </Suspense>
            </DashboardVisualizationsGrid>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export const Component = ChatDashboardPage;

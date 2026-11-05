import { NewChatView } from "@/features/chat";
import { DatasetsTableCompact } from "@/features/dataset-dashboard";
import { NewDatsetBuild } from "@/features/new-dataset";
import { useSessionStore } from "@/services/auth";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { useSearchParamsTabs } from "@/shared/lib/react/use-search-params-tabs";
import { HOME_TAB_PARAM, HOME_TABS } from "@/shared/model/routes";
import { GradientText } from "@/shared/ui/gradient-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { Text } from "@/shared/ui/kit/text";
import { Suspense } from "react";

function HomePage() {
  const displayName =
    useSessionStore((state) => state.user?.profile?.name) ?? "Sam";
  const isMobile = useIsMobile();
  const { tab, handleTabChange } = useSearchParamsTabs(
    [HOME_TABS.BUILD, HOME_TABS.CHAT],
    HOME_TABS.BUILD,
    HOME_TAB_PARAM,
  );

  if (isMobile) {
    return (
      <div className="flex h-dvh w-full flex-col px-4 pb-6">
        <NewChatView />
      </div>
    );
  }

  return (
    <Tabs
      value={tab}
      onValueChange={handleTabChange}
      className="h-screen w-full items-center px-6 pt-12 gap-10 overflow-hidden"
    >
      <TabsList variant="segment" size="md">
        <TabsTrigger value={HOME_TABS.BUILD}>Build</TabsTrigger>
        <TabsTrigger value={HOME_TABS.CHAT}>Chat</TabsTrigger>
      </TabsList>

      <Text variant="h1" as="h1" className="text-center">
        Welcome back, <GradientText>{displayName}!</GradientText>
      </Text>

      <TabsContent
        value={HOME_TABS.BUILD}
        className="flex flex-col items-center pb-12 gap-18 px-3 pt-3 -mx-3 -mt-3 w-full"
      >
        <NewDatsetBuild />
        <Suspense fallback={null}>
          <DatasetsTableCompact />
        </Suspense>
      </TabsContent>

      <TabsContent value={HOME_TABS.CHAT} className="px-3 -mx-3">
        <NewChatView />
      </TabsContent>
    </Tabs>
  );
}

export const Component = HomePage;

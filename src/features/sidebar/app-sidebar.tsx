import { BuildIcon } from "@/shared/assets/icons/general/Build";
import { ChartIcon } from "@/shared/assets/icons/general/Chart";
import { ChatIcon } from "@/shared/assets/icons/general/Chat";
import { ChatHistoryIcon } from "@/shared/assets/icons/general/ChatHistory";
import { DashboardIcon } from "@/shared/assets/icons/general/Dashboard";
import { LayoutIcon } from "@/shared/assets/icons/general/Layout";
import { isChatVisualizeEnabled } from "@/shared/model/feature-flag";
import {
  HOME_TAB_PARAM,
  HOME_TABS,
  homeTabPath,
  ROUTES,
} from "@/shared/model/routes";
import { SidebarLayout } from "@/shared/ui/kit/sidebar";
import {
  LayoutGrid,
  LayoutTemplate,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useMatch } from "react-router-dom";

import {
  SidebarNavigation,
  type MenuItem,
  type SidebarEntry,
} from "./compose/sidebar-navigation";
import { SidebarUserMenu } from "./compose/sidebar-user-menu";
import { cn } from "@/shared/lib/css";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { SidebarUserMenuMobile } from "./compose/sidebar-user-menu-mobile";

// Bubble 1 — the pharos-standard apps this fork inherits.
const pharosItems: MenuItem[] = [
  {
    title: "Build",
    url: homeTabPath(HOME_TABS.BUILD),
    matchPaths: [
      { path: ROUTES.HOME, end: true },
      { path: ROUTES.NEW_DATASET_ADAPT, end: false },
      { path: ROUTES.NEW_DATASET_INVENT, end: false },
      { path: ROUTES.NEW_DATASET_ID, end: false },
      { path: ROUTES.DATASET_FINETUNE, end: false },
      ROUTES.DATASET_AUTOSCIENTIST_DASHBOARD,
    ],
    searchMatch: {
      param: HOME_TAB_PARAM,
      value: HOME_TABS.BUILD,
      defaultValue: HOME_TABS.BUILD,
    },
    icon: <BuildIcon />,
  },
  {
    // The datasets Dashboard, restored from original pharos.
    title: "Dashboard",
    url: ROUTES.DATASETS,
    matchPaths: [ROUTES.DATASETS, { path: ROUTES.DASHBOARD_DATASET, end: true }],
    icon: <DashboardIcon />,
  },
  {
    // Chat Lab: the pharos chat surface powered by OpenAI, for iterating on chat.
    // The untouched pharos New Chat stays reachable from Archive → Chat.
    // Open chats highlight their own sub-item below it instead.
    title: "Chat",
    url: ROUTES.CHAT_LAB,
    matchPaths: [{ path: ROUTES.CHAT_LAB, end: true }],
    icon: <ChatIcon />,
  },
  ...(isChatVisualizeEnabled()
    ? [
        {
          title: "Visualize",
          url: ROUTES.CHAT_VISUALIZE,
          matchPaths: [
            { path: ROUTES.CHAT_VISUALIZE, end: true },
            { path: ROUTES.CHAT_VISUALIZE_SESSION, end: false },
          ],
          icon: <ChartIcon />,
        } satisfies MenuItem,
      ]
    : []),
  {
    title: "History",
    url: ROUTES.CHAT_FOLDERS,
    matchPaths: [
      ROUTES.CHAT_FOLDERS,
      { path: ROUTES.CHAT_FOLDER, end: false },
      { path: ROUTES.CHAT, end: false },
    ],
    excludePaths: [
      { path: ROUTES.CHAT_VISUALIZE, end: false },
      { path: ROUTES.NEW_CHAT_ORIGINAL, end: false },
    ],
    icon: <ChatHistoryIcon />,
  },
];

// The UI Kit reference — a developer tool.
const uiKitItem: MenuItem = {
  title: "UI Kit",
  url: ROUTES.UI_KIT,
  matchPaths: [{ path: ROUTES.UI_KIT, end: false }],
  icon: <LayoutIcon />,
};

// A gallery of common UI patterns built as small standalone demos.
const commonUiExamplesItem: MenuItem = {
  title: "Common UI Examples",
  url: ROUTES.COMMON_UI_EXAMPLES,
  matchPaths: [{ path: ROUTES.COMMON_UI_EXAMPLES, end: false }],
  icon: <LayoutTemplate className="size-5" />,
};

// The library of mini interface shells chat opens, at every size.
const interfaceLibraryItem: MenuItem = {
  title: "Interface library",
  url: ROUTES.INTERFACE_LIBRARY,
  matchPaths: [{ path: ROUTES.INTERFACE_LIBRARY, end: false }],
  icon: <LayoutGrid className="size-5" />,
};

// Bubble 3 — Tools, its own bubble holding a collapsible section.
const toolsItems: SidebarEntry[] = [
  {
    title: "Tools",
    icon: <Wrench className="size-5" />,
    items: [uiKitItem, commonUiExamplesItem, interfaceLibraryItem],
    // Collapsed by default — expand to reveal developer tools.
    defaultOpen: false,
  },
];



export function AppSidebar({ className }: { className?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  // New Chat is just the pharos bubble: the explorations below it stay hidden.
  const isNewChat = useMatch({ path: ROUTES.CHAT_LAB, end: false }) != null;

  return (
    // Minimized by default: the rail stays collapsed and expands on hover (or
    // while the user menu is open). Each SidebarNavigation is its own bubble;
    // the gap between them is the delineator.
    <SidebarLayout
      expanded={isMenuOpen}
      onMouseLeave={() => setIsMenuOpen(false)}
      className={cn(
        // On chat the rail runs the full height so the profile sits at the
        // bottom; the gap between stays click-through.
        isNewChat &&
          !isMobile &&
          "bottom-12 pointer-events-none [&>*]:pointer-events-auto",
        className,
      )}
    >
      <SidebarNavigation
        logoLink={isMobile ? ROUTES.DATASETS : ROUTES.HOME}
        menuItems={isMobile ? [] : pharosItems}
      />
      {!isMobile && !isNewChat && (
        <>
          <SidebarNavigation menuItems={toolsItems} showLogo={false} />
        </>
      )}
      {isMobile && <SidebarUserMenuMobile />}
      {!isMobile && (
        <div className={cn(isNewChat && "mt-auto")}>
          <SidebarUserMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} />
        </div>
      )}
    </SidebarLayout>
  );
}

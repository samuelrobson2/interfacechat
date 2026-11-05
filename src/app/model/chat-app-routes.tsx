import { isChatVisualizeEnabled } from "@/shared/model/feature-flag";
import { ROUTES } from "@/shared/model/routes";
import type { RouteObject } from "react-router-dom";

export const chatAppRoutes: RouteObject[] = [
  {
    path: ROUTES.CHAT_FOLDERS,
    lazy: () =>
      import("@/features/chat-workspace/chat-dashboard.page"),
  },
  {
    path: ROUTES.CHAT_FOLDER,
    lazy: () => import("@/features/chat-workspace/chat-folder.page"),
  },
  {
    path: ROUTES.CHAT_VISUALIZE,
    lazy: () =>
      isChatVisualizeEnabled()
        ? import("@/features/chat-visualize/new-visualize/new-visualize.page")
        : import("@/app/ui/not-found.page"),
  },
  {
    path: ROUTES.CHAT_VISUALIZE_SESSION,
    lazy: () =>
      isChatVisualizeEnabled()
        ? import("@/features/chat-visualize/visualize-chat/visualize-chat.page")
        : import("@/app/ui/not-found.page"),
  },
  {
    path: ROUTES.CHAT,
    lazy: () => import("@/features/chat/chat.page"),
  },
  {
    path: ROUTES.NEW_CHAT_ORIGINAL,
    lazy: () => import("@/features/chat-original/new-chat-original.page"),
  },
];

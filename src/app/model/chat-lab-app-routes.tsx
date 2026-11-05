import { protectedLoader } from "@/services/auth";
import { ROUTES } from "@/shared/model/routes";
import type { RouteObject } from "react-router-dom";

/** Empty matchers — the layout owns the UI so the page never remounts. */
function EmptyChatLabRoute() {
  return null;
}

export const chatLabAppRoutes: RouteObject[] = [
  {
    loader: protectedLoader,
    lazy: () => import("@/features/chat-lab/chat-lab-layout"),
    children: [
      {
        path: ROUTES.CHAT_LAB,
        Component: EmptyChatLabRoute,
      },
      {
        path: ROUTES.CHAT_LAB_SESSION,
        Component: EmptyChatLabRoute,
      },
    ],
  },
];

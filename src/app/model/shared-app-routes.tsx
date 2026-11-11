import { paymentLoader } from "@/services/payment";
import { ROUTES } from "@/shared/model/routes";
import type { RouteObject } from "react-router-dom";

// Settings routes shared across the whole app (previously duplicated per data/chat app).
export const sharedAppRoutes: RouteObject[] = [
  {
    index: true,
    lazy: () => import("@/app/ui/home.page"),
  },
  {
    path: ROUTES.USER_PROFILE,
    lazy: () => import("@/features/settings/user-profile.page"),
  },
  {
    path: ROUTES.SETTINGS,
    loader: paymentLoader("top-up"),
    lazy: () => import("@/features/settings/settings.page"),
  },
  {
    path: ROUTES.PLANS,
    loader: paymentLoader("plan"),
    lazy: () => import("@/features/settings/plans.page"),
  },
  {
    path: ROUTES.UI_KIT,
    lazy: () => import("@/features/ui-kit/ui-kit.layout"),
    children: [
      {
        index: true,
        lazy: () => import("@/features/ui-kit/pages/primitives.page"),
      },
      {
        path: "components",
        lazy: () => import("@/features/ui-kit/pages/components.page"),
      },
      {
        path: "icons",
        lazy: () => import("@/features/ui-kit/pages/icons.page"),
      },
      {
        path: "animated-icons",
        lazy: () => import("@/features/ui-kit/pages/animated-icons.page"),
      },
      {
        path: "colors",
        lazy: () => import("@/features/ui-kit/pages/colors.page"),
      },
      {
        path: "3d-images",
        lazy: () => import("@/features/ui-kit/pages/three-d-images.page"),
      },
      {
        path: "additions",
        lazy: () => import("@/features/ui-kit/pages/additions.page"),
      },
    ],
  },
  {
    path: ROUTES.INTERFACE_LIBRARY,
    lazy: () => import("@/features/interface-shells/interface-library.page"),
  },
  {
    path: ROUTES.INTERFACE_STATES,
    lazy: () => import("@/features/interface-shells/interface-states.page"),
  },
  {
    path: ROUTES.WORKBENCH,
    lazy: () => import("@/features/workbench/workbench.page"),
  },
  {
    path: ROUTES.COMMON_UI_EXAMPLES,
    lazy: () =>
      import("@/features/common-ui-examples/common-ui-examples.layout"),
    children: [
      {
        index: true,
        lazy: () => import("@/features/common-ui-examples/pages/index.page"),
      },
      {
        path: "document-analyser",
        lazy: () =>
          import("@/features/common-ui-examples/pages/document-analyser.page"),
      },
    ],
  },
];

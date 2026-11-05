import {
  createNewPasswordLoader,
  googleCallbackLoader,
  notifyEmailLoader,
  phoneOTPLoader,
  resetPasswordCheckEmailLoader,
  signUpPasswordLoader,
  verifyEmailloader,
} from "@/features/auth";
import { AppSidebar } from "@/features/sidebar";
import { protectedLoader, signinLoader } from "@/services/auth";
import { CONFIG } from "@/shared/model/config";
import { SidebarProvider } from "@/shared/ui/kit/sidebar";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { App } from "./app";
import { chatAppRoutes } from "./model/chat-app-routes";
import { chatLabAppRoutes } from "./model/chat-lab-app-routes";
import { dataAppRoutes } from "./model/data-app-routes";
import { sharedAppRoutes } from "./model/shared-app-routes";
import { Providers } from "./providers";
import { AppErrorBoundary, GlobalErrorBoundary } from "./ui/error-boundary";
import { ROUTER_BASENAME, ROUTES } from "@/shared/model/routes";

const maintenanceRoutes = [
  {
    element: (
      <Providers>
        <Outlet />
      </Providers>
    ),
    children: [
      {
        path: "*",
        lazy: () => import("@/app/ui/maintenance.page"),
      },
    ],
  },
];

const appRoutes = [
  {
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    ErrorBoundary: GlobalErrorBoundary,
    children: [
      // AUTH ROUTES
      {
        path: ROUTES.WELCOME,
        lazy: () => import("@/features/auth/welcome/welcome.page"),
      },
      {
        path: ROUTES.SIGNIN,
        loader: signinLoader,
        lazy: () => import("@/features/auth/email/signin.page"),
      },
      {
        path: ROUTES.SIGNUP_PASSWORD,
        loader: signUpPasswordLoader,
        lazy: () => import("@/features/auth/email/signup-password.page"),
      },
      {
        path: ROUTES.NOTIFY_EMAIL,
        loader: notifyEmailLoader,
        lazy: () => import("@/features/auth/email/notify-email.page"),
      },
      {
        path: ROUTES.VERIFY_EMAIL,
        loader: verifyEmailloader,
        lazy: () => import("@/features/auth/email/verify-email.page"),
      },
      {
        path: ROUTES.PHONE_AUTH,
        lazy: () => import("@/features/auth/phone/phone-auth.page"),
      },
      {
        path: ROUTES.PHONE_AUTH_OTP,
        loader: phoneOTPLoader,
        lazy: () => import("@/features/auth/phone/phone-otp.page"),
      },
      {
        path: ROUTES.GOOGLE_CALLBACK,
        loader: googleCallbackLoader,
        lazy: () => import("@/features/auth/google/google-callback.page"),
      },
      {
        path: ROUTES.SETUP_PROFILE,
        loader: protectedLoader,
        lazy: () => import("@/features/auth/setup/setup-profile.page"),
      },
      {
        path: ROUTES.RESET_PASSWORD,
        lazy: () =>
          import("@/features/auth/reset-password/reset-password.page"),
      },
      {
        path: ROUTES.RESET_PASSWORD_CHECK_EMAIL,
        loader: resetPasswordCheckEmailLoader,
        lazy: () =>
          import("@/features/auth/reset-password/reset-password-check-email.page"),
      },
      {
        path: ROUTES.CREATE_NEW_PASSWORD,
        loader: createNewPasswordLoader,
        lazy: () =>
          import("@/features/auth/reset-password/create-new-password.page"),
      },
      {
        path: ROUTES.CREATE_NEW_PASSWORD_SUCCESS,
        lazy: () =>
          import("@/features/auth/reset-password/create-new-password-success.page"),
      },
      {
        path: ROUTES.CREATE_NEW_PASSWORD_ERROR,
        lazy: () =>
          import("@/features/auth/reset-password/create-new-password-error.page"),
      },
      // UNIFIED APP ROUTES (homepage, datasets, chat) under a single sidebar
      {
        path: ROUTES.HOME,
        loader: protectedLoader,
        shouldRevalidate: () => false,
        element: (
          // The provider lets pages beneath follow the rail as it expands —
          // it renders no box of its own, only the shared expanded state.
          <SidebarProvider>
            <AppSidebar />
            <Outlet />
          </SidebarProvider>
        ),
        ErrorBoundary: AppErrorBoundary,
        children: [
          ...sharedAppRoutes,
          ...dataAppRoutes,
          ...chatAppRoutes,
          ...chatLabAppRoutes,
        ],
      },
      // NOT FOUND ROUTE
      {
        path: "*",
        lazy: () => import("@/app/ui/not-found.page"),
      },
    ],
  },
];

export const router = createBrowserRouter(
  CONFIG.MAINTENANCE_MODE_ENABLED === "true" ? maintenanceRoutes : appRoutes,
  { basename: ROUTER_BASENAME },
);

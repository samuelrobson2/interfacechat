import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { redirect, useNavigate } from "react-router-dom";
import { REDIRECT_AFTER_LOGIN_KEY } from "@/services/auth";
import { isMobileViewport, useIsMobile } from "@/shared/lib/react/use-mobile";

function isProfileComplete(user: ApiSchemas["UserResponse"]) {
  return (
    user.profile?.name &&
    user.profile?.languages?.length &&
    user.profile?.countries?.length &&
    user.profile?.domains?.length
  );
}

function popRedirectAfterLogin(): string {
  const path = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
  sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
  return path ?? ROUTES.HOME;
}

export function useNavigateAfterLogin() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (user: ApiSchemas["UserResponse"]) => {
    // Explicit login happened in this tab, so skip welcome overlay.
    sessionStorage.setItem("welcomeOverlayShown", "true");

    if (!isProfileComplete(user)) {
      navigate(ROUTES.SETUP_PROFILE);
      return;
    }

    // On mobile/below-md viewport always land on the datasets route.
    if (isMobile) {
      navigate(ROUTES.DATASETS);
      return;
    }

    navigate(popRedirectAfterLogin());
  };
}

export function redirectAfterLogin(user: ApiSchemas["UserResponse"]) {
  // Explicit login happened in this tab, so skip welcome overlay.
  sessionStorage.setItem("welcomeOverlayShown", "true");

  if (!isProfileComplete(user)) {
    return redirect(ROUTES.SETUP_PROFILE);
  }

  // On mobile/below-md viewport always land on the datasets route.
  if (isMobileViewport()) {
    return redirect(ROUTES.DATASETS);
  }

  return redirect(popRedirectAfterLogin());
}

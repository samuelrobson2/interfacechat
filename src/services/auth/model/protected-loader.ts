import { DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { ROUTER_BASENAME, ROUTES } from "@/shared/model/routes";
import type { LoaderFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";
import { identifyUser, useSessionStore } from "./session-store";

export const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";
const WELCOME_OVERLAY_SHOWN_KEY = "welcomeOverlayShown";

export async function protectedLoader({ request }: LoaderFunctionArgs) {
  // DEV-ONLY: skip the auth gate when VITE_AUTH_BYPASS=true (see .env.local).
  if (DEV_AUTH_BYPASS) {
    return null;
  }

  const accessToken = await useSessionStore.getState().getToken();
  const user = useSessionStore.getState().user;

  const { pathname, search } = new URL(request.url);
  const relativePath = pathname.replace(ROUTER_BASENAME, "") || "/";

  if (accessToken) {
    const welcomeShown =
      sessionStorage.getItem(WELCOME_OVERLAY_SHOWN_KEY) === "true";

    if (user) identifyUser(user);

    if (!welcomeShown) {
      sessionStorage.setItem(WELCOME_OVERLAY_SHOWN_KEY, "true");
      const searchParams = new URLSearchParams({
        to: `${relativePath}${search}`,
      });
      return redirect(`${ROUTES.WELCOME}?${searchParams.toString()}`);
    }

    return null;
  }

  sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, relativePath + search);
  return redirect(ROUTES.SIGNIN);
}

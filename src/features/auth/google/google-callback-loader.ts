import { useSessionStore } from "@/services/auth";
import { ROUTES } from "@/shared/model/routes";
import { redirect } from "react-router-dom";
import { redirectAfterLogin } from "../_model/navigate-after-login";

export async function googleCallbackLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get("token");

  if (!accessToken) throw redirect(ROUTES.SIGNIN);

  try {
    const user = await useSessionStore.getState().login(accessToken);

    if (!user) throw redirect(ROUTES.SIGNIN);

    return redirectAfterLogin(user);
  } catch {
    throw redirect(ROUTES.SIGNIN);
  }
}

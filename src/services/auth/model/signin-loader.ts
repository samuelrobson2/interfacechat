import { ROUTES } from "@/shared/model/routes";
import { redirect } from "react-router-dom";
import { useSessionStore } from "./session-store";

export async function signinLoader() {
  const accessToken = await useSessionStore.getState().getToken();
  if (!accessToken) return null;

  return redirect(ROUTES.HOME);
}

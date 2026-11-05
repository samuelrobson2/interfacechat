import { ROUTES } from "@/shared/model/routes";
import { redirect } from "react-router-dom";

export async function createNewPasswordLoader({
  request,
}: {
  request: Request;
}) {
  const url = new URL(request.url);
  const verificationToken = url.searchParams.get("token");

  if (!verificationToken) {
    throw redirect(ROUTES.RESET_PASSWORD);
  }

  return verificationToken;
}

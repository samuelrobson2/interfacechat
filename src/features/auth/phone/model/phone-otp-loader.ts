import { PHONE_REGEX } from "@/services/auth";
import { redirect } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";
import { z } from "zod";

export async function phoneOTPLoader({ request }: { request: Request }) {
  const phoneSchema = z.string().regex(PHONE_REGEX);
  const url = new URL(request.url);
  const phone = url.searchParams.get("phone");

  if (!phone || !phoneSchema.safeParse(phone).success) {
    throw redirect(ROUTES.PHONE_AUTH);
  }

  return phone;
}

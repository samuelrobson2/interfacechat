import { ROUTES } from "@/shared/model/routes";
import { redirect } from "react-router-dom";
import z from "zod";

export async function signUpPasswordLoader({ request }: { request: Request }) {
  const emailSchema = z.string().pipe(z.email());
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email || !emailSchema.safeParse(email).success) {
    throw redirect(ROUTES.SIGNIN);
  }

  return email;
}

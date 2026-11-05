import { publicFetchClient } from "@/shared/api/instance";
import { ROUTES } from "@/shared/model/routes";
import { redirect } from "react-router-dom";

export async function verifyEmailloader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const verificationToken = url.searchParams.get("verificationToken");

  if (!verificationToken) {
    throw redirect(ROUTES.SIGNIN);
  }

  try {
    const { data } = await publicFetchClient.POST("/auth/verify", {
      params: {
        query: {
          verificationToken: verificationToken,
        },
      },
    });
    return data;
  } catch {
    return null;
  }
}

import { useSessionStore } from "@/services/auth";
import type { ApiSchemas } from "@/shared/api/schema";
import { useNavigateAfterLogin } from "../../_model/navigate-after-login";

export function useLoginAfterVerify(
  data?: ApiSchemas["UserLoginResponeDto"] | null,
) {
  const login = useSessionStore((state) => state.login);
  const navigateAfterLogin = useNavigateAfterLogin();

  async function loginUser() {
    if (!data) return;
    const user = await login(data.access_token, data.user);

    if (!user) return;
    navigateAfterLogin(user);
  }

  return {
    loginUser,
    isVerified: !!data?.user,
  };
}

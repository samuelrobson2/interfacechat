import { useSessionStore } from "@/services/auth";
import { publicRqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { useNavigateAfterLogin } from "../../_model/navigate-after-login";
import { usePhoneStore } from "./phone-store";

export function usePhoneVerify() {
  const navigateAfterLogin = useNavigateAfterLogin();
  const login = useSessionStore((state) => state.login);
  const clearVerifyStarted = usePhoneStore((state) => state.clearVerifyStarted);
  const {
    mutate: verifyMutation,
    isPending,
    error,
  } = publicRqClient.useMutation("post", "/auth/login/phone/verify", {
    async onSuccess(data, variables) {
      const user = await login(data.access_token, data.user);
      clearVerifyStarted(variables.body.phone);

      if (!user) return;
      navigateAfterLogin(user);
    },
  });

  const phoneVerify = (data: ApiSchemas["LoginPhoneVerifyDto"]) => {
    verifyMutation({
      body: data,
      credentials: "include",
    });
  };

  return {
    phoneVerify,
    isPending,
    errorMessage: error?.message,
  };
}

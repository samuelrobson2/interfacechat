import { useSessionStore } from "@/services/auth";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { useTransition } from "react";

export function useChangePassword() {
  const [isPending, startTransition] = useTransition();
  const login = useSessionStore((state) => state.login);

  const {
    mutateAsync,
    error,
    isSuccess,
    reset,
  } = rqClient.useMutation("post", "/auth/inapp-reset-password");

  const changePassword = (
    data: ApiSchemas["PasswordResetWithTokenDto"],
    onSuccess?: () => void,
  ) => {
    startTransition(async () => {
      const response = await mutateAsync({
        body: data,
        credentials: "include",
      });
      await login(response.access_token, response.user);
      onSuccess?.();
    });
  };

  return {
    changePassword,
    isPending,
    isSuccess,
    errorMessage: error?.message.toString(),
    resetState: reset,
  };
}

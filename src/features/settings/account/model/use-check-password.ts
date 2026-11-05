import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { useState } from "react";

export function useCheckPassword() {
  const [token, setToken] = useState<string | null>(null);

  const {
    mutate: checkPasswordMutation,
    isPending,
    error,
    reset,
  } = rqClient.useMutation("post", "/auth/check-password", {
    onSuccess(data) {
      setToken(data.token);
    },
  });

  const checkPassword = (data: ApiSchemas["CheckCurrentPasswordDto"]) => {
    checkPasswordMutation({
      body: data,
      credentials: "include",
    });
  };

  const resetState = () => {
    reset();
    setToken(null);
  };

  return {
    checkPassword,
    token,
    isPending,
    errorMessage: error?.message.toString(),
    resetState,
  };
}

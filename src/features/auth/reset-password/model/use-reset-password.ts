import { publicRqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { href, useNavigate } from "react-router-dom";

export function useResetPassword() {
  const navigate = useNavigate();
  const {
    mutate: resetPasswordMutation,
    isPending,
    error,
    isError,
  } = publicRqClient.useMutation("post", "/auth/reset-password-request", {
    onSuccess(_, variables) {
      const queryParams = new URLSearchParams();
      queryParams.set("email", variables.body.email);

      navigate(
        `${href(ROUTES.RESET_PASSWORD_CHECK_EMAIL)}?${queryParams.toString()}`,
      );
    },
  });

  const resetPassword = (data: ApiSchemas["PasswordResetRequestDto"]) => {
    resetPasswordMutation({
      body: data,
    });
  };

  return {
    resetPassword,
    isPending,
    isError,
    errorMessage: error?.message,
  };
}

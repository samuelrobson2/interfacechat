import { publicRqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { useNavigate } from "react-router-dom";

export function useCreateNewPassword() {
  const navigate = useNavigate();
  const {
    mutate: createNewPasswordMutation,
    isPending,
    error,
    isError,
  } = publicRqClient.useMutation("post", "/auth/reset-password", {
    onSuccess() {
      navigate(ROUTES.CREATE_NEW_PASSWORD_SUCCESS);
    },
    onError(error) {
      if (error.statusCode === 401)
        navigate(ROUTES.CREATE_NEW_PASSWORD_ERROR);
    },
  });

  const createNewPassword = (
    data: ApiSchemas["PasswordResetDto"],
    verificationToken: string,
  ) => {
    createNewPasswordMutation({
      params: {
        query: {
          token: verificationToken,
        },
      },
      body: data,
    });
  };

  return {
    createNewPassword,
    isPending,
    isError,
    errorMessage: error?.message,
  };
}

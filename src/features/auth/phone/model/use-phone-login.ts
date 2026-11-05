import { publicRqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { href, useNavigate } from "react-router-dom";

export function usePhoneLogin() {
  const navigate = useNavigate();
  const {
    mutate: loginMutation,
    mutateAsync: loginMutationAsync,
    isPending,
    error,
  } = publicRqClient.useMutation("post", "/auth/login/phone", {
    onSuccess(_, variables) {
      const queryParams = new URLSearchParams();
      queryParams.set("phone", variables.body.phone);
  
      navigate(`${href(ROUTES.PHONE_AUTH_OTP)}?${queryParams.toString()}`);
    },
  });

  const phoneLogin = (data: ApiSchemas["LoginPhoneDto"]) => {
    loginMutation({
      body: data,
    });
  };

  const phoneLoginAsync = async (data: ApiSchemas["LoginPhoneDto"]) => {
    await loginMutationAsync({
      body: data,
    });
  };

  return {
    phoneLogin,
    phoneLoginAsync,
    isPending,
    errorMessage: error?.responseMessage || error?.message,
  };
}

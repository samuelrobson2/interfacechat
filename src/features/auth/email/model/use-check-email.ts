import { publicRqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { href, useNavigate } from "react-router-dom";

export function useCheckEmail() {
  const navigate = useNavigate();
  const {
    mutate: checkEmailMutation,
    isPending,
    error,
  } = publicRqClient.useMutation("post", "/auth/check-email", {
    onSuccess(data, variables) {
      if (!("isAvailable" in data) || !data.isAvailable) {
        throw new Error("Email already in use");
      }

      const queryParams = new URLSearchParams();
      queryParams.set("email", variables.body.email);
  
      navigate(`${href(ROUTES.SIGNUP_PASSWORD)}?${queryParams.toString()}`);
    },
  });

  const checkEmail = (data: ApiSchemas["CheckEmailDto"]) => {
    checkEmailMutation({
      body: data,
    });
  };

  return {
    checkEmail,
    isPending,
    errorMessage: error?.message,
  };
}

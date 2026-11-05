import { publicRqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES, TYPEFORM_LINK } from "@/shared/model/routes";
import { href, useNavigate } from "react-router-dom";

const BETA_ACCESS_REQUIRED_CODE = "BETA_ACCESS_REQUIRED";

type UseSignupOptions = {
  // Runs after a successful registration; navigation waits for it to resolve.
  onSuccess?: () => void | Promise<void>;
};

export function useSignup(options?: UseSignupOptions) {
  const navigate = useNavigate();
  const {
    mutate: registerMutation,
    isPending,
    error,
    isError,
  } = publicRqClient.useMutation("post", "/auth/register", {
    async onSuccess(_, variables) {
      await options?.onSuccess?.();

      const queryParams = new URLSearchParams();
      queryParams.set("email", variables.body.email);

      navigate(`${href(ROUTES.NOTIFY_EMAIL)}?${queryParams.toString()}`);
    },
  });

  const signUp = (data: ApiSchemas["RegisterDto"]) => {
    registerMutation({
      body: data,
    });
  };

  const errorLink =
    error?.code === BETA_ACCESS_REQUIRED_CODE ? TYPEFORM_LINK : undefined;

  return {
    signUp,
    isPending,
    isError,
    errorMessage: error?.responseMessage,
    errorLink,
  };
}

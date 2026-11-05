import { useSessionStore } from "@/services/auth";
import { publicRqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { useNavigateAfterLogin } from "../../_model/navigate-after-login";

type UseSigninOptions = {
  // Runs after a successful login; navigation waits for it to resolve.
  onSuccess?: (user: ApiSchemas["UserResponse"]) => void | Promise<void>;
};

export function useSignin(options?: UseSigninOptions) {
  const login = useSessionStore((state) => state.login);
  const navigateAfterLogin = useNavigateAfterLogin();
  const {
    mutate: loginMutation,
    isPending,
    error,
  } = publicRqClient.useMutation("post", "/auth/login", {
    async onSuccess(data) {
      const user = await login(data.access_token, data.user);

      if (!user) return;

      await options?.onSuccess?.(user);

      navigateAfterLogin(user);
    },
  });

  const signIn = (data: ApiSchemas["LoginDto"]) => {
    loginMutation({
      body: data,
      credentials: "include",
    });
  };

  const getErrorMessage = () => {
    if (error?.statusCode === 401) return "There is no account with those credentials";
    if (error?.statusCode === 403) return "Email not verified";

    return error?.message;
  };

  return {
    signIn,
    isPending,
    errorMessage: getErrorMessage(),
  };
}

import { useSessionStore } from "@/services/auth";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";

export function useUpdateProfile() {
  const user = useSessionStore((state) => state.user);
  const updateUser = useSessionStore((state) => state.updateUser);
  const {
    mutate: updateProfileMutation,
    isPending,
    error,
  } = rqClient.useMutation("patch", `/users/{id}/profile`, {
    onSuccess(data) {
      if (!user) return;
      updateUser({
        ...user,
        profile: data,
      });
    },
  });

  const updateProfile = (
    data: ApiSchemas["UpdateProfileDto"],
    onSuccess?: () => void,
    onError?: (error: string) => void,
  ) => {
    if (!user?.user_id) return;

    updateProfileMutation(
      {
        body: data,
        params: {
          path: {
            id: user.user_id,
          },
        },
      },
      {
        onSuccess,
        onError: (error) => onError?.(error.message.toString()),
      },
    );
  };

  return {
    updateProfile,
    isPending,
    errorMessage: error?.message.toString(),
  };
}

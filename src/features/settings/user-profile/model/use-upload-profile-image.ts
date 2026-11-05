import { getUser, useSessionStore } from "@/services/auth";
import { rqClient } from "@/shared/api/instance";

export function useUploadProfileImage() {
  const user = useSessionStore((state) => state.user);
  const updateUser = useSessionStore((state) => state.updateUser);

  const { mutate, isPending, error } = rqClient.useMutation(
    "post",
    "/users/{id}/profile-image",
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );

  const uploadProfileImage = (file: File) => {
    if (!user?.user_id) return;

    mutate(
      {
        body: {
          file: file as unknown as string,
        },
        params: {
          path: {
            id: user.user_id,
          },
        },
        bodySerializer: () => {
          const formData = new FormData();
          formData.append("file", file);
          return formData;
        },
      },
      {
        onSuccess: async () => {
          const newUser = await getUser(user.user_id);

          if (!newUser) return;
          updateUser(newUser);
        },
      },
    );
  };

  return {
    uploadProfileImage,
    isPending,
    errorMessage: error?.message,
  };
}

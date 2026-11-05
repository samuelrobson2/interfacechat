import { useSessionStore } from "@/services/auth";
import { rqClient } from "@/shared/api/instance";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";

export function useDeleteUser() {
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();

  const { mutate, isPending, error } = rqClient.useMutation(
    "delete",
    "/users/account",
    {
      onSuccess() {
        logout();
        navigate(ROUTES.SIGNIN);
      },
    },
  );

  const deleteUser = async () => {
    mutate({});
  };

  return {
    deleteUser,
    isPending,
    errorMessage: error?.message.toString(),
  };
}

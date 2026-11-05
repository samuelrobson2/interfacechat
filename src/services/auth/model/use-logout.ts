import { useSessionStore } from "@/services/auth";
import { publicRqClient } from "@/shared/api/instance";
import { ROUTES } from "@/shared/model/routes";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const logout = useSessionStore((state) => state.logout);
  const navigate = useNavigate();

  const { mutate: logoutMutation, isPending } = publicRqClient.useMutation(
    "post",
    "/auth/logout",
    {
      onSuccess() {
        logout();
        navigate(ROUTES.SIGNIN);
      },
    },
  );

  const handleLogout = () => {
    logoutMutation({
      credentials: 'include'
    });
  };

  return { handleLogout, isPending };
}

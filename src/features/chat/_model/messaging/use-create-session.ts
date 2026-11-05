import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { href, useNavigate } from "react-router-dom";
import { useNewChat } from "./use-new-chat";

export const useCreateChat = () => {
  const navigate = useNavigate();
  const { saveMessage } = useNewChat();
  const { mutate, isPending, error } = rqClient.useMutation(
    "post",
    "/chat/sessions",
  );

  const createChat = async (message: ApiSchemas["CreateUserMessageDto"]) => {
    mutate(
      {},
      {
        onSuccess: (data) => {
          saveMessage(message);
          navigate(href(ROUTES.CHAT, { chat_id: data.session_id }));
        },
      },
    );
  };

  return {
    createChat,
    isPending,
    error,
  };
};

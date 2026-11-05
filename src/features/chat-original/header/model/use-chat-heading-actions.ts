import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatQueryOptions } from "@/services/chat";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";

type ChatSession = ApiSchemas["ChatSessionDto"];
type PatchSessionBody = ApiSchemas["PatchSessionDto"];

type UseChatHeadingActionsParams = {
  sessionId?: string;
  title?: string | null;
  isFavorite?: boolean;
};

export type UseChatHeadingActionsResult = {
  isFavorite: boolean;
  isEditingTitle: boolean;
  startEditingTitle: () => void;
  stopEditingTitle: () => void;
  toggleFavorite: () => void;
  renameChat: (nextTitle: string) => void;
};

export function useChatHeadingActions({
  sessionId,
  title,
  isFavorite = false,
}: UseChatHeadingActionsParams): UseChatHeadingActionsResult {
  const queryClient = useQueryClient();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const { mutate } = rqClient.useMutation(
    "patch",
    "/chat/sessions/{sessionId}",
  );

  const patchSession = (body: PatchSessionBody) => {
    if (!sessionId) return;

    const sessionQueryKey = chatQueryOptions.session(sessionId).queryKey;

    // Optimistically reflect the change in the cached session.
    queryClient.setQueryData<ChatSession>(sessionQueryKey, (prev) =>
      prev ? { ...prev, ...body } : prev,
    );

    mutate(
      { params: { path: { sessionId } }, body },
      {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: sessionQueryKey });
        },
      },
    );
  };

  const toggleFavorite = () => patchSession({ is_favorite: !isFavorite });

  const renameChat = (nextTitle: string) => {
    setIsEditingTitle(false);

    const trimmed = nextTitle.trim();
    // Skip empty titles and no-op edits.
    if (!trimmed || trimmed === (title?.trim() ?? "")) return;

    patchSession({ title: trimmed });
  };

  return {
    isFavorite,
    isEditingTitle,
    startEditingTitle: () => setIsEditingTitle(true),
    stopEditingTitle: () => setIsEditingTitle(false),
    toggleFavorite,
    renameChat,
  };
}

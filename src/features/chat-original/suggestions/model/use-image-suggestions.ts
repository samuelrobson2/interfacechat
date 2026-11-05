import { fetchClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  imageSuggestionQueryKey,
  takeVisible,
} from "../lib/suggestions-cache";

// Image-highlight suggestions appear after the user draws a bbox on an image
// attachment. They are vision-conditioned edit prompts the user can apply to
// pre-fill the inline composer (and edit before submitting).
export const useHighlightImageSuggestions = ({
  attachmentId,
  bbox,
}: {
  attachmentId: string | undefined;
  bbox: ApiSchemas["HighlightImageBboxDto"] | null | undefined;
}) => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();

  const isEnabled = Boolean(chat_id && attachmentId && bbox);

  const { data, isFetching } = useQuery({
    // Use primitive bbox fields in the key so structural changes (new object
    // references with identical coords) reuse the cached entry.
    queryKey: [
      ...imageSuggestionQueryKey,
      chat_id,
      attachmentId,
      bbox?.x,
      bbox?.y,
      bbox?.width,
      bbox?.height,
    ],
    queryFn: async () => {
      const { data } = await fetchClient.POST(
        "/chat/sessions/{sessionId}/messages/highlight-image-suggestions",
        {
          params: { path: { sessionId: chat_id! } },
          body: {
            attachment_id: attachmentId!,
            bbox: bbox!,
          },
        },
      );
      return data!;
    },
    retry: false,
    staleTime: Infinity,
    enabled: isEnabled,
  });

  const suggestions = takeVisible(data?.suggestions);

  return { suggestions, isFetching, isEnabled };
};

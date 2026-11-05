import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { chatQueryOptions } from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import type { ImageItem } from "@/shared/ui/kit/images-viewer";

const isImageContentType = (contentType: string) =>
  contentType.startsWith("image/");

const isActiveAttachment = (attachment: ApiSchemas["ChatAttachmentDto"]) =>
  !attachment.superseded_at && !attachment.superseded_by_attachment_id;

// Backend returns file_name as "<name>.<ext>", strip the extension for display
const stripFileExtension = (fileName: string) =>
  fileName.replace(/\.[^/.]+$/, "");

// Read the optional metadata title used for comparison image card headers
const getAttachmentTitle = (
  attachment: ApiSchemas["ChatAttachmentDto"],
): string | undefined => {
  const title = attachment.metadata?.title;
  return title && title.length > 0 ? title : undefined;
};

export const useMessageImages = (
  sessionId: string | undefined,
  message: ApiSchemas["ChatMessageDto"],
  isVisible: boolean,
): ImageItem[] => {
  const imageAttachments = useMemo(
    () =>
      message.attachments.filter(
        (a) => isImageContentType(a.content_type) && isActiveAttachment(a),
      ),
    [message.attachments],
  );

  const queries = useQueries({
    queries: imageAttachments.map((attachment) => ({
      ...chatQueryOptions.attachmentDownloadUrl(
        sessionId ?? "",
        attachment.attachment_id,
      ),
      enabled: !!sessionId && isVisible,
      staleTime: 10 * 60 * 1000,
    })),
  });

  return useMemo(() => {
    return imageAttachments.map((attachment, index) => {
      const query = queries[index];
      const url = query?.data?.download_url;

      return {
        src: url ?? "",
        alt: stripFileExtension(attachment.file_name),
        title: getAttachmentTitle(attachment),
        isLoading: !url,
        attachmentId: attachment.attachment_id,
      };
    });
  }, [imageAttachments, queries]);
};

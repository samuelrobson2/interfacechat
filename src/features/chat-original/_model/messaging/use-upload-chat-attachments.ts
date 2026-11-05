import { rqClient } from "@/shared/api/instance";
import { useInputStore } from "../store/input-store";
import { useParams } from "react-router-dom";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import type { ApiSchemas } from "@/shared/api/schema";

export const CHAT_ALLOWED_ATTACHMENT_CONTENT_TYPES = [
  "text/plain",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

type AllowedContentType =
  (typeof CHAT_ALLOWED_ATTACHMENT_CONTENT_TYPES)[number];

export const uploadToS3 = async (presignedUrl: string, file: File): Promise<void> => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!response.ok) {
    throw new Error(`S3 upload failed with status: ${response.status}`);
  }
};

export const useUploadChatAttachments = (isNewChat: boolean) => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();

  const files = useInputStore((state) => state.files);
  const setFiles = useInputStore((state) => state.setFiles);
  const uploadedAttachments = useInputStore(
    (state) => state.uploadedAttachments,
  );
  const setUploadedAttachments = useInputStore(
    (state) => state.setUploadedAttachments,
  );
  const isUploadingAttachments = useInputStore(
    (state) => state.isUploadingAttachments,
  );
  const setIsUploadingAttachments = useInputStore(
    (state) => state.setIsUploadingAttachments,
  );

  const { mutateAsync: initiateAttachment } = rqClient.useMutation(
    "post",
    "/chat/sessions/{sessionId}/attachments/initiate",
  );

  const uploadFiles = async (
    sessionId: string,
    filesToUpload: Map<string, File>,
  ): Promise<ApiSchemas["CreateUserMessageAttachmentDto"][]> => {
    if (filesToUpload.size === 0) return [];

    const uploads = Array.from(filesToUpload.values()).map(async (file) => {
      const { upload_url, s3_key } = await initiateAttachment({
        params: { path: { sessionId } },
        body: {
          file_name: file.name,
          content_type: file.type as AllowedContentType,
        },
      });

      await uploadToS3(upload_url, file);

      return {
        s3_key,
        file_name: file.name,
        content_type: file.type as AllowedContentType,
      };
    });

    return Promise.all(uploads);
  };

  const handleFilesChange = async (newFiles: Map<string, File>) => {
    setFiles(newFiles);

    // For new chat (no sessionId yet), upload is deferred to checkPendingMessage
    if (isNewChat || !chat_id) return;

    const newlyAdded = Array.from(newFiles.entries()).filter(
      ([key]) => !files.has(key),
    );
    if (newlyAdded.length === 0) return;

    setIsUploadingAttachments(true);
    try {
      const results = await uploadFiles(chat_id, new Map(newlyAdded));

      const updated = new Map(uploadedAttachments);
      newlyAdded.forEach(([key], i) => {
        updated.set(key, results[i]!);
      });
      setUploadedAttachments(updated);
    } catch (err) {
      console.error("Failed to upload attachment:", err);
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  const handleRemoveFile = (fileKey: string) => {
    const updatedFiles = new Map(files);
    updatedFiles.delete(fileKey);
    setFiles(updatedFiles);

    const updatedUploaded = new Map(uploadedAttachments);
    updatedUploaded.delete(fileKey);
    setUploadedAttachments(updatedUploaded);
  };

  return {
    handleFilesChange,
    handleRemoveFile,
    isUploadingAttachments,
    uploadFiles,
  };
};

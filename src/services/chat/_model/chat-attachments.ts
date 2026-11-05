// Content types accepted as chat/model attachments. Shared across features so
// every attachment picker offers the same file types.
export const CHAT_ALLOWED_ATTACHMENT_CONTENT_TYPES = [
  "text/plain",
  "application/pdf",
  // Microsoft Word
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  // Microsoft Excel
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type ChatAttachmentContentType =
  (typeof CHAT_ALLOWED_ATTACHMENT_CONTENT_TYPES)[number];

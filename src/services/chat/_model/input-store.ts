import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ApiSchemas } from "@/shared/api/schema";

export type UploadedAttachment = ApiSchemas["CreateUserMessageAttachmentDto"];

interface InputState {
  message: string | undefined;
  files: Map<string, File>;
  uploadedAttachments: Map<string, UploadedAttachment>;
  isUploadingAttachments: boolean;
}

interface InputActions {
  setMessage: (message: string) => void;
  setFiles: (files: Map<string, File>) => void;
  setUploadedAttachments: (attachments: Map<string, UploadedAttachment>) => void;
  setIsUploadingAttachments: (isUploading: boolean) => void;
  reset: () => void;
}

type InputStore = InputState & InputActions;

export const useInputStore = create<InputStore>()(
  immer((set) => ({
    message: undefined,
    files: new Map<string, File>(),
    uploadedAttachments: new Map<string, UploadedAttachment>(),
    isUploadingAttachments: false,

    setMessage: (message) =>
      set((state) => {
        state.message = message;
      }),

    setFiles: (files) =>
      set((state) => {
        state.files = files;
      }),

    setUploadedAttachments: (attachments) =>
      set((state) => {
        state.uploadedAttachments = attachments;
      }),

    setIsUploadingAttachments: (isUploading) =>
      set((state) => {
        state.isUploadingAttachments = isUploading;
      }),

    reset: () =>
      set((state) => {
        state.message = undefined;
        state.files = new Map<string, File>();
        state.uploadedAttachments = new Map<string, UploadedAttachment>();
        state.isUploadingAttachments = false;
      }),
  })),
);

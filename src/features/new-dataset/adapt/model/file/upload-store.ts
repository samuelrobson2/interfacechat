import { create } from "zustand";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  files: File[] | null;
  filesProgress: Record<string, { name: string; progress: number }> | null;
}

interface UploadActions {
  setUploading: (isUploading: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setFiles: (files: File[] | null) => void;
  setFilesProgress: (
    filesProgress: Record<string, { name: string; progress: number }> | null,
  ) => void;
}

type UploadStore = UploadState & UploadActions;

const initialState: UploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  files: null,
  filesProgress: null,
};

export const useUploadStore = create<UploadStore>()((set) => ({
  ...initialState,

  setUploading: (isUploading) => set({ isUploading }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setFiles: (files) => set({ files }),
  setFilesProgress: (filesProgress) => set({ filesProgress }),
}));

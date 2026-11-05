import { useSessionStore } from "@/services/auth";
import { sleep } from "@/shared/lib/js";
import { CONFIG } from "@/shared/model/config";
import { useRef, useState } from "react";

export const JobState = {
  Waiting: "waiting",
  Active: "active",
  Completed: "completed",
  Failed: "failed",
  Delayed: "delayed",
  Paused: "paused",
  Stuck: "stuck",
  Unknown: "unknown",
} as const;

export type JobState = (typeof JobState)[keyof typeof JobState];

export const ProgressStage = {
  NotStarted: "not_started",
  Pending: "pending",
  Initializing: "initializing",
  CollectingFiles: "collecting_files",
  Uploading: "uploading",
  Completed: "completed",
} as const;

export type ProgressStage = (typeof ProgressStage)[keyof typeof ProgressStage];

export const FileStatus = {
  Pending: "pending",
  Downloading: "downloading",
  Uploading: "uploading",
  Completed: "completed",
  Failed: "failed",
} as const;

export type FileStatus = (typeof FileStatus)[keyof typeof FileStatus];

export interface FileProgress {
  status: FileStatus;
  progress: number;
  bytesUploaded: number;
  totalBytes: number;
  error_message?: string;
}

export interface Progress {
  stage: ProgressStage;
  error_message?: string;
  files: Record<string, FileProgress>;
  total: number;
  completed: number;
}

export interface DatasetUploadProgress {
  dataset_id: string;
  state: JobState;
  progress: Progress;
  is_progress_error?: boolean;
  error?: string;
}

function parseMessageBody(message: string) {
  try {
    return JSON.parse(message) as DatasetUploadProgress;
  } catch (error) {
    console.error("[SSE] Error parsing message body:", error);
    return null;
  }
}

function setAllToCompleted(currentFilesProgress: Record<string, FileProgress>) {
  return Object.keys(currentFilesProgress).reduce(
    (acc, filePath) => {
      const file = currentFilesProgress[filePath];
      if (file) {
        acc[filePath] = {
          status: FileStatus.Completed,
          progress: 100,
          bytesUploaded: file.totalBytes,
          totalBytes: file.totalBytes,
        };
      }
      return acc;
    },
    {} as Record<string, FileProgress>,
  );
}

export function useDatasetUploadProgress() {
  const getToken = useSessionStore((state) => state.getToken);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filesProgress, setFilesProgress] = useState<
    Record<string, FileProgress>
  >({});

  const eventSourceRef = useRef<EventSource | null>(null);

  async function handleDatasetUploadProgress(
    datasetId: string,
    onSuccess?: () => Promise<void>,
  ) {
    const accessToken = await getToken();

    return new Promise<void>((resolve, reject) => {
      if (!datasetId || !accessToken) return;

      const sseUrl = `${CONFIG.API_BASE_URL}/datasets/${datasetId}/upload/progress?token=${encodeURIComponent(accessToken)}`;
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("[SSE] Connection established successfully");
        setIsLoading(true);
        resolve();
      };

      eventSource.onmessage = async (event) => {
        const parsedData = parseMessageBody(event.data);

        if (!parsedData) return;

        if (parsedData.state === JobState.Completed) {
          setFilesProgress(setAllToCompleted);

          // Close immediately to prevent auto-reconnect during async operations
          eventSource.close();

          await sleep(1500);
          await onSuccess?.();
          setIsLoading(false);

          return;
        }

        if (parsedData.state === JobState.Failed) {
          if (parsedData.is_progress_error) {
            setError(parsedData.error || "An unknown error occurred");
          } else {
            setError(
              parsedData.progress?.error_message || "An unknown error occurred",
            );
          }

          setIsLoading(false);

          eventSource.close();
          return;
        }

        if (Object.keys(parsedData.progress?.files).length === 0) return;

        setFilesProgress(parsedData.progress?.files);
      };

      eventSource.onerror = (error) => {
        console.error("[SSE] Connection error:", error);
        console.log("[SSE] ReadyState:", eventSource.readyState);

        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("[SSE] Connection closed");

          reject();
          setIsLoading(false);
          setError("Connection closed");
          eventSource.close();
        }
      };
    });
  }

  return {
    isLoading,
    filesProgress,
    error,
    handleDatasetUploadProgress,
    reset: () => {
      eventSourceRef.current?.close();
      setIsLoading(false);
      setError(null);
      setFilesProgress({});
    },
  };
}

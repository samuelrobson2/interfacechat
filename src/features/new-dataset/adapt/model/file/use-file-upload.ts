import type { components } from "@/shared/api/schema/generated";
import { isApiError } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { useAdaptReturn } from "../use-adapt-return";
import { useUploadStore } from "./upload-store";

type FileFormat = components["schemas"]["FileFormatEnum"];

const BATCH_MAX_FILES = 1000;

const mimeTypeMap: Record<string, FileFormat> = {
  "application/json": "json",
  "text/json": "json",
  "text/csv": "csv",
  "application/csv": "csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/pdf": "pdf",
  "text/html": "html",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/parquet": "parquet",
  "application/x-parquet": "parquet",
  "application/vnd.apache.parquet": "parquet",
  "application/x-ndjson": "jsonl",
  "application/jsonl": "jsonl",
  "text/plain": "txt",
};

const allowedExtensions = new Set<string>([
  "csv",
  "json",
  "jsonl",
  "parquet",
  "pdf",
  "docx",
  "pptx",
  "xlsx",
  "html",
  "zip",
  "txt",
]);

// Convert MIME type to file format extension
function getFileFormat(file: File): FileFormat {
  const fromMime = file.type && mimeTypeMap[file.type];
  if (fromMime) return fromMime;

  const extension = file.name.toLowerCase().split(".").pop();
  if (extension === "htm") return "html";
  if (extension && allowedExtensions.has(extension)) {
    return extension as FileFormat;
  }

  return "json";
}

function batchDatasetName(files: File[]): string {
  const first = files[0]!;
  if (files.length === 1) return first.name;
  const dot = first.name.lastIndexOf(".");
  const base =
    dot > 0 ? first.name.slice(0, dot) : first.name;
  return `${base} (${files.length} files)`;
}

export function useFileUpload() {
  const { navigateAfterUpload } = useAdaptReturn();
  const isUploading = useUploadStore((state) => state.isUploading);
  const progress = useUploadStore((state) => state.progress);
  const error = useUploadStore((state) => state.error);
  const files = useUploadStore((state) => state.files);
  const filesProgress = useUploadStore((state) => state.filesProgress);
  const setUploading = useUploadStore((state) => state.setUploading);
  const setProgress = useUploadStore((state) => state.setProgress);
  const setError = useUploadStore((state) => state.setError);
  const setFiles = useUploadStore((state) => state.setFiles);
  const setFilesProgress = useUploadStore((state) => state.setFilesProgress);

  const { mutateAsync: uploadInitiateMutation } = rqClient.useMutation(
    "post",
    "/datasets/upload/initiate",
  );

  const { mutateAsync: uploadCompleteMutation } = rqClient.useMutation(
    "post",
    "/datasets/upload/complete",
  );
  const { mutateAsync: initiateBatchMutation } = rqClient.useMutation(
    "post",
    "/datasets/upload/initiate-batch",
  );
  const { mutateAsync: completeBatchMutation } = rqClient.useMutation(
    "post",
    "/datasets/upload/complete-batch",
  );

  const uploadToS3 = async (
    presignedUrl: string,
    file: File,
    onProgressInFile?: (percent: number) => void,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgressInFile?.(pct);
        }
      });

      // Handle successful upload
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      // Handle network errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"));
      });

      // Configure and send request
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.send(file);
    });
  };

  const uploadSingleFile = async (file: File) => {
    // Step 1: Initiate upload and get presigned URL
    const { upload_url } = await uploadInitiateMutation({
      body: {
        name: file.name,
        file_format: getFileFormat(file),
      },
    });

    if (!upload_url) throw new Error("Upload URL not received from server");

    // Step 2: Upload file to S3 using presigned URL
    await uploadToS3(upload_url, file, (pct) => setProgress(pct));

    // Step 3: Complete the upload
    const s3_key = new URL(upload_url).pathname.slice(1);
    const { dataset_id } = await uploadCompleteMutation({
      body: {
        s3_key,
        name: file.name,
        file_format: getFileFormat(file),
        file_size_bytes: file.size,
      },
    });

    return dataset_id;
  };

  const uploadBatchFiles = async (batchFiles: File[]) => {
    const { dataset_id, uploads } = await initiateBatchMutation({
      body: {
        name: batchDatasetName(batchFiles),
        files: batchFiles.map((f) => ({
          file_name: f.name,
          file_format: getFileFormat(f),
          file_size_bytes: f.size,
        })),
      },
    });

    if (!uploads?.length) throw new Error("No upload URLs from initiate-batch");

    if (uploads.length !== batchFiles.length) {
      throw new Error("Upload list length does not match selected files");
    }

    const progressByS3Key = uploads.reduce(
      (acc, row) => {
        acc[row.s3_key] = {
          name: row.file_name,
          progress: 0,
        };
        return acc;
      },
      {} as Record<string, { name: string; progress: number }>,
    );
    setFilesProgress(progressByS3Key);

    const total = uploads.length;
    await Promise.all(
      uploads.map(async (row, i) => {
        const file = batchFiles[i]!;
        await uploadToS3(row.upload_url, file, (pctInFile) => {
          progressByS3Key[row.s3_key] = {
            name: row.file_name,
            progress: pctInFile,
          };
          setFilesProgress({ ...progressByS3Key });

          const overall =
            Object.values(progressByS3Key).reduce(
              (sum, item) => sum + item.progress,
              0,
            ) / total;
          setProgress(Math.round(Math.min(100, overall)));
        });
      }),
    );

    setProgress(100);
    setFilesProgress(
      Object.fromEntries(
        Object.entries(progressByS3Key).map(([key, value]) => [
          key,
          { ...value, progress: 100 },
        ]),
      ),
    );

    const completeResult = await completeBatchMutation({
      body: {
        dataset_id,
        files: uploads.map((u, i) => {
          const file = batchFiles[i]!;
          return {
            s3_key: u.s3_key,
            file_name: u.file_name,
            file_format: getFileFormat(file),
            file_size_bytes: file.size,
          };
        }),
      },
    });

    return completeResult.dataset_id;
  };

  const uploadFiles = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const capped =
      acceptedFiles.length > BATCH_MAX_FILES
        ? acceptedFiles.slice(0, BATCH_MAX_FILES)
        : acceptedFiles;

    try {
      setFiles(null);
      setUploading(true);
      setProgress(0);
      setError(null);
      setFiles(capped);
      setFilesProgress(null);

      const dataset_id =
        capped.length === 1
          ? await uploadSingleFile(capped[0]!)
          : await uploadBatchFiles(capped);

      setUploading(false);
      navigateAfterUpload(dataset_id);
    } catch (err) {
      console.error("Upload error:", err);
      if (isApiError(err)) {
        setError(err.error || err.message);
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setUploading(false);
      setFiles(null);
      setFilesProgress(null);
    }
  };

  const removeFile = () => {
    setFiles(null);
    setProgress(0);
    setError(null);
    setFilesProgress(null);
  };

  return {
    uploadFiles,
    removeFile,
    setError,
    isUploading,
    progress,
    filesProgress,
    error,
    files,
  };
}

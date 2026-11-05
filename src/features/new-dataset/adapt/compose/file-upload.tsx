import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  DropzoneError,
  DropzoneUploading,
} from "@/shared/ui/kit/dropzone";
import { Dialog, DialogContent } from "@/shared/ui/kit/dialog";
import { FileStatus } from "../model/link/use-dataset-upload-progress";
import { useFileUpload } from "../model/file/use-file-upload";
import { LinkImportDatasetDialogProgress } from "../ui/link-import-dataset-dialog-progress";

/** Matches `InitiateBatchDto.files.maxItems` in API schema */
const BATCH_MAX_FILES = 1000;

export function FileUpload() {
  const {
    uploadFiles,
    setError,
    isUploading,
    progress,
    filesProgress,
    error,
    files,
  } =
    useFileUpload();

  const handleDrop = async (accepted: File[]) => {
    await uploadFiles(accepted);
  };

  const isMultiFileProgressOpen =
    isUploading &&
    !!filesProgress &&
    Object.keys(filesProgress).length > 1;
  const normalizedFilesProgress = Object.fromEntries(
    Object.entries(filesProgress ?? {}).map(([, item]) => [
      item.name,
      {
        status:
          item.progress >= 100 ? FileStatus.Completed : FileStatus.Uploading,
        progress: item.progress,
        bytesUploaded: 0,
        totalBytes: 0,
      },
    ]),
  );

  return (
    <>
      <Dropzone
        className="h-[308px]"
        accept={{
          "application/json": [".json"],
          "text/json": [".json"],
          "text/csv": [".csv"],
          "application/csv": [".csv"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            [".docx"],
          "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            [".pptx"],
          "application/pdf": [".pdf"],
          "text/html": [".html", ".htm"],
          "application/zip": [".zip"],
          "application/x-zip-compressed": [".zip"],
          "application/parquet": [".parquet"],
          "application/x-parquet": [".parquet"],
          "application/vnd.apache.parquet": [".parquet"],
          "application/x-ndjson": [".jsonl"],
          "application/jsonl": [".jsonl"],
          "text/plain": [".txt"],
          "": [".jsonl"],
        }}
        maxFiles={BATCH_MAX_FILES}
        onDrop={handleDrop}
        onError={(err) => setError(err.message)}
        src={files ?? undefined}
        uploading={isUploading}
        isError={!!error}
      >
        <DropzoneEmptyState caption="CSV, JSON, JSONL, Parquet, PDF, DOCX, PPTX, XLSX, HTML, ZIP, TXT files" />
        <DropzoneContent />
        <DropzoneUploading progress={progress} />
        <DropzoneError
          title="Dataset upload failed"
          caption={error || "Please check the file and try again"}
        />
      </Dropzone>

      <Dialog open={isMultiFileProgressOpen}>
        <DialogContent
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <LinkImportDatasetDialogProgress
            filesProgress={normalizedFilesProgress}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

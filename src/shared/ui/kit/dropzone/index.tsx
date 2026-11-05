import { UploadIcon } from "@/shared/assets/icons/outlined/Upload";
import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import Lottie from "lottie-react";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { DropEvent, DropzoneOptions, FileRejection } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { FileUploadedItem } from "../file-upload";
import { Card } from "../card";

type DropzoneContextType = {
  src?: File[];
  isError?: boolean;
  uploading?: boolean;
  accept?: DropzoneOptions["accept"];
  maxSize?: DropzoneOptions["maxSize"];
  minSize?: DropzoneOptions["minSize"];
  maxFiles?: DropzoneOptions["maxFiles"];
};

const DropzoneContext = createContext<DropzoneContextType | undefined>(
  undefined,
);

type DropzoneProps = Omit<DropzoneOptions, "onDrop"> & {
  src?: File[];
  isError?: boolean;
  uploading?: boolean;
  className?: string;
  onDrop?: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent,
  ) => void;
  children?: ReactNode;
};

export const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  isError,
  uploading,
  className,
  children,
  ...props
}: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onError,
    disabled,
    onDrop: (acceptedFiles, fileRejections, event) => {
      if (fileRejections.length > 0) {
        const message = fileRejections.at(0)?.errors.at(0)?.message;
        onError?.(new Error(message));
        return;
      }

      onDrop?.(acceptedFiles, fileRejections, event);
    },
    ...props,
  });

  return (
    <DropzoneContext.Provider
      key={JSON.stringify(src)}
      value={{ src, accept, maxSize, minSize, maxFiles, uploading, isError }}
    >
      <Card
        className={cn(
          "justify-center items-center relative w-full px-10 py-6",
          isDragActive && "bg-blue-1",
          className,
        )}
        {...((!src || isError) && !uploading ? getRootProps() : {})}
      >
        <input {...getInputProps()} disabled={disabled} />
        {children}
      </Card>
    </DropzoneContext.Provider>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);

  if (!context) {
    throw new Error("useDropzoneContext must be used within a Dropzone");
  }

  return context;
};

type DropzoneContentProps = {
  children?: ReactNode;
  className?: string;
  onRemove?: () => void;
};

export const DropzoneContent = ({
  children,
  className,
  onRemove,
}: DropzoneContentProps) => {
  const { src, uploading, isError } = useDropzoneContext();

  if (!src || uploading || isError) return null;

  if (children) return children;

  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-6",
        className,
      )}
    >
      {/* File container with remove button */}
      <FileUploadedItem onRemove={onRemove} className={className} files={src} />

      {/* Success text */}
      <Text variant="title">Upload completed</Text>
    </div>
  );
};

type DropzoneEmptyStateProps = {
  children?: ReactNode;
  caption?: string;
  className?: string;
};

export const DropzoneEmptyState = ({
  children,
  caption,
  className,
}: DropzoneEmptyStateProps) => {
  const { src, isError, uploading } = useDropzoneContext();

  if (src || isError || uploading) return null;

  if (children) return children;

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Large upload icon */}
      <UploadIcon className="size-15" />

      <div className="flex flex-col items-center gap-6">
        {/* Text content */}
        <div className="flex flex-col items-center gap-2">
          <Text variant="title">Drag & drop files to upload</Text>
          {caption && <Text color="secondary">{caption}</Text>}
        </div>

        {/* Browse file button */}
        <Button className="w-fit" variant="primary" size="48" type="button">
          Browse file
        </Button>
      </div>
    </div>
  );
};

type DropzoneUploadingProps = {
  children?: ReactNode;
  progress: number;
  className?: string;
};

export const DropzoneUploading = ({
  children,
  progress,
  className,
}: DropzoneUploadingProps) => {
  const { uploading, isError } = useDropzoneContext();

  // Show while uploading even when `src` lists the files being uploaded (store sets files before PUT).
  if (!uploading || isError) return null;

  if (children) return children;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      {/* Animated loader icon */}
      <Lottie
        className="size-20"
        animationData={loadingBlackAnimation}
        loop={true}
      />

      {/* Progress percentage and text */}
      <div className="flex flex-col items-center gap-2">
        <Text variant="h1">{progress}%</Text>
        <Text color="secondary">Uploading dataset</Text>
      </div>
    </div>
  );
};

type DropzoneErrorProps = {
  children?: ReactNode;
  title?: string;
  caption?: string;
  className?: string;
};

export const DropzoneError = ({
  children,
  title,
  caption,
  className,
}: DropzoneErrorProps) => {
  const { isError } = useDropzoneContext();

  if (!isError) return null;

  if (children) return children;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Large upload icon */}
      <UploadIcon className="size-15" pathClasses="stroke-red-5" />

      <div className="flex flex-col items-center gap-2 mt-6">
        {/* Text content */}
        <Text variant="title" color="error">
          {title}
        </Text>
        {caption && <Text color="error">{caption}</Text>}
      </div>

      <Button size="48" type="button" className="mt-6">
        Upload again
      </Button>
    </div>
  );
};

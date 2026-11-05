"use client";

import { FileFilledIcon } from "@/shared/assets/icons/general/FileFilled";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { UploadIcon } from "@/shared/assets/icons/outlined/Upload";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import type { ReactNode } from "react";
import * as React from "react";
import { createContext, useContext, useId } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { Badge } from "../badge";
import { TruncatedText } from "../truncated-text";
import { PlusSmallIcon } from "../../../assets/icons/outlined/PlusSmall";

// Context type for file upload state
type FileUploadContextType = {
  files?: Map<string, File>;
};

const FileUploadContext = createContext<FileUploadContextType | undefined>(
  undefined,
);

// Hook to access file upload context
const useFileUploadContext = () => {
  const context = useContext(FileUploadContext);

  if (!context) {
    throw new Error("useFileUploadContext must be used within a FileUpload");
  }

  return context;
};

const handleFileChange = (
  fileList: FileList | null,
  maxFiles: number,
  files?: Map<string, File>,
  onChange?: (files: Map<string, File>) => void,
) => {
  if (!fileList || fileList.length === 0) return;

  const newFiles = Array.from(fileList);
  const availableSlots = maxFiles - (files?.size ?? 0);

  if (availableSlots > 0) {
    const filesToAdd = newFiles.slice(0, availableSlots);
    const updatedFiles = new Map(files);

    filesToAdd.forEach((file) => {
      const key = `${file.name}-${file.size}`;
      updatedFiles.set(key, file);
    });

    onChange?.(updatedFiles);
  }
};

// Main FileUpload component with provider
type FileUploadProps = {
  files?: Map<string, File>;
  className?: string;
  children?: ReactNode;
};

export const FileUpload = ({ files, className, children }: FileUploadProps) => {
  return (
    <FileUploadContext.Provider value={{ files }}>
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    </FileUploadContext.Provider>
  );
};

// Trigger component for file selection
type FileUploadTriggerProps = Omit<
  React.ComponentProps<"input">,
  "onChange"
> & {
  onChange?: (files: Map<string, File>) => void;
  maxFiles?: number;
  className?: string;
  children?: ReactNode;
};

export const FileUploadTrigger = ({
  className,
  children,
  onChange,
  maxFiles = 3,
  ...props
}: FileUploadTriggerProps) => {
  const { files } = useFileUploadContext();
  const inputId = useId();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files, maxFiles, files, onChange);
    e.target.value = "";
  };

  if (files && files.size > 0) return null;

  return (
    <label
      data-slot="file-upload-trigger"
      className={cn(
        "cursor-pointer inline-flex items-center gap-2",
        "hover:opacity-80 active:opacity-60",
        props?.disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        type="file"
        onChange={handleInputChange}
        className="sr-only"
        {...props}
      />
      {children || (
        <>
          <UploadIcon className="size-5" pathClasses="stroke-icon-primary" />
          <Text>Upload file</Text>
        </>
      )}
    </label>
  );
};

// Content wrapper component for displaying uploaded files
type FileUploadContentProps = {
  children?: ReactNode;
  onRemove?: () => void;
  className?: string;
};

export const FileUploadContent = ({
  children,
  onRemove,
  className,
}: FileUploadContentProps) => {
  const { files } = useFileUploadContext();

  if (!files || files.size === 0) return null;

  if (children) return <>{children}</>;

  return (
    <FileUploadedItem
      className={className}
      files={Array.from(files.values())}
      onRemove={onRemove}
    />
  );
};

const maxLabelItems = 3;

// Reusable file item component (can be used in dropzone as well)
export function FileUploadedItem({
  className,
  files,
  onRemove,
  ...props
}: React.ComponentProps<"div"> & {
  files: File[];
  onRemove?: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRemove?.();
    }
  };

  const fileName =
    files.length > maxLabelItems
      ? `${new Intl.ListFormat("en").format(
          files.slice(0, maxLabelItems).map((file) => file.name),
        )} and ${files.length - maxLabelItems} more`
      : new Intl.ListFormat("en").format(files.map((file) => file.name));

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-[16px] bg-background-secondary p-4",
        className,
      )}
      {...props}
    >
      {/* File icon */}
      <FileFilledIcon className="size-15" pathClasses="fill-icon-primary" />

      {/* File name */}
      <Text color="secondary" className="truncate w-full">
        {fileName}
      </Text>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          onKeyDown={handleKeyDown}
          className={cn([
            "absolute cursor-pointer -top-3 -right-3 flex items-center gap-2",
            "rounded-full p-2 border border-stroke-secondary",
            "shadow-inset-default bg-background-primary",
          ])}
          type="button"
          aria-label={`Remove ${fileName}`}
        >
          <CrossLargeIcon
            className="size-4"
            pathClasses="stroke-icon-primary"
          />
        </button>
      )}
    </div>
  );
}

// Attachment trigger component for inline file upload (icon button style)
type FileUploadAttachmentTriggerProps = Omit<
  React.ComponentProps<"input">,
  "onChange"
> & {
  onChange?: (files: Map<string, File>) => void;
  maxFiles?: number;
  className?: string;
  tooltipContent?: React.ReactNode;
};

export const FileUploadAttachmentTrigger = ({
  className,
  onChange,
  maxFiles = 3,
  tooltipContent,
  ...props
}: FileUploadAttachmentTriggerProps) => {
  const { files } = useFileUploadContext();
  const inputId = useId();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files, maxFiles, files, onChange);
    e.target.value = "";
  };

  const content = (
    <label
      data-slot="file-upload-attachment-trigger"
      className={cn(
        "cursor-pointer inline-flex items-center justify-center w-10 h-11.5",
        props?.disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      htmlFor={inputId}
      tabIndex={0}
      aria-label="Attach file"
    >
      <input
        id={inputId}
        type="file"
        onChange={handleInputChange}
        className="sr-only"
        {...props}
      />
      <PlusSmallIcon className="size-20" pathClasses="stroke-current" />
    </label>
  );

  if (tooltipContent) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom">{tooltipContent}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

type FileUploadAttachmentContentProps = {
  fileKey?: string;
  onRemove?: (fileKey: string) => void;
  className?: string;
  textClassName?: string;
  file?: File;
};

export const FileUploadAttachmentContent = ({
  fileKey,
  onRemove,
  className,
  textClassName,
  file,
}: FileUploadAttachmentContentProps) => {
  if (!file || !fileKey) return null;

  const fileName = file.name || "";

  return (
    <Badge
      className={cn(className)}
      closable
      closeIconClassName="text-icon-primary"
      onClose={() => onRemove?.(fileKey)}
    >
      <FileFilledIcon className="size-6" pathClasses="fill-icon-primary" />

      <TruncatedText
        className={cn("whitespace-nowrap max-w-[110px]", textClassName)}
      >
        {fileName}
      </TruncatedText>
    </Badge>
  );
};

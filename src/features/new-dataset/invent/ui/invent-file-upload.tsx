import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/ui/kit/command";
import {
  FileUpload,
  FileUploadAttachmentContent,
  FileUploadAttachmentTrigger,
} from "@/shared/ui/kit/file-upload";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";

export function InventFileUpload({
  files,
  multiline,
  maxFiles,
  setFiles,
  removeFile,
}: {
  files: Map<string, File>;
  multiline: boolean;
  maxFiles: number;
  setFiles: (files: Map<string, File>) => void;
  removeFile: (fileKey: string) => void;
}) {
  const firstFile = files.entries().next().value;
  const showMore = files.size > 1;
  const restFiles = Array.from(files.entries()).slice(1);

  return (
    <FileUpload
      files={files}
      className={cn(
        "flex-row items-center gap-1.5 mr-1.5",
        multiline && "mr-0",
      )}
    >
      <FileUploadAttachmentTrigger
        multiple
        onChange={setFiles}
        className="size-13 [&_svg]:size-5"
        accept=".csv,.json,.jsonl,.parquet,.pdf,.docx,.pptx,.xlsx,.html,.htm,.zip"
        disabled={files.size >= maxFiles}
        maxFiles={maxFiles}
        tooltipContent={
          files.size >= maxFiles ? "Max files reached" : "Upload file"
        }
      />
      <FileUploadAttachmentContent
        className="bg-background-primary"
        key={firstFile?.[0]}
        fileKey={firstFile?.[0]}
        file={firstFile?.[1]}
        onRemove={removeFile}
      />
      {showMore && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="size-11" size="icon">
              +{files.size - 1}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col gap-2">
            <Command>
              <CommandGroup>
                <CommandList>
                  {restFiles.map(([fileKey, file]) => (
                    <CommandItem
                      key={fileKey}
                      closable
                      onClose={() => removeFile(fileKey)}
                    >
                      {file.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </TooltipContent>
        </Tooltip>
      )}
    </FileUpload>
  );
}

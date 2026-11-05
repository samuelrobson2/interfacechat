import { FileText, Upload, X } from "lucide-react";
import { Dropzone } from "@/shared/ui/kit/dropzone";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import type { DocumentEntry } from "./types";

// Right-hand panel: drop/browse to add a PDF, and a list of every document
// available to open (the seed document plus anything uploaded this session).
export function UploadPanel({
  documents,
  activeDocId,
  onUpload,
  onOpen,
  onRemove,
}: {
  documents: DocumentEntry[];
  activeDocId?: string;
  onUpload: (files: File[]) => void;
  onOpen: (doc: DocumentEntry) => void;
  onRemove: (docId: string) => void;
}) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col gap-4 border-l border-gray-2 bg-background-primary p-4">
      <Text variant="label">Documents</Text>

      <Dropzone
        accept={{ "application/pdf": [".pdf"] }}
        maxFiles={10}
        onDrop={(files) => onUpload(files)}
        className="min-h-0 gap-2 py-5"
      >
        <Upload className="size-5 text-typography-secondary" />
        <Text variant="caption" color="secondary" className="text-center">
          Drop a PDF, or click to upload
        </Text>
      </Dropzone>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(doc)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(doc)}
            className={cn(
              "group flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-left transition-colors",
              activeDocId === doc.id ? "bg-gray-1" : "hover:bg-gray-1/60",
            )}
          >
            <FileText className="size-4 shrink-0 text-typography-secondary" />
            <Text variant="caption" className="min-w-0 flex-1 truncate">
              {doc.title}
            </Text>
            {doc.removable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(doc.id);
                }}
                className="shrink-0 rounded-full p-1 text-typography-secondary opacity-0 transition-opacity hover:bg-gray-2 group-hover:opacity-100"
                aria-label={`Remove ${doc.title}`}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

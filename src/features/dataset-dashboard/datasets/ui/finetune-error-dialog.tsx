import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Button } from "@/shared/ui/kit/button";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { CopyIcon } from "@/shared/assets/icons/general/Copy";
import { ROUTES } from "@/shared/model/routes";
import { href, Link } from "react-router-dom";

interface FinetuneErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string | null;
  datasetId: string | null;
}

// Backend stores together.ai's HTTP error body verbatim, so a typical
// payload looks like:
//   `402 {"error":{"message":"...","type":"insufficient_balance",...}}`
// Try to surface just the human-readable message; fall back to raw.
function extractHumanMessage(raw: string): string {
  const start = raw.indexOf("{");
  if (start === -1) return raw;
  const jsonPart = raw.slice(start);
  try {
    const parsed: unknown = JSON.parse(jsonPart);
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      const errorField = obj.error;
      if (errorField && typeof errorField === "object") {
        const nested = (errorField as Record<string, unknown>).message;
        if (typeof nested === "string" && nested.trim()) return nested;
      }
      if (typeof obj.message === "string" && obj.message.trim()) {
        return obj.message;
      }
    }
  } catch {
    // not valid JSON — fall through
  }
  return raw;
}

export function FinetuneErrorDialog({
  open,
  onOpenChange,
  errorMessage,
  datasetId,
}: FinetuneErrorDialogProps) {
  const trimmed = errorMessage?.trim() ?? "";
  const body = trimmed
    ? extractHumanMessage(trimmed)
    : "This attempt didn't complete.";
  const canCopy = !!trimmed;

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(errorMessage!);
      toast.success("Error copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Model training failed</DialogTitle>
        </DialogHeader>
        <div className="relative min-w-0">
          <pre className="font-sans text-sm text-red-5 whitespace-pre-wrap break-all max-h-[240px] overflow-auto bg-red-0 rounded-md p-4 pr-12 border border-red-100 w-full">
            {body}
          </pre>
          {canCopy && (
            <Button
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              aria-label="Copy error to clipboard"
              onClick={handleCopy}
            >
              <CopyIcon svgClasses="size-4" />
            </Button>
          )}
        </div>
        <DialogFooter showCancelButton={false}>
          <DialogClose asChild>
            <Button variant="secondary" className="flex-1">
              Close
            </Button>
          </DialogClose>
          {datasetId && (
            <Button variant="primary" className="hidden flex-1 sm:flex" asChild>
              <Link
                to={href(ROUTES.DATASET_FINETUNE_TRAINING_METHOD, {
                  dataset_id: datasetId,
                })}
              >
                Re-configure
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import type { CombineValidationError } from "@/services/dataset";

interface CombineValidationErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Must be non-empty. The caller is responsible for handling the empty case
   *  (e.g. show a toast) rather than opening the dialog. */
  errors: CombineValidationError[];
}

const FALLBACK_BODY =
  "Couldn't combine these datasets. Adjust your selection and try again.";

export function CombineValidationErrorDialog({
  open,
  onOpenChange,
  errors,
}: CombineValidationErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Can't combine these datasets</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {errors.map((error, index) => (
            <Text
              key={`${error.code}-${error.dataset_id ?? index}`}
              variant="body"
              color="secondary"
            >
              {error.message?.trim() || FALLBACK_BODY}
            </Text>
          ))}
        </div>
        <DialogFooter showCancelButton={false}>
          <DialogClose asChild>
            <Button variant="primary" className="flex-1">
              OK
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

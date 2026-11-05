import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";

type ConfirmDeleteApiKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmDeleteApiKeyDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading = false,
  title = "Delete API key?",
  description = "This key will stop working for all integrations that use it. This action cannot be undone.",
  confirmLabel = "Delete key",
  cancelLabel = "Cancel",
}: ConfirmDeleteApiKeyDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter
          showCancelButton={false}
          className="flex gap-2 sm:justify-center"
        >
          <Button variant="secondary" className="flex-1" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button className="flex-1" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

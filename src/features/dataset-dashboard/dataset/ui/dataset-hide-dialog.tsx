import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";

export function DatasetHideDialog({
  open,
  onOpenChange,
  datasetId,
  onHideConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string | null;
  onHideConfirm: () => void;
  isPending: boolean;
}) {
  const handleHide = () => {
    if (datasetId) onHideConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle>Delete Dataset</DialogTitle>
          <DialogDescription>
            This dataset will be deleted from the dashboard table.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter
          showCancelButton={false}
          className="flex gap-2 sm:justify-center"
        >
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleHide} isLoading={isPending}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

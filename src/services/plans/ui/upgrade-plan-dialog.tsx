import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";

interface UpgradePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  planName: string;
  upgradeAmount: string;
}

export function UpgradePlanDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  planName,
  upgradeAmount,
}: UpgradePlanDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            You are switching to the{" "}
            <span className="text-typography-primary font-normal">
              {planName} plan
            </span>
            . A one-time charge of{" "}
            <span className="text-typography-primary font-normal">
              {upgradeAmount}
            </span>{" "}
            will be applied to your saved card to cover the remainder of your
            current billing cycle.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter showCancelButton={false}>
          <Button
            variant="secondary"
            className="flex-1"
            disabled={isPending}
            onClick={onClose}
          >
            Maybe later
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            isLoading={isPending}
            onClick={onConfirm}
          >
            Let&apos;s do it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

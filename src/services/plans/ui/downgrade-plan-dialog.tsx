import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Text } from "@/shared/ui/kit/text";

interface DowngradePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  planName: string;
  activeUntilDate?: string;
  nextChargeAmount?: string;
}

export function DowngradePlanDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  planName,
  activeUntilDate,
  nextChargeAmount,
}: DowngradePlanDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Your Subscription</DialogTitle>
          <DialogDescription>
            You are switching to the{" "}
            <span className="text-typography-primary font-medium">
              {planName} plan
            </span>
            . Your current benefits will remain active until the end of your
            billing cycle.
          </DialogDescription>

          {activeUntilDate && (
            <Text className="text-center">
              This plan will become active on {activeUntilDate}.
              {nextChargeAmount && (
                <>
                  {" "}
                  Your next charge will be {nextChargeAmount} on{" "}
                  {activeUntilDate}.
                </>
              )}
            </Text>
          )}
        </DialogHeader>

        <DialogFooter showCancelButton={false}>
          <Button
            variant="secondary"
            className="flex-1"
            disabled={isPending}
            onClick={onClose}
          >
            No, thanks
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            isLoading={isPending}
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

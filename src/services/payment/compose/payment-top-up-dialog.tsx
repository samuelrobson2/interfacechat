import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { useCreditsTopUp } from "../model/use-credits-top-up";
import { PaymentTopUpForm } from "../ui/payment-top-up-form";

export function PaymentTopUpDialog({
  trigger,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  trigger?: React.ReactNode;
}) {
  const { topUpCredits, isPending } = useCreditsTopUp();

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Credits</DialogTitle>
        </DialogHeader>

        <PaymentTopUpForm
          id="payment-top-up-form"
          onSubmit={(values) => topUpCredits(Number(values.amount))}
        />

        <DialogFooter>
          <Button
            form="payment-top-up-form"
            type="submit"
            className="flex-1"
            isLoading={isPending}
          >
            Top up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { PlansList } from "../compose/plans-list";
import { PlansListSkeleton } from "./plans-list-skeleton";

export function PlansListDialog({
  trigger,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  trigger?: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        showCloseButton
        className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[1400px] flex-col overflow-y-auto sm:max-w-[1400px]"
      >
        <DialogHeader>
          <DialogTitle>Upgrade The Plan</DialogTitle>
        </DialogHeader>
        <Suspense fallback={<PlansListSkeleton />}>
          <PlansList />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

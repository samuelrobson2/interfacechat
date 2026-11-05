import { Skeleton } from "@/shared/ui/kit/skeleton";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
} from "../../_ui/finetune-steps-layout";

export function ConfirmPageSkeleton() {
  return (
    <FinetuneStepsContentWrapper className="h-full min-h-0">
      <Skeleton className="h-10 w-24" />

      <FinetuneStepsContent className="flex h-full min-h-0 flex-col gap-4">
        <Skeleton className="h-full min-h-[320px] w-full rounded-[8px]" />
      </FinetuneStepsContent>

      <Skeleton className="h-12 w-full rounded-[8px]" />
    </FinetuneStepsContentWrapper>
  );
}

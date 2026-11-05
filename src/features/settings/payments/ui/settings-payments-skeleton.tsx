import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Separator } from "@/shared/ui/kit/separator";

function PaymentPlanSkeleton() {
  return (
    <div className="flex gap-6 flex-1">
      <Skeleton className="size-[90px] shrink-0" />
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[36px] w-[220px]" />
          <Skeleton className="h-[24px] w-[160px]" />
        </div>
        <div className="flex gap-4 items-center">
          <Skeleton className="h-[28px] w-[64px] rounded-[36px]" />
          <Skeleton className="h-[24px] w-[160px]" />
        </div>
      </div>
    </div>
  );
}

function PaymentCreditsSkeleton() {
  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex items-center justify-between w-full">
        <Skeleton className="h-[36px] w-[220px]" />
        <Skeleton className="h-[28px] w-[100px]" />
      </div>
      <Skeleton className="h-[56px] w-[172px]" />
    </div>
  );
}

function PaymentMethodsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[36px] w-[220px]" />
        <Skeleton className="h-[24px] w-[160px]" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="flex-1 h-[104px]" />
        <Skeleton className="flex-1 h-[104px]" />
      </div>
      <Skeleton className="h-[56px] w-[172px]" />
    </div>
  );
}

export function SettingsPaymentsSkeleton() {
  return (
    <div className="flex flex-col h-full gap-12">
      <div className="flex h-fit gap-8">
        <PaymentPlanSkeleton />
        <Separator orientation="vertical" color="secondary" />
        <PaymentCreditsSkeleton />
      </div>

      <Separator color="secondary" />

      <PaymentMethodsSkeleton />
    </div>
  );
}

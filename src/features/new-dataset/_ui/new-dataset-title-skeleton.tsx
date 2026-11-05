import { Skeleton } from "@/shared/ui/kit/skeleton";

export function NewDatasetTitleSkeleton() {
  return (
    <div className="flex w-full justify-center">
      <Skeleton className="w-[520px] h-12" />
    </div>
  );
}
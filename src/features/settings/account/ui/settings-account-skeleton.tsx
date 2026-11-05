import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";

export function SettingsAccountSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      {/* Account info block */}
      <div className="flex flex-col gap-6">
        <Skeleton className="w-[200px] h-[36px]" />
        <div className="flex gap-8">
          <Skeleton className="flex-1 h-[64px]" />
          <Skeleton className="flex-1 h-[64px]" />
        </div>
        <Skeleton className="w-[172px] h-[56px]" />
      </div>

      {/* Divider line */}
      <Separator color="secondary" />

      {/* Additional info block */}
      <div className="flex flex-col gap-6 w-[620px]">
        <Skeleton className="w-[200px] h-[36px]" />
        <Skeleton className="w-[160px] h-[24px]" />
      </div>
    </div>
  );
}

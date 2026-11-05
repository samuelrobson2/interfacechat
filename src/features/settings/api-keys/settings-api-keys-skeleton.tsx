import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Separator } from "@/shared/ui/kit/separator";
import { cn } from "@/shared/lib/css";

function SettingsApiKeySkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex gap-6 min-w-0", className)} {...props}>
      <Skeleton className="size-[72px]" />
      <div className="flex flex-col gap-8 w-[486.5px]">
        <div className="flex flex-col gap-3">
          <Skeleton className="w-[220px] h-[36px]" />
          <Skeleton className="w-[160px] h-[24px]" />
        </div>
        <Skeleton className="w-[172px] h-[56px]" />
      </div>
    </div>
  );
}

export function SettingsApiKeysSkeleton() {
  return (
    <div className="flex h-full flex-col gap-[80px]">
      <div className="flex h-fit items-start gap-8">
        <SettingsApiKeySkeleton className="flex-1" />
      </div>
      <div className="flex w-full min-h-0 flex-nowrap items-stretch gap-8">
        <SettingsApiKeySkeleton className="h-full min-h-0 min-w-0 flex-1" />
        <Separator
          orientation="vertical"
          color="secondary"
          className="self-stretch"
        />
        <SettingsApiKeySkeleton className="h-full min-h-0 min-w-0 flex-1" />
        <Separator
          orientation="vertical"
          color="secondary"
          className="self-stretch"
        />
        <SettingsApiKeySkeleton className="h-full min-h-0 min-w-0 flex-1" />
      </div>
    </div>
  );
}

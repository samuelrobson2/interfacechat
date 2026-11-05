import { ChainLinkIcon } from "@/shared/assets/icons/outlined/ChainLink";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function DatasetSourceBadge({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-fit max-w-full items-center gap-0.5 rounded-[120px] bg-gray-6 p-1 pr-2",
        className,
      )}
    >
      <span className="grid size-4 shrink-0 place-items-center rounded-[9px]">
        <ChainLinkIcon
          svgClasses="size-2.5"
          pathClasses="stroke-icon-primary"
        />
      </span>
      <Text
        variant="small"
        color="darkGray"
        className="min-w-0 flex-1 truncate"
      >
        {name}
      </Text>
    </div>
  );
}

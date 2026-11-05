import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/kit/tooltip";

export function GrowItemLayout({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn("flex flex-col gap-8", className)}>{children}</div>;
}


export function GrowItemLayoutTitle({
  title,
  tooltipContent,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string;
  tooltipContent?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Text variant="title">{title}</Text>
      {tooltipContent && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CircleInfoIcon />
          </TooltipTrigger>
          <TooltipContent className="max-w-[320px]">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import { CheckmarkIcon } from "@/shared/assets/icons/outlined/Checkmark";
import { cn } from "@/shared/lib/css";
import { Card } from "@/shared/ui/kit/card";
import { Text } from "@/shared/ui/kit/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";

export function MappingItem({
  selectedColumn,
  title,
  tooltipContent,
  disabled,
  className,
  textSelectedColor,
  onColumnSelect,
}: {
  selectedColumn?: boolean;
  title?: string;
  tooltipContent?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  textSelectedColor?: string;
  onColumnSelect?: () => void;
}) {
  const tooltip = tooltipContent ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleInfoIcon />
      </TooltipTrigger>
      <TooltipContent className="max-w-[320px]">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  ) : null;

  return (
    <Card
      className={cn(
        "gap-1.5 cursor-pointer",
        disabled && "cursor-not-allowed",
        className,
      )}
      onClick={disabled ? undefined : onColumnSelect}
    >
      {title && (
        <Text
          className={cn("flex items-center gap-1.5", disabled && "text-gray-2")}
        >
          {title}
          {tooltip}
        </Text>
      )}

      {selectedColumn && (
        <div className={cn("flex gap-2 items-center", textSelectedColor)}>
          <CheckmarkIcon className="size-5" pathClasses="stroke-current" />
          <Text className="text-current">
            Selected
          </Text>
        </div>
      )}
    </Card>
  );
}

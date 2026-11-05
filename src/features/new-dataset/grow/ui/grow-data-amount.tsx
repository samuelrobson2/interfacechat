import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import { cn } from "@/shared/lib/css";
import { Card } from "@/shared/ui/kit/card";
import { Slider } from "@/shared/ui/kit/slider";
import { Text } from "@/shared/ui/kit/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";

export function GrowDataAmount({
  value,
  onChange,
  title,
  tooltipContent,
  ...props
}: Omit<React.ComponentProps<typeof Card>, "onChange"> & {
  title: string;
  value: number;
  onChange: (value: number) => void;
  tooltipContent?: React.ReactNode;
}) {
  const handleValueChange = (value: number[]) => {
    onChange(value[0] ?? 0);
  };

  return (
    <div className={cn("flex flex-col gap-4", props.className)} {...props}>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Text variant="label" color="secondary">
            {title}
          </Text>

          <Tooltip>
            <TooltipTrigger asChild>
              <CircleInfoIcon />
            </TooltipTrigger>
            <TooltipContent className="max-w-[320px]">
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </div>

        <Text>{value}%</Text>
      </div>

      <Slider
        size="small"
        value={[value]}
        onValueChange={handleValueChange}
        min={0}
        max={100}
      />
    </div>
  );
}

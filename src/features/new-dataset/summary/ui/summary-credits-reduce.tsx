import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import { cn } from "@/shared/lib/css";
import { debounce, getNumericValue } from "@/shared/lib/js";
import { Input } from "@/shared/ui/kit/input";
import { Slider } from "@/shared/ui/kit/slider";
import { Text } from "@/shared/ui/kit/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { useState } from "react";

export function SummaryCreditsReduce({
  title,
  radioInput,
  className,
  tooltipContent,
  maxRows,
  onValueChange,
  disabled,
  expanded,
  sliderLabel = "rows",
  launchKind = "adaption",
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
  radioInput?: React.ReactNode;
  className?: string;
  tooltipContent?: React.ReactNode;
  maxRows: number;
  onValueChange: (value: number[]) => void;
  disabled?: boolean;
  expanded?: number;
  /** Label for the slider count (e.g. rows, pages, documents). */
  sliderLabel?: string;
  /** Shown in the deploy sentence: preprocessing vs adaption. */
  launchKind?: "preprocessing" | "adaption";
}) {
  const [innerValue, setInnerValue] = useState([maxRows]);

  const clampValue = (value: number) => {
    return Math.max(Math.min(value, maxRows), 0);
  };

  const debouncedSetValue = debounce((value: number[]) => {
    onValueChange(value);
  }, 300);

  const handleValueChange = (inputValue: string) => {
    const newValue = clampValue(getNumericValue(inputValue));
    setInnerValue([newValue]);
    debouncedSetValue([newValue]);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <label className="flex gap-3 items-center">
        {radioInput}

        <div className="flex items-center gap-2">
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
      </label>

      <div className={cn("flex flex-col gap-2", disabled && "opacity-50")}>
        <div className={cn("flex justify-between items-center")}>
          <Text color="secondary" variant="label">
            {sliderLabel}
          </Text>
          <Input
            disabled={disabled}
            wrapperClassName="w-fit"
            className="h-9 w-fit"
            value={innerValue[0]?.toLocaleString()}
            inputClassName="p-0 w-15 text-typography-secondary"
            onChange={(e) => handleValueChange(e.target.value)}
          />
        </div>
        <Slider
          disabled={disabled}
          size="small"
          value={innerValue}
          onValueChange={setInnerValue}
          onValueCommit={onValueChange}
          min={1}
          max={maxRows}
        />
      </div>

      <Text className={cn(disabled && "opacity-50")}>
        {expanded
          ? `Deploy ${launchKind} on ${innerValue[0]?.toLocaleString()} ${sliderLabel} in your current dataset to get an expanded dataset of ${expanded?.toLocaleString()} rows.`
          : `Deploy ${launchKind} on ${innerValue[0]?.toLocaleString()} ${sliderLabel} in your current dataset.`}
      </Text>
    </div>
  );
}

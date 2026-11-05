import { useEffect, useMemo, useState } from "react";
//import { CircleInfoIcon } from "@/shared/assets/icons/general/CircleInfo";
import { getNumericValue } from "@/shared/lib/js";
import { Input } from "@/shared/ui/kit/input";
import { Slider } from "@/shared/ui/kit/slider";
import { Text } from "@/shared/ui/kit/text";
/* import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip"; */

type CreditsReduceSliderProps = {
  title: string;
  //tooltip: string;
  value: number[];
  max: number;
  min?: number;
  label: string;
  onChange: (value: number[]) => void;
};

export function CreditsReduceSlider({
  title,
  //tooltip,
  value,
  max,
  min = 1,
  label,
  onChange,
}: CreditsReduceSliderProps) {
  const safeMin = Math.max(min, 0);
  const safeMax = Math.max(max, safeMin);
  const [innerValue, setInnerValue] = useState<number[]>(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const currentValue = useMemo(
    () => Math.max(safeMin, Math.min(innerValue[0] ?? safeMin, safeMax)),
    [innerValue, safeMin, safeMax],
  );

  const handleInputChange = (rawValue: string) => {
    const nextValue = Math.max(
      safeMin,
      Math.min(getNumericValue(rawValue), safeMax),
    );
    setInnerValue([nextValue]);
    onChange([nextValue]);
  };

  const handleSliderCommit = (nextValue: number[]) => {
    setInnerValue(nextValue);
    onChange(nextValue);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Text variant="title">{title}</Text>
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <CircleInfoIcon />
          </TooltipTrigger>
          <TooltipContent className="max-w-[320px]">{tooltip}</TooltipContent>
        </Tooltip> */}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Text color="secondary" variant="label">
            {label}
          </Text>
          <Input
            wrapperClassName="w-fit"
            className="h-9 w-fit"
            inputClassName="p-0 w-12 text-typography-secondary"
            value={currentValue.toLocaleString()}
            onChange={(event) => handleInputChange(event.target.value)}
          />
        </div>

        <Slider
          size="small"
          value={[currentValue]}
          onValueChange={setInnerValue}
          onValueCommit={handleSliderCommit}
          min={safeMin}
          max={safeMax}
        />
      </div>
    </div>
  );
}

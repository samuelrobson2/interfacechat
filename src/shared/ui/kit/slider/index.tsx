import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/shared/lib/css";
import { getNumericValue } from "@/shared/lib/js";
import { Input } from "../input";
import { Text } from "../text";

function Slider({
  className,
  defaultValue,
  size = "default",
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  size?: "default" | "small";
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none my-2 data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-gray-2 relative grow overflow-hidden rounded-[16px] data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2",
          size === "small" &&
            "data-[orientation=horizontal]:h-[2px] data-[orientation=vertical]:w-[2px]",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-stroke-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "bg-stroke-primary ring-stroke-primary/50 block size-6 shrink-0 rounded-full transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
            size === "small" && "size-3",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

interface SliderRowProps {
  label?: string;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  size?: "default" | "small";
}

function SliderRow({
  label,
  value: controlledValue,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  size = "small",
}: SliderRowProps) {
  const [internalValue, setInternalValue] = React.useState(
    controlledValue ?? defaultValue ?? [min],
  );

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newValue: number[]) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const handleInputChange = (inputValue: string) => {
    const newVal = Math.min(max, Math.max(min, getNumericValue(inputValue)));
    handleValueChange([newVal]);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <Text variant="label" color="secondary">
            {label}
          </Text>
        )}
        <Input
          variant="plain"
          fill="outlined"
          wrapperClassName="w-fit"
          className="h-9 w-20"
          inputClassName="p-0 text-center text-typography-secondary"
          value={currentValue[0]?.toLocaleString()}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      <Slider
        value={currentValue}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        size={size}
        disabled={disabled}
      />
    </div>
  );
}

interface SliderRangeRowProps {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  size?: "default" | "small";
}

function SliderRangeRow({
  value: controlledValue,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  size = "small",
}: SliderRangeRowProps) {
  const [internalValue, setInternalValue] = React.useState(
    controlledValue ?? defaultValue ?? [min, max],
  );

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [leftFocused, setLeftFocused] = React.useState(false);
  const [rightFocused, setRightFocused] = React.useState(false);
  const [leftInput, setLeftInput] = React.useState("");
  const [rightInput, setRightInput] = React.useState("");

  // When not focused — read directly from slider state (no useEffect needed)
  const leftDisplayValue = leftFocused ? leftInput : String(currentValue[0]);
  const rightDisplayValue = rightFocused ? rightInput : String(currentValue[1]);

  const commitValues = (left: number, right: number) => {
    if (!isControlled) setInternalValue([left, right]);
    onValueChange?.([left, right]);
  };

  const handleLeftFocus = () => {
    setLeftInput(String(currentValue[0]));
    setLeftFocused(true);
  };

  const handleRightFocus = () => {
    setRightInput(String(currentValue[1]));
    setRightFocused(true);
  };

  const handleLeftChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    if (digits === "") { setLeftInput(""); return; }
    const parsed = parseInt(digits, 10);
    setLeftInput(parsed > max ? String(max) : digits);
  };

  const handleRightChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    if (digits === "") { setRightInput(""); return; }
    const parsed = parseInt(digits, 10);
    setRightInput(parsed > max ? String(max) : digits);
  };

  const handleLeftBlur = () => {
    setLeftFocused(false);
    const parsed = leftInput === "" ? (currentValue[0] ?? min) : parseInt(leftInput, 10);
    let left = Math.min(max, Math.max(min, parsed));
    let right = currentValue[1] ?? max;
    if (left > right) [left, right] = [right, left]; // swap if out of order
    else if (left === right) {
      right = Math.min(max, right + step);
      if (left === right) left = Math.max(min, left - step); // fallback when both at max
    }
    commitValues(left, right);
  };

  const handleRightBlur = () => {
    setRightFocused(false);
    const parsed = rightInput === "" ? (currentValue[1] ?? max) : parseInt(rightInput, 10);
    let left = currentValue[0] ?? min;
    let right = Math.min(max, Math.max(min, parsed));
    if (right < left) [left, right] = [right, left]; // swap if out of order
    else if (left === right) {
      left = Math.max(min, left - step);
      if (left === right) right = Math.min(max, right + step); // fallback when both at min
    }
    commitValues(left, right);
  };

  const handleKeyDown = (e: React.KeyboardEvent, commit: () => void) => {
    if (e.key === "Enter") {
      commit();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <Input
          variant="plain"
          fill="outlined"
          wrapperClassName="w-fit"
          className="h-9 w-20"
          inputClassName="p-0 text-center text-typography-secondary"
          value={leftDisplayValue}
          onChange={(e) => handleLeftChange(e.target.value)}
          onFocus={handleLeftFocus}
          onBlur={handleLeftBlur}
          onKeyDown={(e) => handleKeyDown(e, handleLeftBlur)}
          disabled={disabled}
        />
        <Input
          variant="plain"
          fill="outlined"
          wrapperClassName="w-fit"
          className="h-9 w-20"
          inputClassName="p-0 text-center text-typography-secondary"
          value={rightDisplayValue}
          onChange={(e) => handleRightChange(e.target.value)}
          onFocus={handleRightFocus}
          onBlur={handleRightBlur}
          onKeyDown={(e) => handleKeyDown(e, handleRightBlur)}
          disabled={disabled}
        />
      </div>
      <Slider
        value={currentValue}
        onValueChange={(v) => commitValues(v[0] ?? min, v[1] ?? max)}
        min={min}
        max={max}
        step={step}
        size={size}
        disabled={disabled}
        minStepsBetweenThumbs={1}
      />
    </div>
  );
}

export { Slider, SliderRow, SliderRangeRow };
export type { SliderRowProps, SliderRangeRowProps };

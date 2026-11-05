import { Input } from "@/shared/ui/kit/input";
import { Slider } from "@/shared/ui/kit/slider";
import { Text } from "@/shared/ui/kit/text";

export function ControlBrandLengthInput({
  value,
  setValue,
  min,
  max,
}: {
  value: [number, number];
  setValue: (value: [number, number]) => void;
  min: number;
  max: number;
}) {
  const getNumericValue = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue === "" ? 0 : parseInt(numericValue, 10);
  };

  const clampValue = (value: number) => {
    return Math.max(Math.min(value, max), min);
  };

  const handleSliderChange = (newValue: number[]) => {
    const [newMin, newMax] = newValue as [number, number];
    
    if (newMax - newMin < 1) return;
    
    setValue([newMin, newMax]);
  };

  const handleMinChange = (inputValue: string) => {
    const newMinValue = clampValue(getNumericValue(inputValue));

    const adjustedMinValue = Math.min(newMinValue, value[1] - 1);
    setValue([adjustedMinValue, value[1]]);
  };

  const handleMaxChange = (inputValue: string) => {
    const newMaxValue = clampValue(getNumericValue(inputValue));

    const adjustedMaxValue = Math.max(newMaxValue, value[0] + 1);
    setValue([value[0], adjustedMaxValue]);
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <Text>Minimum</Text>
          <Input
            className="w-32.5 bg-background-primary"
            inputClassName="p-0"
            value={value[0]}
            onChange={(e) => handleMinChange(e.target.value)}
            rightElement={<Text>words</Text>}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Text>Maximum</Text>
          <Input
            className="w-32.5 bg-background-primary"
            inputClassName="p-0"
            value={value[1]}
            onChange={(e) => handleMaxChange(e.target.value)}
            rightElement={<Text>words</Text>}
          />
        </div>
      </div>
      <Slider
        value={value}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={1}
        minStepsBetweenThumbs={1}
      />
    </>
  );
}
